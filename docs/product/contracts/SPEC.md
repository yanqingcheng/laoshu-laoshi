<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Laoshu Laoshi: the spec

A Chinese-learning app where the learner's own words become a personal game world. You bring a book; its words become lessons; the lessons open a new neighbour in your town, with a game, a show and a voice conversation made from exactly the words you know.

The product specification below defines the learning rules. The pasted build prompt defines delivery priority. The attached RUNTIME-PROMPTS.txt supplies runtime model prompts. Anything not written here is the builder's choice; choose the simplest thing.

Sections marked **Exact** must be built as written. Everything else describes behaviour and leaves the how to you.

## 1. Vocabulary of this spec

| Term | Meaning |
|---|---|
| **Repertoire** | The words a learner has taken on: passed in a lesson quiz, declared known, or imported with a schedule. A word stays in the repertoire when it is forgotten. |
| **Queued** | A word the learner wants and has not yet taken on. |
| **Solid** | A repertoire word the scheduler predicts the learner would recognise today (section 4.3). |
| **Wobbly** | A repertoire word that is not solid. |
| **Allowed words** | The exact set of words one piece of content may use. |
| **Token** | One word of Chinese text as data: `{"w": "蛋糕", "p": "dan4 gao1"}`. Punctuation is `{"w": "。"}`. Models and prompts refer to a word by its characters and pinyin; code maps that to a Word ID. |
| **Astra** | The OpenAI text model the app calls at run time. |

## 2. The four layers (Exact)

Build these as four separate modules. Each talks to the next only through the functions named here. This separation is the architecture; do not shortcut it.

```
1. WORD MEMORY     scheduler, repertoire, the word check
        ▲ evidence          │ queries
2. CONTENT SHELF   every content item, with the words it needs
        │
3. THE CHOOSER     decides what each surface shows, in what order
        │
4. THE WORLD       rooms, map, players. Displays what it is handed.
```

**Layer 1, word memory.** Nothing outside this module reads or writes cards, schedules or the repertoire. Other code uses three functions:

- `submitEvidence({learnerId, wordId, skill, outcome, requestId, activity})` where outcome is `fail | hard | good | easy`. The only way practice changes a schedule.
- `checkText(tokens, allowedWordIds)` returns `{ok, problems[]}`. The only judge of whether Chinese may be shown (section 5). Its companion `splitText(text, learnerId)` turns running text into words (section 5.2).
- `queryWords(learnerId, filter)` returns words. The only way anything else learns what the learner knows. Filter fields, all optional and combinable: `status` (`repertoire | queued`), `strength` (`solid | wobbly`), `skill`, `dueWithinDays`, `learnedWithinDays`, `sourceId`, `lessonId`, `orderBy` (`weakest | dueSoonest | newest | queueOrder`), `limit`. More filter fields will be added later; build it as one function with a filter object, not a function per question.

The same module also owns the few writes that are not practice: `declareKnown`, `queueWords`, `unqueueWord`, `importWords`, and `undoLast` (each evidence row stores the card's state before it, so the last grade can be reversed).

**Layer 2, content shelf.** One table of content items (section 3). Generation jobs write to it. Nothing is shown from anywhere else.

**Layer 3, the chooser.** One function: `serve(learnerId, surface, placeId?)` returns `{items, pendingCount}`. `items` is ordered, and each carries `seen`. Tonight's rule: items whose status is ready and whose `requiredWordIds` are all in the repertoire; unseen first, then newest first. `pendingCount` is how many items for that surface are still being made. The rule will be replaced later, so keep it in one file and call it from everywhere, including the map markers.

**Layer 4, the world.** Screens and players. A screen never filters, sorts or picks content; it calls `serve` and shows the result. A player reports back only through `submitEvidence` and `markSeen(contentId)`.

## 3. Stored objects

Use the platform's backend with real sign-in from the first stage. Every learner-owned row carries the learner's ID and the database enforces ownership. IDs are UUIDs. Times are UTC; the learner's timezone decides which day it is.

- **Learner:** account, display name, optional Chinese name with its reading, optional `about` text, avatar, timezone, daily review number per direction (default 10), lesson pace (default 5), pinyin on/off (default on), coins.
- **Word:** id, Hanzi, pinyin (tone numbers, one space per syllable, neutral tone as 5, ü written `u:`), meaning, accepted English answers, alternate readings, synonyms, `selfScored` flag, origin (`course | dictionary | manual`).
- **LearnerWord:** learner, word, status (`queued | repertoire`), how it entered (`lesson | declared | imported`), queue position, source.
- **Card:** learner, word, skill (`recognise | produce`), scheduler state, due time. Unique per learner, word and skill. The skill field is a string so more skills can be added later.
- **Evidence:** append-only log of every `submitEvidence` call with its request ID and the card's state before it. A repeated request ID returns the first result and changes nothing.
- **Sentence:** tokens, English, origin (`course | generated | own`). **SentenceTarget:** sentence, word, the English with that word's meaning replaced by `___`, accepted answers for the gap. Gap and answers may be empty.
- **Source:** learner, title, kind (`course | book | described | manual`), its words, its lesson plan.
- **Lesson:** source, order within the source, its word IDs.
- **Place:** learner (null for bundled places, whose content every learner shares), slot on the map, kind (`neighbour | shop`), source, host, lines, objects, scenario, art (section 8).
- **ContentItem:** id, place, surface (`tv | console | host | book`), format (`drama | game | talk | story`), recipe (the mechanic or sub-genre, a string), level, `requiredWordIds` (set from its tokens when it becomes ready), payload, status (`pending | ready | failed`), created time. **Seen:** learner, content item.
- **Job:** kind, input snapshot, status (`queued | running | ready | failed`), error, outputs. A page reload reattaches to the running job; it never starts a second one.
- **ReviewSession:** learner, direction, day, seed, ordered cards with each card's chosen sentence, grades so far.
- **Transcript:** learner, content item, the turns of one conversation (section 9.3).
- **Compound:** a joined word and its verdict, `transparent | opaque` (section 5.2). Global.
- **Layout:** one record per picture (home room, neighbour room, town) holding every hotspot's position (section 8).

## 4. Word memory

### 4.1 Scheduler (Exact)

- Library `ts-fsrs` version 5.2.3, created as `fsrs()` with default settings. One card per learner, word and skill.
- Outcome to rating: fail → Again, hard → Hard, good → Good, easy → Easy.
- After a **fail** keep the library's own due time (a few minutes ahead, so the card is still due today).
- After a **pass** move the due time to the start of a local day: if the library's due day is today or earlier, the start of tomorrow; otherwise the start of that day. A card passed today never returns today.
- A card is **due** when its due time is at or before the end of today in the learner's timezone and its word is in the repertoire. Use this one rule on every screen.

### 4.2 Entering the repertoire (Exact)

- **Lesson quiz:** a word enters when both of its quiz questions have been answered correctly (section 6.2). Its two cards are created by those answers.
- **Declared known** ("I know this" at placement, "I already knew this" in a lesson): the word enters with two cards written directly, no evidence rows. Recognise: Review state, stability 30 days, difficulty 5, due in 30 days. Produce: Review state, stability 7 days, difficulty 5, due in 7 days.
- **Imported with a schedule:** the word enters with the imported scheduler state copied exactly (section 6.6).
- Importing or adding a word without a schedule only queues it.

### 4.3 Solid and wobbly (Exact)

A repertoire word is **solid** when its recognise card is in the Review state and the scheduler's predicted recall today (`get_retrievability`) is at least 0.95. Otherwise it is wobbly. Never show recall percentages to the learner.

## 5. The word check (Exact)

Every piece of generated Chinese is stored as tokens and passes `checkText` before it is stored and again before it is shown. Model output is never trusted to have obeyed its word list.

1. Every token's `w` must match a word in the allowed set, or be a name token, or punctuation. Name tokens are the learner's Chinese name, 毛毛 (the dog, full name 王毛毛), 咪咪 (the cat, full name 李咪咪) and a place's host name.
2. Pinyin shown to the learner comes from the stored Word, never from the model. If the model's `p` disagrees with every stored reading of that word, it is a problem.
3. **Joined words.** Chinese has no spaces, so two allowed words side by side can spell a third word. Some are harmless: 这 + 个, 吃 + 饭. Some are a different word entirely: 东 + 西 is "thing". When a run of neighbouring tokens spells a dictionary word that is not itself allowed, look it up in the compound table (section 5.2). Transparent: fine. Opaque: a problem.
4. Generated Chinese text must not contain digits or Latin letters.

A piece that fails is sent back to the model once with the list of problems, and withheld if it fails again. A failed piece never reaches a screen.

Two exceptions. Bundled course sentences are hand-written; they are checked by rule 1 only, and every combination they use counts as transparent. A live voice conversation cannot be checked before it is spoken; it is checked afterwards, in its transcript (section 9.3).

### 5.1 Showing Chinese (Exact)

One shared Chinese text toolkit supplies the app's `WordText` component and the sandbox game's DOM adapter. Implement the shared token/pinyin core and both adapters during the event, following [RUBYTEXT.md](RUBYTEXT.md). Games call the trusted injected renderer; they do not recreate ruby layout per generated page. The sandbox remains isolated (section 9.2).

- Pinyin sits above its own word using `<ruby>`, in tone marks, one whole word per ruby unit (毛毛虫 / máo máo chóng stays together). Never a separate line of pinyin under a sentence.
- Lines wrap between words, never inside one.
- Tapping a word opens a small card: Hanzi, pinyin, meaning, and "Add to my words" if it is not in the repertoire or queue.
- When a word is being tested, hide every occurrence of it by token, including its pinyin, before rendering. Never blank by substring.
- Hanzi 28 to 32px, pinyin 13 to 15px. No colour coding of word knowledge.

### 5.2 The compound table and splitting text (Exact)

**Compound:** a stored table of joined words, each `transparent` or `opaque`. It is global, not per learner.

- Seed it at first run from `data/compounds.json` (246 transparent and 1,388 opaque, covering every dictionary word that can be built from course words).
- A joined word that is itself a Word row (东西, 好吃) is opaque without being in the table: it is a word to be learned.
- A joined word that is not in the table is judged by Astra (PROMPTS.md, `compound.judge`) and the verdict stored for good. Judging happens when a piece is generated, in one batch per piece. At display time only the table is consulted; an unjudged word passes.

**`splitText(text, learnerId)`** lives in the word-memory module and is the only way running text becomes words. It is used for a book (section 7) and a transcript (section 9.3).
1. Longest match against Word rows and the dictionary together.
2. A matched word that the table calls transparent is replaced by its parts.
3. A matched word that is not a Word row, is not in the table, and can be built from words the learner has, is judged and then treated by its verdict.
4. Whatever is then not in the learner's repertoire is unknown to them.

## 6. The base app

These are the functions of the existing Laoshu Laoshi app, rebuilt. The smaller ones (word library, adding words by hand, new-learner placement, listening tape, settings) are specified in their own BACKLOG stages.

**Failure rule for every screen:** a read that fails shows "Could not load" with Retry. It is never shown as an empty list.

### 6.1 Reviews

Two daily reviews: Chinese to English (`recognise`) and English to Chinese (`produce`).

**Cards**
- A card shows one sentence containing the word. Candidate sentences are all sentences targeting that word in which every other word is in the repertoire. Pick one with the session's seed and keep it for the session. With no candidate, show the word alone.
- **Recognise:** the Chinese sentence with pinyin, target highlighted. If the sentence has a gap for this word, show the English with `___` and the learner types the missing English. With no gap, the learner types the word's meaning and the English sentence stays hidden until they have answered. A `selfScored` word has no text box: "How well did you understand what it does here?" with Didn't know, Hard, Good, Easy.
- **Produce:** the English sentence, and the Chinese sentence with every occurrence of the target hidden. The learner types the target's pinyin.
- Any other word on a card can be tapped for its meaning at no cost.

**Grading (Exact)**
- A correct answer shows Hard, Good, Easy with Good focused, so Enter accepts it.
- A wrong answer shows the right answer, "Mark wrong and continue", and "I was actually right", which offers the three grades instead and records no fail.
- **Nearly:** if every syllable is right and one or more tones are wrong, say "Nearly: check your tones", name the syllable, and let the learner answer once more. Right the second time offers the grades with Hard focused. Wrong again is a wrong answer.
- Undo reverses the last grade.

**Sessions (Exact)**
- Take the direction's due cards, earliest due day first, shuffled within a day by the session's seed. Take the first N (the learner's daily number).
- A missed card comes back after the whole round, in a "Review mistakes" round. Rounds repeat until one has no miss. The learner may leave at any point.
- The grade press saves. The card advances only after the save succeeds. Each asking has its own request ID so a retry cannot count twice. On failure keep the card and the typed answer and show Retry.
- The session lives on the server. Returning the same day restores the same cards, sentences and position. It is never rebuilt from a fresh list of due cards.
- The finish screen shows cards reviewed, the share right first time, and "Review more" if any are still due.

### 6.2 Lessons and the quiz

A lesson is a list of words. One sitting teaches up to the learner's pace (default 5); a long lesson takes several sittings.

1. **Word screen:** Hanzi with pinyin, meaning, a picture if there is one. Buttons: "See examples", "I already knew this" (declares it known and removes it from the quiz).
2. **Examples:** up to five sentences with the word highlighted and English beneath.
3. **Quiz (Exact):** each word gets two questions built exactly like the two review cards, using different sentences where it has two or more. All questions are shuffled together with a seed from the lesson. Each answer goes through `submitEvidence`: right is `good`, wrong is `fail`. A missed question returns in a "Review mistakes" round; the quiz ends when a round has no miss. Words already passed stay passed if the learner leaves.
4. **End screen:** words learned, and whatever opened because of it.

**What a lesson sentence may contain (Exact):** the repertoire, the other words of the same lesson, the 21 words of the first course lesson, and names. Nothing else.

### 6.3 Answer checking (Exact)

One checker, used everywhere an answer is typed.

**Pinyin**
- Case and spacing never matter: `ni3hao3`, `ni3 hao3` and `Nǐ hǎo` are the same answer.
- Tone marks and tone numbers are interchangeable. `v`, `ü` and `u:` are the same letter. Apostrophes are ignored.
- Tones are required and must be right. An answer with no tones is wrong.
- A neutral syllable may be typed bare, with 5 or with 0.
- Erhua: for `zher4` accept `zher4`, `zhe4r`, `zhe4 r5` and `zhe4 er`.
- Accept spoken tone changes beside the dictionary form: 不 as tone 2 before a tone 4; 一 as tone 2 before a tone 4 and as tone 4 before tones 1, 2 and 3; the first of two third tones inside the word as tone 2.
- Accept any alternate reading of the word.
- If the answer is the pinyin of one of the word's synonyms: "That word is right too, but we're looking for a different one." Nothing is graded.

**English**
- Lower-case, trim, drop punctuation, collapse spaces.
- Gap card: right if it equals any accepted answer for that gap.
- Meaning card: split the meaning on commas, semicolons and slashes; each part is an answer. Accept a verb without its leading "to". Also accept anything in the word's accepted-answers list.
- British and American spellings are the same answer.
- Nothing fuzzy. "a cat" is not "cat" unless listed.

**Typing pinyin:** on a phone, an on-screen pinyin keyboard (letters, ü, tone keys 1 to 4, space, Enter) with a link to use the system keyboard instead. With the system keyboard, turn off autocorrect and show tone buttons 1 to 4. Enter checks.

### 6.4 The bundled course (Exact)

Supplied as data: `data/course/word-lists.json` (26 lists, 326 words) and `data/course/sentences/*.json` (1,028 sentences). Load it at first run.

**Words**
- One Source of kind `course` with 26 Lessons in `sort_order`. Each word becomes a Word with origin `course`.
- Convert the tone-mark pinyin to tone numbers: lower-case it, drop apostrophes, write ü as `u:`, give a syllable with no mark tone 5. A fused erhua syllable stays one syllable (`nǎr` → `nar3`).
- `alt_pinyin`, where present, becomes the alternate readings.
- `selfScored` is true when the meaning contains "particle", "measure word" or "suffix".

**Sentences.** Each has `hanzi`, `english`, `uses` (every course word in it), `covers` (the words it teaches) and sometimes `recognition` (per word: `gap` and `answers`). Ignore its `pinyin` field.
- Turn `hanzi` into tokens by longest match against that sentence's own `uses` list. Anything left over is punctuation.
- `{DOG_NAME}` becomes the name token 毛毛 and `{CAT_NAME}` the name token 咪咪; they always follow the word 王 or 李. In the English, they become "Maomao" and "Mimi". `{USER_NAME}` becomes the learner's Chinese name, and their display name in the English; these sentences are used only for learners who have a Chinese name.
- Create a SentenceTarget for each word in `covers`. Copy its gap and answers from `recognition` where they exist and the gap contains `___` exactly once; otherwise leave them empty.
- A course lesson done out of order uses only its sentences that pass section 6.2's rule. A word left with no sentence gets generated ones (PROMPTS.md, `lesson.sentences`).

### 6.5 The dictionary (Exact)

Supplied as data: `data/dictionary.json`, CC-CEDICT, shaped `{"entries": [[hanzi, pinyin, meanings separated by "/"], …]}` with about 120,000 entries. It is a static file read into memory by the backend; it is not a table.

- It is used to look up a word the learner types (by Hanzi, pinyin or English), to give the meaning and pinyin of a word that is not yet a Word row, and to split text into words (sections 7 and 9.3).
- One Hanzi can have several entries. Rank ordinary entries above those whose meaning begins "variant of", "old variant of" or "surname".
- A dictionary entry becomes a Word row the first time a learner queues it.
- **A course Word always wins.** Match a course word by its Hanzi alone; use pinyin only to choose among dictionary entries.

### 6.6 Bringing an existing learner across (Exact)

Settings has "Import my words", which takes the existing app's export file:

```json
{"version": 1, "exportedAt": "2026-10-06T08:00:00.000Z",
 "vocab": [{"hanzi": "蛋糕", "pinyin": "dàn gāo", "meaning": "cake",
   "progress": {
     "recognition": {"due_at": "2026-10-09T00:00:00.000Z",
       "fsrs_state": {"due": "2026-10-09T00:00:00.000Z", "stability": 12.4, "difficulty": 5.1,
         "elapsed_days": 3, "scheduled_days": 9, "reps": 4, "lapses": 0,
         "learning_steps": 0, "state": 2, "last_review": "2026-09-30T07:12:00.000Z"}},
     "production": null}}]}
```

`pinyin` is in tone marks. `fsrs_state` is a `ts-fsrs` card. Either direction may be null.

- Match each word to an existing Word as section 6.5 says; otherwise create it.
- A word with at least one schedule enters the repertoire. `recognition` becomes its `recognise` card and `production` its `produce` card, state and due time copied exactly. A direction that is null gets the declared-known card for that skill.
- A word with both directions null is queued.
- A word that appears more than once in the file is imported once, keeping the entry reviewed most recently.
- Words the learner already has are skipped. Nothing is dropped.
- The import is one transaction and reports how many words entered the repertoire, were queued and were skipped.

## 7. From a book to a place

This is the centre of the product. Steps run as one chain of jobs; each step stores its output so a failure restarts from the last good step.

1. **Read.** The learner gives the book's title and photographs pages. A vision model returns the text (PROMPTS.md, `source.read`).
2. **Words.** `splitText` splits the text into words (section 5.2); a model corrects the splits and picks the meaning in context (`source.words`).
3. **Compare.** Code compares against the repertoire. What is left is the **unknown list**.
4. **Plan lessons (Exact).**
   - Zero unknown words: no lessons. Go straight to step 6; the place opens as soon as it is made.
   - Otherwise, for each unfinished course lesson count how many unknown words it teaches. A course lesson teaching 3 or more of them becomes a **prerequisite lesson**, in course order.
   - The unknown words not covered by a prerequisite become **custom lessons**: one lesson if there are 20 or fewer, otherwise lessons of about 15, ordered by how often each word appears in the source.
   - The plan is: prerequisite lessons, then custom lesson 1, 2, 3…
5. **Approve.** The learner sees the plan and the words, can drop words, and approves. Sentences for every custom lesson are generated at once, lesson 1 first (`lesson.sentences`), so the learner can start while the place is made. With no free custom slot, ask which custom place to replace.
6. **Make the place** (section 8), in levels (Exact):
   - **Level 1** content may use the repertoire as it was at approval, plus every word of the prerequisite lessons, plus custom lesson 1's words. Make level 1 immediately.
   - **Level k** adds custom lesson k's words. Make level k when the learner finishes custom lesson k−1.
   - In every level's prompts the words are grouped: NEW is that level's lesson words (with zero unknown words, the source's ten most frequent words); BRING IN is up to 12 repertoire words from `queryWords`, half `weakest` and half `newest`; the rest are simply allowed.
   - The theme and the neighbour are made once, at level 1. The scenario's ideas for the game, conversation, drama and story are made again at each level.
7. **Open (Exact).** A custom place opens when its prerequisite lessons and custom lesson 1 are finished and its host and lines exist. Art never holds a place shut: until its own pictures arrive it uses the stock house, room and character. A bundled place opens when 80% of its course lesson's words are in the repertoire. Each content item inside appears only when all its own required words are in the repertoire, so a place fills up as later lessons are done.

**Map markers (Exact),** drawn by the app over the map, one per place, the first that applies:
- Empty plot: a slot with no place.
- Faded with a padlock: a place that is not open. Tapping it lists the lessons still needed and offers the next one.
- Cog: open, and something for it is still being made.
- "!": open, with at least one unseen item.
- Nothing: open, nothing new.

## 8. Places

A place is data plus art, all generated to a fixed shape so any place plugs into the same screens.

**Neighbour**
- `host`: name (made only of allowed words, such as the word for what they are), an English descriptor, their look in English, what they love.
- `lines`: first greeting, greeting on return, a line waving the learner over, a thank-you. Tokens.
- `objects`: up to four things in the room. Each has a word, a label, one line the host says when it is tapped, and a cut-out picture.
- `art`: a house for the map, a character sheet cut into two poses (neutral and delighted), a room backdrop.
- Surfaces inside: the **TV** (dramas), the **console** (games), the **host** (conversations), the **coffee-table book** (stories).

**The room screen.** One backdrop with eight hotspots: host, TV, console, book, and four object spots (shelf, table, floor, wall). Tapping a surface plays the first item `serve` returns straight away; if there is more than one, show next and previous on the player. Never put a menu between the learner and the content. A surface with nothing to serve shows the cog if `pendingCount` is above zero, otherwise nothing.

**At home,** the same surfaces list across every place, by calling `serve` with no place: the **phone** is `serve("tv")`, scrolled vertically, one drama per screen; the **console** is `serve("console")`; the **shelf** holds lessons and `serve("book")`; the **radio** plays the listening tape; the **desk** holds the two reviews; the **camera** on the desk adds a book; the **door** leads to town.

**Bundled places.** The mouse teacher (老师), the dog (毛毛) and the cat (咪咪) are neighbours tied to the first three course lessons. Their names, looks, houses and character sheets are fixed, uploaded art. Only their lines, objects, scenario and content items are generated, from their lesson's words plus all earlier lessons' words, and every learner shares them.

**Positions (Exact).** Every hotspot's position and size is stored as fractions of its picture in the Layout record, never hard-coded. A layout mode on the developer page shows the picture with every hotspot as a draggable, resizable box and saves the result. Pictures are 3:2.

**Town.** Eight slots: home, the three bundled neighbours, two custom places, the shop, and the park and gym. The map is drawn from a raised three-quarter angle, like The Sims. Tap a place to enter; no walking. Every place is a real button, with the same places as a list beneath the map. On a phone the map pans sideways and opens centred on home.

## 9. Generated content

Three formats share one rule.

### 9.1 The sandbox rule (Exact)

Games and dramas are single HTML pages written by Astra. The app treats that code as untrusted.

- Run it in an `<iframe sandbox="allow-scripts">` loaded from `srcdoc`. Before loading, insert as the first element of its `<head>`: `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline'; img-src data:">`.
- **The generated code contains no Chinese.** All Chinese reaches it as checked data in an `init` message from the app.
- Pictures reach a drama as data URLs in the same `init` message. A game receives no pictures; it draws everything itself.
- It talks to the app only by `postMessage`. The app accepts a message only when `event.source` is that iframe's window, and only the message types listed below. The page gets no learner data, no keys, no session.
- Testing a new page: load it in a hidden sandbox, send `init` with the item's real data, and wait for `ready`. If none arrives in 10 seconds, send the error back to Astra once (`repair`). If that fails, mark the item failed.

### 9.2 Games

One game is one HTML page plus its data. Each has a **mechanic** invented for the words and a separately chosen **art style**. `tone-flight`, `lane-runner`, `serve-the-order` and `fetch-it` are baseline examples, not the complete mechanic list. `pixel-art`, `paper-cutout`, `low-poly-3d` and `neon-arcade` are supported style examples; PROMPTS.md describes their rendering requirements.

- First plan creative concepts using GAME-CONCEPT.md with the verified words, place scenario and recent game history. Select a genuinely different interaction, including sprite movement, navigation, collecting and delivery where appropriate. Require the words/meanings to support the mechanic. Do not force variety by substituting an unrelated template. Choose the art style separately.
- Data sent in `init`: the title and instruction as tokens, and rounds, each with the word's tokens, its tones as numbers and its meaning in English, plus what the mechanic needs.
- Messages from the game: `ready`; `say` with a word's characters (the app speaks it only if it is one of that game's words); `done` with a score.
- Games send no evidence tonight.
- Generation is an unattended job pipeline after the learner's existing approval/choices: frozen allowed snapshot → creative concept alternatives and selection (GAME-CONCEPT.md) → mechanic-specific schema/content contract → `game.data` → checked English-only `game.script` → checked `game.design` → `game.page`. Plans use round indices and stable item keys plus measured text profiles, never new learner vocabulary. Actual preceding artifacts pass forward; page generation receives English plans/schema/profile only, and Chinese arrives at runtime through `init`.
- Validate every stage's schema/references and content rules; a fresh semantic reviewer checks data senses/orders and design feasibility before implementation. One targeted automatic repair per failing stage, followed by all its checks again; page source and browser defects share one page repair budget. Exhaustion withholds the game. Persist inputs, outputs, checks, attempts, elapsed time and usage/cost evidence. This replaces a single-call success criterion, not plan approval or learning choices.
- A `ready` smoke test alone does not mark a game ready for learners. A browser acceptance worker must exercise actual init data, phone/desktop layout, complete win/loss runs, every-state restart, inputs, ruby/order visibility and renderer distinctions in the exact sandbox. Static source/syntax checks are preliminary only. Deployment needs a browser-capable worker/service and a job/result endpoint; an edge function cannot substitute a hidden iframe or claim this service exists. Until its result returns, status is awaiting browser acceptance. Concrete failures feed the remaining page repair budget and require browser rerun. See [PIPELINES.md](PIPELINES.md), [COSTING.md](COSTING.md) for build-night implementation requirements. Afternoon experiment code must not be imported.


### 9.3 Live voice conversation

Tapping the host starts a spoken conversation.

- Use OpenAI's realtime voice model from the browser, with a short-lived session token minted by the backend.
- The session's instructions come from the place's talk item (PROMPTS.md, `talk.instructions`). The model is told to stay inside the allowed words. It will sometimes stray. That is accepted.
- A text box under the conversation lets the learner type instead of speak.
- Nothing is scored during the conversation and no evidence is sent. End calls `markSeen`.

**The transcript (Exact).** When the conversation ends, show both sides, including what the model heard the learner say.
- Split each turn into tokens with `splitText` (section 5.2). A run of non-Chinese text is one plain token.
- Render with `WordText`.
- Any word not in the learner's repertoire is marked, with "Add to my words", which queues it.
- Keep transcripts. The transcript screen links to earlier ones with the same host.

### 9.4 Animated dramas

A drama is a script plus an animation.

1. Astra writes the **script** (`drama.script`): eight lines, each with a speaker, tokens, English and a stage direction. It passes the word check.
2. Astra writes the **animation** (`drama.animation`) from the stage directions: a page that moves the characters' cut-out pictures over the room backdrop, like paper puppets. It contains no Chinese.
3. **The app drives playback (Exact):** the app sends `play` with a line ID (`l1` to `l8`); the page performs that line's movement and replies `lineDone` with the same ID. Meanwhile the app shows that line's caption under the frame with `WordText` and speaks it. When both the speech and `lineDone` have finished, the app sends the next `play`. With no speech available, it waits for a tap instead. If `lineDone` has not come after 6 seconds, carry on. The learner can always tap to advance or go back.

Dramas send no evidence.

## 10. Not in the first pass

Character skills, credits, and the other wider-product features are BACKLOG stages 20 to 38, built after stages 1 to 19. Never built: real payments or a checkout, and walking around the map. A video model is used only if the account has one (stage 38).
