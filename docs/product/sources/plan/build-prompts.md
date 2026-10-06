# Build Laoshu one working step at a time

Current text/image checkpoint: [site-spec.md](site-spec.md), [rehearsal-prompts.md](rehearsal-prompts.md), and [design reference](../design/README.md). The S-stage sequence controls the next rehearsal; earlier B/P stages remain coverage and later-product context. Voice/video can wait.
Start with **B00, the vocabulary check**, then **B01, the learning record**. These make the content experiments measurable and give every later screen the same learner state. The sequence below translates the 5 October afternoon requirements into build prompts. The order, time budgets and demo cuts are execution proposals; the product decisions remain Qing's.

## What to give the builder

Required project notes: [requirements](requirements.md), [walkthroughs](walkthroughs.md), [screen design](design.md), [content prompt drafts](prompts.md), [prompt-logging instructions](../CLAUDE.md), and this file. Requirements win wherever the documents disagree. The old application's [product description](product-description/README.md) is required behaviour reference for B01, not implementation code to copy.

Use these notes in a private rehearsal. At the event, first ask what prepared notes, prompts, assets and data are allowed. Create the event repository fresh and bring only permitted inputs. The October 4–5 prototype and workshop are separate prior experiments; their code and outputs are not event inputs by default.

Paste this standing instruction once, then one stage prompt at a time:

```text
Build Laoshu Laoshi from the supplied requirements.md, walkthroughs.md,
design.md, prompts.md, build-prompts.md and CLAUDE.md. The current stage prompt limits
what you build now; retain later requirements in the backlog. requirements.md
governs product behaviour. Preserve its R identifiers and assumed/open labels.
Work from fresh code. Use the project's available backend and keep provider
keys on the server. State which model/provider is actually configured; do not
invent a model identifier or claim an offline fixture is live generation.

Use one word record, one scheduler, and one evidence entry point. A record is
one learner's recall history for one word and skill. Keep saved/queued words,
learned words, and words explicitly marked known distinct. Passive reading,
watching, looking up a meaning and playing today's game do not improve recall
records. Every screen must work in a phone browser by touch and by keyboard,
with visible focus, labelled controls, and alternatives to swiping/dragging.

Each stage ends with a usable screen and its stated completion checks. Handle
pending, empty, failed and resumed states honestly. Keep prior working paths
usable. Show a concise result and any missing provider, input or product decision.
Do not build a speculative payment scheme or settle an open product decision.
Record every actual generation prompt and its settings in prompt-log as the
project's CLAUDE.md requires. Private learner inputs and scanned-book text are
referenced by private file/placeholder, never embedded in a public repository.
```

## Order and coherent demo cuts

All B and P items are **execution-task** items. X items are **test-charter** items; G items are **decision** items. This repo has no tracker binding: this document and [build-backlog.json](build-backlog.json) hold the work, rather than creating a new tracker. A requirement link is planned coverage, not proof of implementation.

| Step | Deliverable | Depends on | Can show after it works |
|---|---|---|---|
| B00 | Independent Chinese-content validation | — | A good fixture accepted; a bad one rejected |
| B01 | Four recall records, due review, evidence log | B00 | Both spoken-language review directions saved correctly |
| B02 | Home and recoverable plants | B01 | A useful room with desk, bookshelf, radio, TV, console, camera and door |
| B03 | Scan/resolve words into a learning queue | B00, B01, B02 | Bring a book; choose its new words |
| B04 | Lessons, quiz and stored speech | B03 | Teach a few chosen words at home |
| B05 | Shared generation jobs and vocabulary snapshot | B04 | Building site appears while content is made |
| B06 | Map, eligibility and book neighbour | B02, B05 | Open the new house when its language gate is met |
| B07 | Checked drama, stills and speech | B06 | TV episode with a cliffhanger |
| B08 | Checked game data, isolated game and replay | B05, B06 | Play the generated game as the climax |
| B09 | Planned conversation, typed first, voice tested | B06 | Talk to the neighbour; fallbacks finish the exchange |
| B10 | New and experienced learner arrival | B01, B02, B04, B06 | Name/avatar, lesson 0 or individual swipes, a useful first day |
| B11 | Story levels, print and radio tape | B05, B06, B09 | Daily reading, output and hands-free replay |
| P01 | Full course and all intake routes | B03, B10 | Course packs, described sources and free manual additions |
| P02 | Full daily selection and practice balance | B11 | Due words and recent material drive the daily four |
| P03 | Shops, gifts, ownership and coin ledger | B09, P02 | Buy by saying it; failed item waits 24 hours |
| P04 | Open drill places and job scenarios | P01, P02 | Gym, park, grammar and café practice |
| P05 | Bundled free content and paid generation | P01, P03 | Content filtered to each learner; separate coins and credits |
| P06 | Broader world and presentation choices | P04, P05 | Collectibles, daily change, archived neighbours and alternate views |
| P07 | Whole-product reliability and release checks | P06, B07, B08 | Checked persistence, privacy, corrections and accessibility |

**Demo cuts.** B00–B04 is a complete “bring your words and learn them” demo. B00–B07 adds the world and drama. B00–B08 adds the game climax. B09 adds the conversation that Qing includes in the full demo; typed pinyin remains available if microphone testing fails. B10 and B11 make the demo product useful to a new learner and cover the wider daily flow. P01–P07 preserve the real product beyond the event; they are not promised within four hours.

Build order differs from stage order on screen: in the full demo, conversation comes before TV, then the game. Proposed four-hour budget: first 10 minutes settle event rules/provider access; by 60 minutes B01–B02; by 120 minutes B03–B04; by 175 minutes B05–B06; by 210 minutes whichever of B07–B09 has good content; reserve the last 30 minutes for checks and rehearsal. If a stage is late, use the last complete demo cut. These are stopping targets, not generation-latency evidence.

## Copyable stage prompts

These use the standing instruction and required project notes above. Attach the named content prompt sections only when implementing that call. No draft in prompts.md is certified merely because it appears here.

### B00 — Account for every Chinese word

```text
Implement B00, the shared content checker, before the UI consumes generated
Chinese. Follow R12, R38-R43a and prompts.md section 5. Define an explicit
content-type schema for lessons, stories, conversation plans, neighbours,
dramas and game DATA. Validate every learner-visible Chinese field, including
titles, names, greetings, gifts, open questions, and game instructions.

Validate word objects independently against a pinned dictionary and reading
table. Preserve dictionary tones in stored pinyin; spoken sandhi belongs in
display/audio and accepted-answer logic. Do not certify words using the model's
own pinyin or segmentation alone. Detect a prohibited whole dictionary word
hidden by adjacent allowed pieces; ambiguous segmentation is a review finding,
not an automatic proof that a compound was used. Keep sense/reading IDs where
characters have multiple meanings. Explicit names and numbers need declared
readings; punctuation is not a vocabulary word.

The caller supplies an immutable policy: allowed word/sense IDs, target counts,
chosen unknown words and running-word budget, approved companions, names and
shape constraints. Compute the actual unknown running-word share after output,
including approved extras: declaring a word never makes it known or free of the
budget. Lesson examples permit their target and introduced companions; easy
input permits no unfamiliar words. Medium/hard budget values are settings.

Return findings with field/line and reason. Initial generation plus at most
two repairs use the same policy. A third failed result is withheld, logged,
and offers retry or other activity. Naturalness needs human reading even after
a code pass. Report any missing dictionary coverage as unverified, never pass.

Done: accept a checked original fixture; reject an undeclared word, incorrect
pinyin, a hidden compound, an over-budget extra and a target omitted from a
lesson. Reject a conversation ask/simpler containing its recall target and a
drama with 11 lines. Recompute counts on repaired text, not on repair advice.
```

### B01 — One learner record and reliable review

```text
Implement B01 from R1-R4, R8-R14a, R64-R65. Give each word a sense ID and each
learner up to four separate skill records: recognition by sound/pinyin,
recognition by characters, production by sound/pinyin, production by characters.
That two-by-two mapping is the requirements' provisional interpretation.
Tom's demo disables character testing: keep displaying Hanzi with pinyin,
schedule only sound/pinyin records. Reserve character records without claiming
an unimplemented handwriting or typed-character assessment.

Implement both review directions and whole-sentence listening. Use one pinyin
answer checker with required tones, numeric/marked tones, v/ü, case/spacing
normalisation and accepted sandhi. Test incorrect tones too. Accepted English
meanings are resolved in advance; review does not wait for an LLM.

Use a documented spaced scheduler with per-skill state. If it is a simpler
prototype scheduler, label it and do not call it legacy FSRS parity. Provide
one submitEvidence entry point with event ID, learner, word/sense, skill,
activity, easy/medium/hard pass or fail (manual Good maps to medium),
revealed/hinted status, timestamp and correction
reference. Evidence eligibility is an explicit per-activity policy. Log used
and unused events; suppress duplicate IDs and outside-card daily duplicates.
Save evidence and schedule atomically before advancing. Correct/undo by linked
events and restore the affected schedule; keep original events in the log.

R11e leaves replacement grading open: retain R11/R11a's existing manual grades
temporarily and label that choice in developer notes. Do not adopt timing or
backspace-based grading. Support the typo correction and last-grade undo.
Use synthetic demo state by default. A private export needs an explicit mapping;
READY/LEARNED list status alone is never evidence of known words or four skills.

Done: fail/save/retry and double-submit do not skip or double-grade a card;
reload resumes; a second tab cannot corrupt an active review; undo restores
the previous schedule while retaining both events; character-off leaves Hanzi
visible and character skills absent from the due queue. Show a usable empty
state and distinct failed lookup. Check old-app verification scenarios from
docs/product-description without copying its code.
```

### B02 — Home where all practice is reachable

```text
Implement B02 from R80-R83a, R93-R94, R100-R100b and R115-R123. Make an
illustrated bilingual room with labelled keyboard-focusable hotspots: desk
reviews and notebook, bookshelf lessons, radio tape, TV old episodes, phone
short videos, console replay, camera/keyboard intake, plants and front door.
Connect working B01 paths; later paths say what is coming, with useful next
actions, rather than pretending empty placeholders are finished features.

Plants reflect completed daily reviews and current due backlog. Other deliberate
practice can earn coins without automatically watering the plants. They
grow, wilt and recover, never die and never show a numerical streak or debt.
Keep that provisional state calculation separate from recall scheduling.
Learning stays accessible regardless of game locks. Reduced motion and a plain
labelled action list make the illustrated room usable on a phone and by keys.

Done: complete a review from the desk, return home, reload and see the same
learner state; all hotspots have touch/key equivalents; simulated return after
a gap shows recoverable plants and a useful next lesson/review.
```

### B03 — Bring a book or a word

```text
Implement B03 from R18, R20-R29 and R121, using prompts 1-3. Photograph/upload
the complete supplied book, show page count/order and transcription uncertainty,
and let the learner correct uncertain input before extracting a vocabulary
list. Reading each supplied page must not invent missing text. Scanned source
text is temporary extraction input; retain vocabulary/provenance, not a
reproduction or retelling of the book. Described original sources later have
their own retention policy (P01). Private photos/text never enter the public repo.

Compare word senses with the record, distinguishing saved, taught and known;
propose learning order with reasons, essential companions, and a code-enforced
pace cap. Learner accepts/skips or marks individual words already known.
Handle English/Hanzi/pinyin word resolution and real ambiguity. Do not auto-add
companions or treat imported registration as mastery. Manual fully specified
word/sentence entry is free and available without a provider or credits.

Done: add an original synthetic page and word, correct a transcription, choose
new words, reload the queue and see no schedule changes until an explicit
learning/known action. Duplicate senses merge safely, distinct senses stay
distinct; provider failure retains the intake and offers retry/manual review.
```

### B04 — Learn words while content is prepared

```text
Implement B04 from R5-R7, R15-R16, R27-R29 and R116, using prompt 5 and B00.
At home choose the next small lesson. Introduce each word with Hanzi, numbered
pinyin converted for display, meaning, an image and three checked example
sentences; companions must be explicitly introduced/approved, never silently
assumed known. A quiz pass admits the word to scheduled review. Allow the
individual 'I already knew this word' route and catch missed course words.

Use Azure Mandarin speech at normal/slowed speed, generated and stored ahead
of playback through a server boundary. No key in the browser. Identify unavailable
speech honestly; an audio-unavailable prototype is not completion of R15.
Bind image/audio to exact text/version so a changed lesson cannot reuse stale
assets. A slow or failed generation offers another ready lesson or retry.

Done: introduce and quiz an original target; failed quiz does not mark it
learned; pass creates the intended skill records once; replay uses stored
audio; a companion never becomes known from appearing in a sentence. Time an
actual five-word walkthrough separately for the generation-overlap experiment.
```

### B05 — Generate from one snapshot

```text
Implement B05 from R4, R30-R34a, R38-R43a, R64a, R107 and R126. Create a
shared generation snapshot: learner/word-sense IDs and states, relevant due
skills, sure vocabulary, newly taught targets, upcoming lesson targets (not yet
learned), chosen unknowns, companion approvals, source vocabulary/subject, family/cast, level and policy version.
Sure vocabulary is not the whole imported record. Feed every genre this same
snapshot and B00 policy; a genre cannot modify schedules. Generation can
prepare upcoming lesson targets before the learner sees the lesson, but only
a quiz pass/explicit known action changes their state. Publication rechecks
the current learned/selected-unknown policy; planned teaching is not evidence.

Create independent jobs for neighbour, planned conversation, drama and game,
in demo priority order. Jobs have queued/running/checking/ready/failed states,
immutable input IDs, cancellation and bounded repair. Persist job state and
result identity; repeat polling/retry cannot spend credits twice or duplicate
content. Editing/deleting/resetting inputs invalidates publication from old
jobs; stored old content retains a clear original context label and readiness
check. A building site can exist while jobs run; lesson/review never waits.

Done: delayed old result after changing words cannot appear as current;
changing learner/source cannot cross-bind a result; a failure is visible and
recoverable; vocabulary edits refresh all load/readiness checks. Record actual
provider name and duration; no latency estimate is represented as measured.
```

### B06 — A map and a neighbour from the book

```text
Implement B06 from R84-R95, R124-R131 and R137 using prompt 11. The town is
a tapped map, not a walking game. Show standard friends, future lesson plots,
and one synthetic demo custom plot. Names are introduced vocabulary, not
silently known. The new neighbour has one character sheet, house, greetings
and preferences; all Chinese passes B00 including name/loves/missed_you.

Show its building site immediately; tapping offers the source's lesson at
home. Two separate conditions govern entry: content ready and 80% of that
source's NEW-word set learned under a named gate policy. Freeze that distinct
word/sense set at accepted intake; learning changes the numerator, never shrinks
the denominator. G02 leaves the metric open; rehearsal may use quiz-passed words, explicitly labelled provisional.
Use the same configurable policy for standard places with their own word sets.
Do not lower the threshold secretly for the demo; use openly labelled synthetic
seed state or a smaller source. Handle zero-new-word sources explicitly.

Opening a place does not license every piece inside: content still passes its
own vocabulary eligibility policy, including out-of-order learning. Friends
show an exclamation mark only for new eligible content. Gym/park/grammar remain
accessible from lesson 1; no pedagogical tool is behind the map gate. Town
labels are Chinese; English gloss behaviour is G05, not silently decided.

Done: at 79% entry offers the lesson, at 80% plus ready it opens; at 80% while
generating it remains a building site. Locked place and bookshelf reach the
same lesson. A piece requiring one missing word stays unavailable inside an
otherwise open place. Touch/key map actions agree.
```

### B07 — The neighbour's TV drama

```text
Implement B07 from R31-R34a, R38-R46 and R106-R110 using prompt 10, B00 and
the B06 cast sheet. A checked episode has 6-10 short lines, a hook, reversal,
and cliffhanger; speaker/pose/shot values are constrained. Build the affordable
stills-and-Azure-voice player first: one backdrop, reusable character poses,
captions in Hanzi with optional pinyin/spacing, synchronised to stored audio.
Use one house style and stable character references. Input changes no schedules.

Do not autoplay English in town; keep the G05 gloss policy configurable. At
home replay uses the same content identity and bilingual help. A source's
fixed demo video is not automatically a new personalised film. Seedance clips
are optional only after the organiser ruling and experiment; unavailable
images/audio have honest states and do not block learning.

Done: episode plays, pauses, seeks/restarts and finishes with captions aligned;
reload/replay retrieves the same episode; delayed assets cannot attach to a
different script. Qing judges its Mandarin and cliffhanger separately from
mechanical tests. At home the TV/phone can replay an unlocked episode.
```

### B08 — The daily game, using checked data

```text
Implement B08 from R101-R105a and R120, using prompts 12a/12b. Generate and
validate DATA first, then create a one-file game consuming exactly that DATA.
Game instructions and all visible Chinese come from DATA. Use the current 12b draft including its R14a keyboard requirement, and log the
full prompt actually run. Choose the genre by experiment, not by claiming all genres work.

Host the file in an iframe with scripts allowed but no same-origin privilege,
record access, network, storage, popups, navigation or camera/microphone.
Enforce network denial with the frame/content security policy; searching source
for fetch alone is not enough. Check messages against the actual frame window
and current game ID. A game_done message only changes play status; it cannot
submit evidence, award a review grade, unlock vocabulary or spend credits.

Today's game is visible while reviews are due and opens after the due review
set is complete; a no-due day opens it. Keep the generated daily instance and
the home console's replay separate so replay is possible without being a new
generation. Finish by touch and keyboard without trapping focus.

Done: game finishes at 390px and by keys; every visible Chinese token is in
DATA, injected Chinese is rejected; network/storage/record access fail; forged
completion from another frame is ignored; play/replay leaves schedule/log
grades unchanged. Use a fixed tested shell as an explicitly labelled fallback.
```

### B09 — Talk to the neighbour

```text
Implement B09 from R13, R54-R59c, R70-R75 and R114 using prompts 8/9 and B00.
Plan/check the whole exchange before starting; replace the mouse's identity
with B06's neighbour and topic without free-writing unchecked live responses.
Provide typed pinyin with tones first. Questions target already learned due
production words, never today's unlearned cake words as recall. Ask/simpler
must not display their target; either_or/give reveals it and suppresses credit.

Off-script reply: simpler, then a choice, then give the answer and continue.
No dead end and no invented pronunciation/tonal judgement. Matcher output is
only a candidate interpretation, not permission to update the schedule.
Before recording evidence confirm identity, due skill, unaided production,
no target revealed elsewhere on screen, and B01's duplicate policy. Missing
target alone is never a fail. Corrections remain possible.

Add speech capture/transcript confirmation only after the beginner/noise
experiment passes. Denied permission, silence or failed recogniser preserves
typed/tap continuation. Tapped revealed answers do not count as recalled.
Replay planned neighbour audio; do not claim a recorded exchange is live voice.

Done: five turns finish for correct, wrong, silence and off-script answers;
transcript edits/withdrawal work; hinted/copied/omitted words create no false
success/fail; confirmed eligible due production updates once. Test quiet/noisy
speech with a human separately before promising it on stage.
```

### B10 — A useful first day for either learner

```text
Implement B10 from R2a-R2b, R17-R17j, R76i-R76j and R138-R139. Name/avatar
comes first: ten preset avatars, plus a capped free one-off generation option
only when image generation is configured. Then ask if they know Chinese.

No: show pre-made arrival, lesson 0 conversation/game and a room tour; use
G06's newcomer-content gate before calling this complete. Yes: show individual
easy-to-hard word/sentence cards, keep/don't-know via swipe/buttons/keys, always
preview the next ten words. Preview, stopping and unvisited cards mark nothing
known. Save one explicit choice at a time and resume safely. Offer stop with
keep-going; R17d's numbers are settings and provisional, not a measured algorithm.
Onboarding easy mark applies only to the explicitly chosen skill per R17g's
provisional mapping; it cannot mark all four records fluent.

Experienced learners skip lesson 0 but see arrival; eligible places are open
and bookshelf catches missing earlier lesson words. Both routes end with a
real lesson or review, never no activity. Newcomers have friends and open drill
places, while the mall remains locked until its words qualify. Model gift
credits as a separate entitlement for one neighbour; G03 owns its unit/plot
details, so do not fabricate pricing or coin-purchased generation.

Done: all-don't-know, all-keep, mid-session reload and stop leave useful next
actions; looking at ten upcoming words changes no records; no batch marking
exists; character testing off keeps Hanzi visible everywhere.
```

### B11 — Stories, print and the radio

```text
Implement B11 from R30-R47, R48-R53, R60-R69 and R117 using prompts 6-8 and
B00/B05. Easy text uses only words the schedule is sure of; medium/hard uses
the learner's record plus explicitly chosen unknowns from their queue. Code
computes and measures actual running-word budgets, including extras. New text
is an original story around source vocabulary, not a scanned-book retelling.

Render picture/text/audio, optional pinyin and word spacing, and meaning on
tap without colour overlays. Lookups are free and unscored; explicit forgotten
marks on learned words submit eligible recognition evidence with undo. Unknown
word help offers learn-sooner and does not manufacture a prior review record.
Town English-help policy remains G05; bilingual replay is available at home.

Print the selected generated story with pinyin; add its exact audio and review
sentences/recall pauses to the home radio. Replay/download are stored results,
not new charged generations. Test background/screen-off behaviour on actual
phone browsers; report limitations instead of promising native capabilities.
Offer daily four activities freely in any order, with output through B09.

Done: easy output contains zero unfamiliar words; actual medium/hard load is
visible in developer checks; tapping meaning changes no schedule; forgotten
undo restores it; selected-story print contains that story; radio pause/resume
and replay use the chosen stored content, including after reload.
```

## Prompts for the full product after the demo

These remain in scope as later work. Each uses the same standing instruction and B contracts; a postponed item is not removed from the product.

### P01 — Course packs and complete intake

```text
Implement P01 from R17-R29 and R21-R23. Build the small core curriculum in
themed lesson/pack word sets, with missing earlier words catch-up. Complete
single-word resolution, companion approval, prioritisation, manual free word
AND sentence entry, themed packs via the mouse and prompt 4 described original
source creation. Scanned and described sources share vocabulary/provenance
contracts; only original described sources retain their generated page text.
G04 gates English-book translation. Done: add each route, reload, then learn
the same resulting word; ambiguous readings require a choice, duplicates
preserve sense identity, and no-provider manual additions work without credits.
```

### P02 — Select practice from real learning evidence

```text
Implement P02 from R48-R53, R60-R69 and R96-R96a. Due skills drive recall and
output; recent/older learned words and sources fill input/fluency via the
documented decay curve. G07 owns its time origin/word-source selection; keep
parameters explicit and deterministic under a test clock. Track deliberate
study/input/output/fluency time and suggest the under-served strand without
blocking another. Self-reported child read-aloud counts as time, not fabricated
word recall. Earn coins from honest deliberate practice, not watching/reading
or selecting a generous grade. Done: all four activities are selectable in
any order, old material retains a nonzero chance, unknown words never enter
easy input, and repeating an event cannot mint coins or double-count recall.
```

### P03 — Own things by being able to say them

```text
Implement P03 from R64b, R96-R100b, R122 and R130. Code-backed coin ledger
buys already-made furniture, art, trinkets and gifts. Every purchase requires
the learner to produce its Chinese; failure locks that item for exactly 24
hours across reload, with no successful purchase/debit. G01 governs grading
and G08 governs which outside-review tests become evidence. Coins never buy
generation. Show learned foods in shops; gifts increase affection; owned
objects show their vocabulary by touch, hover or focus. Done: failed green-table
test blocks only that item until its timestamp, successful transaction debits
once and grants once, lookup of owned words is unscored, buying cake for the
neighbour connects to their known preference. Extra plots wait for G03.
```

### P04 — Drills, grammar and jobs always in reach

```text
Implement P04 from R93-R94 and R132-R135. Gym/park/grammar practice opens
from lesson 1 and grows with vocabulary, never requiring a game reward or
payment for the core pedagogy. Provide listening tone patterns, typed tone
responses, tongue twisters and pitch-trace imitation. Pitch is measured signal,
not a pronunciation verdict from a speech model. Grammar lessons use the
learner's words. G09 owns naming/scenario design; G08 owns each drill's evidence
mapping. Cafe service earns coins for deliberate practice. Done: new learner
reaches drills from home or town, practice uses only eligible words, speech
denial leaves a useful typed/listening route, and no unapproved drill submits
recall evidence. Report hardware/voice validation separately.
```

### P05 — Free bundled content and priced personal generation

```text
Implement P05 from R76-R79, R76a-R76l and R105. Ship pre-made stories,
clips, conversations and games per course pack. Filter each piece against the
actual learner, including out-of-order learners. Personal generation consumes
server-owned credits; doing/replaying already made material is free. Keep coins
separate. G03 gates measured cost, paid tiers, gift allowance, revealed plots,
extra slots and voice subscription; show configuration instead of invented
prices until decided. Done: out-of-order missing vocabulary withholds a piece,
learning it makes the friend's new-content marker appear, replay spends zero
generation credits, concurrent/retried purchase/generation cannot double-charge,
and server decisions cannot be overridden by browser state.
```

### P06 — A world that keeps changing

```text
Implement P06 from R90-R95, R98d-R99a, R111-R113 and R136-R137. Add
vocabulary-linked collectibles/claw games, friends' new daily content, optional
story choices and fluency-based archiving of neighbours/shops. G02 owns the
fully-fluent archive predicate; G10 owns whether choices remain passive input.
Choices never award recall by themselves. Introduce any new cast name into
vocabulary before using it. Keep shared data/behaviour usable in other
presentation styles, without building alternate engines. Done: archived friend
is revisitable, a collectible requires its language purchase test, every visible
Chinese line has eligibility, daily changes recover after reload, and switching
presentation retains the same learner/evidence state. No numerical streak.
```

### P07 — Verify the whole product

```text
Implement P07: exercise the three walkthroughs and old-app verification cases
on the resulting build. Check skill isolation, correction/undo replay,
two-tab and save failure, lost provider response, stale generation after edit,
job retry/cost, private source retention, account boundaries, full reset including
uploaded blobs and generated context, out-of-order course eligibility, phone
touch and keyboard-only completion. Check every planned R identifier against
the actual implementation and evidence; retain unimplemented/conditional items.
Done: publish a concise release record of exact build, checks, open defects,
provider/human-tested surfaces and cut scope. Plan coverage never becomes a
claim of FSRS parity, Mandarin correctness or learning efficacy by itself.
```

## Decisions and content experiments

| ID / type | Owner and question | Affected work / way forward |
|---|---|---|
| G01 / decision | Qing: replacement grading; character production by typing or handwriting (open 23–24) | B01 keeps existing grades temporarily; character-production implementation waits |
| G02 / decision | Qing: 80% learned predicate, fully-fluent archive predicate (open 10) | B06 tests labelled quiz-pass policy; P06 archival waits for definition |
| G03 / decision | Qing: gift-neighbour unit, coin slots vs hidden paid plots, measured prices, voice access (open 15, 20, 25–26, 32) | B10 shows prototype gift entitlement; production payment/plot rules wait |
| G04 / decision | Qing: English-book translation still wanted (open 8) | P01 takes English vocabulary; faithful printed translation remains conditional |
| G05 / decision | Qing: English meaning on tap in immersion town (open 16) | Keep policy switch explicit; home bilingual help works either way |
| G06 / decision | Qing/content designer: lesson 0 newcomer game/content (open 28) | B10 full newcomer route needs reviewed bundled assets, not a fake completed tour |
| G07 / decision | Qing: decay origin and exact selectors (open 7) | P02 keeps provisional configurable selector isolated from scheduler |
| G08 / decision | Qing: evidence eligibility per activity (R64a) | B01 supports the contract; each outside-card activity needs an explicit approved mapping |
| G09 / decision | Qing: grammar layout/name and job scenario selection (open 27, 30) | P04 may prototype examples; full scenario generator remains conditional |
| G10 / decision | Qing: input story choices versus passive-input rule (open 19) | P06 choices conditional; no effect on schedules |
| G11 / decision | Organisers: prepared materials, tools/providers, build/demo limits | Fresh event build uses only permitted materials; private rehearsal can proceed |
| G12 / decision | Qing: R21 source pages/text retention versus R33a/prompt 1 discard | B03 uses temporary scanned text and retains vocabulary/provenance; full source retention awaits reconciliation |
| X01 / test-charter | Builder: run independent checker challenge cases | Enables all content trials; distinguish unresolved dictionary/segmentation cases |
| X02 / test-charter | Builder + Qing: book, lessons, neighbour and script | Experiments 1–4 script step, in that order; [experiment run sheet](experiment-run-sheet.md) |
| X03 / test-charter | Builder + Qing: game genres and stills/voice; optional video | Experiments 5–6; independent after X02, video requires allowed tool/access |
| X04 / test-charter | Qing/Tom + builder: quiet/noisy speech | Experiment 7; typed route remains usable on failure |
| X05 / test-charter | Qing + builder: readiness timing and end-to-end rehearsal | Experiments 8–9 and chosen demo cut; selects live vs permitted pre-made content |

The other open decisions in requirements.md section 9 remain owned there; they are not silently resolved by this backlog. Full-product tasks must consult that section. Run `python3 tools/check-build-backlog.py` to check the dependency graph, prompt headings, links and complete R-ID assignment. That checks the plan's structure, not a running product.
