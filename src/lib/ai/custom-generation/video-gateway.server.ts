/** Server-only integration seam. Supply an authenticated Lovable adapter at runtime.
 * No guessed endpoint/model ID, fake job ID, timer, or placeholder MP4.
 */
export interface VideoRequest {
  ownerId: string;
  requestId: string;
  idempotencyKey: string;
  acceptedShotHash: string;
  model: string;
  prompt: string;
  durationSeconds: number;
  aspectRatio: string;
  audioMode: 'native' | 'controlled';
  references: { url: string; role: 'identity' | 'style' | 'opening-frame' | 'closing-frame' }[];
}

export type VideoJob =
  | { status: 'blocked'; code: 'VIDEO_GATEWAY_NOT_CONFIGURED'; message: string }
  | { status: 'pending'; providerJobId: string }
  | { status: 'failed'; providerJobId: string; message: string }
  | { status: 'rendered'; providerJobId: string; temporaryOutputUrl: string;
      model: string; usage: Record<string, unknown> | null; costUsd: number | null };

export interface LovableVideoGateway {
  /** Adapter must enforce authenticated ownership and durable idempotency. */
  submit(request: VideoRequest): Promise<VideoJob>;
  /** Reconcile an uncertain/timeout submission before retrying it. */
  reconcile(ownerId: string, idempotencyKey: string): Promise<VideoJob>;
  poll(ownerId: string, providerJobId: string): Promise<VideoJob>;
}

const missingGateway = (): VideoJob => ({
  status: 'blocked',
  code: 'VIDEO_GATEWAY_NOT_CONFIGURED',
  message: 'Video generation is not connected yet. The accepted script and storyboard can be retained for later rendering.',
});

/** Rendered output still requires owned storage, media checks and publication. */
export function createVideoGateway(adapter?: LovableVideoGateway): LovableVideoGateway {
  if (adapter) return adapter;
  return {
    submit: async () => missingGateway(),
    reconcile: async () => missingGateway(),
    poll: async () => missingGateway(),
  };
}
