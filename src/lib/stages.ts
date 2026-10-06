// The true build status of every BACKLOG stage. The world greys out anything
// whose stage is not built. Update this list as stages land.
export type StageStatus = "built" | "partial" | "unbuilt";
export interface Stage { n: number; name: string; status: StageStatus; note?: string }

export const STAGES: Stage[] = [
  { n: 1, name: "Foundation", status: "built", note: "Sign-in (email + Google), learner-owned rows, idempotent course load with counts." },
  { n: 2, name: "Word memory and Chinese text", status: "partial", note: "Scheduler, evidence, queryWords, checkText, WordText built. Dictionary lookup in splitText and Astra compound judging not yet." },
  { n: 3, name: "Reviews", status: "built", note: "Server sessions, seeded order, mistake rounds, nearly-tones, undo. On-screen pinyin keyboard is basic tone buttons." },
  { n: 4, name: "Lessons", status: "partial", note: "Word, examples, two-question quiz, I already knew this. Generated sentences for words without any (lesson.sentences) not yet." },
  { n: 5, name: "Import a learner", status: "built", note: "Settings → Import my words, one transaction, dedupes, skips existing." },
  { n: 6, name: "Home and town", status: "partial", note: "Illustrated home, eight-slot town, neighbour rooms and cast; real buttons and unlock markers; full art preview on Dev. Layout editor and content chooser not yet." },
  { n: 7, name: "Bring a book", status: "unbuilt" },
  { n: 8, name: "Make a place", status: "unbuilt" },
  { n: 9, name: "Place art", status: "unbuilt" },
  { n: 10, name: "Games", status: "unbuilt" },
  { n: 11, name: "Live voice", status: "unbuilt" },
  { n: 12, name: "Animated dramas", status: "unbuilt" },
  { n: 13, name: "Word library and adding words", status: "unbuilt" },
  { n: 14, name: "New learner and placement", status: "unbuilt" },
  { n: 15, name: "Stories", status: "unbuilt" },
  { n: 16, name: "Listening tape and spoken cards", status: "unbuilt" },
  { n: 17, name: "Coins, shop, gifts, plants", status: "unbuilt" },
  { n: 18, name: "Park and gym drills", status: "partial", note: "Separate illustrated playground/gym, reciprocal doors and town exits; repertoire tone/pinyin drills. Live audio and learner-session browser acceptance pending; no coin system yet." },
  { n: 19, name: "Settings, export, report a problem", status: "partial", note: "Profile, pace, daily numbers, pinyin toggle, import. Export and report a problem not yet." },
  { n: 20, name: "Content for every course lesson", status: "unbuilt" },
  { n: 21, name: "Story levels and the daily four", status: "unbuilt" },
  { n: 22, name: "Reading aids and the evidence log", status: "unbuilt" },
  { n: 23, name: "Today's game", status: "unbuilt" },
  { n: 24, name: "Collectibles, wall art, affection, daily change", status: "unbuilt" },
  { n: 25, name: "Serial dramas and story choices", status: "unbuilt" },
  { n: 26, name: "Home replays and the personal tape", status: "unbuilt" },
  { n: 27, name: "Better sources", status: "unbuilt" },
  { n: 28, name: "Questions from the mouse", status: "unbuilt" },
  { n: 29, name: "Hearing reviews and simpler grading", status: "unbuilt" },
  { n: 30, name: "Gym and park extras", status: "partial", note: "Local microphone calibration and 16-pair tone circuit with approximate contour feedback. Human microphone validation, reference speech and tongue twisters remain." },
  { n: 31, name: "The grammar place", status: "unbuilt" },
  { n: 32, name: "Jobs", status: "unbuilt" },
  { n: 33, name: "The arcade", status: "unbuilt" },
  { n: 34, name: "Arrival day", status: "unbuilt" },
  { n: 35, name: "More plots, and neighbours who move on", status: "unbuilt" },
  { n: 36, name: "Characters", status: "unbuilt" },
  { n: 37, name: "Credits", status: "unbuilt" },
  { n: 38, name: "Plain view, and video if available", status: "unbuilt" },
];

export function stageBuilt(n: number) {
  return STAGES.find((s) => s.n === n)?.status !== "unbuilt";
}
