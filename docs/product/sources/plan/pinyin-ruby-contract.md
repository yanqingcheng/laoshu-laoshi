# Pinyin and ruby rendering contract

Owner: the shared Chinese-text renderer and its content adapter. Applies to the [site specification](site-spec.md), illustrated rehearsal and eventual product. Basis: Qing's 5 October instruction that pinyin must always be in supertitles/ruby text, and the [source-backed legacy study](pinyin-legacy-study-2026-10-05.md).

## Placement and visibility

Whenever pronunciation is displayed with Chinese, place it **above its corresponding Hanzi**, using semantic HTML `<ruby>汉字<rt>pīnyīn</rt></ruby>` with `ruby-position: over`. No parenthetical, adjacent, subtitle/below-Hanzi, or sentence-wide detached pronunciation line. Use one shared renderer on lessons, recognition cards, readers, episodes, conversations, names, map labels, word sheets, games, inventories, onboarding and print. Generated images must not bake in language text.

The existing per-learner pinyin setting defaults on. Interpret “always” as placement whenever pinyin is visible, preserving that setting and deliberate assessment concealment. This is an explicit interpretation, not a new claim that Qing removed the setting. If always-visible pinyin was intended, removing the setting is a product change; assessment concealment still takes precedence. Pinyin input fields and explicit raw-data editing/export are not pronunciation annotations.

## Data and alignment

Consume validated lexical tokens `{wordId, w, p}` plus distinct punctuation tokens; preserve stable token/occurrence IDs. Resolve canonical numeric-tone pronunciation from the pinned word sense, and deterministically format its validated syllables into tone marks before rendering. Display tone marks, including ü; never guess readings from Hanzi, split a sentence-level pinyin string against character count, or use CSS to repair bad data. Store reviewed token pronunciation overrides separately if contextual pronunciation is later supported; do not silently invent sandhi.

One whole lexical word is one ruby unit: 毛毛虫 / máo máo chóng and 巧克力 / qiǎo kè lì stay together. 这儿 / zhèr is one unit; 儿子 / ér zi is another. A one-syllable/two-character word is valid. 行's different senses/readings remain different word IDs. Punctuation has no pronunciation and consumes no syllable; it sits on the Hanzi baseline. Latin text, numerals and learner-authored names need an explicit content policy, not accidental indexing as Hanzi.

Reject missing/mismatched readings at the content boundary; expose an actionable unavailable-content state instead of silently displaying shifted or partial pinyin. Count agreement alone does not validate reading, tone or word sense. Word-spacing preference changes only inter-word visual spacing, never token identity or pronunciation alignment.

## Layout and typography

Use native ruby layout inside an atomic, non-breaking word wrapper. Wrap between lexical words; never separate an annotation from its base or break a compound into character cells. Keep closing punctuation with its preceding word and opening punctuation with its following word where possible. Allow the whole word to consume the width its pronunciation needs: even Hanzi spacing is not worth overlapping annotations. Do not estimate annotation width from character count or absolutely position pronunciation outside the text's reserved space.

Reading target is 28–32px Hanzi and 13–15px pinyin at normal zoom. Use a real Chinese font with glyph coverage, deliberately loaded/local and checked after loading; a Latin font followed by an unverified fallback name is not proof. Keep tone marks legible, sufficient contrast and explicit Chinese language metadata (`lang="zh-Hans"`). Reserve first-line headroom, ruby-aware line height and bottom spacing. Card, modal, button and scroll ancestors must not cut off annotations with fixed height or overflow clipping. Text remains live outside illustrated scene masks.

At 320px viewport width and 200% zoom, reflow the surrounding layout and preserve whole words. A token that cannot fit needs an explicit accessible overflow treatment; do not silently clip, shrink to illegibility or insert arbitrary word-internal breaks. Verify loaded and fallback fonts, small labels and long adjacent readings, not just the main heading. Reader pagination must measure ruby-inclusive height; print must retain headroom at page boundaries.

## Access, concealment and copying

Provide exactly one accessible reading per word or utterance, not per-character repetitions of Hanzi and pinyin plus a duplicate label. For interactive words, an accessible button name can contain its Hanzi and approved pronunciation once, with visual ruby excluded from duplicate announcement. For prose, choose and browser/screen-reader-check one language-tagged utterance representation; do not assume `aria-label` on an arbitrary span replaces its descendants. Keep reading text available and all word controls keyboard reachable. Names and labels follow the same concealed/visible policy as pixels.

Mask assessed target occurrences **before** generating visual text, accessible names, hints, copy output or print. Unaided pinyin production/purchase views must not reveal target Hanzi or pinyin in tooltips, image alt text, nearby labels, hidden DOM, or other repeated occurrences. Token/occurrence IDs determine masking; substring replacement must not blank an unrelated compound. Answer reveal happens only at the task's allowed feedback step. Character recognition similarly withholds pronunciation if it would answer the assessment.

Copying Chinese prose defaults to clean Hanzi plus punctuation, once. Offer an explicit annotated export when useful, generated from the same tokens with each word's pronunciation once. Never serialize generic `textContent` as learner copy/export: ruby can concatenate readings with bases. Preserve normal selection and verify clipboard behavior in supported browsers; a dedicated Copy Chinese control is the minimum deterministic route. Print is explicitly annotated ruby, while structured study export keeps Hanzi and canonical pinyin in separate fields.

## Focused acceptance evidence

These are required checks, not claims that they have already passed. Use the same renderer fixture in Chromium, Firefox and WebKit where available; record unavailable engines. Include actual accessible-name/reading checks, not DOM presence alone.

| Case | Required observation |
|---|---|
| 毛毛虫、巧克力、装、双 at 320/375px and 200% zoom | Whole-word wraps; no overlapping or clipped long readings; readable tone marks |
| 你好，我在这儿。儿子在哪儿？ | Punctuation remains at baseline; erhua does not shift following words |
| A long multi-line story in card/modal/word sheet and print | First and later ruby lines visible; page breaks retain full annotation/base units |
| Pinyin and word-spacing toggles, then route change/reload | Preference persists; no token remapping; visible pinyin remains above |
| Same Hanzi with distinct senses/readings; malformed/missing pronunciation | Correct canonical sense; invalid content is caught rather than guessed |
| Repeated production target plus a compound containing the same character | All assessed occurrences masked, unrelated compounds unchanged; no accessibility/copy leakage |
| Keyboard word lookup and screen-reader utterance traversal | Each intended unit announced once; focus and return position preserved |
| Copy Chinese, annotated export, browser print | Plain copy has no pinyin duplication; annotated output has each reading once; print retains ruby |

Mechanical checks should verify token identity, masked output, native ruby structure, canonical conversion and copy serialization. Browser layout and assistive reading require inspection beyond those checks. The prototype may demonstrate a subset, but must identify that subset rather than claim product-wide conformance.
