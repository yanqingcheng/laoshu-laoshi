import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { prepareTalk, startTalk, saveTalk, talkHistory } from "@/lib/talk.functions";
import { WordText } from "@/components/WordText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Turn = { role: "host" | "learner"; text: string; typed?: boolean };

// Live spoken conversation with a neighbour. Real microphone over WebRTC with a
// short-lived backend credential; text box works even if the mic is refused.
export function TalkPanel({ placeId, hostName, onClose }: { placeId: string; hostName: string; onClose: () => void }) {
  const prep = useServerFn(prepareTalk);
  const start = useServerFn(startTalk);
  const save = useServerFn(saveTalk);
  const hist = useServerFn(talkHistory);
  const [phase, setPhase] = useState<"preparing" | "connecting" | "live" | "saving" | "transcript" | "error">("preparing");
  const [err, setErr] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<any>(null);
  const [past, setPast] = useState<any[]>([]);
  const pc = useRef<RTCPeerConnection | null>(null);
  const dc = useRef<RTCDataChannel | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const meta = useRef<{ itemId: string; model: string } | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  const add = (t: Turn) => { turnsRef.current = [...turnsRef.current, t]; setTurns(turnsRef.current); };

  const cleanup = () => {
    dc.current?.close(); pc.current?.close(); pc.current = null; dc.current = null;
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
  };
  useEffect(() => () => cleanup(), []);

  useEffect(() => {
    (async () => {
      try {
        const r = await prep({ data: { placeId } });
        if (!r.ok) throw new Error(r.error);
        setPhase("connecting");
        try { stream.current = await navigator.mediaDevices.getUserMedia({ audio: true }); setMicOk(true); } catch { setMicOk(false); }
        const s = await start({ data: { itemId: r.itemId } });
        if (!s.ok) throw new Error(s.error);
        meta.current = { itemId: r.itemId, model: s.model };
        const p = new RTCPeerConnection(); pc.current = p;
        p.ontrack = (e) => { if (audio.current) audio.current.srcObject = e.streams[0]; };
        if (stream.current) stream.current.getTracks().forEach((t) => p.addTrack(t, stream.current!));
        else p.addTransceiver("audio", { direction: "recvonly" });
        const ch = p.createDataChannel("oai-events"); dc.current = ch;
        ch.onopen = () => { setPhase("live"); ch.send(JSON.stringify({ type: "response.create" })); };
        ch.onmessage = (e) => {
          const ev = JSON.parse(e.data);
          if (ev.type === "conversation.item.input_audio_transcription.completed" && ev.transcript?.trim()) add({ role: "learner", text: ev.transcript.trim() });
          if (ev.type === "response.output_audio_transcript.done" && ev.transcript?.trim()) add({ role: "host", text: ev.transcript.trim() });
          if (ev.type === "output_audio_buffer.started") setSpeaking(true);
          if (ev.type === "output_audio_buffer.stopped" || ev.type === "response.done") setSpeaking(false);
          if (ev.type === "error") setErr(ev.error?.message ?? "Voice error");
        };
        const offer = await p.createOffer(); await p.setLocalDescription(offer);
        const resp = await fetch("https://api.openai.com/v1/realtime/calls", { method: "POST", body: offer.sdp, headers: { Authorization: `Bearer ${s.value}`, "Content-Type": "application/sdp" } });
        if (!resp.ok) throw new Error(`Could not connect the voice call (${resp.status})`);
        await p.setRemoteDescription({ type: "answer", sdp: await resp.text() });
      } catch (e) {
        cleanup(); setErr((e as Error).message); setPhase("error");
      }
    })();
  }, [placeId]);

  const sendText = () => {
    const t = typed.trim();
    if (!t || !dc.current || dc.current.readyState !== "open") return;
    dc.current.send(JSON.stringify({ type: "conversation.item.create", item: { type: "message", role: "user", content: [{ type: "input_text", text: t }] } }));
    dc.current.send(JSON.stringify({ type: "response.create" }));
    add({ role: "learner", text: t, typed: true });
    setTyped("");
  };

  const end = async () => {
    cleanup();
    if (!meta.current) return onClose();
    setPhase("saving");
    try {
      const r = await save({ data: { itemId: meta.current.itemId, model: meta.current.model, turns: turnsRef.current } });
      setResult(r);
      setPast(await hist({ data: { placeId } }));
      setPhase("transcript");
    } catch (e) { setErr((e as Error).message); setPhase("error"); }
  };

  return (
    <div className="paper-card mt-3 p-4" aria-live="polite">
      <audio ref={audio} autoPlay />
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Talking with {hostName}</h2>
        {phase === "live" || phase === "connecting" ? <Button variant="destructive" onClick={end}>End</Button> : phase === "transcript" || phase === "error" ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
      {phase === "preparing" && <p>Getting the conversation ready…</p>}
      {phase === "connecting" && <p>Connecting{micOk === false ? " (microphone blocked — you can type instead)" : "…"}</p>}
      {err && <p className="text-destructive">{err}</p>}
      {phase === "live" && (
        <>
          <p className="text-sm">{speaking ? `🔊 ${hostName} is speaking…` : micOk ? "🎙 Your turn — speak in Chinese, or type below." : "Microphone blocked — type below."}</p>
          <ul className="my-3 max-h-60 space-y-1 overflow-y-auto text-sm">
            {turns.map((t, i) => <li key={i}><strong>{t.role === "host" ? hostName : "You"}:</strong> <span lang="zh-CN">{t.text}</span></li>)}
          </ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendText(); }}>
            <Input aria-label="Type instead of speaking" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type in Chinese or pinyin…" />
            <Button type="submit">Send</Button>
          </form>
        </>
      )}
      {phase === "saving" && <p>Saving the transcript…</p>}
      {phase === "transcript" && result && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Dotted words aren't in your words yet — tap one to add it.</p>
          {result.turns.length === 0 && <p>Nothing was said.</p>}
          <ol className="space-y-3">
            {result.turns.map((t: any, i: number) => (
              <li key={i}>
                <div className="text-xs font-semibold text-muted-foreground">{t.role === "host" ? hostName : t.typed ? "You (typed)" : "You (as heard)"}</div>
                <WordText tokens={t.tokens} lexicon={result.lexicon} size="sm" markUnknown />
              </li>
            ))}
          </ol>
          {past.length > 1 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold">Earlier conversations with {hostName} ({past.length - 1})</summary>
              {past.slice(1).map((c) => (
                <div key={c.id} className="mt-3 border-t pt-2">
                  <div className="text-xs text-muted-foreground">{new Date(c.at).toLocaleString()}</div>
                  {c.turns.map((t: any, i: number) => <WordText key={i} tokens={t.tokens} lexicon={c.lexicon} size="sm" markUnknown />)}
                </div>
              ))}
            </details>
          )}
        </div>
      )}
    </div>
  );
}
