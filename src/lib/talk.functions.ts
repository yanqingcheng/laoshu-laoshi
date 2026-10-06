import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Live voice conversation with a neighbour (BACKLOG stage 11, SPEC 9.3).
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
  const out = new Set<string>();
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from("learner_words").select("word_id,status").eq("learner_id", id).eq("status", "repertoire").range(f, f + 999);
    if (error) throw new Error(error.message);
    data.forEach((r: Any) => out.add(r.word_id));
    if (data.length < 1000) break;
  }
  return out;
}
const toText = (toks: Any[]) => (toks ?? []).map((t: Any) => t.w).join("");

async function loadLevel(sb: Any, item: Any) {
  const { data: p, error } = await sb.from("places").select("*").eq("id", item.place_id).single();
  if (error) throw new Error(error.message);
  const lvl = (p.scenario?.levels ?? []).find((l: Any) => l.level === item.level) ?? p.scenario?.levels?.[0];
  return { p, lvl };
}

/** Write the brief for the latest host item if it is still pending (talk.brief, checked, one repair). */
export const prepareTalk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ placeId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, place, learner, sb } = await ctx(context);
    const { data: items } = await sb.from("content_items").select("*").eq("place_id", data.placeId).eq("surface", "host").order("level", { ascending: false });
    const item = (items ?? [])[0];
    if (!item) return { ok: false as const, error: "This place has no conversation yet." };
    if (item.status === "ready") return { ok: true as const, itemId: item.id };
    const { p, lvl } = await loadLevel(sb, item);
    const ref = await course.ref();
    const ids = new Set<string>(lvl?.allowedIds ?? []);
    const words = [...ids].map((id) => ref.words.get(id)).filter(Boolean);
    const newH = new Set((lvl?.ideas?.talk?.words ?? []) as string[]);
    const allowed = { newW: words.filter((w: Any) => newH.has(w.hanzi)), bring: [], also: words.filter((w: Any) => !newH.has(w.hanzi)), ids };
    const names = place.baseNames(learner, p.host?.nameText ? `${p.host.nameText} | ${p.host.namePinyin} | the host of this place` : undefined);
    const nameSet = new Set(names.map((n: string) => n.split(" | ")[0]));
    const scen = { ...lvl };
    delete scen.ideas; delete scen.allowedIds;
    const { PROMPTS, fill } = await import("@/lib/ai/prompts");
    const allH = new Set(words.map((w: Any) => w.hanzi));
    let checkedTopics: Any[] = [];
    const r = await place.callChecked<Any>({
      learnerId: learner.id, jobId: null, stage: "talk.brief",
      prompt: fill(PROMPTS["talk.brief"], {
        SCENARIO: JSON.stringify(scen), IDEA: lvl?.ideas?.talk?.idea_en ?? "", LEARNER_CONTEXT: learner.about ?? "", LEVEL: String(item.level), PLACE_SO_FAR: "",
        WORDS_AND_RULES: fill(PROMPTS.WORDS_AND_RULES, { ALLOWED: place.allowedText(allowed), NAMES: names.join("\n") }),
      }),
      check: (x) => {
        const probs: string[] = [];
        const topics = x?.topics ?? [];
        if (topics.length < 3 || topics.length > 5) probs.push(`need three to five topics, got ${topics.length}`);
        checkedTopics = topics.map((t: Any, i: number) => {
          const c = place.checkTokens(t.opener ?? [], ids, ref, core, nameSet);
          if (!c.ok) probs.push(...c.problems.map((q: Any) => `topic ${i + 1} opener: ${q.w} — ${q.problem}`));
          return { about_en: t.about_en, opener: c.tokens };
        });
        for (const w of x?.target_words ?? []) if (!allH.has(w)) probs.push(`target word ${w} is not an allowed word`);
        return probs;
      },
    });
    if (r.problems.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("content_items").update({ status: "failed", payload: { ...item.payload, error: r.problems.slice(0, 6) } }).eq("id", item.id);
      return { ok: false as const, error: `The conversation could not be written: ${r.problems.slice(0, 3).join("; ")}` };
    }
    const brief = { host_en: r.out.host_en, situation_en: r.out.situation_en, topics: checkedTopics, target_words: r.out.target_words ?? [], needs: r.out.needs ?? [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("content_items").update({ status: "ready", payload: { ...item.payload, brief } }).eq("id", item.id);
    return { ok: true as const, itemId: item.id };
  });

/** Mint a short-lived realtime credential with talk.instructions filled in. The API key never leaves the server. */
export const startTalk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ itemId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { course, place, learner, sb } = await ctx(context);
    const { data: item, error } = await sb.from("content_items").select("*").eq("id", data.itemId).single();
    if (error) throw new Error(error.message);
    const brief = item.payload?.brief;
    if (!brief) return { ok: false as const, error: "Conversation not ready" };
    const { p, lvl } = await loadLevel(sb, item);
    const ref = await course.ref();
    const words = (lvl?.allowedIds ?? []).map((id: string) => ref.words.get(id)).filter(Boolean);
    const { PROMPTS, fill } = await import("@/lib/ai/prompts");
    const { AI_MODELS } = await import("@/lib/ai/config");
    const names = place.baseNames(learner, p.host?.nameText ? `${p.host.nameText} | ${p.host.namePinyin} | you, the host` : undefined);
    const instructions = fill(PROMPTS["talk.instructions"], {
      HOST_NAME: p.host?.nameText ?? "the host", HOST_EN: brief.host_en, SITUATION_EN: brief.situation_en,
      TOPICS: brief.topics.map((t: Any) => `- ${t.about_en} (you could ask: ${toText(t.opener)})`).join("\n"),
      TARGET_WORDS: brief.target_words.join("、"), TURNS: "6",
      ALLOWED_PLAIN: words.map((w: Any) => `${w.hanzi} | ${w.pinyin} | ${w.meaning}`).join("\n"), NAMES: names.join("\n"),
    });
    const key = process.env["OPENAI_API_KEY"];
    if (!key) return { ok: false as const, error: "OPENAI_API_KEY is not configured" };
    const voice = p.art?.voice ?? "sage";
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 120 },
        session: {
          type: "realtime", model: AI_MODELS.realtime, instructions,
          audio: { input: { transcription: { model: AI_MODELS.stt, language: "zh" }, turn_detection: { type: "semantic_vad" } }, output: { voice } },
        },
      }),
    });
    const j: Any = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false as const, error: `${r.status}: ${j?.error?.message ?? "unknown error"}` };
    return { ok: true as const, value: j.value as string, model: AI_MODELS.realtime, hostName: p.host?.nameText ?? "" };
  });

/** SPEC 9.3 transcript (Exact): splitText each turn, mark words outside the repertoire. Saves and marks seen. */
export const saveTalk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ itemId: z.string().uuid(), model: z.string().max(60), turns: z.array(z.object({ role: z.enum(["host", "learner"]), text: z.string().max(2000), typed: z.boolean().optional() })).max(200) }).parse(d))
  .handler(async ({ context, data }) => {
    const { core, course, learner, sb } = await ctx(context);
    const { data: item } = await sb.from("content_items").select("id,place_id").eq("id", data.itemId).single();
    const ref = await course.ref();
    const rep = await repertoireOf(sb, learner.id);
    const turns = data.turns.map((t) => ({ ...t, tokens: tokenize(core, ref, t.text) }));
    const lexicon = lexFor(turns, ref, rep);
    const { error } = await sb.from("transcripts").insert({ learner_id: learner.id, content_id: data.itemId, place_id: item?.place_id ?? null, turns: { model: data.model, turns } });
    if (error) throw new Error(error.message);
    await sb.from("seen").upsert({ learner_id: learner.id, content_id: data.itemId }, { onConflict: "learner_id,content_id", ignoreDuplicates: true });
    return { turns, lexicon };
  });

function tokenize(core: Any, ref: Any, text: string) {
  return core.splitText(text, { wordsByHanzi: ref.wordsByHanzi, compounds: ref.compounds }).map((t: Any) => {
    if (t.punct) return { w: t.w, punct: true };
    const row = (ref.wordsByHanzi.get(t.w) ?? [])[0];
    return row ? { w: t.w, id: row.id } : { w: t.w };
  });
}
function lexFor(turns: Any[], ref: Any, rep: Set<string>) {
  const lex: Record<string, Any> = {};
  for (const t of turns) for (const k of t.tokens) if (k.id && !lex[k.id]) { const w = ref.words.get(k.id); lex[k.id] = { hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning, known: rep.has(k.id) }; }
  return lex;
}

export const talkHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Any) => z.object({ placeId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { course, learner, sb } = await ctx(context);
    const { data: rows } = await sb.from("transcripts").select("id,created_at,turns").eq("place_id", data.placeId).order("created_at", { ascending: false }).limit(10);
    const ref = await course.ref();
    const rep = await repertoireOf(sb, learner.id);
    return (rows ?? []).map((r: Any) => ({ id: r.id, at: r.created_at, model: r.turns?.model, turns: r.turns?.turns ?? [], lexicon: lexFor(r.turns?.turns ?? [], ref, rep) }));
  });
