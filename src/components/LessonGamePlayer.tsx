import { useEffect, useRef, useState } from "react";
import { acceptedGameMessage, assembleGamePage, gameSpeechWords } from "@/lib/game-sandbox";

export interface LessonGamePlayerProps {
  /** Previously checked generated HTML; learner data and secrets must never be included. */
  html: string;
  /** Checked content tokens and mechanic data only. No learner/session/credential objects. */
  data: unknown;
  title?: string;
  onReady?: () => void;
  onDone?: (score: number) => void;
  /** Supply the app's speech service; without one the available browser zh-CN voice is used. */
  onSay?: (word: string) => void | Promise<void>;
  onClose?: () => void;
  className?: string;
  height?: number | string;
}

/** Isolated content player. Ready means initialized, never publication/learning acceptance. */
export function LessonGamePlayer({ html, data, title = "Lesson game", onReady, onDone, onSay, onClose, className = "", height = "min(760px, calc(100dvh - 130px))" }: LessonGamePlayerProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const callbacks = useRef({ onReady, onDone, onSay });
  callbacks.current = { onReady, onDone, onSay };
  const [document, setDocument] = useState<{ source: string; key: number }>();
  const documentSequence = useRef(0);
  const [restartKey, setRestartKey] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const sendInit = useRef<() => void>(() => undefined);

  useEffect(() => {
    let active = true, ready = false, lastSpeech = 0, spoke = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const words = gameSpeechWords(data);
    setStatus("loading"); setError(""); setScore(null); setDocument(undefined);
    const fail = (message: string) => { if (active) { setStatus("error"); setError(message); } };
    const receive = (event: MessageEvent<unknown>) => {
      if (!active || !frame.current || event.source !== frame.current.contentWindow) return;
      const message = acceptedGameMessage(event.data, words);
      if (!message) return;
      if (message.type === "ready") {
        clearTimeout(timer);
        if (!ready) { ready = true; setStatus("ready"); callbacks.current.onReady?.(); }
      } else if (ready && message.type === "done") {
        // The protocol has no internal-restart event: enforce once/run in game acceptance,
        // not once/iframe here (which would suppress legitimate replay completions).
        setScore(message.score); callbacks.current.onDone?.(message.score);
      } else if (ready && message.type === "say" && Date.now() - lastSpeech > 300) {
        lastSpeech = Date.now();
        if (callbacks.current.onSay) {
          try { void Promise.resolve(callbacks.current.onSay(message.w)).catch(() => { if (active) setError("Speech is unavailable. You can keep playing."); }); }
          catch { setError("Speech is unavailable. You can keep playing."); }
        } else if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(message.w); utterance.lang = "zh-CN";
          window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); spoke = true;
        }
      }
    };
    window.addEventListener("message", receive);
    sendInit.current = () => {
      if (!active) return;
      ready = false; clearTimeout(timer);
      timer = setTimeout(() => fail("The game did not start. Try loading it again."), 10_000);
      frame.current?.contentWindow?.postMessage({ type: "init", data }, "*");
    };
    try {
      timer = setTimeout(() => fail("The game did not start. Try loading it again."), 10_000);
      setDocument({ source: assembleGamePage(html), key: ++documentSequence.current });
    }
    catch (e) { fail(e instanceof Error ? e.message : "Could not load this game"); }
    return () => {
      active = false; clearTimeout(timer); window.removeEventListener("message", receive);
      sendInit.current = () => undefined;
      if (spoke && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [html, data, restartKey]);

  return (
    <section className={`min-w-0 ${className}`} aria-label={title}>
      <div className="mb-2 flex min-h-12 items-center justify-between gap-2">
        <span role="status" className="text-sm">
          {status === "loading" ? "Loading game…" : status === "error" ? "Could not load game" : score !== null ? `Score: ${score}` : title}
        </span>
        <div className="flex gap-2">
          <button type="button" className="min-h-12 rounded border px-3" onClick={() => setRestartKey(k => k + 1)}>{score === null ? "Restart" : "Play again"}</button>
          {onClose && <button type="button" className="min-h-12 rounded border px-3" onClick={onClose}>Close</button>}
        </div>
      </div>
      {error && <p role="alert" className="mb-2 text-sm text-destructive">{error}</p>}
      {document && <iframe key={document.key} ref={frame} title={title} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={document.source} onLoad={() => sendInit.current()} className="block w-full border-0 bg-white" style={{ height, minHeight: 320 }} />}
    </section>
  );
}
