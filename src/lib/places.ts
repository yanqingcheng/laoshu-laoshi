// The three bundled neighbours, tied to the first three course lessons after the
// lesson-0 starter (SPEC: "Lesson 0 needs no vocabulary").
// Open rule (Exact): 80% of that lesson's words in the repertoire.
export const BUNDLED = [
  { slot: "mouse", label: "老师 · the mouse teacher", lesson: 1 },
  { slot: "dog", label: "毛毛 · the dog", lesson: 2 },
  { slot: "cat", label: "咪咪 · the cat", lesson: 3 },
];
export const isOpen = (l?: { learned: number; total: number }) => (l ? l.learned / l.total >= 0.8 : false);
