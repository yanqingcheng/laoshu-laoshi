import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Microdrama video hook. Input is an ACCEPTED, already-checked drama script
// (the drama pipeline owns vocabulary checks). The video model gets only
// visual/audio direction: no dialogue and no on-screen text, because Chinese
// captions are rendered by the shared ruby renderer as a UI overlay and
// unchecked model speech must not bypass the vocabulary gate.

const Caption = z.object({
  atS: z.number().min(0),
  untilS: z.number().min(0),
  zh: z.string(),
  en: z.string().optional(),
  tokens: z.array(z.object({ w: z.string(), p: z.string().optional(), punct: z.boolean().optional() })).optional(),
});

const StartInput = z.object({
  contentRef: z.string().min(1).max(200), // stable id of the drama episode; one job per learner+ref
  setting: z.string().min(3).max(800),
  cast: z.array(z.object({ name: z.string().max(60), look: z.string().max(400) })).min(1).max(4),
  beats: z.array(z.string().min(3).max(500)).min(1).max(8),
  sound: z.string().max(300).optional(),
  captions: z.array(Caption).max(20).default([]),
  aspect: z.enum(["9:16", "16:9"]).default("9:16"),
  durationS: z.number().int().min(3).max(10).default(8),
  retry: z.boolean().default(false),
});

export type DramaStartInput = z.input<typeof StartInput>;

function buildPrompt(i: z.infer<typeof StartInput>) {
  const per = i.durationS / i.beats.length;
  const beats = i.beats.map((b, n) => `[${(n * per).toFixed(1)}-${((n + 1) * per).toFixed(1)}s] ${b}`).join("\n");
  const cast = i.cast.map((c) => `- ${c.name}: ${c.look}`).join("\n");
  return [
    "A short storybook microdrama in a warm painted-paper illustration style: cream paper texture, indigo, muted jade and terracotta, soft cut-paper depth, gentle camera moves.",
    `Setting: ${i.setting}`,
    `Characters (keep their look, clothing and props identical in every shot):\n${cast}`,
    `Beats:\n${beats}`,
    `Sound: ${i.sound ?? "soft ambient room sound and a gentle, playful instrumental score"}.`,
    "No dialogue, no speech, no voices. No on-screen text, no captions, no letters or characters of any script anywhere in frame. Leave the lower fifth of the frame calm for captions.",
    "Consider micro-detail, expression and timing; the visual payoff of the final beat must be clearly visible.",
  ].join("\n\n");
}

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

export const startDramaVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StartInput.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const learnerId = context.userId;
    // Production requests are resolved from the server's reviewed artifact, never
    // from a browser's claim that its captions have already been checked.
    if (data.contentRef.startsWith('episode:')) {
      const itemId = data.contentRef.split(':')[1];
      const { data: item, error } = await db.from('content_items').select('*').eq('id', itemId).eq('learner_id', learnerId).single();
      if (error || !item) throw new Error('Episode not found');
      const drama = (item.payload as any)?.drama;
      const request = drama?.accepted && drama.requests?.find((r: any) => r.contentRef === data.contentRef);
      if (!request) throw new Error('This shot has no accepted script');
      data = StartInput.parse({ ...request, retry: data.retry });
    } else if (data.captions.length) {
      // Dev hook remains useful, but cannot publish unchecked Chinese either.
      const core = await import('@/lib/memory/core.server');
      const { ref: loadRef } = await import('@/lib/course.server');
      const { checkTokens } = await import('@/lib/place.server');
      const learner = await core.getLearner(context.supabase, learnerId);
      const ids = new Set((await core.queryWords(context.supabase, learner, { status: 'repertoire' })).map(w => w.id));
      const ref = await loadRef();
      for (const c of data.captions) {
        if (!c.tokens?.length || c.zh !== c.tokens.map(t => t.w).join('') || !checkTokens(c.tokens, ids, ref, core, new Set()).ok) throw new Error('Caption must contain checked repertoire tokens');
      }
    }
    for (const c of data.captions) if (c.untilS <= c.atS || c.untilS > data.durationS) throw new Error('Caption timing is outside the clip');
    const { data: existing } = await db.from("drama_videos").select("*").eq("learner_id", learnerId).eq("content_ref", data.contentRef).maybeSingle();
    // Reload / double-tap must not create duplicate jobs or spend.
    if (existing && !(existing.status === "failed" && data.retry)) return existing;

    const { VIDEO_MODEL, createVideo, VideoGatewayError } = await import("./gateway.server");
    const prompt = buildPrompt(data);
    const row = {
      learner_id: learnerId, content_ref: data.contentRef, model: VIDEO_MODEL, prompt,
      captions: data.captions, aspect: data.aspect, duration_s: data.durationS,
      status: "queued", error: null, gateway_job_id: null, storage_path: null, progress: null, updated_at: new Date().toISOString(),
    };
    // A unique insert (or conditional retry claim) wins before any provider spend.
    const { data: saved, error } = existing
      ? await db.from('drama_videos').update(row as never).eq('id', existing.id).eq('status', 'failed').select('*').maybeSingle()
      : await db.from('drama_videos').insert(row as never).select('*').single();
    if (error?.code === '23505' || (!error && !saved)) {
      const {data: winner, error: winnerError} = await db.from('drama_videos').select('*').eq('learner_id',learnerId).eq('content_ref',data.contentRef).single();
      if(winnerError) throw new Error(winnerError.message);
      return winner;
    }
    if (error || !saved) throw new Error(error?.message ?? 'Could not reserve video job');
    try {
      const job = await createVideo(prompt, data.durationS, data.aspect);
      const { data: upd } = await db.from("drama_videos").update({ gateway_job_id: job.id, status: "running", progress: job.progress ?? 0 } as never).eq("id", saved.id).select("*").single();
      return upd ?? saved;
    } catch (e) {
      const msg = e instanceof VideoGatewayError ? `${e.status}: ${e.message}` : (e as Error).message;
      // Network/5xx may have created a paid provider job. Preserve queued state
      // for reconciliation rather than offering a duplicate-spend retry.
      const definitive = e instanceof VideoGatewayError && e.status >= 400 && e.status < 500;
      const { data: upd } = await db.from("drama_videos").update({ status: definitive ? 'failed' : 'queued', error: definitive ? msg.slice(0,500) : 'Submission outcome unknown; reconcile the provider job before retrying.' } as never).eq("id", saved.id).select("*").single();
      return upd ?? saved;
    }
  });

export const checkDramaVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: v } = await db.from("drama_videos").select("*").eq("id", data.id).eq("learner_id", context.userId).maybeSingle();
    if (!v) throw new Error("Video not found");
    let row = v;
    if (row.status === "running" && row.gateway_job_id) {
      const { pollVideo, downloadVideo } = await import("./gateway.server");
      try {
        const job = await pollVideo(row.gateway_job_id);
        if (job.status === "failed") {
          const { data: u } = await db.from("drama_videos").update({ status: "failed", error: job.error?.message ?? "Video generation failed", updated_at: new Date().toISOString() } as never).eq("id", row.id).select("*").single();
          row = u ?? row;
        } else if (job.status === "completed") {
          const path = `${context.userId}/${row.id}.mp4`;
          const bytes = await downloadVideo(job.id);
          const up = await db.storage.from("drama-videos").upload(path, bytes, { contentType: "video/mp4", upsert: true });
          if (up.error) throw new Error(up.error.message);
          const { data: u } = await db.from("drama_videos").update({ status: "ready", progress: 100, storage_path: path, updated_at: new Date().toISOString() } as never).eq("id", row.id).select("*").single();
          row = u ?? row;
        } else if (job.progress != null && job.progress !== row.progress) {
          const { data: u } = await db.from("drama_videos").update({ progress: job.progress } as never).eq("id", row.id).select("*").single();
          row = u ?? row;
        }
      } catch (e) {
        // transient poll failures leave the job running; the client polls again later
        return { ...row, url: null, pollError: (e as Error).message };
      }
    }
    let url: string | null = null;
    if (row.status === "ready" && row.storage_path) {
      if(row.content_ref.startsWith('episode:')) {
        const {data:item}=await db.from('content_items').select('required_word_ids').eq('id',row.content_ref.split(':')[1]).eq('learner_id',context.userId).single();
        const core=await import('@/lib/memory/core.server');
        const learner=await core.getLearner(context.supabase,context.userId);
        const known=new Set((await core.queryWords(context.supabase,learner,{status:'repertoire'})).map(w=>w.id));
        if(!item||(item.required_word_ids??[]).some(id=>!known.has(id))) return {...row,url:null,pollError:'This scene is generated. Learn its words to watch it.'};
      }
      const s = await db.storage.from("drama-videos").createSignedUrl(row.storage_path, 3600);
      url = s.data?.signedUrl ?? null;
    }
    return { ...row, url, pollError: null as string | null };
  });

export const listDramaVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("drama_videos").select("id, content_ref, status, progress, error, created_at").order("created_at", { ascending: false }).limit(20);
    return data ?? [];
  });
