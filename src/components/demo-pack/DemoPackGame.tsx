import { useEffect, useReducer, useState } from "react";
import { WordText } from "@/components/WordText";

const items = [
  { id: "bamboo", hanzi: "竹子", pinyin: "zhu2 zi5", meaning: "bamboo", icon: "🎋", x: 0, y: 0 },
  { id: "paw", hanzi: "爪子", pinyin: "zhua3 zi5", meaning: "paw", icon: "🐾", x: 6, y: 0 },
  { id: "fur", hanzi: "毛", pinyin: "mao2", meaning: "fur", icon: "🧶", x: 0, y: 4 },
  { id: "bed", hanzi: "床", pinyin: "chuang2", meaning: "bed", icon: "🛏️", x: 6, y: 4 },
];
const rocks = new Set(["2,1", "4,1", "2,3", "4,3"]);
type State = { x: number; y: number; round: number; order: number[]; feedback: string; mistakes: number };
type Action = { type: "move"; dx: number; dy: number } | { type: "collect" } | { type: "restart" };
export const initialGameState: State = { x: 3, y: 2, round: 0, order: [0, 3, 1, 2], feedback: "Read the word, explore the garden, then collect its matching object.", mistakes: 0 };
export function gameReducer(state: State, action: Action): State {
  if (action.type === "restart") return { ...initialGameState, order: [...state.order.slice(1), state.order[0]] };
  if (state.round >= items.length) return state;
  if (action.type === "move") {
    const x = Math.max(0, Math.min(6, state.x + action.dx));
    const y = Math.max(0, Math.min(4, state.y + action.dy));
    return rocks.has(`${x},${y}`) ? { ...state, feedback: "A rock blocks the path. Go around it." } : { ...state, x, y };
  }
  const found = items.find((item) => item.x === state.x && item.y === state.y);
  if (!found) return { ...state, feedback: "Walk onto one of the four objects, then collect." };
  if (found !== items[state.order[state.round]]) return { ...state, mistakes: state.mistakes + 1, feedback: `That is ${found.meaning}. Read the requested word and try another corner.` };
  return { ...state, round: state.round + 1, feedback: `Found ${found.meaning}! ${state.round === items.length - 1 ? "Your panda scrapbook is complete." : "Now find the next object."}` };
}

/** Prepared book-inspired practice. Deliberately never writes vocabulary or learning progress. */
export function DemoPackGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [help, setHelp] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [hostArt, setHostArt] = useState(true);
  const done = state.round === items.length;
  const target = items[state.order[Math.min(state.round, items.length - 1)]];
  useEffect(() => {
    const keys: Record<string, [number, number]> = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      if (keys[event.key]) { event.preventDefault(); const [dx, dy] = keys[event.key]; dispatch({ type: "move", dx, dy }); }
      if ((event.key === " " || event.key === "Enter") && !(event.target instanceof HTMLElement && ["BUTTON", "A"].includes(event.target.tagName))) { event.preventDefault(); dispatch({ type: "collect" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => setHelp(false), [state.round]);
  const move = (dx: number, dy: number) => dispatch({ type: "move", dx, dy });
  return <section className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-emerald-900/15 bg-[#f9f6e9] p-4 shadow-sm sm:p-6" aria-label="Panda garden game">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Prepared book-inspired game</p><h2 className="text-2xl font-bold text-emerald-950">Panda's little discoveries</h2></div>
      <span className="whitespace-nowrap rounded-full bg-emerald-100 px-3 py-2 font-bold text-emerald-900" aria-label={`${state.round} of 4 collected`}>{state.round} / 4</span>
    </div>
    <div className="flex min-h-24 items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3">
      <div>{done ? <strong className="text-xl text-emerald-800">Garden explored!</strong> : <><p className="text-xs text-slate-500">Find and collect</p><WordText tokens={[{ w: target.hanzi, p: target.pinyin }]} pinyin={showPinyin} tappable={false} size="lg" /></>}</div>
      {!done && <div className="flex flex-col items-end gap-2 text-xs"><button type="button" className="underline" onClick={() => setHelp(!help)}>{help ? target.meaning : "English hint"}</button><button type="button" className="underline" onClick={() => setShowPinyin(!showPinyin)}>{showPinyin ? "Hide pinyin" : "Show pinyin"}</button></div>}
    </div>
    <div className="relative grid aspect-[7/5] grid-cols-7 overflow-hidden rounded-3xl border-4 border-emerald-900/20 bg-[#bfd5a2] outline-none focus-visible:ring-4 focus-visible:ring-amber-400" tabIndex={0} aria-label="Garden. Use arrow keys to move and space to collect.">
      {Array.from({ length: 35 }, (_, index) => {
        const x = index % 7; const y = Math.floor(index / 7);
        const item = items.find((it) => it.x === x && it.y === y);
        const isRock = rocks.has(`${x},${y}`);
        return <div key={index} className={`relative flex items-center justify-center border border-white/10 ${index % 2 ? "bg-white/5" : "bg-emerald-950/5"}`}>
          {isRock ? <span className="text-3xl sm:text-5xl" aria-label="Rock">🪨</span> : item ? item.id === "fur" ? <svg viewBox="0 0 64 64" className="h-10 w-10 sm:h-14 sm:w-14" role="img" aria-label="Soft panda fur"><path d="M8 46 4 30l9 3-3-16 12 8 4-19 8 18 12-15-1 20 15-5-7 24Q32 60 8 46" fill="#fffaf0" stroke="#524c43" strokeWidth="2"/><path d="m17 39 5 6m8-17 1 17m14-9-6 10" stroke="#cec3ae" strokeWidth="3" strokeLinecap="round"/></svg> : <span className="text-3xl sm:text-5xl" aria-label={item.meaning}>{item.icon}</span> : <span aria-hidden="true" className="text-emerald-800/15">{index % 3 === 0 ? "✿" : "·"}</span>}
        </div>;
      })}
      <div className="pointer-events-none absolute flex items-center justify-center transition-all duration-150" style={{ left: `${state.x / 7 * 100}%`, top: `${state.y / 5 * 100}%`, width: `${100 / 7}%`, height: "20%" }}>
        <span className="flex h-[90%] w-[90%] items-center justify-center rounded-full bg-white/85 p-1 text-3xl shadow-lg ring-2 ring-amber-400 sm:text-5xl" role="img" aria-label={`Panda at column ${state.x + 1}, row ${state.y + 1}`}>{hostArt ? <img src="/art/demo-pack/panda-host.png" alt="" className="h-full w-full object-contain" onError={() => setHostArt(false)} /> : "🐼"}</span>
      </div>
      {done && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-emerald-950/85 p-6 text-center text-white"><img src="/art/demo-pack/panda-delighted.png" alt="Happy panda" className="h-36 w-28 object-contain" /><h3 className="text-2xl font-bold">Four little discoveries!</h3><p>You helped the panda explore its book world.</p><button type="button" className="rounded-xl bg-amber-300 px-6 py-3 font-bold text-emerald-950" onClick={() => dispatch({ type: "restart" })}>Play again</button></div>}
    </div>
    <p role="status" aria-live="polite" className="min-h-10 text-center text-sm text-emerald-950">{state.feedback}</p>
    <div className="flex items-center justify-center gap-6">
      <div className="grid grid-cols-3 gap-1" aria-label="Movement controls">
        {[["", 0, 0], ["↑", 0, -1], ["", 0, 0], ["←", -1, 0], ["↓", 0, 1], ["→", 1, 0]].map(([label, dx, dy], i) => label ? <button type="button" key={i} disabled={done} aria-label={`Move ${label === "↑" ? "up" : label === "↓" ? "down" : label === "←" ? "left" : "right"}`} onClick={() => move(Number(dx), Number(dy))} className="h-12 w-12 touch-manipulation rounded-xl border border-emerald-900/15 bg-white text-xl font-bold active:bg-emerald-100 disabled:opacity-40">{label}</button> : <span key={i} />)}
      </div>
      <button type="button" disabled={done} onClick={() => dispatch({ type: "collect" })} className="touch-manipulation rounded-2xl bg-emerald-800 px-6 py-5 font-bold text-white shadow-sm active:bg-emerald-700 disabled:opacity-40">Collect</button>
    </div>
    <p className="text-center text-xs text-slate-500">Arrow keys / WASD + Space, or use the buttons. Practice only — no learning progress is recorded.</p>
  </section>;
}

export default DemoPackGame;

