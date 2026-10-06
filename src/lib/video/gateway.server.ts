// Lovable AI Gateway video jobs (create, poll, download). Server only.
export const VIDEO_MODEL = "google/gemini-omni-1.1-flash";
const BASE = "https://ai.gateway.lovable.dev";

export type VideoJob = {
  id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  progress?: number;
  error?: { code: string; message: string };
};

export class VideoGatewayError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function key() {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new VideoGatewayError(401, "Video service is not configured (missing LOVABLE_API_KEY).");
  return k;
}

async function jobResponse(r: Response): Promise<VideoJob> {
  if (!r.ok) {
    const body = (await r.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    throw new VideoGatewayError(r.status, body?.message ?? body?.error?.message ?? `Video request failed: ${r.status}`);
  }
  return r.json() as Promise<VideoJob>;
}

export async function createVideo(input: string, durationS: number, aspect: "9:16" | "16:9") {
  return jobResponse(await fetch(`${BASE}/v1/videos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: VIDEO_MODEL,
      input,
      response_format: { type: "video", resolution: "720p", duration: `${durationS}s`, aspect_ratio: aspect },
    }),
  }));
}

export async function pollVideo(id: string) {
  return jobResponse(await fetch(`${BASE}/v1/videos/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${key()}` } }));
}

export async function downloadVideo(id: string): Promise<ArrayBuffer> {
  const r = await fetch(`${BASE}/v1/videos/${encodeURIComponent(id)}/content`, { headers: { Authorization: `Bearer ${key()}` } });
  if (!r.ok) throw new VideoGatewayError(r.status, `Video download failed: ${r.status}`);
  return r.arrayBuffer();
}
