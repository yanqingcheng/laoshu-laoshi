# Laoshu Laoshi planned product specification

Version 2, 6 October 2026, including Qing's decisions on short videos, 80% custom unlocks, queue-only unfamiliar story words and adaptive town text. This is the full planned product for the hackathon repository, including the features beyond the demo. It describes intended behaviour, not verified implementation. Read it with the [complete 38-stage build queue](product/contracts/BACKLOG.md), whose detailed instructions and acceptance checks are part of this specification, subject to the newer decisions recorded here.

Laoshu Laoshi is a Chinese-learning app where the words a learner wants become an explorable personal world. A parent brings a child's book, learns its unfamiliar vocabulary, and gains a themed neighbour with stories, games, shows and conversations that combine those new words with their existing vocabulary. The learning record drives the world. Progress through the world must never substitute for evidence of learning.

## Reading order and authority

Agents should read this document, the [decisions and conflicts register](product/DECISIONS.md), then the relevant stage and exact contracts before implementation. The [source index](product/SOURCES.md) links the planning and prompt repositories, pinned revisions, and local snapshots. The snapshots preserve the full source wording, including assumptions and unresolved questions; summaries here do not remove requirements.

Qing's latest decisions in this specification and the decision register override historical source contracts, including sections labelled Exact. Otherwise, the event prompt pack gives its **SPEC Exact sections** precedence over backlog wording. Its newer typography, pipelines, costing, game concept, media and voice sections supplement shorter stage descriptions. The planning repo preserves wider intent. Remaining material disagreements are recorded rather than silently merged; original snapshots stay unchanged.

| Detailed contract | What it specifies |
|---|---|
| [Learning and world](product/contracts/SPEC.md) | Exact data, scheduler, vocabulary, review, import, source, place and sandbox rules |
| [Chinese rendering](product/contracts/RUBYTEXT.md) | Shared token/pinyin core, WordText, game adapter and visual acceptance |
| [Generation pipelines](product/contracts/PIPELINES.md) | Actual stage outputs, independent checks, bounded repairs, truthful publication |
| [Cost accounting](product/contracts/COSTING.md) | Whole-request usage, attempts, duration and unknown costs |
| [Game concepts](product/contracts/GAME-CONCEPT.md) | Six alternatives, meaningful movement and comprehension, mechanic contracts |
| [Stories and media](product/contracts/MEDIA.md) | Vocabulary selection, narrative, image review, narration and motion comics |
| [Voices](product/contracts/VOICES.md) | Stable casting, OpenAI speech, transcription and listening checks |
| [All 38 stages](product/contracts/BACKLOG.md) | Full implementation instructions, dependencies, done-when and checks |
| [Runtime prompts](product/sources/prompts/attachments/RUNTIME-PROMPTS.txt) | Exact templates, shared blocks, data shapes, repair and art prompts |
| [Full product requirements](product/sources/plan/requirements.md) | All original numbered requirements, rationale, assumptions and open decisions |

Current implementation status lives in [src/lib/stages.ts](../src/lib/stages.ts) and the developer page. A document, generated asset or stage flag is not acceptance evidence. This documentation does not mark any stage built.

## Product principles

- Personal vocabulary is the foundation: source words, dictionary senses, approved companions and actual learner history, rather than a generic beginner list presented as personalisation.
- Deliberate study, input, output and fluency are distinct. The schedule estimates recall; only meaningful recall evidence changes it. Watching, reading, tapping for a meaning and completing a recreational game do not prove recall.
- Core learning remains accessible. Lessons, reviews and eligible drills are never bought with coins or held behind affection. Vocabulary requirements protect comprehension; credits cover personal generation; optional game rewards are separate.
- Home is bilingual and personal. Town defaults to Chinese comprehensible input, with English meanings on tap and whole-caption translations on request. Adapt text difficulty to the learner; English help does not justify incomprehensible Chinese.
- The world should be enjoyable enough to return to: characters, collections, short dramas, choices and daily changes. No numerical streaks, broken-streak debt or plants that die.
- Every interaction works in a phone browser with touch and with a keyboard. Illustrated controls have real buttons and equivalent accessible lists. A plain presentation ultimately offers the same content.
- Every feature is visible from the first preview. Unbuilt features are greyed with “Not built yet” and cannot pretend to work. Loading failures have Retry and never masquerade as empty results.

## Learner journeys

**An existing learner brings a book.** Sign in, privately import real words and schedules, inspect due reviews, enter a title and ordered page photos, review uncertain OCR, inspect unfamiliar senses and proposed lessons, edit and approve the plan. Start the first lesson immediately while the place is generated. Meet the neighbour once its language and identity gates pass, read its four-page story, play its generated game, talk to its host, earn practice coins, and buy, place or gift an eligible object. Home retains everything unlocked for replay.

**A brand-new learner arrives.** Create an account, choose a name and avatar, optionally add a Chinese name and personal context, and say whether they already know Chinese. The initial flow starts lesson 1; stage 34 adds the vocabulary-zero arrival scene, bundled show, conversation and newcomer game before the room tour. The shelf always offers a real next lesson, and completing lesson 1 opens eligible mouse content. No course words are silently declared known to make onboarding look complete.

**An experienced new learner uses placement.** Make one saved decision per word in course order, with an example and a preview of the next ten. Buttons, swipes and keys are equivalent. After five consecutive don't-knows, offer to stop; never batch or infer unseen answers. Save progress for resumption. Known words create the exact declared-known schedules. Open eligible places, offer missing words from earlier lessons as “finish off”, and end with a lesson or review even if every word was marked known.

The [full walkthroughs](product/sources/plan/walkthroughs.md) retain the family context and intended experiences.

## Architecture and durable state

Keep four modules with narrow interfaces:

1. **Word memory** owns repertoire, queue, cards, scheduling, segmentation and validation. Other modules use `submitEvidence`, `queryWords`, `checkText`, `splitText`, `declareKnown`, `queueWords`, `unqueueWord`, `importWords` and `undoLast`. They do not read or write schedules directly.
2. **Content shelf** holds generated and bundled ContentItems and Seen records. Generation publishes here after checks.
3. **Chooser** exposes `serve(learnerId, surface, placeId?)`. Baseline: ready items whose required words are all in the repertoire, unseen first then newest, plus a truthful pending count. The approved exception is medium/hard stories: their explicit unfamiliar words must come only from the learner's queue and fit the selected running-word budget. Keep all actual word IDs and explicit unknown IDs; do not falsify required words or promote them into the repertoire to pass eligibility. For town text variants, select the hardest suitable checked version under the policy below. All selection remains in this module.
4. **World and players** display the chooser's results, report permitted evidence and mark content seen. They do not implement competing eligibility or sorting rules.

Persist Learner, Word, LearnerWord, Card, Evidence, Sentence, SentenceTarget, Source, Lesson, Place, ContentItem, Seen, Job, ReviewSession, Transcript, Compound and Layout records as defined in [SPEC section 3](product/contracts/SPEC.md#3-stored-objects). Later stages add signal logs, exposure counts, ownership/placements, affection, credit transactions and serial continuity. Use UUIDs, UTC storage and learner-local day boundaries. Database ownership must isolate every learner-owned row; bundled places/content can be shared without sharing learner progress.

An evidence request ID is idempotent. Save the previous card state for Undo. A grade advances the UI only after persistence succeeds; failure keeps the answer and card for Retry. Persist review ordering, selected sentences, grades and position server-side. Reloading a job reattaches to it rather than duplicating work. Long generation preserves accepted intermediate results and resumes at the last successful stage.

## Learning and vocabulary

### Course and dictionary

Load the supplied 26 lessons, 326 unique words and 1,028 sentences idempotently, with per-record errors and actual counts on `/status`. Retain [data attribution](product/sources/prompts/attachments/DATA-ATTRIBUTION.txt). The original data envelope is an input, not a prompt to fabricate curriculum. Its course, sentence and dictionary parsing rules are in SPEC sections 6.4 and 6.5.

Words retain Hanzi, tone-number pinyin, meanings, accepted English answers, alternate readings, synonyms and origin. Normal form uses neutral tone 5 and `u:` for ü. Course words take precedence according to the exact matching rule. The dictionary is a backend static lookup, approximately 120,000 entries, searched by Hanzi, pinyin or English; do not describe this approximation as a verified load count. Seed the compound table with 246 transparent and 1,388 opaque entries.

### Repertoire and schedules

Queued means wanted but not acquired. Repertoire means passed in a lesson, declared known or imported with a schedule. Forgetting never removes a word from the repertoire or revokes an already opened neighbour.

Use `ts-fsrs` 5.2.3 with default `fsrs()` settings as the event's exact contract, one card per learner, word and skill. Outcomes map fail/hard/good/easy to Again/Hard/Good/Easy. Preserve the scheduler's fail due time. For a pass, move due to the start of its local due day, or tomorrow if that would be today or earlier. Due means at or before the end of the learner's current local day. A passed card never returns today.

Declared known creates Review cards directly, with difficulty 5, recognition stability/due 30 days and production stability/due 7 days, without fake practice evidence. A word is solid when its recognition card is in Review and predicted recall is at least 0.95; otherwise it is wobbly. Do not show recall percentages to learners. Character recognition is a later optional skill; character production remains deferred.

### Reviews and answer checking

Two daily directions default to ten cards each. Select due cards by due day, seeded shuffle within a day, and retain the chosen sentence throughout the session. Sentences must target the word and contain no other word outside the repertoire; use a word-only card when none qualify.

Recognition shows Chinese, pinyin and the highlighted target, with an English gap if available; otherwise ask for the meaning and reveal the translation after answering. Self-scored particles, measure words and suffixes use the specified self-assessment. Production shows the English and hides every occurrence of the target and its pinyin by token. No production audio before answering.

Correct answers offer Hard, Good and Easy with Good focused. Wrong answers reveal the answer, offer “Mark wrong and continue” and “I was actually right”. Correct syllables with wrong tones get one “Nearly” retry, with Hard focused on success. Missed cards return after the round until a round has no misses; the learner may leave. Undo reverses the last grade. Finish shows count, first-try accuracy and Review more when due cards remain.

One shared checker accepts tone marks/numbers, case and spacing variations, v/ü/u:, neutral 0/5/bare syllables, specified erhua forms, alternate readings and prescribed tone sandhi. Non-neutral tones are required. A synonym prompts another attempt without grading. English uses normalized exact answers, gap-specific answers, split meanings, optional leading “to” and British/American spelling equivalence; no fuzzy acceptance. Phone input includes a pinyin keyboard, system-keyboard option, tone buttons and Enter.

### Lessons and word management

Teach up to the learner's pace per sitting, default five words. Show Hanzi, pinyin, meaning, available image/audio, examples and “I already knew this”. Up to five examples precede two shuffled quiz questions per word, one per skill, using different sentences where possible. Correct is good and wrong is fail through word memory; each word enters the repertoire only after both questions pass. Preserve completed words and lesson position when leaving. Show newly opened content at the end.

Lesson examples may use the repertoire, same-lesson words, the 21 starter words and approved names. Lessons remain accessible out of order; generate missing eligible examples, with a word-only fallback while generation fails or runs.

The word library is searchable and sortable, with status and next due day by skill. A word detail view holds sentences, editable accepted English answers and manual sentences. Learners can queue, move forward or remove queued words; repertoire words cannot be deleted. Dictionary lookup, pasted lists and manual entry remain free and do not require a model. Assisted disambiguation, companion words and conversational packs arrive in stage 27. Never silently substitute assisted generation for free manual entry.

### Import and export

Private import uses the exact version-1 JSON schema in SPEC section 6.6. Preserve supplied scheduler state and due times. At least one non-null direction means repertoire; create a missing direction using declared-known defaults. Two null directions mean queued. Deduplicate a file by most recently reviewed entry, skip words already held, and transact atomically. Report repertoire additions, queued additions and skips. A repeated import adds nothing. Process and discard the whole uploaded file without logging or committing it. Export uses the same round-trippable format.

## Chinese rendering and validation

Every generated Chinese payload is tokenised and checked before storage and display. Validate allowed word membership, stored readings and senses, approved names, punctuation and opaque joined words. Digits and Latin letters are not generated Chinese. `splitText` uses longest dictionary/Word matches and transparent-compound splitting; unknown compound judgements are cached globally. Bundled course sentences and live conversation have the explicitly documented exceptions; do not broaden these exceptions to other generated content.

All app Chinese uses WordText; sandbox text uses the same core through the injected `LaoshuText.render` adapter. Use native whole-word ruby with tone marks above Hanzi, wrapping between words, no stretched characters, clipping or separate pinyin line. Meaning popovers allow queueing; later they add “Learn this sooner”, “I knew this” and undoable “I didn't know this”. A lookup alone changes no schedule. Settings control pinyin and interword spaces.

Check actual multiword screenshots at phone and desktop sizes, plus game states at 320×480, 390×700 and 900×600. Preserve hidden answers across repeated tokens. CSS and overflow checks alone do not establish readable typography. Art never contains model-drawn captions or vocabulary labels.

## Source to lesson to world

1. Accept a title and ordered, reorderable/removable photos, or an original story description. Stage 27 adds English books and packs proposed in conversation.
2. OCR each page and independently compare against its image. Retain gaps, unclear spans and editable uncertainty. Source-bound translation and a new story inspired by a book are different outputs.
3. Segment and resolve words in context, with source evidence and exact senses. Compare with the actual learner snapshot, distinguishing registration, queue membership and acquisition.
4. Plan prerequisites: an unfinished course lesson covering at least three unknown words is included in course order. Remaining unknown words form one custom lesson up to 20 words, otherwise groups of about 15 ordered by source frequency. Zero unknown words means no invented lesson.
5. Let the learner inspect, drop and approve words; later allow reordering, known declarations and companion choices. Explain frequency and what the order opens. Freeze the approved vocabulary/version. Approval creates source, lessons, queued words and place atomically. Delete uploaded photos after approval or cancellation as the event contract requires.
6. Generate lesson sentences immediately, first lesson first, while place and content jobs run. Level 1 uses the approval-time repertoire, prerequisites and custom lesson 1; each later level adds its lesson. Generate level k when lesson k−1 finishes. NEW, BRING IN and remaining allowed groups are explicit; BRING IN selects up to 12 existing words, half weakest and half newest.
7. Generate theme and host identity once; create new scenarios per level. Text identity and language eligibility determine opening; missing art uses truthful stock art. Every content item still checks its own required words.

**Approved custom opening gate:** acquire at least `ceil(0.8 × N)` of the deduplicated approved source senses not yet acquired at approval, and have checked host identity/lines ready. Freeze this denominator at approval, including approved necessary companions; exclude already-acquired words. Zero new words satisfies the language gate immediately. A five-word first lesson does not replace a larger approved-source denominator. Count actual acquisition through word memory, not merely queueing, exposure or unrelated/replayed events. This supersedes the historical prerequisite-plus-first-lesson opening rule. Keep lesson planning and staged generation, while allowing the remaining 20% to be learned after entry. Missing art does not block entry. Bundled places retain their fixed-set 80% rule. Queue edits never shrink the frozen denominator, and forgetting later does not evict a neighbour. Every story/game/object still passes its own vocabulary policy.

**Gate acceptance:** with 48 approved new senses, 38 acquired remains locked and 39 opens once identity is ready. Completing a five-word first lesson cannot open that source by itself. Replayed evidence and queue removal cannot change the count or denominator; a zero-new-word source needs no fabricated lesson.

## World and presentation

Home is an illustrated 3:2 room: desk for reviews, shelf for lessons/stories/finish-off lists, camera and typing entry for sources, radio for listening, phone for vertical episodes, console for games, door for town, windowsill plants and owned decorations. Stage 26 adds full TV and audio replays. Home surfaces aggregate unlocked content across places through the chooser.

The initial town has eight authoritative slots: home, mouse, dog, cat, two custom places, shop, park/gym. It uses raised three-quarter illustrated houses, real buttons, an equivalent list and sideways panning on phones, centred on home. There is no walking between places. Later configurable neighbour/shop/distant-travel plots extend the map; grammar and arcade are planned destinations whose exact placement should not silently invalidate the initial slot contract.

Marker precedence is empty, locked, open with pending content, open with unseen content, none. Locked places show their needed lessons and offer the next. Generation is visible as construction/pending; failures remain distinct from success. The chooser owns these states.

A neighbour has an allowed-word name, appearance, preferences, four greeting functions, up to four inspectable objects, a house, two character poses and a room. Its host, TV, console and coffee-table book open talk, drama, game and story content directly, with next/previous when needed. Hotspot rectangles live as normalized Layout data, with a draggable/resizable developer editor.

### Adaptive town text

Qing's direction is comprehensible input: provide different versions of town text and filter to the hardest version the learner can cope with. Chinese is the default; tapping a word reveals its English meaning in place, and a whole-caption translation can be requested. No trip home is required for help.

For implementation, treat alternative greetings, object lines and other town copy as versions of the same underlying meaning/action. Each version needs checked tokens, its actual required vocabulary, an ordered difficulty level and any explicit content policy. The chooser uses the learner's real vocabulary and strength to select the hardest eligible version; screens do not guess difficulty or simply display the latest generated version. Preserve character identity, intent and available actions across simplification. If only an easier checked version qualifies, use it. If none qualifies, show a truthful unavailable/lesson state rather than unchecked difficult copy. Tapping a gloss does not count as failure or learning evidence.

**Provisional detail:** the precise measure of “can cope with” beyond vocabulary eligibility is not settled. Do not infer a level from lesson number alone or hard-code a new recall threshold as approved policy. Until a broader town policy is chosen, ordinary town copy uses repertoire words; only explicitly medium/hard story content has the approved queue-only unknown allowance. Choosing a harder variant must not remove an easy-story request's solid-only constraint or weaken game/review rules. Live spontaneous voice retains its separate post-conversation audit rule.

**Acceptance:** two learners with different vocabulary can see different checked versions of the same greeting; the strongest eligible version is selected, with an easier fallback when necessary. English help is available without navigation or a scheduling penalty. No ordinary town variant introduces arbitrary unfamiliar words, and variants preserve the same meaning and action.

Mouse teacher, dog Maomao and cat Mimi are the fixed first-three-lesson cast. Their content is shared and made from the associated and earlier lessons. Use the [current art handoff](../ART-HANDOFF.txt), [art direction](art/ART-DIRECTION.txt), manifests and annotated placements. App state controls art, ownership and language eligibility; pictures cannot establish any of them. Preserve reference identity, alpha and originals. Future art calls record full expanded prompts before generation and results/retries afterwards under the workspace and art-handoff logging rules.

## Content and play

### Stories and daily practice

Each place level has a four-page illustrated story, with next/back, Print and shared ruby. Plan motivation, obstacle, consequential action and visual payoff before captions/images. Use meaningful wider review vocabulary as well as source nouns; keep a coverage map. A fresh review checks natural Mandarin, faithful English, causality and continuity; inspect the actual pictures for the intended reveal.

Stage 21 adds easy stories using only solid words, medium with about 2% and hard with about 5% deliberately selected unknown running words. Qing approved these allowances with a strict constraint: unfamiliar words come **only from that learner's queue**, source-relevant first. Percentages are settings. Validate the repertoire plus exactly the selected queued words, record running-word exposure counts, provide contextual help and tap meanings, and repeat encounters around ten times across stories. If no queued word is suitable, use fewer or no unknowns rather than inventing one to fill a quota. Serving must verify unfamiliar words are still queued (or have since been acquired); removing an unknown from the queue cannot leave it implicitly allowed in newly served content. Encounters never acquire words or change schedules. Preserve stricter game, review and lesson policies separately.

**Story acceptance:** a selected queued unknown within budget can appear in a medium/hard story despite not being repertoire. A non-queued unknown fails, even within the percentage budget. An empty queue never produces arbitrary unknowns. Easy stories remain solid-only; story permission cannot leak into games or reviews.

The daily four are recognition review, production review, easy story and a remembered medium/hard choice. Suggest the next, allow any order and extra practice, record completion and time across study/input/output/fluency, and bias tomorrow towards neglected strands. “I read this aloud” records activity, not inferred recall. Optional prechecked story branches send no evidence.

Narration comes from accepted captions and passes transcription/completeness checks. Motion comics combine accepted panels, actual audio duration, stable captions and gentle camera movement; they are not claimed as character animation. Audio postcards, greeting cards and similar formats remain exploratory ideas rather than extra mandatory stages.

### Generated games

One learner request runs a real unattended pipeline: frozen words → six genuinely different concepts, at least four involving player movement → selected mechanic contract → checked data → script → detailed design → HTML → static and browser checks → bounded repair. Meaningful navigation, collecting, carrying, mazes and delivery are possibilities; language must matter to winning. Mechanics and paper/pixel/neon/real low-poly-3D styles are independent. Do not relabel the same quiz as varied gameplay.

Game code contains no Chinese. Verified text arrives via `init` and the trusted shared renderer. Run the assembled page in the exact iframe sandbox/CSP from SPEC, without same-origin, learner state or credentials. Accept only the permitted messages from that iframe. Speech requests are restricted to the game's words. Do not relax security to share typography.

A ready event is a smoke test only. A browser-capable acceptance service must exercise real data, phone/desktop, keyboard/touch, win/loss, all-state restart, readable long text, focus changes and the claimed renderer. Until then the game awaits acceptance. The page has one repair budget shared by source and browser defects. Recreational games send no scheduling evidence.

Today's game favours due/recent repertoire words, differs from yesterday and is visible but locked until both daily reviews finish; if nothing is due it opens immediately. Old games remain replayable. Shared free versus personal credit-funded daily games is a provisional setting.

### Voice and output

Tapping a host starts real Realtime speech with backend-minted short-lived credentials, microphone permission, speaking indicator, text fallback and End. Instructions contain the actual vocabulary and situation. Live drift is acknowledged and audited afterwards; do not claim prevalidated spontaneous speech. Save both sides' transcripts, including what the model heard, split them with word memory, highlight unfamiliar words and allow queueing. Previous transcripts remain accessible. Free conversation itself sends no evidence.

Stage 28 adds a separate output activity: two or three prepared spoken questions after a story. Optional heard-pinyin transcription precedes a typed or spoken answer. A due produce word recalled correctly without being supplied in the question/screen can earn good; a clear error earns hard, omission is not a miss and copying counts for nothing. Spoken answers require learner confirmation of the transcript. At most once per word per day; allow withdrawal as a typo. Responses use repertoire words and corrected wording without pronunciation judgement.

### Dramas and audio

An eight-line checked drama script drives generated paper-cut animation. The app sends stable line IDs, shows WordText captions and speaks; advance when both audio and animation complete, with the specified six-second animation timeout and manual controls. Back/replay, resizing and all lines must work. The phone is a vertical feed; home TV replays eligible shows. Serial episodes continue prior cliffhangers with a hook, reversal, tiny-stakes melodrama and recurring catchphrase, at most one episode per place per day.

The initial radio tape plays Chinese, a pause 1.2 times clip length, Chinese again, the same pause, English, then three seconds silence. Show synchronized text and play/pause/skip. Chinese is slowed about 30%; production cards remain silent until answered. Later pre-generate normal/slow audio, replay saved stories/dialogues hands-free, support background playback and select material using configurable weight `2 / daysSinceLearned^1.2`. The zero-day rule requires definition, not division by zero.

Use stable character voice profiles and OpenAI TTS per the voice contract. Verify complete speech by transcription comparison and listen to demo-selected clips. A failed clip can leave usable text. Short videos are now required scope through Lovable's Video Agents connector, following Qing's 6 October update.

### Short videos

Integrate Lovable Video Agents to turn the accepted short-drama script into generated video for the neighbour TV, home replays and vertical phone feed. This is additional to the paper-cut drama and motion-comic formats. The earlier stage-38 “only if available” scope restriction is superseded; missing connector setup must be reported as an implementation dependency, not a reason to drop video from the product.

The following integration and acceptance requirements apply the existing media, job and vocabulary contracts to the restored feature:

- Inspect the actual connector actions, permissions and supported inputs/outputs before choosing a concrete job contract. Do not invent model IDs, duration limits, prices or capabilities.
- Supply the checked script, stable cast/identity references and accepted scene directions. Preserve hook, reversal and cliffhanger, source sense IDs, learner vocabulary and serial continuity. Keep Chinese captions as real shared-renderer UI overlays rather than model-drawn text in frames.
- Store a resumable video job and its output against the content item, with truthful queued/running/failed states, errors and retry policy. Reloading must not create duplicate jobs or spend. Provider credentials remain server-side; use the connector's supported authenticated integration.
- Inspect the actual returned video for character/prop continuity and required story action. Check any spoken Mandarin against the accepted script with transcription plus listening. Unchecked provider-generated speech or text must not bypass the vocabulary gate. If the connector cannot supply controlled speech, use the accepted narration track through a supported assembly step.
- Publish only after checking playback, captions, sound, timing, aspect/layout on phone and desktop, replay and the host player's navigation. Preserve the item's word eligibility and per-learner seen state. An asynchronous job acknowledgment is not a playable result.
- Account for video generation, verification, repair, audio and assembly costs where exposed; missing metadata remains unknown. Record personal-generation credit pricing before launch under stage 37. Shared lesson videos, if generated as bundled content, use the shared-content entitlement.

**Done when:** a fresh checked episode passes through the actual connector and plays with correct Chinese captions and verified audio on the neighbour TV and phone feed, survives reload, replays from home, and exposes a real failure/retry path. A still animation or prerecorded clip does not satisfy this short-video check. Exact provider setup and limits are to be verified during implementation.

## Progression and additional activities

Coins reward effortful practice: one per graded review card, two per word learned, plus the specified drill-set and job rewards. They buy existing items and plots, never personal generation or learning. The shop opens at 80% of Shopping & Groceries words. Offer an item only when its words are in the repertoire. Buying hides its words and asks for the buying sentence in pinyin. Correct purchase atomically deducts coins and grants ownership; failure gives produce fail, takes no coins and locks that item for 24 hours.

Place/move furniture and trinkets at home, inspect owned words freely, or gift appropriate items to neighbours. Affection unlocks optional greetings and friendship scenes. Wall art uses real Chinese text over illustrated frames. Plants show accumulated care and current backlog, preserve maturity when drooping/recovering, never die and never display a broken numerical streak. Daily changes and welcome-back greetings encourage return.

Park/gym begin with hear/see-and-type-tones drills from repertoire words, no scheduling evidence and one coin per completed ten-round set. Later add browser pitch-contour matching without a speech model, network-off operation after audio load, and repertoire tongue twisters with slow/normal playback. Grammar is available from lesson 1: plain English explanation, three eligible examples and reorder/gap drills, in course pattern order.

Jobs begin with a ten-customer café shift: comprehend repertoire orders, serve by movement/tap, receive corrections and shift coins, more for fewer mistakes. Arcade claw/lucky-dip machines cost coins, show odds, restrict all text/prizes to eligible vocabulary and require the buying test before a prize is kept.

When both skills for every custom-place word are solid, the wider plan moves the neighbour to Old friends; manual early retirement is also supported. Preserve all content and home replays and free the plot. The exact two-skill solidity calculation still needs definition. More slots, credits and archived content must not bypass vocabulary checks.

## Accounts and commercial boundary

Settings include names/context, avatar, timezone, daily counts, lesson pace, pinyin, spacing, character mode, simpler grading, experimental spoken answers, plain view, import/export and sign out. Report a problem stores message, page and browser with a reference number. Sign-in and learner ownership apply from the foundation. Generation limits must be real before public sign-up can spend a shared provider budget.

The optional described avatar is free once, offers three variants and preserves style; ten presets remain available. Character recognition starts empty when enabled, tests Hanzi without pinyin and hides pinyin only on character-solid words. Speaking-only learners never get character tests. Character production stays greyed out pending a decision.

Credits are separate from coins, with a ledger, displayed balance and price before generation. Gift credits provisionally cover one custom neighbour: host/art and level-1 story, game, drama and conversation. Free use includes the bundled course/content, review, rereading, relistening, replay and manual words/sentences. Personal generation is tiered by cost; voice provisionally spends per conversation. Book vocabulary can still be learned without funding a generated place. Only clearly labelled developer test grants exist in this build; no real payment provider or checkout.

## Full scope and delivery order

Every row below is planned scope. Full text and checks are preserved in [BACKLOG](product/contracts/BACKLOG.md); dependencies there remain binding.

| Stage | Planned capability |
|---|---|
| 1 | Accounts, ownership, stored objects, course/dictionary import, status counts |
| 2 | Word memory, FSRS, vocabulary/compound checks, Chinese text, answer checker, developer tools |
| 3 | Two persistent daily reviews, retries, corrections, Undo, mistake rounds |
| 4 | Lessons, examples, declared-known action and two-question quizzes |
| 5 | Private transactional learner import preserving schedules |
| 6 | Illustrated home/town, content shelf/chooser, hotspots, markers, layout/art import |
| 7 | Book photos or described source through approval to custom lessons |
| 8 | Generated theme, scenario, host, lines, objects, levels and opening gates |
| 9 | Personal house, room, character and object art with verified fallback |
| 10 | Generated game pipeline, safe sandbox and browser acceptance |
| 11 | Live neighbour voice, typed fallback and saved transcripts |
| 12 | Animated dramas and vertical phone feed |
| 13 | Word library, dictionary lookup, manual words/sentences and pasted lists |
| 14 | Profile, ten avatars, first lessons and individual placement |
| 15 | Four-page illustrated stories, reader, Print and media pipeline |
| 16 | Listening tape, stored speech and card/lesson speakers |
| 17 | Coins, shop, buying tests, gifts, owned items and plants |
| 18 | Park and gym tone drills |
| 19 | Settings, export and problem reports |
| 20 | Shared story/drama/game packs for all 26 course lessons |
| 21 | Easy/medium/hard stories, exposures and the daily four |
| 22 | Expanded word popovers, spacing controls and all-signal log |
| 23 | Today's generated game and review completion gate |
| 24 | Collectible catalogue, arrange mode, wall art, affection and daily change |
| 25 | Continuing serial dramas and prechecked story choices |
| 26 | Home replays, personal audio tape, slow playback and decay selection |
| 27 | Disambiguation, companions, editable plans, chat packs and English books |
| 28 | Prepared story questions and confirmed output evidence |
| 29 | Hearing review, optional simpler grading and experimental spoken answers |
| 30 | Pitch matching and tongue twisters |
| 31 | Grammar lessons and repertoire-based drills |
| 32 | Café and later job scenarios |
| 33 | Arcade claw machine and lucky dip |
| 34 | Described avatars, lesson-zero arrival and experienced-learner arrival |
| 35 | Configurable extra plots and Old friends |
| 36 | Optional character recognition; production explicitly deferred |
| 37 | Generation credit ledger, gift allowance and test grants |
| 38 | Plain view and generated short videos via Lovable Video Agents; video restored to scope on 6 October |

The launch prompt's priority sequence is foundation/memory/review/lessons, Chinese rendering, import, world/chooser, book intake, place generation, story, games, progression and live voice. Those map to stages 1–11 plus 15 and 17, with dependency checks. Then complete **12, 14, 13, 16, 18, 19**, followed by **20–38**. Prioritisation is not permission to remove later features. An earlier rehearsal cut or prototype fallback is not the complete product.

## Generation acceptance and evidence

Keep one central model configuration and resolve supported model IDs at runtime. The source pack requests Astra for runtime text/planning/code plus configured vision/image/TTS/Realtime capabilities; names and historical prices in snapshots are not independently verified current availability or billing.

Freeze source/vocabulary/reference inputs. Each stage receives its predecessor's actual accepted output and records hashes, attempts and validation. Run deterministic schema, vocabulary, references, dimensions, syntax and events first, then fresh semantic or visual review. Permit one targeted repair per failing stage, recheck the complete replacement, and invalidate dependent output. Enforce whole-request time/spend limits. Exhaustion gives failed, withheld, partial or explicitly permitted fallback states, never fabricated success.

Record parent/run IDs, model/settings, provider request IDs, timestamps, tokens/media units where exposed, checks, repairs and artifacts. Count review calls, transcription and failures. Sum cost across parallel calls but measure elapsed time end to end. Missing usage/cost is unknown, never free. Keep learner content, credentials and failed private artifacts out of public logs.

Acceptance covers the three learner journeys; out-of-order lessons and per-item eligibility; reload/retry/idempotency; private import round-trip; failed reads; microphone refusal; missing audio/art; pending browser acceptance; and phone/desktop accessibility. Inspect real screenshots and actually play games. Preserve the source stage's exact acceptance cases, including Chinese segmentation and pinyin edge cases. [Site acceptance](product/sources/plan/site-acceptance.md) supplies additional historical failure/interruption cases, subject to the current contract differences.

Event delivery also records tool contributions, actual event-time changes and setup that truly needs the user's account. Keep preparation prompts/data/design references distinct from final event implementation and media. A polished demo or an art delivery does not certify the full feature set.
