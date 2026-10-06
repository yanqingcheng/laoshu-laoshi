import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

async function ctx(context: Any) {
  const core = await import("@/lib/memory/core.server");
  const course = await import("@/lib/course.server");
  const book = await import("@/lib/book.server");
  const learner = await core.getLearner(context.supabase, context.userId);
  return { core, course, book, learner, sb: context.supabase as Any };
}
async function sets(sb: Any, id: string) {
  const rows: Any[] = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from("learner_words").select("word_id,status").eq("learner_id", id).range(f, f + 999);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return {
    repertoire: new Set<string>(rows.filter((r) => r.status === "repertoire").map((r) => r.word_id)),
    queued: new Set<string>(rows.filter((r) => r.status === "queued").map((r) => r.word_id)),
  };
}
async function getJob(sb: Any, id: string) {
  const { data, error } = await sb.from("jobs").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}
async function setJob(sb: Any, id: string, patch: Any) {
  const { error } = await sb.from("jobs").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}
function names(learner: Any) {
  const n = ["毛毛 | mao2 mao5 | the dog (full name 王毛毛)", "咪咪 | mi1 mi1 | the cat (full name 李咪咪)"];
  if (learner.chinese_name) n.unshift(`${learner.chinese_name} | ${learner.chinese_name_pinyin ?? ""} | the learner`);
  return n;
}

export const bookCreate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ title: z.string().trim().min(1).max(120), kind: z.enum(["photos", "describe"]), topic: z.string().max(300).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const { learner, sb } = await ctx(context);
    const { data: job, error } = await sb.from("jobs").insert({ learner_id: learner.id, kind: "book", input: data, status: "running", step: "read" }).select("id").single();
    if (error) throw new Error(error.message);
    return { jobId: job.id as string };
  });

export const bookRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ jobId: z.string().uuid(), paths: z.array(z.string()).max(12).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const { book, learner, sb } = await ctx(context);
    const job = await getJob(sb, data.jobId);
    try {
      if (job.input.kind === "describe") {
        const r = await book.describeStory(learner.id, job.id, job.input.topic || job.input.title, learner.about ?? "");
        const out = { language: "zh", pages: [{ id: "p1", text: r.text }], describedTitle: r.title_en };
        await setJob(sb, job.id, { step: "review-text", outputs: { read: out } });
        return out;
      }
      const paths = data.paths ?? [];
      if (!paths.length) throw new Error("Add at least one photo.");
      if (paths.some((p) => !p.startsWith(`${learner.id}/${job.id}/`))) throw new Error("Photo path not allowed");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const signed = await supabaseAdmin.storage.from("book-pages").createSignedUrls(paths, 3600);
      if (signed.error) throw new Error(signed.error.message);
      const urls = signed.data.map((s: Any) => s.signedUrl);
      const r = await book.readPages(learner.id, job.id, urls);
      if (r.language !== "zh" && r.language !== "en") {
        await setJob(sb, job.id, { status: "failed", error: "This book could not be used (not Chinese or English).", outputs: { read: r, paths } });
        return { ...r, unusable: true };
      }
      await setJob(sb, job.id, { step: "review-text", outputs: { read: r, paths } });
      return r;
    } catch (e) {
      await setJob(sb, job.id, { status: "failed", error: (e as Error).message });
      throw e;
    }
  });

export const bookPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ jobId: z.string().uuid(), pages: z.array(z.object({ id: z.string(), text: z.string().max(5000) })).max(12) }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, book, learner, sb } = await ctx(context);
    const job = await getJob(sb, data.jobId);
    const text = data.pages.map((p) => p.text).join("\n");
    const language = job.outputs?.read?.language ?? "zh";
    try {
      const ref = await course.ref();
      const { repertoire, queued } = await sets(sb, learner.id);
      const plan = await book.buildPlan({ learnerId: learner.id, jobId: job.id, language, text, ref, core, repertoire, queued, courseLessons: ref.courseLessons });
      await setJob(sb, job.id, { step: "approve", outputs: { ...job.outputs, pages: data.pages, plan } });
      return plan;
    } catch (e) {
      await setJob(sb, job.id, { error: (e as Error).message });
      throw e;
    }
  });

export const bookApprove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ jobId: z.string().uuid(), drop: z.array(z.string()).max(500) }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, book, learner, sb } = await ctx(context);
    const job = await getJob(sb, data.jobId);
    const plan0 = job.outputs?.plan;
    if (!plan0) throw new Error("No plan to approve");
    if (job.status === "ready" && job.outputs?.sourceId) return { sourceId: job.outputs.sourceId, lessons: job.outputs.lessons };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const drop = new Set(data.drop);
    const unknown = (plan0.unknown as Any[]).filter((u) => !drop.has(u.key));
    const { repertoire } = await sets(sb, learner.id);
    const ref0 = await course.ref();
    const lessonsPlan = book.planLessons(unknown, ref0.courseLessons, repertoire);
    // words: create any that do not exist yet
    for (const u of unknown) {
      if (u.wordId) continue;
      const { data: ex } = await supabaseAdmin.from("words").select("id").eq("hanzi", u.hanzi).eq("pinyin", u.pinyin).neq("origin", "course").maybeSingle();
      if (ex) { u.wordId = ex.id; continue; }
      const { data: w, error } = await supabaseAdmin.from("words").insert({ hanzi: u.hanzi, pinyin: u.pinyin, meaning: u.meaning || u.hanzi, origin: u.inDictionary ? "dictionary" : "manual" }).select("id").single();
      if (error) throw new Error(error.message);
      u.wordId = w.id;
    }
    const byKey = new Map(unknown.map((u) => [u.key, u]));
    const { data: src, error: se } = await supabaseAdmin.from("sources").insert({
      learner_id: learner.id, title: job.input.title, kind: job.input.kind === "describe" ? "described" : "book",
      word_ids: unknown.map((u) => u.wordId), plan: { lessons: lessonsPlan, repertoireAtApproval: [...repertoire], topWords: [...(plan0.found as Any[])].sort((a, b) => b.count - a.count).slice(0, 10).map((f: Any) => f.hanzi) }, status: "ready",
    }).select("id").single();
    if (se) throw new Error(se.message);
    const created: Any[] = [];
    let ord = 0;
    for (const l of lessonsPlan) {
      if (l.kind === "prerequisite") { created.push({ id: l.courseLessonId, title: l.title, kind: "prerequisite" }); continue; }
      const { data: les, error } = await supabaseAdmin.from("lessons").insert({ source_id: src.id, ord: ord++, title: `${job.input.title} · ${l.title}`, word_ids: l.keys.map((k: string) => byKey.get(k)!.wordId) }).select("id,title").single();
      if (error) throw new Error(error.message);
      created.push({ id: les.id, title: les.title, kind: "custom" });
    }
    await core.queueWords(sb, learner, unknown.map((u) => u.wordId), src.id);
    // place in a free custom slot (made in stage 8)
    const { data: taken } = await supabaseAdmin.from("places").select("slot").eq("learner_id", learner.id);
    const free = ["custom1", "custom2"].find((s) => !(taken ?? []).some((t: Any) => t.slot === s));
    if (free) await supabaseAdmin.from("places").insert({ learner_id: learner.id, slot: free, source_id: src.id, status: "pending" });
    // photos are deleted after approval
    if (job.outputs?.paths?.length) await supabaseAdmin.storage.from("book-pages").remove(job.outputs.paths);
    course.invalidateRef();
    await setJob(sb, job.id, { status: "ready", step: "approved", outputs: { ...job.outputs, sourceId: src.id, lessons: created, slot: free ?? null } });
    void book;
    return { sourceId: src.id, lessons: created, slot: free ?? null };
  });

export const bookCancel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { learner, sb } = await ctx(context);
    const job = await getJob(sb, data.jobId);
    const { data: files } = await sb.storage.from("book-pages").list(`${learner.id}/${job.id}`);
    if (files?.length) await sb.storage.from("book-pages").remove(files.map((f: Any) => `${learner.id}/${job.id}/${f.name}`));
    await setJob(sb, job.id, { status: "failed", step: "cancelled", error: "Cancelled by the learner" });
    return { ok: true };
  });

/** Generate example/quiz sentences for every word of a custom lesson that has none yet. */
export const lessonSentences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ lessonId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, book, learner, sb } = await ctx(context);
    const { data: lesson, error } = await sb.from("lessons").select("*, sources!inner(learner_id)").eq("id", data.lessonId).single();
    if (error) throw new Error(error.message);
    if (lesson.sources.learner_id !== learner.id) throw new Error("Not your lesson");
    course.invalidateRef();
    const ref = await course.ref();
    const { repertoire } = await sets(sb, learner.id);
    const { data: have } = await sb.from("sentence_targets").select("word_id, sentences!inner(learner_id)").in("word_id", lesson.word_ids).eq("sentences.learner_id", learner.id);
    const done = new Set((have ?? []).map((h: Any) => h.word_id));
    const starter = ref.courseLessons[0]?.word_ids ?? [];
    const alsoIds = [...new Set([...repertoire, ...starter])].filter((id) => !lesson.word_ids.includes(id));
    const allowedIds = new Set<string>([...alsoIds, ...lesson.word_ids]);
    const lessonWords = lesson.word_ids.map((id: string) => ref.words.get(id)).filter(Boolean);
    const also = alsoIds.map((id) => ref.words.get(id)).filter(Boolean);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const report: Any[] = [];
    const todo = lessonWords.filter((w: Any) => !done.has(w.id));
    // a few at a time to respect the shared rate limit
    for (let i = 0; i < todo.length; i += 4) {
      await Promise.all(todo.slice(i, i + 4).map(async (w: Any) => {
        try {
          const r = await book.sentencesForWord({ learnerId: learner.id, jobId: null, target: w, lessonWords, also, names: names(learner), ref, core, allowedIds });
          for (const s of r.kept) {
            const { data: row, error: e1 } = await supabaseAdmin.from("sentences").insert({ tokens: s.tokens, english: s.english, origin: "generated", learner_id: learner.id }).select("id").single();
            if (e1) throw new Error(e1.message);
            await supabaseAdmin.from("sentence_targets").insert({ sentence_id: row.id, word_id: w.id, gap: s.gap || null, answers: s.answers });
          }
          report.push({ hanzi: w.hanzi, kept: r.kept.length, withheld: r.kept.length === 0 });
        } catch (e) {
          report.push({ hanzi: w.hanzi, kept: 0, error: (e as Error).message });
        }
      }));
    }
    return { lessonId: lesson.id, already: done.size, report };
  });

export const myBooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { learner, sb } = await ctx(context);
    const { repertoire } = await sets(sb, learner.id);
    const { data: srcs } = await sb.from("sources").select("id,title,kind,created_at,lessons(id,ord,title,word_ids)").eq("learner_id", learner.id).order("created_at", { ascending: false });
    const { data: jobs } = await sb.from("jobs").select("id,input,status,step,error,updated_at").eq("learner_id", learner.id).eq("kind", "book").in("status", ["running", "failed"]).order("updated_at", { ascending: false }).limit(5);
    return {
      books: (srcs ?? []).map((s: Any) => ({
        id: s.id, title: s.title, kind: s.kind,
        lessons: (s.lessons ?? []).sort((a: Any, b: Any) => a.ord - b.ord).map((l: Any) => ({ id: l.id, title: l.title, total: l.word_ids.length, learned: l.word_ids.filter((id: string) => repertoire.has(id)).length })),
      })),
      jobs: jobs ?? [],
    };
  });

/** Re-run the Exact lesson plan after the learner drops words (no model call). */
export const bookReplan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ jobId: z.string().uuid(), drop: z.array(z.string()).max(500) }).parse(d))
  .handler(async ({ context, data }) => {
    const { course, learner, sb } = await ctx(context);
    const { planLessons } = await import("@/lib/bookplan");
    const job = await getJob(sb, data.jobId);
    const drop = new Set(data.drop);
    const ref = await course.ref();
    const { repertoire } = await sets(sb, learner.id);
    return planLessons((job.outputs?.plan?.unknown ?? []).filter((u: Any) => !drop.has(u.key)), ref.courseLessons, repertoire);
  });
