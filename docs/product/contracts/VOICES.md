<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Character voice casting

Qing approved the live conversation audio quality on 6 October and requested an OpenAI text-to-speech audition so speech can also be generated during the event. Use OpenAI TTS for tonight’s build, following the positive audition and completeness checks below. This replaces the earlier Azure plan; implementation still happens during the event.

Assign a stable voice profile to each character, matching that character’s established gender, age and personality. Do not infer gender from a provider voice name, species or occupation. If the character design leaves this unspecified, retain a provisional casting choice for review. Keep the same profile across games, stories, lessons and live conversation where that voice is supported. Shared names across TTS and Realtime still need a listening check for consistency.

Store character ID, intended gender/presentation (when established), age range, personality, TTS model and voice ID, delivery instructions, Realtime voice where relevant, and audition/approval status. Change expression and pace for a scene without randomly changing the character’s underlying voice. Include the full voice profile and text in the audio cache key.

Initial audition: gpt-4o-mini-tts with Marin and Cedar, three identical Mandarin lines each: a neighbour question, game instruction and short story. No final gender or character assignment yet. Ask Qing to judge tone accuracy, natural tone sandhi, intelligibility for a beginner, omissions/additions and character fit. Do not infer Mandarin quality from a file decoding successfully.

Generate speech from already verified text. Decode/check the output, retain request ID, reported usage, generation time and audio hash, then cache the clip. A failed synthesis gets a bounded repair/retry and remains included in costing. Event implementation and demonstration audio should be newly generated during the event; afternoon audio is experiment evidence. Clearly label generated voices as AI-generated.

Official guide: https://developers.openai.com/api/docs/guides/text-to-speech

## Listening result and completeness gate

Qing judged both audition voices good enough for the demo. Marin’s story clip omitted some of its supplied text; Cedar’s equivalent included all of it. Exact omissions and cause are not established. No final character-to-voice mapping is approved yet.

For generated clips, transcribe the actual audio and compare it with the verified source text before publishing. Normalize punctuation and spacing, and handle uncertain Mandarin homophones explicitly; ASR agreement is supporting evidence, not a pronunciation guarantee. A mismatch triggers one regeneration and recheck; after another failure withhold the clip and keep the text available. Count transcription and retries in end-to-end cost. Audition representative clips by listening, and listen to all clips selected for the one-minute demo. The later comic experiment exercised transcription comparison successfully for four clips. Tonight’s app still needs its own implementation and checks.

## No audition audio in the product or demo

Carry forward only the speech prompts and validation requirements. Every final clip must be generated during the hackathon. Neither the complete Cedar clip nor any other afternoon output may be reused, embedded, copied or recorded into the demo. Existing user data and visual design guidance are permitted inputs, not permission to reuse generated experimental assets.
