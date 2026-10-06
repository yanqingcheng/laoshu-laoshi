// Single source of truth for exact model IDs used by Laoshu Laoshi.
// All values are confirmed against the connected OpenAI account at runtime
// (see checkAiConnection in src/lib/ai/openai.functions.ts) before any
// generation job runs. Never guess model IDs elsewhere in the codebase.

export const AI_MODELS = {
  // Runtime text / planning / code generation (GPT-6 Astra per spec).
  text: "gpt-6-astra",
  // Image generation for places, hosts, stories and game art.
  image: "gpt-image-2",
  // Text-to-speech for narration, stories and spoken cards.
  tts: "gpt-4o-mini-tts",
  // Speech-to-text for verifying generated speech completeness.
  stt: "gpt-4o-mini-transcribe",
  // Live voice conversation with neighbours.
  realtime: "gpt-realtime",
} as const;

export type AiModelKind = keyof typeof AI_MODELS;

// Voice casting: one consistent voice per character role.
export const VOICE_CAST = {
  narrator: "shimmer",
  hostMouse: "sage",
  hostDog: "onyx",
  hostCat: "coral",
  learnerEcho: "nova",
} as const;
