<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Laoshu Laoshi: the full build queue

This is the whole planned app as thirty-eight stages: 1 to 19 are the core app and world, 20 to 38 the rest of the planned product. Nothing here is optional in the sense of "not wanted": every stage is to be built, in the order given, for as long as the build continues. Qing decides when to stop.

**Order tonight.** The pasted prompt's ten priority items come first. They are these stages: item 1 is stages 1, 3 and 4; item 2 is stage 2; item 3 is stage 5; item 4 is stage 6; item 5 is stage 7; item 6 is stages 8 and 9; item 7 is stage 15; item 8 is stage 10; item 9 is stage 17; item 10 is stage 11. Each of those stages' full text below applies to its item, including its "Done when" and "Check". After them, continue without being asked again through stages **12, 14, 13, 16, 18, 19**, and then **20 to 38** in number order. Stage 2's developer page, stage 1's /status page and stage 8's "Make bundled places" are part of the first pass, not extras.

**Where documents differ.** SPEC.md's Exact sections win over a stage's wording. The newer sections of this attachment (RUBYTEXT.md, PIPELINES.md, COSTING.md, GAME-CONCEPT.md, MEDIA.md, VOICES.md) win where they say more than a stage does. All speech uses OpenAI text-to-speech as VOICES.md says; there is no Azure key.

**Show the whole app from the start.** Every planned thing has its place in the world from the first preview: the radio, the phone feed, the shop, the park and gym, the word library, placement, settings. A thing whose stage is not built yet is visibly greyed out, with a short plain label such as "Not built yet", and does nothing when tapped. Never a dead button that looks live, never a fake result, never a hidden feature. When its stage is built, the grey comes off. Keep one list on the developer page of every stage and whether it is built, partly built or not started, and keep it true.

**After each stage** say which stage finished, what its "Done when" and "Check" showed, and go straight on to the next.

## The order

| # | Stage | Leaves working | Needs | Later stages survive without it? |
|---|---|---|---|---|
| 1 | Foundation | Sign-in, the stored objects, the course and dictionary loaded | | No |
| 2 | Word memory and Chinese text | Word memory, `WordText`, the answer checker | 1 | No |
| 3 | Reviews | Both daily reviews | 2 | No |
| 4 | Lessons | Lessons and their quiz | 3 | No |
| 5 | Import a learner | Tom's real words in the app | 4 | No |
| 6 | Home and town | The room, the map, the chooser | 4 | No |
| 7 | Bring a book | Photo to lesson plan to first custom lesson | 6 | No |
| 8 | Make a place | A new neighbour appears and opens | 7 | No |
| 9 | Place art | The neighbour's own house, look and room | 8 | Yes |
| 10 | Games | A one-shot game on the console | 8 | Yes |
| 11 | Live voice | Talk to the neighbour, read the transcript | 8 | Yes |
| 12 | Animated dramas | A show on the TV, a feed on the phone | 8 | Yes |
| 13 | Word library and adding words | | 6 | Yes |
| 14 | New learner and placement | | 4 | Yes |
| 15 | Stories | | 9 | Yes |
| 16 | Listening tape and spoken cards | | 6 | Yes |
| 17 | Coins, shop, gifts, plants | | 9 | Yes |
| 18 | Park and gym drills | | 6 | Yes |
| 19 | Settings, export, report a problem | | 5 | Yes |

Stages 1 to 5 are the existing app's core, rebuilt. Stages 6 to 12 are the new world. A stage marked Yes can be left greyed out without breaking any stage that does not list it under Needs; it is still to be built when its turn comes.

Every stage below assumes SPEC.md (above, in this attachment) is loaded. "Section" always means a section of SPEC.md.

---

## 1. Foundation

**Done when:** you can sign up, sign in and sign out; /status shows 26 lessons, 326 words, 1,028 sentences loaded, and the dictionary's entry count.

```text
Build the foundation of the app described in SPEC.md.

1. Backend with email and password sign-in, no email confirmation step. Every route except the landing page and sign-in needs a signed-in learner.
2. Create the stored objects in section 3, with database-enforced ownership on every learner-owned table.
3. Load the bundled course exactly as section 6.4 says. Loading is idempotent: running it twice changes nothing. Load the dictionary into backend memory as section 6.5 says, and seed the compound table as section 5.2 says.
4. One config file naming the four models the app calls: text, vision, image and realtime voice.
5. A plain signed-in home page with links to: Reviews, Lessons, Words, Settings, Town. These are placeholders for later stages.
6. A /status page showing counts of lessons, words, sentences loaded, sentences that could not be loaded (each with its reason), sentence targets with and without a gap, dictionary entries, and compounds by verdict.

Apply the failure rule in section 6 to every screen from now on. Mobile-first. Build nothing from later sections yet.
```

**Check:** /status shows 26 lessons, 326 words and 1,028 sentences with none failed. The word 不客气 has pinyin `bu4 ke4 qi5`; 女儿 has `nu:3 er2`; 哪儿 has `nar3`.

## 2. Word memory and Chinese text

**Done when:** the tests pass and the developer page works.

```text
Build layer 1 of SPEC.md section 2 as one module, and the shared pieces every later stage uses.

1. Word memory exactly as section 2 defines it: submitEvidence, checkText, splitText, queryWords, and the writes declareKnown, queueWords, unqueueWord, importWords (a stub until stage 5) and undoLast. The scheduler is section 4.1, entering the repertoire section 4.2, solid and wobbly section 4.3. Nothing outside this module may touch cards or schedules.
2. The word check, section 5, and the compound table and splitText, section 5.2, with compound.judge in PROMPTS.md for words the table does not have.
3. The WordText component, section 5.1.
4. The answer checker and the on-screen pinyin keyboard, section 6.3.
5. A developer page /dev with:
   - "Make test learner": declares every word of the first two course lessons known for the current learner, then sets six of those cards due today.
   - A box to try the answer checker against any word.
   - A box to paste tokens and run checkText against the current repertoire, and a box to paste Chinese text and run splitText.
   - A table from queryWords with a control for each filter field.

Write automated tests for sections 4.1, 4.2, 5 and 6.3. Include these answer-checker cases for 你好 (ni3 hao3): "ni3hao3", "Nǐ hǎo", "ni3 hao3" and "ni2 hao3" are right; "ni hao" is wrong; "ni4 hao3" is nearly. Include these word-check cases, each with only the two single words allowed: 这 then 个 passes (这个 is transparent); 东 then 西 fails (东西 is opaque). Include a splitText case: for a learner who has 这, 个 and 吃, the text 这个东西好吃 splits into 这, 个, 东西, 好吃 even when they also have 好: 东西 and 好吃 remain unknown unless those whole words are in their repertoire.
```

**Check:** on /dev, a sentence of repertoire words renders with pinyin above each word and wraps between words on a narrow screen.

## 3. Reviews

**Done when:** the test learner can finish a review in each direction, reload mid-session and land on the same card, and the due counts go down.

```text
Build the reviews in SPEC.md section 6.1. Grading and sessions are exact.

Routes /review/recognise and /review/produce, each reachable from the home page with its due count. Use WordText for all Chinese and the answer checker from stage 2. Every grade goes through submitEvidence with a fresh request ID per asking. On a phone, produce cards use the pinyin keyboard from stage 2.
```

**Check:** answer one card wrong and it returns in "Review mistakes". Reload halfway: same card, same sentence. A card graded Good is not due again today. A sentence with 王毛毛 in it shows 王 and 毛毛 with pinyin above each.

## 4. Lessons

**Done when:** a new learner can do the first course lesson, and those words are due for review tomorrow.

```text
Build lessons and the quiz in SPEC.md section 6.2. The quiz and the rule for what a lesson sentence may contain are exact.

A Lessons page lists every lesson by source, in order, with how many of its words are in the repertoire. The earliest unfinished lesson is offered first. Any lesson can be started; none is locked. Sentences for a course lesson follow section 6.4's last rule. Generating missing sentences uses lesson.sentences in PROMPTS.md through a Job; the lesson is usable word-only while that runs.

Position in a lesson is saved at every step.
```

**Check:** "I already knew this" removes a word from the quiz and gives it cards due in 30 and 7 days. A word passed in the quiz is due tomorrow, not today. A word failed in the quiz and not yet passed does not appear in reviews.

## 5. Import a learner

**Done when:** Tom's export file imports, and his due counts match what the existing app shows.

```text
Build "Import my words" in Settings exactly as SPEC.md section 6.6 says, through importWords in the word-memory module. Show the report when it finishes. The uploaded file is processed and discarded; it is never stored whole and never logged.
```

**Check:** import twice; the second run reports everything skipped. No course word is duplicated. A file listing the same word twice imports it once.

## 6. Home and town

**Done when:** home is an illustrated room whose objects lead to working things; the town shows eight slots with the right markers; hotspots can be dragged into place.

```text
Build layers 2, 3 and 4 of SPEC.md section 2, and the screens in section 8, with no generated content yet.

1. The content shelf (ContentItem and Seen in section 3) and the chooser: serve() exactly as section 2 defines it, in its own file, and markSeen.
2. Home as a room, replacing the plain home page: the uploaded home room picture as the backdrop, with a real button over each of the desk (the two reviews, with due counts), the shelf (lessons), the phone, the console, the radio, the camera and the door (town). Under the picture, the same actions as a plain list. The phone and console call serve() and show an empty state for now.
3. Town: the uploaded ground picture with the eight slots of section 8. Create the three bundled places tied to the first three course lessons, using their uploaded houses. The two custom slots, the shop and the park show the empty plot. Map markers exactly as section 7 defines them.
4. The room screen in section 8 with its eight hotspots; the four surfaces call serve().
5. Positions exactly as section 8 says, with the layout mode on /dev for each of the three pictures. Start every hotspot at a sensible guess.
6. On /dev, an upload for each fixed picture: home room, neighbour room, town ground, stock house, the learner's house, the three bundled neighbours' houses, the empty plot, the three character sheets, the style board, and the avatar sheet. Cut each character sheet into its left (neutral) and right (delighted) halves on upload.

The pictures in references/ show the look and layout wanted. Where a picture has not been uploaded yet, show a plain paper-coloured panel with its name; do not draw scenery.
```

**Check:** with the test learner, the mouse teacher's and the dog's houses are open and the cat's shows a padlock listing its lesson. Every tappable thing also appears in the list beneath.

## 7. Bring a book

**Done when:** photographing pages of a Chinese picture book gives a lesson plan, and after approving it the first custom lesson can be started.

```text
Build steps 1 to 5 of SPEC.md section 7. Step 4 is exact.

The camera on the home room: type the book's title, take or upload photos, reorder and remove them, then Go. Each step is a Job using the named prompt in PROMPTS.md (source.read, source.words, lesson.sentences). Show progress per step, and the result of each: the text read (editable, unclear parts highlighted), the words found, the unknown list, then the plan (prerequisite lessons and custom lessons with their words). The learner can drop words, then approves.

On approval, in one transaction: create the Source, its Lessons, the queued words, and the Place in a custom slot. Then generate the custom lessons' sentences. The new lessons appear on the Lessons page at once.

Also offer "Describe a story instead": the learner types a topic, source.describe in PROMPTS.md writes a short original text, and that text goes through the same steps from step 2.

Photos are deleted after approval or cancel.
```

**Check:** a book whose words are all in the repertoire gives "no new words" and no lessons. A book with 30 unknown words gives two custom lessons. An unknown word taught by a course lesson that covers three or more of them shows that course lesson as a prerequisite. 这个 in a book is not reported as an unknown word when 这 and 个 are known.

## 8. Make a place

**Done when:** after approving a book, a new house shows a padlock until its lessons are done, then opens with a host who greets you and objects you can tap, with a cog while anything is still being made.

```text
Build steps 6 and 7 of SPEC.md section 7 and the neighbour in section 8, text parts only.

When a source is approved, start a chain of Jobs using PROMPTS.md: place.theme, then place.scenario, then place.neighbour. Build the allowed words for level 1 and their three groups exactly as section 7 step 6 says, using queryWords. Pass every text result through checkText before storing it. Store the scenario and its four ideas on the place. Then create the place's level 1 content items as pending: one for the console, one for the host, one for the TV. Later stages fill them in.

When the learner finishes custom lesson k−1, make level k: run place.scenario again for new ideas and create that level's pending items.

The place opens by the rule in section 7 step 7. The room screen shows the host, their greeting, and the objects; tapping an object shows its label and line with WordText. Until stage 9 gives a place its own art, it uses the stock house, the stock room and the mouse teacher's character sheet.

On /dev add "Make bundled places": for each of the three bundled neighbours run place.scenario and place.neighbour as section 8 says for bundled places, keeping their fixed name, look and art, and create their pending items.
```

**Check:** every Chinese line in the new place passes the word check against level 1's words. The house stays padlocked while a level 1 lesson is unfinished.

## 9. Place art

**Done when:** the new neighbour's house on the map, their character and their room are their own and match their description.

```text
Give each custom place its own art, using the art prompts in PROMPTS.md (art.house, art.character, art.room, art.object) and the image model through the backend, with the uploaded style board attached as each template says.

Each is a Job started when place.neighbour finishes. Store results as the place's art; cut the character sheet into its two poses. A picture that fails leaves the stock picture in place, with a Retry on /dev. Bundled places get object pictures only.
```

**Check:** two different books give two visibly different houses that sit correctly on the same plot.

## 10. Games

**Done when:** the neighbour's console plays a game Astra wrote from that neighbour's words, on a phone and with a keyboard, and the home console lists it.

```text
Build the sandbox in SPEC.md section 9.1 and games in section 9.2. Section 9.1 is exact. Section 9.2, PIPELINES.md, GAME-CONCEPT.md and RUBYTEXT.md now describe the full staged pipeline, shared text adapter and acceptance; where this stage's wording is shorter or older, they win.

For each pending console item: choose the mechanic and art style as section 9.2 says; build the round data with game.data in PROMPTS.md, checked with checkText; then ask Astra for the page with game.page. Test it in a hidden sandbox as section 9.1 says before marking it ready.

The game player: a full-screen sandboxed frame with Restart and Close. On "say", the app speaks that word (the app's OpenAI speech as VOICES.md says, otherwise the browser's zh-CN voice). On "done", show the score and Play again. Call markSeen when the game first reports ready.

On /dev add "Make a game" with a choice of mechanic, art style and words, for trying prompts.
```

**Check:** the source of a generated game contains no Chinese characters. A tone-flight game in pixel-art plays with the network off, apart from speech.

## 11. Live voice

**Done when:** tapping the host starts a spoken conversation in Chinese about their situation, and ending it shows a transcript with unfamiliar words marked.

```text
Build the live voice conversation in SPEC.md section 9.3. The transcript rules are exact.

For each pending host item, write its brief with talk.brief in PROMPTS.md, checked with checkText; it is then ready. When the learner taps the host: the backend mints a short-lived realtime session token; the browser connects with the microphone; the session's instructions are talk.instructions filled from the brief and the level's allowed words. Show the host's picture, a speaking indicator, the text box, and End.

Collect both sides' text from the realtime session's transcription events, including the transcription of the learner's speech. On End, save the Transcript, call markSeen, and show the transcript as section 9.3 says.

If the microphone is refused, the text box still works.
```

**Check:** say something off-topic in English: the host answers briefly in Chinese and steers back. In the transcript, a word outside the repertoire is marked and "Add to my words" queues it; words in the repertoire are not marked.

## 12. Animated dramas

**Done when:** the neighbour's TV plays an eight-line animated episode with captions and speech, and the phone at home scrolls every drama the learner can watch.

```text
Build animated dramas in SPEC.md section 9.4, using the sandbox in section 9.1. Playback is driven by the app exactly as section 9.4 step 3 says.

For each pending TV item: drama.script in PROMPTS.md, checked with checkText; then drama.animation, given the script's stage directions and the keys of the pictures it will receive (the room backdrop, each speaker's two poses, and the place's object pictures). Test in a hidden sandbox as section 9.1 says.

The drama player: the sandboxed frame; under it the current line's caption with WordText and its English, small; tap or Right for next, Left for back; a replay button at the end. Speak each line with the app's OpenAI speech, cast by character as VOICES.md says. Call markSeen when the last line finishes.

The phone at home: a full-screen vertical feed of serve("tv") with no place, one drama per screen, swipe up for the next.

If stage 10 was skipped, build section 9.1's sandbox here.
```

**Check:** the animation page contains no Chinese. Going back a line replays that line's movement.

---

## 13. Word library and adding words

```text
Build the word library and adding words by hand.

/words: a searchable, sortable table of the learner's words with status and next due day per skill. /words/:id shows the word's sentences and lets the learner edit its accepted English answers, add their own sentence (checked by section 5 against the repertoire, free, no model), move a queued word up, or remove a queued word. A repertoire word cannot be deleted.

The camera on the home room gains "Look up a word" (one search box over the dictionary, section 6.5, by Hanzi, pinyin or English) and "Paste a list". A word not in the dictionary can be typed in by hand. Added words are queued, free, and call no model. A word with no sentences is still taught and reviewed, word-only.
```

## 14. New learner and placement

```text
Build the new-learner flow. A first-time sign-in goes here before home.

Name; pick one of ten avatars (cut from the uploaded avatar sheet, or plain coloured discs if none); optional Chinese name with its reading; optional line about themselves; then "Do you already know some Chinese?" No: start the first course lesson. Yes: placement.

Placement, exactly: course words in order, one card at a time with one example sentence: "I know this" or "I don't know this", by button, swipe or Left/Right key, with a strip showing the next ten. Each decision is saved before the next card. "I know this" calls declareKnown. After five don't-knows in a row offer "Stop here". Never decide for the learner and never batch.
```

## 15. Stories

```text
Add stories to the book surface. MEDIA.md describes vocabulary selection, review, narration and the motion comic in more detail; where it says more than this stage, it wins. For each place level, make one four-page story with story.pages in PROMPTS.md (checked with checkText) and one picture per page with art.scene. The reader shows one page at a time with WordText, next and back, and Print. A story is a ContentItem with surface "book" and format "story"; the shelf at home lists them through serve("book"). Stories send no evidence.
```

## 16. Listening tape and spoken cards

```text
Build the listening tape on the radio at home. From sentences whose words are all in the repertoire, favouring recently learned words, play for each sentence: the Chinese, a pause 1.2 times the clip's length, the Chinese again, the same pause, the English, 3 seconds of silence. Show the sentence with WordText while it plays; play, pause and skip.

Speech from the app's OpenAI text-to-speech (VOICES.md): the Chinese slowed about 30%, the English at normal speed. Clips are made on first use and stored per sentence.

Add a speaker button to recognise cards and lesson screens. Produce cards have no audio until answered. If speech is not set up, the radio says "Audio isn't set up yet" and shows the sentences as text.
```

## 17. Coins, shop, gifts, plants

```text
Build coins, a shop, gifts and plants.

Coins come only from effortful practice: 1 per graded review card, 2 per word learned. They buy things, never content or generation.

The shop is a place in the shop slot, tied to the course lesson "Shopping & Groceries" and open at 80% of its words, with a keeper, lines and items made by place.shop in PROMPTS.md and item pictures by art.object. It uses the stock house and room.

Buying, exactly: an item is on the shelf only when its words are in the repertoire. To buy it the learner types its buying sentence in pinyin with the item's own words hidden. Right: coins are taken and the item is theirs, in one transaction. Wrong: submitEvidence fail on that word's produce card, no coins taken, and that item is locked for that learner for 24 hours.

An owned item can be placed in the home room, or given to a neighbour who loves it, whose return greeting then becomes their thank-you.

Plants on the home windowsill stand in for a streak: they grow with completed daily reviews, droop when due reviews pile up, and never die.
```

## 18. Park and gym drills

```text
Open the park and gym slot in town to everyone. Two drills using repertoire words from queryWords: "Hear it, type the tones" (the app speaks a word, the learner types its tone numbers) and "See it, type the tones". Each round is marked right or wrong on screen. Drills send no evidence. One coin per completed set of ten if coins exist.
```

## 19. Settings, export, report a problem

```text
Finish Settings: name, Chinese name, the line about themselves, daily review number, lesson pace, pinyin on/off, timezone, import, export, sign out. Export gives the learner's words and both cards' scheduler state as JSON in exactly the shape section 6.6 imports. Add "Report a problem": a text box that stores the message with the page address and browser, and replies with a reference number.
```

---

# Stages 20 to 38: the rest of the planned product

These come from Qing's product rulings of 4 to 6 October that had not yet been written as stages. They follow stage 19, in number order. The same rules hold: SPEC.md's four layers and Exact sections are not loosened; all Chinese shown passes `checkText`; schedules change only through `submitEvidence`; screens show only what `serve` hands them; everything works by touch on a phone and by keyboard; each unbuilt thing is greyed out with "Not built yet" until its stage lands. Where a line says "not yet decided", build the stated default as a setting on the developer page so it can be changed without a rebuild.

| # | Stage | Leaves working | Needs |
|---|---|---|---|
| 20 | Content for every course lesson | Stories, shows and games waiting behind each lesson, for everyone | 10, 12, 15 |
| 21 | Story levels and the daily four | Easy, medium and hard stories; a suggested day | 15 |
| 22 | Reading aids and the evidence log | "I didn't know this", "Learn this sooner", spacing, every signal logged | 6 |
| 23 | Today's game | One fresh game a day, greyed until reviews are done | 10 |
| 24 | Collectibles, wall art, affection, daily change | A home worth decorating and neighbours who notice you | 17 |
| 25 | Serial dramas and story choices | Cliffhangers that continue tomorrow | 12, 15 |
| 26 | Home replays and the personal tape | Radio, TV, phone and console replay everything unlocked | 12, 16 |
| 27 | Better sources | Companion words, word choices, packs by chat, English books | 7, 13 |
| 28 | Questions from the mouse | Spoken or typed answers that count as evidence | 11, 15 |
| 29 | Hearing reviews and simpler grading | Type what you hear; grading without the dial | 3, 16 |
| 30 | Gym and park extras | Pitch matching, tongue twisters | 18 |
| 31 | The grammar place | Grammar lessons and drills in the learner's words | 6 |
| 32 | Jobs | A café shift that earns coins | 10, 17 |
| 33 | The arcade | Claw machines and lucky dips, all in known Chinese | 17, 24 |
| 34 | Arrival day | Described avatars, the lesson-0 scene, a town already partly open | 14 |
| 35 | More plots, and neighbours who move on | Extra slots; an archive of old friends | 8, 17 |
| 36 | Characters | Reading characters as its own skill, switchable | 3 |
| 37 | Credits | Gift credits and the paid boundary, with no real payments | 8 |
| 38 | Plain view, and video if available | The same app without the game dressing | 6, 12 |

## 20. Content for every course lesson

**Done when:** a learner who finishes any course lesson finds something new to read, watch and play that uses that lesson's words, without anything being generated for them personally.

```text
Give every course lesson its own ready content, made once and shared by all learners.

For each of the 26 course lessons, in order, make a content pack with the app's existing generators: one easy story (stage 15), one drama (stage 12) and one game (stage 10), from that lesson's words plus all earlier lessons' words. Place = the bundled neighbour or shop tied to that lesson where one exists; otherwise no place, so it appears at home on the shelf, phone and console. Vary games across the pack: rotate mechanics and art styles so no two neighbouring lessons get the same pairing, and never give every house the same game.

Run this as one background job from /dev, resumable, safe to run twice, lesson 1 first, with true status per item and cost per item where reported. It must not block a learner's own generation.

These items are ordinary ContentItems with requiredWordIds, so the chooser already holds each one back until the learner has its words, whatever order they learned in. When one becomes available the neighbour or the home object shows "!".

Empty plots where a future bundled neighbour will live say "This opens when you do lesson N" and offer that lesson.
```

**Check:** a learner who did lesson 5 before lesson 2 sees lesson 5's game only if they have every word in it. Two learners see the same story for lesson 3.

## 21. Story levels and the daily four

**Done when:** the learner can ask for an easy, medium or hard story and the difference is real; home suggests the next of four daily things without blocking anything.

```text
Build three story levels on the existing story engine.

Easy: only solid words (SPEC.md section 4.3). No unknown words at all. Medium: any repertoire word, with about 2% of running words unknown. Hard: about 5% unknown. Both percentages are settings. The unknown words are chosen, never accidental: take them from the learner's queued words, most relevant to the story's source first. Each chosen unknown word should come round again across later stories, in different sentences, until it has been met about ten times or has been learned; keep a count per learner and word. An unknown word in a story is always tappable for its meaning, and the sentence and picture should point at it. checkText is called with the repertoire plus exactly the chosen unknown words.

Stories still send no evidence. Print stays, with pinyin, for reading aloud to a child; add "I read this aloud" which only records that it happened.

The daily four: Chinese to English review, English to Chinese review, an easy story, and a medium or hard story (the learner picks which and the app remembers). Home shows which of the four are done today and suggests the next. Nothing is locked and any order is fine; doing more is always allowed. Track minutes spent in study, input, output and fluency, and lean tomorrow's suggestion toward whichever is behind.
```

**Check:** an easy story for the test learner contains no word that is wobbly. A hard story of 100 words has about five unknown words, all from the learner's queue.

## 22. Reading aids and the evidence log

**Done when:** the word pop-up can mark a forget and move a word up the queue, spacing and pinyin can be switched, and every signal is recorded.

```text
Extend the word pop-up used by WordText everywhere.

For a word in the repertoire, add two small optional buttons: "I knew this" (changes nothing) and "I didn't know this" (submitEvidence fail on its recognise card, with Undo). Looking a word up never counts against it. For a word that is queued or not yet the learner's, add "Learn this sooner", which moves it to the front of the queue (queueing it first if needed).

Settings gains: spaces between words on or off (default on), pinyin on or off.

Log every signal about a word, used or not, in one append-only table: card answers, pop-up opens, the two buttons, words typed or said correctly in a conversation, drill results, purchase attempts. Each row says whether it changed a schedule. Outside the review cards, at most one schedule change per word, per skill, per day from each kind of activity. Add one helper so any activity can report "easy pass, medium pass, hard pass or fail" for a word without knowing how scheduling works; it maps onto submitEvidence.
```

**Check:** tapping a word ten times changes nothing. "I didn't know this" brings the word back in today's review; Undo removes that.

## 23. Today's game

**Done when:** home shows one new game each day, greyed out until the day's reviews are done, playable once they are.

```text
Add a daily game. Once a day per learner, generate one small themed game through the stage 10 pipeline, from repertoire words with today's due and recently learned words favoured, in a mechanic and art style different from yesterday's. It is play: it sends no evidence, and it does not need staying power because it is played on one day.

Show it at home from the start of the day as a visible, greyed-out card with its title, opening when both daily reviews are finished. On a day with nothing due it is open at once. Yesterday's games stay replayable on the console.

Not yet decided: whether free learners get a personal daily game. Default: one shared daily game per course lesson for learners with no credits, a personal one for learners with credits (stage 37).
```

**Check:** with reviews outstanding the card is visible and greyed; finishing them opens it without a reload.

## 24. Collectibles, wall art, affection, daily change

**Done when:** there are many things to collect, each tied to a word the learner knows; the home shows them; neighbours respond to gifts and to absence.

```text
Build on stage 17.

Collectibles: generate a large catalogue of small things (art.object), each carrying one word. An item can be offered only when its word is in the repertoire, and is bought by the stage 17 rule: say it in Chinese or come back tomorrow. Nothing is purely decorative. An owned thing can always be hovered or tapped to see its word again, free.

Wall art for the home: hangings that show the characters of words the learner is learning, made as real text over an illustrated frame, never drawn by the image model. Furniture and trinkets can be placed and moved in the home room in a simple arrange mode, positions saved.

Affection: each neighbour has a level that rises with gifts they love and with visits. Higher levels open extra greeting lines and small friendship scenes, which are fun only and never hold back anything that teaches.

Absence and change: a neighbour not visited for a while greets the learner as missed and glad they are back; never a number, a broken streak or a debt. Each day one small thing in the world is different: a new line from a friend, or one object moved.
```

**Check:** an item whose word is not in the repertoire is not on any shelf. After a week away there is no counter anywhere, and one neighbour says they missed you.

## 25. Serial dramas and story choices

**Done when:** a drama ends on a cliffhanger and tomorrow's episode picks it up; a story can offer a choice that changes what happens next.

```text
Make dramas serial. Each place has a running show. A new episode's script is given the previous episodes' summaries and must continue from the last cliffhanger: a hook in the first line, one reversal, enormous stakes about something tiny, a recurring catchphrase, and a stop at the peak without resolving. Each episode mixes that level's new words with repertoire words that most need review (queryWords weakest and dueSoonest). One new episode per place per day at most. The phone feed shows new episodes first.

Stories may offer one or two choices. A choice is not scored and sends no evidence. Each branch is written and checked ahead, not generated on tap.
```

**Check:** episode 2 refers to what happened at the end of episode 1. Both branches of a choice pass the word check before the story is shown.

## 26. Home replays and the personal tape

**Done when:** everything unlocked can be replayed from home, and the radio can play the learner's own stories and dialogues as well as the sentence tape.

```text
Finish the home objects. The TV at home lists every show the learner has unlocked, newest first. The console lists every game unlocked. The phone stays the vertical feed. The shelf holds lessons, stories, and "finish off" lists of words missed from earlier lessons.

The radio gains a second mode: play any unlocked story or saved conversation as audio, hands free, one after another, with the text following along. Audio for words and sentences is made ahead and stored, at normal and slowed speed; a session never waits for speech. Add a slow toggle wherever a speaker button appears.

Choose what the sentence tape and "play something" bring back with the old app's decay rule: each lesson or source gets weight 2 / (days since learned)^1.2, drawn at random in proportion, so recent material dominates and old material still comes round. Both numbers are settings.
```

**Check:** with the screen off the radio keeps playing. A lesson learned a month ago still turns up occasionally.

## 27. Better sources

**Done when:** adding words is helped at every step: the right word is confirmed, its companions are offered, and the order is explained.

```text
Improve how vocabulary comes in.

A single word typed in English, Chinese or pinyin: propose the intended word with pinyin and meaning, and show the choices when there are several. Suggest companion words a learner needs to use it naturally (a measure word, a verb it goes with); the learner accepts or skips each. A newly added word must always be learnable: if no sentence can be made for it from the repertoire, say which companion words would fix that.

For a source's lesson plan, show why words come in the order they do: how often each appears in the source and what it opens. The learner can reorder, skip a word or mark it already known.

"Make a pack by chatting": the learner tells the mouse a topic in English ("nappy change", "the walk to nursery") and gets a proposed word pack to edit and approve, which then behaves like any source.

An English book can be a source: read it, take its vocabulary in Chinese, and continue as for a Chinese book. The app never reproduces a scanned book page by page.

Adding words and sentences by hand stays free and never calls a model.
```

**Check:** typing "nappy" offers more than one Chinese word to choose from. A word with no possible sentence says which companion would unlock one.

## 28. Questions from the mouse

**Done when:** after a story, the mouse asks about it and a correct answer using a due word counts as practice.

```text
Add output practice with evidence. After any story page set, the mouse teacher (or the place's host) can ask two or three questions about it, spoken aloud. Questions are written ahead with the story and built so a good answer needs words due for the produce skill. The learner may first type what they heard in pinyin and see each syllable marked; then answers by typing pinyin with tones, or by speaking.

Evidence, exactly: a due word produced correctly, when it was not shown or said in the question, is a good on its produce card. A clear error on a word, such as a wrong tone when typed, is a hard. Not using a word is never a miss. A word copied from the screen counts for nothing. A spoken answer counts only after the learner confirms the transcript of what they said. At most once per word per day. An answer can be withdrawn as a typo before it counts.

The mouse replies in repertoire words, with a corrected version of the answer when needed, and never comments on pronunciation.

Neighbours already open can have further conversations generated, and wave the learner over when one is ready.
```

**Check:** answering with a word that was in the question changes no schedule. Withdrawing an answer leaves no evidence row marked as used.

## 29. Hearing reviews and simpler grading

**Done when:** a review can be done by ear, and grading can run without the Hard, Good, Easy dial.

```text
Add a hearing mode to Chinese to English review: the learner hears a whole sentence (never a lone syllable), types the pinyin of what they heard, sees each syllable marked, then the meaning. It grades the recognise card.

Grading without the dial. Not yet decided by Qing, who finds choosing Hard, Good, Easy by hand awkward. Build this as a setting, off by default so SPEC.md 6.1 stands: right first time is good; right on the second try after "Nearly", or after opening a hint or a lookup on that card, is hard; wrong is fail. No timing. "I was actually right" and Undo stay.

Saying an answer aloud instead of typing: add behind a clearly labelled experimental switch, off by default, since recognising a beginner's Mandarin is unproven.
```

**Check:** with the setting on, a right first answer advances with no grade buttons shown, and Undo still reverses it.

## 30. Gym and park extras

**Done when:** the gym has a pitch-matching drill and tongue twisters, and every drill fills up as lessons are done.

```text
Extend stage 18. "Match the tones": the app plays a word or short phrase and shows its pitch line; the learner says it and their own pitch line is drawn over it, measured as plain pitch from the microphone in the browser, not by a speech model. Score closeness of contour per syllable; no evidence sent. "Tongue twisters": short ones built from repertoire words, shown with WordText, with slow and normal playback. All drill places are open from lesson 1 with lesson 1's words and gain material as lessons are done.
```

**Check:** the pitch drill works with the network off once the audio is loaded. A learner with only lesson 1 has drills to do.

## 31. The grammar place

**Done when:** a place in town teaches a grammar pattern and drills it in sentences made from the learner's own words.

```text
Add a grammar place, open to everyone. Each short lesson explains one pattern in plain English with three example sentences from the repertoire, then a drill: reorder the words, or fill the gap. Patterns come in the order the course introduces them. Sentences are generated per learner, checked by checkText, and kept. Not yet decided: its name and layout. Default: a schoolroom using the stock room, on the park and gym screen as a third door.
```

**Check:** every drill sentence uses only repertoire words.

## 32. Jobs

**Done when:** the learner can work a short shift in a café, serving what customers ask for, and is paid in coins.

```text
Add job scenarios, starting with a café. Customers order in Chinese from repertoire words; the learner hands over what was asked for, by movement or tap. A shift is ten customers. It is deliberate practice: pay coins per completed shift, more for fewer mistakes. A wrong hand-over shows the right item and its word. Not yet decided: how further jobs are chosen. Default: one job per shop-type place, generated with the game pipeline from that place's words.
```

**Check:** an order never contains a word outside the repertoire.

## 33. The arcade

**Done when:** town has an arcade with a claw machine and a lucky dip that give collectibles.

```text
Add an arcade. A claw machine and a lucky-dip machine cost coins per go and give a collectible from stage 24's catalogue. Everything in it is in Chinese and within the learner's repertoire: prize labels, buttons, the machine's patter. A prize is kept only after the learner says it in Chinese by the buying rule; otherwise it goes back in the machine. Odds are shown plainly.
```

**Check:** no prize is offered whose word the learner does not have.

## 34. Arrival day

**Done when:** a new learner can describe their own avatar, arrives through a short scene, and someone who already knows some Chinese finds the town partly open.

```text
Extend stage 14.

Avatar: besides the ten presets, the learner can describe one. The description goes inside our own art prompt; show three versions to choose from. Once per learner, free, then closed.

Lesson 0 needs no vocabulary. The learner appears in a scene and sees a ready-made short show of the mouse and friends, a ready-made conversation, and a small newcomer game, all bundled content made once (stage 20's job). Not yet designed by Qing: the newcomer game. Default: meet the three neighbours and tap who is who by name, with their names spoken. Then the learner is put in their room and shown round: plants, lesson 1's tape, first reviews, bookshelf.

A learner who used placement skips lesson 0 but still sees the arrival show. Every place where they hold 80% of its words is already open. The bookshelf starts at the first lesson not finished and offers "finish off" for words missed in earlier lessons. Placement swipes earn a few coins and can be left and resumed. Whatever is marked, the learner leaves with a first lesson or a first review, never nothing to do.
```

**Check:** marking every word known still ends on something to do. A second described avatar is refused.

## 35. More plots, and neighbours who move on

**Done when:** the map can hold more than two custom places, and a neighbour whose words are fully solid moves to a list without being lost.

```text
Slots: make the number of custom neighbour plots, shop plots and "distant travels" plots a setting instead of fixed at two, with the town picture extending or panning to hold them and the Layout record placing them. Coins can buy an empty plot; coins never pay for what is generated to fill it.

Moving on: when every word of a custom place is solid in both skills, its neighbour moves to "Old friends", a list reached from the map. Everything they had stays playable there, their plot frees up, and a visit is a natural place for long-interval words. The learner can also send a neighbour there early to make room.
```

**Check:** moving a neighbour on removes nothing from the home TV, console or shelf.

## 36. Characters

**Done when:** reading characters can be switched on as its own skill, tested separately from sound.

```text
Add character skills beside the two existing ones, using Card.skill as a string as SPEC.md intended. "Recognise the character": the card shows Hanzi with no pinyin and asks the meaning. Off by default; a learner who only wants to speak never meets it, and still sees characters everywhere with pinyin. Switching it on starts those cards empty, so words already spoken get a second pass on characters only. With it on, text mixes pinyin and no pinyin: hide pinyin only on words whose character card is solid. Not yet decided: whether typing a character through a pinyin keyboard counts as producing it. Default: do not build character production yet; leave it greyed.
```

**Check:** with the switch off no card ever hides pinyin.

## 37. Credits

**Done when:** generation for one learner spends credits, everyone starts with a gift, and what is free stays free. No real payment is taken.

```text
Add a credit ledger. Anything generated for one learner spends credits, in tiers by cost: text only is cheapest, pictures more, a personal daily game most. Reviewing, re-reading, re-listening, repeating a conversation already made, the whole bundled course and its content, and adding words by hand are always free. Coins never buy credits or anything generated.

Every new learner gets gift credits: enough for one full custom neighbour. Not yet decided: what that contains. Default: the place's host, art, and level 1 story, game, drama and conversation.

Custom plots beyond what the learner's credits could fill are not shown; when credits are added the map extends and the plots appear. With no credits, a book can still be scanned and its words learned and reviewed, with no generated place.

There is no payment provider. Credits are added only from /dev, clearly labelled as a test grant. Do not build a checkout or imply one exists. Show the learner their balance and what each thing will cost before they start it. Not yet decided: whether live voice needs its own cheap plan. Default: voice spends credits per conversation.
```

**Check:** a learner with no credits can do every lesson and review and play all bundled content. Starting a generation shows its price first.

## 38. Plain view, and video if available

**Done when:** the learner can switch the game dressing off and still reach everything.

```text
The world is one presentation of the app. Add a "plain view" switch in Settings that shows the same things as lists and cards with no rooms or map, built from the lists that already sit under each picture. Everything reachable in the world is reachable there.

Generated video for dramas: only if the account has a video model available. If so, offer it as an alternative way to film an episode from the same checked script. If not, leave it greyed out. Never substitute a prerecorded clip.
```

**Check:** in plain view every surface that has content in the world shows the same items in the same order.
