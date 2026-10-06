import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createVoiceSession } from "@/lib/ai/openai.functions";
import { Button } from "@/components/ui/button";

// Early live-voice connection check: real microphone, short-lived token from
// the backend, WebRTC to the realtime model. Reports each step truthfully.
export function VoiceCheck() {
  const mint = useServerFn(createVoiceSession);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const pc = useRef<RTCPeerConnection | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const add = (s: string) => setLog((l) => [...l, s]);

  const stop = () => {
    pc.current?.close(); pc.current = null;
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
    setLive(false); setBusy(false);
  };

  const start = async () => {
    setLog([]); setBusy(true);
    try {
      add("Asking for microphone…");
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      add("✓ Microphone allowed");
      const s = await mint();
      if (!s.ok) throw new Error(`Session token failed — ${s.error}`);
      add(`✓ Short-lived session token received (${s.model})`);
      const p = new RTCPeerConnection(); pc.current = p;
      p.ontrack = (e) => { if (audio.current) audio.current.srcObject = e.streams[0]; };
      stream.current.getTracks().forEach((t) => p.addTrack(t, stream.current!));
      const dc = p.createDataChannel("oai-events");
      dc.onopen = () => { add("✓ Data channel open"); dc.send(JSON.stringify({ type: "response.create" })); };
      dc.onmessage = (e) => {
        const ev = JSON.parse(e.data);
        if (ev.type === "session.created") { add("✓ Session connected"); setLive(true); }
        if (ev.type === "response.output_audio_transcript.done") add(`Heard from model: ${ev.transcript}`);
        if (ev.type === "error") add(`✗ ${ev.error?.message ?? "error"}`);
      };
      const offer = await p.createOffer(); await p.setLocalDescription(offer);
      const r = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST", body: offer.sdp, headers: { Authorization: `Bearer ${s.value}`, "Content-Type": "application/sdp" },
      });
      if (!r.ok) throw new Error(`Connect failed — ${r.status} ${await r.text()}`);
      await p.setRemoteDescription({ type: "answer", sdp: await r.text() });
      add("✓ Media connected — you should hear a short greeting");
    } catch (e) {
      add(`✗ ${(e as Error).message}`);
      stop();
    }
  };

  return (
    <div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" disabled={busy} onClick={start}>Run voice connection check</Button>
        {(busy || live) && <Button variant="destructive" onClick={stop}>End</Button>}
      </div>
      <audio ref={audio} autoPlay />
      <ul className="mt-2 space-y-0.5 text-sm">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}
