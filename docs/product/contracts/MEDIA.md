<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Build prompt: personal stories, comics and motion comics

Build all implementation and generate all final scripts, artwork, speech and video during the event. Afternoon outputs are experiment evidence only. This brief supplements the story rules in SPEC.md and PROMPTS.md; it does not permit new unchecked vocabulary.

## Inputs and vocabulary selection

Supply the actual approved learner vocabulary with IDs, readings, senses, mastery/review state, the new source vocabulary, current theme and established characters. Tom’s private vocabulary is loaded at runtime, never committed here. Do not substitute a generic beginner list or invent review/due status. Where review state is absent, label selection as vocabulary reuse rather than claiming spaced-repetition scheduling.

Choose a manageable set of new target words and a broader, meaningful set of existing words that support actions, relationships, feelings and a payoff. Show a coverage map: each selected word, why it is useful, and where it will appear. Prefer due words when that state is supplied. Avoid repeating only the source book’s nouns. Do not force every known word into a short story or sacrifice natural Mandarin to hit a count.

## Script prompt

From the supplied vocabulary, propose three genuinely different four-beat stories. Each needs a character who wants something, an obstacle or misunderstanding, an action that changes the situation, and a satisfying visual payoff. Give each a short synopsis and explain how existing vocabulary helps tell the story. Select the strongest; do not merely describe four pictures of characters eating.

Return a structured script with stable panel IDs, visual action, exact tokenised Chinese caption/dialogue, faithful English, speaker ID, source vocabulary references, illustration instructions and narration text. Let pictures carry action that would require unapproved words; captions must remain comprehensible and natural. Keep character identity, props and location continuous. Do not place learner text inside generated artwork.

## Checks and generation

1. Check schema, vocabulary membership, senses, pinyin, exact caption/narration equality and the coverage map. A word shown only in an English art instruction does not count as Chinese practice.
2. In a fresh context review natural Mandarin, causality, character motivation, visual payoff and whether wider review vocabulary contributes meaningfully. Compare against the supplied learner snapshot. Repair the failed stage once and recheck; withhold if it still fails.
3. Generate illustrations from accepted scripts and identity references. Inspect the actual images for continuity and the visible payoff.
4. Render captions using the shared Chinese text core. Review spacing and ruby alignment at phone, desktop and video sizes; no text baked into image generation.
5. Generate narration from accepted captions, transcribe and compare each clip, then listen to demo-selected speech. Follow VOICES.md for casting.
6. For motion comics, assemble the accepted panels with gentle camera movement, cuts and narration using FFmpeg. Derive timing from actual audio duration, allowing a short lead and reading hold. Keep captions steady and legible. This is a motion comic; do not claim character animation.
7. Check the final export, duration, audio, text, playback and seeking. Count script/reviews/repairs, artwork, TTS and transcription in the same request. Missing image usage means the total is incomplete, not zero.

Other compact formats worth considering after the core demo works: illustrated audio postcards, picture-book slideshows, character greeting cards and short staged dialogues. These are optional ideas, not promises to build all formats in two hours.
