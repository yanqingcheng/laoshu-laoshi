// Lesson planning for a book (SPEC section 7 step 4, Exact). Pure, shared by server and the approval screen.
export interface Unknown {
  key: string; hanzi: string; pinyin: string; meaning: string; count: number;
  wordId: string | null; inDictionary: boolean; companionOf?: string; evidence: string;
}
export type PlannedLesson = { kind: "prerequisite" | "custom"; title: string; courseLessonId?: string; keys: string[] };

/** Step 4, Exact. */
export function planLessons(unknown: Unknown[], courseLessons: { id: string; ord: number; title: string; word_ids: string[] }[], repertoire: Set<string>): PlannedLesson[] {
  if (!unknown.length) return [];
  const lessons: PlannedLesson[] = [];
  const covered = new Set<string>();
  for (const l of [...courseLessons].sort((a, b) => a.ord - b.ord)) {
    if (l.word_ids.every((id) => repertoire.has(id))) continue; // finished
    const ids = new Set(l.word_ids);
    const teaches = unknown.filter((u) => u.wordId && ids.has(u.wordId) && !covered.has(u.key));
    if (teaches.length >= 3) {
      teaches.forEach((u) => covered.add(u.key));
      lessons.push({ kind: "prerequisite", title: l.title, courseLessonId: l.id, keys: teaches.map((u) => u.key) });
    }
  }
  const rest = unknown.filter((u) => !covered.has(u.key) && !u.companionOf).sort((a, b) => b.count - a.count);
  const comps = unknown.filter((u) => !covered.has(u.key) && u.companionOf);
  const total = rest.length + comps.length;
  if (!total) return lessons;
  const n = total <= 20 ? 1 : Math.round(total / 15);
  const size = Math.ceil(rest.length / n);
  const groups: Unknown[][] = [];
  for (let i = 0; i < n; i++) groups.push(rest.slice(i * size, (i + 1) * size));
  for (const c of comps) {
    const g = groups.find((g) => g.some((u) => u.hanzi === c.companionOf)) ?? groups[0];
    g.push(c);
  }
  groups.filter((g) => g.length).forEach((g, i) => lessons.push({ kind: "custom", title: `Custom lesson ${i + 1}`, keys: g.map((u) => u.key) }));
  return lessons;
}

