import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, type PitchFrame } from "@/lib/drills/pitch";

export interface PitchTake { frames: PitchFrame[]; audioUrl: string | null }
/** Microphone audio stays in memory on this device. Releasing/unmounting stops all tracks. */
export function usePitchRecorder() {
  const [status, setStatus] = useState<"idle" | "requesting" | "recording">("idle");
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<PitchFrame[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const generation = useRef(0);
  const dispose = useRef<(() => void) | null>(null);
  const finish = useRef<(() => void) | null>(null);
  const urls = useRef<string[]>([]);

  const cancel = useCallback(() => {
    generation.current++;
    dispose.current?.(); dispose.current = null; finish.current = null;
    setStatus("idle");
  }, []);
  useEffect(() => () => {
    generation.current++;
    dispose.current?.();
    urls.current.forEach(url => URL.revokeObjectURL(url));
  }, []);

  const start = useCallback(async (seconds: number, onComplete: (take: PitchTake) => void) => {
    cancel();
    urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current = [];
    const token = generation.current;
    setError(null); setFrames([]); setElapsed(0); setStatus("requesting");
    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let recorder: MediaRecorder | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const cleanup = () => {
      if (timer) clearInterval(timer);
      if (timeout) clearTimeout(timeout);
      if (recorder?.state === "recording") recorder.stop();
      stream?.getTracks().forEach(track => track.stop());
      void context?.close().catch(() => {});
    };
    dispose.current = cleanup;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") throw new Error("This browser cannot record here. Open the app over HTTPS in a browser with microphone support.");
      // Resume in the initiating gesture, before the asynchronous permission dialog.
      context = new AudioContext();
      await context.resume();
      if (token !== generation.current) { cleanup(); return; }
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      if (token !== generation.current) { cleanup(); return; }
      const analyser = context.createAnalyser(); analyser.fftSize = 4096;
      const source = context.createMediaStreamSource(stream); source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const captured: PitchFrame[] = [];
      const chunks: Blob[] = [];
      // Recording playback is optional; pitch capture remains available without MediaRecorder.
      try {
        if (typeof MediaRecorder !== "undefined") {
          recorder = new MediaRecorder(stream);
          recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
          recorder.start();
        }
      } catch { recorder = null; }
      const started = performance.now();
      let done = false;
      const complete = () => {
        if (done || token !== generation.current) return;
        done = true;
        const deliver = () => {
          if (token !== generation.current) return;
          const audioUrl = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder?.mimeType || "audio/webm" })) : null;
          if (audioUrl) urls.current.push(audioUrl);
          setFrames([...captured]); setStatus("idle"); finish.current = null; dispose.current = null;
          onComplete({ frames: captured, audioUrl });
        };
        if (recorder?.state === "recording") { recorder.onstop = deliver; cleanup(); }
        else { cleanup(); deliver(); }
      };
      finish.current = complete;
      timer = setInterval(() => {
        if (token !== generation.current) return;
        analyser.getFloatTimeDomainData(samples);
        const time = (performance.now() - started) / 1000;
        captured.push({ time, hz: detectPitch(samples, context!.sampleRate) });
        setFrames([...captured]); setElapsed(time);
      }, 50);
      timeout = setTimeout(complete, seconds * 1000);
      setStatus("recording");
    } catch (cause) {
      cleanup();
      if (token !== generation.current) return;
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError" ? "Microphone access was not allowed. You can allow it in your browser and retry, or practise without recording." : name === "NotFoundError" ? "No microphone was found. Connect one and retry, or practise without recording." : cause instanceof Error ? cause.message : "Recording did not start. Please retry.");
      setStatus("idle"); dispose.current = null;
    }
  }, [cancel]);
  return { status, error, frames, elapsed, start, stop: () => finish.current?.(), cancel };
}
