import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

async function ctx(context: Any) {
  const core = await import("@/lib/memory/core.server");
  const course = await import("@/lib/course.server");
  const place = await import("@/lib/place.server");
  const learner = await core.getLearner(context.supabase, context.userId);
  return { core, course, place, learner, sb: context.supabase as Any };
}
async function repertoireOf(sb: Any, id: string) {
  const rows: Any[] = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from("learner_words").select("word_id,status").eq("learner_id", id).range(f, f + 999);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return new Set<string>(rows.filter((r) => r.status === "repertoire").map((r) => r.word_id));
}

/** SPEC 7 step 7 (Exact) for a custom place, plus which lessons still block it. */
function openState(place: Any, source: Any, lessons: Any[], ref: Any, rep: Set<string>) {
  const plan = source?.plan ?? {};
  const need: { id: string; title: string; left: number }[] = [];
  for (const l of plan.lessons ?? []) {
    if (l.kind !== "prerequisite") continue;
    const cl = ref.courseLessons.find((c: Any) => c.id === l.courseLessonId);
    if (!cl) continue;
    const left = cl.word_ids.filter((id: string) => !rep.has(id)).length;
    if (left) need.push({ id: cl.id, title: cl.title, left });
  }
  const custom = lessons.filter((l) => l.source_id === source?.id).sort((a, b) => a.ord - b.ord);
  if (custom[0]) {
    const left = custom[0].word_ids.filter((id: string) => !rep.has(id)).length;
    if (left) need.push({ id: custom[0].id, title: custom[0].title, left });
  }
  const hostExists = !!place.host && !!place.lines;
  // next level due: custom lesson k-1 finished and level k not made
  const made = place.scenario?.levels?.length ?? 0;
  let levelDue: number | null = null;
  if (hostExists && made < custom.length) {
    const prev = custom[made - 1];
    if (prev && prev.word_ids.every((id: string) => rep.has(id))) levelDue = made + 1;
  }
  return { open: need.length === 0 && hostExists, need, hostExists, levelDue };
}

export const townState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { course, learner, sb } = await ctx(context);
    const ref = await course.ref();
    const rep = await repertoireOf(sb, learner.id);
    const { data: places } = await sb.from("places").select("id,slot,source_id,host,lines,scenario,status").eq("learner_id", learner.id);
    const srcIds = (places ?? []).map((p: Any) => p.source_id).filter(Boolean);
    const { data: sources } = srcIds.length ? await sb.from("sources").select("id,title,plan").in("id", srcIds) : { data: [] };
    const { data: lessons } = srcIds.length ? await sb.from("lessons").select("id,ord,title,word_ids,source_id").in("source_id", srcIds) : { data: [] };
    const { data: items } = await sb.from("content_items").select("place_id,status").eq("learner_id", learner.id);
    const { data: seen } = await sb.from("seen").select("content_id").eq("learner_id", learner.id);
    void seen;
    return (places ?? []).map((p: Any) => {
      const src = (sources ?? []).find((s: Any) => s.id === p.source_id);
      const st = openState(p, src, lessons ?? [], ref, rep);
      const pending = (items ?? []).filter((i: Any) => i.place_id === p.id && i.status === "pending").length;
      return {
        id: p.id, slot: p.slot, status: p.status, title: src?.title ?? "", hostName: p.host?.nameText ?? null, descriptor: p.host?.descriptor_en ?? null,
        ...st, pending, marker: !st.open ? "padlock" : pending > 0 || p.status === "making" ? "cog" : "none",
      };
    });
  });

export const getPlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ slot: z.string().max(20) }).parse(d))
  .handler(async ({ context, data }) => {
    const { course, learner, sb } = await ctx(context);
    const { data: p } = await sb.from("places").select("*").eq("learner_id", learner.id).eq("slot", data.slot).maybeSingle();
    if (!p) return null;
    const ref = await course.ref();
    const rep = await repertoireOf(sb, learner.id);
    const { data: src } = p.source_id ? await sb.from("sources").select("id,title,plan").eq("id", p.source_id).single() : { data: null };
    const { data: lessons } = p.source_id ? await sb.from("lessons").select("id,ord,title,word_ids,source_id").eq("source_id", p.source_id) : { data: [] };
    const st = openState(p, src, lessons ?? [], ref, rep);
    const { data: items } = await sb.from("content_items").select("id,surface,status,level").eq("place_id", p.id);
    // lexicon for every token in the host's text
    const ids = new Set<string>();
    const walk = (toks: Any[]) => (toks ?? []).forEach((t: Any) => t.id && ids.add(t.id));
    walk(p.host?.name); Object.values(p.lines ?? {}).forEach((l: Any) => walk(l)); (p.objects ?? []).forEach((o: Any) => { walk(o.label); walk(o.tap_line); }); walk(p.scenario?.title);
    const lexicon: Record<string, Any> = {};
    for (const id of ids) { const w = ref.words.get(id); if (w) lexicon[id] = { hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning, known: rep.has(id) }; }
    const { count: visits } = await sb.from("seen").select("content_id", { count: "exact", head: true }).eq("learner_id", learner.id).eq("content_id", p.id);
    return { place: p, source: src, ...st, items: items ?? [], lexicon, firstVisit: !visits };
  });

export const markVisited = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ placeId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const sb = context.supabase as Any;
    await sb.from("seen").upsert({ learner_id: context.userId, content_id: data.placeId }, { onConflict: "learner_id,content_id", ignoreDuplicates: true });
    return { ok: true };
  });

/** Level 1 (theme → scenario → neighbour) or a later level (scenario only). One repair per stage. */
export const makePlaceLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ placeId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, place, learner, sb } = await ctx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p, error } = await sb.from("places").select("*").eq("id", data.placeId).single();
    if (error) throw new Error(error.message);
    const { data: src } = await sb.from("sources").select("*").eq("id", p.source_id).single();
    const { data: lessons } = await sb.from("lessons").select("id,ord,title,word_ids,source_id").eq("source_id", p.source_id);
    course.invalidateRef();
    const ref = await course.ref();
    const levels: Any[] = p.scenario?.levels ?? [];
    const level = levels.length + 1;
    const customCount = (lessons ?? []).length;
    if (level > 1 && level > customCount) return { ok: true, level: levels.length, note: "All levels made" };
    const t0 = Date.now();
    const { data: job } = await sb.from("jobs").insert({ learner_id: learner.id, kind: "place", input: { placeId: p.id, level }, status: "running", step: "allowed" }).select("id").single();
    const step = (s: string) => sb.from("jobs").update({ step: s, updated_at: new Date().toISOString() }).eq("id", job.id);
    try {
      await supabaseAdmin.from("places").update({ status: "making" }).eq("id", p.id);
      const allowed = await place.buildLevelAllowed({ core, sb, learner, ref, source: src, level, lessons: lessons ?? [] });
      const hostLine = p.host?.nameText ? `${p.host.nameText} | ${p.host.namePinyin} | the host of this place` : undefined;
      const names = place.baseNames(learner, hostLine);
      const context_ = learner.about ?? "";
      let theme = p.scenario?.theme;
      if (level === 1) {
        await step("place.theme");
        theme = (await place.makeTheme({ learnerId: learner.id, jobId: job.id, allowed, names, context: context_, title: src.title })).chosen;
      }
      await step("place.scenario");
      const soFar = level === 1 ? "" : `Host: ${p.scenario?.levels?.[0]?.host_en}. People: ${p.scenario?.levels?.[0]?.people_en}. Situation: ${p.scenario?.levels?.[0]?.situation_en}. Running joke: ${p.scenario?.levels?.[0]?.running_joke_en}. Content so far: ${levels.map((l: Any) => Object.values(l.ideas ?? {}).map((i: Any) => i.idea_en).join(" / ")).join(" | ")}`;
      const scen = await place.makeScenario({ learnerId: learner.id, jobId: job.id, theme, allowed, names, context: context_, level, soFar });
      let neighbour: Any = null;
      if (level === 1) {
        await step("place.neighbour");
        neighbour = await place.makeNeighbour({ learnerId: learner.id, jobId: job.id, scenario: scen, allowed, names, ref, core });
      }
      const newLevels = [...levels, { level, ...scen, allowedIds: [...allowed.ids] }];
      const patch: Any = { scenario: { theme, levels: newLevels, title: neighbour?.title ?? p.scenario?.title, title_en: neighbour?.title_en ?? p.scenario?.title_en }, status: "ready" };
      if (neighbour) Object.assign(patch, { host: neighbour.host, lines: neighbour.lines, objects: neighbour.objects, art: { stock: true, house_en: neighbour.house_en, room_en: neighbour.room_en } });
      await supabaseAdmin.from("places").update(patch).eq("id", p.id);
      // pending items for console, host and TV, made by later stages
      const idsFor = (words: string[]): string[] => words.map((h) => (ref.wordsByHanzi.get(h) ?? []).find((r: Any) => allowed.ids.has(r.id))?.id).filter(Boolean) as string[];
      const rows = [["console", "game", scen.ideas.game], ["host", "talk", scen.ideas.talk], ["tv", "drama", scen.ideas.drama], ["book", "story", scen.ideas.story]].map(([surface, format, idea]: Any) => ({
        learner_id: learner.id, place_id: p.id, surface, format, level, required_word_ids: idsFor(idea?.words ?? []), payload: { idea }, status: "pending",
      }));
      await supabaseAdmin.from("content_items").insert(rows);
      await sb.from("jobs").update({ status: "ready", step: "done", outputs: { level, elapsedMs: Date.now() - t0, needs: neighbour?.needs ?? [] }, updated_at: new Date().toISOString() }).eq("id", job.id);
      return { ok: true, level, elapsedMs: Date.now() - t0 };
    } catch (e) {
      await supabaseAdmin.from("places").update({ status: p.host ? "ready" : "failed" }).eq("id", p.id);
      await sb.from("jobs").update({ status: "failed", error: (e as Error).message, updated_at: new Date().toISOString() }).eq("id", job.id);
      return { ok: false, level, error: (e as Error).message };
    }
  });
