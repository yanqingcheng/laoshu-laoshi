<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Build prompt: shared Chinese text toolkit

Build this toolkit during the hackathon. Carry forward this prompt, not any afternoon implementation. Games should share a tested renderer rather than asking the model to reinvent Chinese typography in every HTML page.

Implement one token/pinyin core with two adapters: the app’s WordText component, and a small dependency-free DOM renderer for sandboxed games. Both consume the same validated token arrays. Keep app-specific word popovers outside the game adapter. Never weaken the iframe sandbox or enable same-origin access to share code.

## Game adapter contract

Expose `window.LaoshuText.render(tokens, {pinyin: 'marked' | 'unmarked' | 'hidden'})`, returning an HTMLElement. Default to marked. Input tokens remain `{w, p?}`; punctuation has no p. Use textContent to build nodes, never interpolate token strings into HTML. The model calls this API for every Chinese title, instruction, word, order and feedback label. It does not implement its own ruby markup, pinyin conversion or canvas Chinese. Tone flight uses unmarked pinyin while answering and marked pinyin on reveal, without altering stored readings.

Build and verify the renderer once, then have the trusted assembly step inline that same version before generated game scripts in each iframe document. The final document remains self-contained, without a network request for the toolkit. Do not relax CSP, add allow-same-origin or rely on parent DOM access. Record both the model-output hash and the assembled-page/toolkit-version hashes; verify the assembled page that learners actually run. Host assembly is a deterministic build step, not a model-output repair.

## Rendering requirements

Preserve native ruby: `display: ruby` on ruby, `display: ruby-text` on rt, and ruby-position over. Place any inline-block/flex rules on an outer word wrapper. Scope/isolate toolkit styles so a generated game's generic CSS cannot change ruby layout. Theme containers and scene artwork; do not let an art-style pass shrink, clip, move or obscure text.

Hanzi at least 28px and pinyin at least 14px in games. Align pinyin over its own whole word, including multi-character and multi-syllable words. Wrap between words; never split the ruby unit. Keep punctuation with the relevant phrase where possible. Reserve enough height for pinyin, wrapping and growing speech bubbles. No ellipsis, clipping, hidden overflow, overlap with HUD/buttons, or shrinking below the minimum to hide a layout problem. A single word that cannot fit must fail layout validation rather than silently losing characters.

Tone-number conversion: preserve syllable boundaries; normalize u: to ü; mark a or e first, o in ou next, otherwise the final vowel. Neutral tone 5 has no mark. Support ü and erhua, and check the dictionary's syllabic nasal cases. Keep dictionary readings unchanged; spoken tone sandhi is a speech concern. Unmarked mode removes tone marks/numbers without losing ü or syllable boundaries. Reject malformed readings upstream rather than guessing.

The toolkit owns glyphs, token grouping, pinyin modes and internal metrics. The game still owns positioning and must provide adequate space. A shared renderer cannot repair a bubble placed behind the HUD.

## Acceptance before generating games

Build a small test gallery with real token arrays and assert both content preservation and layout at 320×480, 390×700 and 900×600. Include long orders, multi-syllable words, repeated words, punctuation, neutral tones, ü, ou, iu/ui and erhua. Exercise marked/unmarked/hidden modes and resizing. Check native ruby and rt computed display values; inspect screenshots as well as bounds. In each generated game verify every Chinese surface uses the adapter and stays visible through play, feedback, win/loss and restart. A toolkit unit-test pass does not replace checking the assembled game.

Implement this as part of the shared text foundation, before the game generator. All art styles use the same adapter contract. Gate publication on text completeness and layout alongside gameplay checks.

## Latest visual review

Qing still found the experimental comic’s ruby text awkward. Treat typography as unresolved. Apply the shared core to comics, stories and video captions as well as games, with context-appropriate sizing. Review actual multiword sentences for annotation centring, uneven word spacing, line rhythm, punctuation and consistent baseline/line height. Preserve whole-word token semantics; do not stretch Hanzi to match long pinyin or space each character as an unrelated card. Compare rendered screenshots at the intended viewing size. Computed CSS and overflow checks alone cannot establish that it looks good.
