// The three bundled neighbours, each tied to a course lesson (by order).
// Open rule (Exact): 80% of that lesson's words in the repertoire.
export const BUNDLED = [
  { slot: "mouse", label: "老师 · the mouse teacher", lesson: 0 },
  { slot: "dog", label: "毛毛 · the dog", lesson: 1 },
  { slot: "cat", label: "咪咪 · the cat", lesson: 2 },
];
export const isOpen = (l?: { learned: number; total: number }) => (l ? l.learned / l.total >= 0.8 : false);
