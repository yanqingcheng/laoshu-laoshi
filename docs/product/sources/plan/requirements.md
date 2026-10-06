# Laoshu Laoshi: provisional product requirements

Status: provisional, Sun 4 Oct 2026. Written by Fable from Qing's rulings that afternoon.
Amended Mon 5 Oct 2026 from Qing's rulings that morning: decisions 8 to 12, R76a to R76f, section 7b (the world, R80 to R114), and open decisions 9 to 22. Her own words for these are in `notes/08-world-and-demo-session-2026-10-05.md`.
Amended again Mon 5 Oct 2026 from her dictation that afternoon: decision 3 rewritten, decisions 13 to 16, R2 to R2c, R11e, R14a, R17a to R17j, R20a, R64a and R64b, R76g to R76l, R96 to R100b reworked, R115 to R139, and open decisions 23 to 32. Her own words are in `notes/09-user-walkthroughs-2026-10-05.md`. The same material told as three people using the product is in `walkthroughs.md`.
Scope: the product. `spec-v2.md` is the hackathon build plan and follows this file; where they disagree, this file is right.

**Marks**

- **(Qing)** she said it.
- **(assumed)** my proposal. Strike or change freely.
- **(research)** supported by the two evidence files: `notes/04-language-learning-evidence-base.md` (the whole design) and `notes/05-comprehensible-input-design-evidence.md` (the input layer). Strength is stated there; a short table is in section 8.

---

## 1. What the product is

Radically personalised comprehensible input, layered on top of a good spaced repetition app. (Qing)

- **The base** is a spaced repetition app: it teaches words and tests recall on a schedule.
- **The new part** is the input: reading and listening material generated for one learner, from that learner's own core vocabulary, about that learner's own world. Personalising input used to be hard. It is now doable. (Qing)
- **Everything is generated from the learner's core vocabulary.** (Qing)

The first learner is Tom, a dad at HSK 1 whose toddler's Chinese is overtaking his. (Qing)

The one-sentence story, as of 5 Oct: "You bring the content you want to learn, and it becomes a part of your world with gen AI." (Qing) The world is section 7b.

The aim for engagement: people should want to come back every day, and everything that brings them back is in service of the pedagogy. Duolingo's fault is that people return daily and do not progress, because it lacks comprehensible input, real spaced repetition and sound pedagogy. Its pull is not the fault. Extrinsic motivation is a stepping stone to the mastery that later supplies intrinsic motivation. (Qing, citing Alpha School)

## 2. Decisions that shape everything

1. **Review and input are fully separate.** Reviews are reviews: recall testing. Input is passive absorption. (Qing)
2. **The schedule is a statistical estimate of when the learner will forget each word, so anything that is useful evidence about that goes into it.** A right answer typed or said is evidence, wherever it happens. So is a wrong one. Reading past a word in a story is not evidence: the learner may have guessed, skimmed or not noticed. (Qing)
3. **Each word has up to four records ("4 stats per word"), each with its own schedule.** (Qing, 5 Oct afternoon; this replaces the two states of 4 Oct.) Read here as: recognising it by sound or pinyin, recognising the character, producing it by saying or typing pinyin, and producing the character. (assumed reading; her words and the layout are in R2) A learner who only wants to speak can "toggle off character fluency altogether". (Qing) Elsewhere in this file "Chinese to English" means the recognising records and "English to Chinese" the producing ones.
4. **The schedule dictates all practice.** It chooses which words feature in every kind of practice. It is updated by observed recall and by nothing else. (Qing)
5. **Input carries a small share of unknown words.** Comprehensible input is, by definition, mostly understood and partly new. (Qing) The old app's rule that the learner never meets an unprepared word still governs review and lessons, where a sentence must not hide the answer behind other unknowns. It does not govern the input.
6. **No colour overlay on pages.** Red, amber and green were a device for showing an audience that a page fits a learner. They are not part of the product. (Qing)
7. **Four kinds of practice, in equal measure, each done at least once a day:** deliberate study, input, output and fluency. (Qing, adopting Nation's four strands)
8. **Home is bilingual; the town is full immersion.** Anything bilingual lives at home. Anything in town is Chinese only. (Qing, 5 Oct)
9. **Nothing that benefits pedagogy is locked behind the game.** Every core feature is there on day one. What is game-locked is more game than learning. (Qing, 5 Oct)
10. **Learning the language is the natural gate.** The world grows because the learner could not understand it before. (Qing, 5 Oct)
11. **Reward currency is never required for an unlock.** (Qing, 5 Oct) Sharpened that afternoon: coins never buy learning and never buy anything generated. They do buy more neighbour slots. (Qing) A slot is read as an empty plot (R92). (assumed)
12. **No numerical streaks.** Happy plants, and neighbours who miss you and are glad you are back. (Qing, 5 Oct)
13. **You do not get a thing if you cannot say it in Chinese.** Nothing in the game is purely cosmetic. (Qing, 5 Oct afternoon)
14. **Coins come from deliberate practice.** "Anything where you're really proactively doing the hard drill work of learning Chinese gets you coins." (Qing, 5 Oct afternoon)
15. **Content is always filtered to what the learner is ready for.** People can learn words in any order; a piece of content they lack the words for waits until they have them. (Qing, 5 Oct afternoon)
16. **Everything works by touch in a phone browser and by keyboard.** "Everything needs to be super easy." (Qing, 5 Oct afternoon)

## 2a. The daily four

Paul Nation's "four strands" framework says a balanced course gives roughly equal time to four kinds of activity. Qing has adopted it as the daily shape of the product: the learner does at least one of each every day, and over time the four get about equal time.

| Kind of practice | What the learner does | Which words the schedule sends there | Changes the schedule? |
|---|---|---|---|
| **Deliberate study** | Reviews due cards; meets and is quizzed on new words | Words due today, in each direction; the next new words | Yes, on every answer |
| **Input** | Reads or listens to a medium or hard story made for them | Words learned recently or due soon, so they are met in fresh sentences; plus a small share of chosen unknown words | No. Nothing is recalled |
| **Output** | Answers the mouse's questions about a page, typing pinyin with tones or speaking | Words due for English to Chinese, so a good answer needs them | Yes: a due word produced correctly, or a clear error on one |
| **Fluency** | Reads or listens to an easy story, quickly; or reads one aloud | Only words the learner is sure of; nothing new, nothing shaky | Only where there is evidence, such as reading aloud to the app. Silent reading and listening: no |

- R48. **One schedule, four destinations.** The schedule's list for the day drives what the story contains, what the mouse asks for and what the fluency material is made of, as well as the cards. (Qing)
- R49. **The daily flow is four steps** (Qing):
  1. Chinese to English reviewing.
  2. English to Chinese reviewing.
  3. An easy story.
  4. A medium or hard story, whichever the learner prefers.
- R49a. **The four are a floor, not a fence.** The learner can do them in any order, at any time of day, and can do as much more as they like. (Qing: any order, and overstudy. Tom wants a custom audio tape for the washing up)
- R49b. **Output is available whenever wanted.** The four steps cover deliberate study twice, fluency and input; in Nation's terms typing pinyin on a card is still study, and free speaking is a separate strand. A conversation with the mouse (section 7) supplies it, and like everything else can be done at any point. (follows from R49a)
- R50. **Roughly equal time.** The app tracks time in each and steers the next day's suggestion towards whichever is behind. (Qing: likes the 1:1:1:1 ratio. Research: this is an expert framework; Nation himself calls the equal split crude, and no study has tested the proportions)
- R51. **No order is imposed.** The app suggests a next thing; it never blocks another. (Qing) This covers the daily four and everything else that teaches. Today's game (R101) is outside it: that waits for the day's reviews (R102), which decision 9 allows because the game is more game than learning.
- R52. **Fluency includes real life.** Reading tonight's printed story aloud to a child is fluency practice, and the app should count it when the learner says they did it. (assumed)
- R53. **Easy stories are entirely words the learner is sure of.** This is where the old app's rule of no unprepared words applies in full. (Qing. Research: fluency practice needs familiar material; it also asks for a push to go faster, which an easy story alone does not supply)

### What counts as evidence

The test for any signal is the one in decision 2: does it tell us something reliable about whether the learner still has the word?

| Signal | What it says | Strength | Used? |
|---|---|---|---|
| Right answer on a card | Recalled it | Strong | Yes |
| Wrong answer on a card | Did not recall it | Strong | Yes |
| Typed what they heard, correctly | Recognised it by ear | Strong | Yes, Chinese to English |
| Due word typed or said correctly to the mouse, without having been shown it | Produced it | Strong | Yes, English to Chinese |
| Clear error on a word in an answer, such as the wrong tone | Has it only partly | Moderate | Yes, as a miss or a "hard" (assumed which) |
| Used a word the mouse had just shown them | Could copy it | Weak | No |
| Did not use a due word in an answer | Nothing; may have said it another way | None | No |
| Read or heard a word in a story and carried on | Nothing; may have guessed or skimmed | None | No |
| Tapped a word to see its meaning | Unsure, or just checking | None | No. People may be unconfident without penalty (Qing) |
| Pressed "I didn't know this" on a word's meaning pop-up | Had forgotten it, by their own account | Strong | Yes, as a forget, Chinese to English (Qing) |
| Pressed "I knew this" | Says they knew it, with nothing recalled | Weak | No (assumed) |

- R64. **Every signal is logged, used or not.** With the log, how well each kind of signal predicts later recall can be measured, and the weak ones promoted or dropped on evidence. (assumed; follows from decision 2 and R3)
- R65. **Evidence from outside the cards is not double counted.** At most one update per word, per direction, per day from each kind of practice. (assumed)
- R64a. **One front door for evidence.** Any activity can report what happened for a word in one of its records (R2): an easy pass, a medium pass, a hard pass or a fail. The activity does not need to understand the spaced repetition behind it. Which games, drills and other content count as evidence is decided case by case. (Qing, 5 Oct afternoon: "a really neat way of plugging in and updating the evidence for that without the sort of calling side having to understand the details of the spaced repetition")
- R64b. A failed attempt to buy something (R98b) is a fail for that word in a producing record, so the word comes back sooner. (assumed)

### Rotating through content: the decay curve

The old app's listening lesson already has a rule for what to bring back and how often. It is reused here so that input, output and fluency keep rotating through the learner's material. (Qing)

- **The rule as built:** each learned list gets a weight of 2 divided by (days since it was learned) to the power 1.2. Sentences are then drawn at random in proportion to weight. One day old weighs 2.0; three days, 0.52; a week, 0.19; two weeks, 0.08; a month, 0.03. So recent material dominates and older material still comes round. (From the old app's listening design, `docs/plans/2026-01-23-listening-mode-design.md` in the app repo.)
- R60. **Two selectors work together.** The schedule says which words are due and must feature. The decay curve fills the rest: which recently learned words to bring back, and which of the learner's books or stories today's material is set in. (assumed split)
- R61. **Applied to words and to sources.** A word's weight runs from the day it was learned. A source book's weight runs from the day the learner added it or last read from it, so the books they are using now come up most. (assumed; see open decision 7)
- R62. **Nothing the learner chose is dropped.** However old, every learned word and every book on the shelf keeps a small chance of coming back. (follows from the curve's long tail)
- R63. **The two numbers are settings.** They were chosen by judgement in the old app, not measured. (Research is consistent with the shape: meetings spread over days beat meetings bunched together, and a word needs several of them. It does not supply the numbers.)

## 3. The base: a good spaced repetition app

The existing app is the reference for what "good" has to cover. Its behaviour is written up in `docs/product-description/` (on branch `cursor/product-description-docs-48bb`), with 28 defects not to repeat.

### 3.1 Words and the record

- R1. A word has characters, pinyin and meaning. Two words with the same characters and different meanings are different words.
- R2. **For each learner, each word has up to four records, each with its own schedule.** (Qing, 5 Oct afternoon: "the two records per learner for their Chinese and English fluency for each word", with Chinese perhaps split into "one for pinyin fluency and one for character fluency", making "those three stats per word"; then "I guess it's 4 stats per word because you could be asking some really advanced learners to write the characters or type the characters". This replaces the two schedules of 4 Oct.) Laid out as two by two (the layout is assumed):

  | | By sound or pinyin | By character |
  |---|---|---|
  | **Recognise** (Chinese to English) | hears it, or sees the pinyin, and knows what it means | reads the character and knows what it means |
  | **Produce** (English to Chinese) | says it, or types the pinyin | writes or types the character |

- R2a. **Characters can be switched off.** Someone like Tom, who only wants to speak, turns character fluency off altogether. The characters are still shown everywhere, with pinyin, so they become familiar; the learner is never tested on them. (Qing: "we still show the characters. You'll still get the familiarity. You just never get tested on any characters") The two character records are then not scheduled. (follows) With characters on, what is shown is "a mix of both": some words with pinyin and some without. (Qing; how the mix is chosen is not said)
- R2b. Switching characters on later starts those records empty, so the learner makes a second pass, on characters only, over words they already speak. (assumed)
- R2c. Typing a character through a pinyin keyboard is mostly picking it from a list. Whether that counts as producing the character, or only handwriting does, is open decision 24. (raised by Fable)
- R3. Every answer is logged, permanently. The old app kept only the current schedule, so nothing could be checked or tuned.
- R4. The record is the single source of truth. Every other part of the product reads it.

### 3.2 Learning a word

- R5. **A word is introduced in a custom lesson before it is reviewed:** characters, pinyin, meaning, audio, a generated picture for the word, and example sentences made only of words the learner already has. (Qing: custom lesson with image generation)
- R6. A short quiz follows. Words enter review when the quiz is passed.
- R7. Words are introduced at a pace the learner will keep up. A session that gets done beats a better one that gets skipped. (Qing: the couch-to-5K principle)

### 3.3 Review

- R8. Chinese to English: the learner sees or hears the Chinese and types the meaning.
- R9. English to Chinese: the learner sees the English and types the pinyin, with tones. (Qing: Tom always types tones)
- R10. Hearing: the learner hears a whole sentence, not an isolated syllable, and types the pinyin of what they heard. (research: naming the tone of a lone syllable does not carry over to recognising words in speech) This is recognition by ear, a mode of Chinese to English, not a third state. (Qing: typing pinyin from hearing is a key task; treating it as a mode is assumed)
- R11. A right answer is followed by hard, good or easy. A wrong answer is a miss and the card returns in the session.
- R11a. **A slip is not a forget.** When an answer is marked wrong, the learner can say "I was actually right" and choose hard, good or easy instead. This is for typos and mis-taps. The old app has this; it stays. (Qing: the misclick buttons. A mistype is evidence about fingers, not memory)
- R11b. **The last grade can be undone.** One tap takes back the most recent grade and shows the card again. The old app has no undo; this is new. (assumed, from the same complaint about Anki)
- R11c. **Both versions are logged.** The log keeps the original mark and the correction, so overrides can be checked for overuse later. (assumed)
- R11d. **The same forgiveness applies outside the cards:** "I didn't know this" on a pop-up can be undone, and an answer to the mouse can be withdrawn as a typo before it counts. (assumed)
- R11e. **How a right answer is graded is open again.** Choosing hard, good or easy by pressing a button, as the existing app does, is "way too funky". (Qing, 5 Oct afternoon) She listed options without choosing: judge by how long the learner takes and how much they backspace; drop the dial and have one difficulty; count a "nearly" as hard; or have a "nearly" ask the learner to try again, since the typo button already covers slips. Fable's proposal: use only what the app can see for certain. Right first time is a pass. Right on the second try after a "nearly", or right after a hint or a lookup, is a hard pass. Wrong is a fail. No timing, because a parent holding a toddler takes twelve seconds over a word they know cold. (assumed; open decision 23) R11 and R11a stand until this is settled. "Easy" stays in any case as the mark for a word the learner says they already know when starting (R17g). (Qing)
- R12. One pinyin checker is used everywhere: tones required; tone numbers or marks; `v` for `ü`; spaces and capitals ignored; tone changes in speech accepted for 不, 一 and paired third tones.
- R13. Saying the answer aloud may replace typing if speech recognition proves reliable for a beginner's Mandarin. Until tested, typing only. (Qing: experiment with voice. Research: automated judgement of non-native Mandarin pronunciation is still unreliable, so the bar for this test is high)
- R14. Reliability rules from the old app's defects: a grade is saved once and only once; nothing advances until the save succeeds; a button does what its label says; a failed lookup never reads as "nothing to do".
- R14a. **Every screen works by touch in a phone browser and by keyboard** (decision 16). Swipes have keys that do the same; reviewing has keyboard shortcuts. (Qing, 5 Oct afternoon) This applies to the whole product, so every build prompt carries it. (assumed)

### 3.4 Audio

- R15. Every word and sentence has natural Mandarin audio, at normal and slowed speed. (Qing: keep Azure)
- R16. Audio is made ahead of need and stored, so a session never waits.

## 4. Where vocabulary comes from

The learner's vocabulary comes from four kinds of source. All of them end in the same place: a list of candidate words, from which the learner's course is chosen.

- R17. **A core course to choose from.** A small prepared curriculum (today: HSK 1 and 2 in themed lists). (Qing: a small core curriculum plus your own vocabulary)
- R17a. **Starting means marking what you know, one word at a time, by swiping.** The learner sees a word and a sentence and swipes one way for "I know this" and the other for "I don't". No estimating from a sample: the schedule needs to know exactly which words the learner has. (Qing: "precision matters for spaced repetition", 4 Oct; the swipe is 5 Oct afternoon: "something Tinder-like where you see a word and a sentence and you swipe left or right")
- R17c. **A word is marked known only because the learner swiped it.** (Qing: "I really don't want people to accidentally end up with words they've never learned marked as easy so we can't batch the swipes, can we?") So no batches, and no screen where "known" is the default. (Fable agreed; the second clause is assumed) Several hundred words means several hundred swipes, which is acceptable. (Qing: "maybe that's okay")
- R17d. **Words come easy to hard, and the app offers to stop.** There is no sampling stage to find the learner's level. As the words get harder the learner keeps fewer, and after "a certain number of swipe-lefts in a row or something" the app may say "stop here". (Qing, tentatively) Everything after that point counts as not yet learned, and "easy to hard" is taken to mean most common first. (both assumed) The trigger is fewer than about 3 kept out of the last 20, not a strict run, so that a learner whose vocabulary does not follow textbook order is not stopped early; the stop screen has a "keep going" button. (assumed)
- R17e. **A strip shows the next ten or so words in the queue,** "so you have some hint of whether you really should stop". (Qing) It is shown all the time, not only on the stop screen. (suggested by Fable; Qing: "Yeah, exactly") Looking at the strip marks nothing. (follows from R17c)
- R17f. **Swiping may earn coins,** as a reward for getting through it. (Qing: "maybe") It can be left and picked up again. (assumed)
- R17g. **"I know this" is an easy mark.** (Qing: "I want people to be able to mark stuff as easy when they're onboarding") It fills the record for recognising by sound or pinyin only; the producing record starts lower and is settled by the first reviews. A wrongly kept word is corrected by its first fail, or by "I didn't know this" (R44a). (assumed)
- R17h. **Anything missed is caught in lessons,** where the learner can always say "I already knew this word" (R28). (Qing)
- R17i. **Every new learner gives a name and makes an avatar (R138), and is then asked whether they already know some Chinese.** (Qing) Yes leads to the swipes; no leads to lesson 0 (R139).
- R17j. **A learner with existing Chinese arrives to a town that is already partly open.** They skip lesson 0 and still see the arrival video; every place where they know 80% of the words is open; the bookshelf starts at the first lesson they have not mastered, and lets them finish off the words they are missing from earlier lessons, as the existing app does. (The picture was Fable's, put as a question; Qing: "yeah exactly", and she added the last point: "they should be able to polish off words they're missing from previous lessons in the bookshelf too - existing laoshu has a system like this") The swipes run by how common a word is and lessons are grouped by subject, so most places will be partly done. (noted by Fable)
- R17b. **Marking must never dead-end.** In the old app, marking a few words known could leave a learner with nothing to do. Whatever is marked, the learner leaves with a first lesson or a first review. (from the old app's defect list)
- R18. **A scanned book.** The learner photographs a book they own. The app reads the text and extracts its vocabulary. (Qing)
- R19. **A described story.** The learner describes a scenario ("a nappy change", "the walk to nursery"). The app writes a book about it and extracts the vocabulary from that book. This works exactly like putting in a book, except the learner describes the story they want. (Qing)
- R20. **A single word.** Typed in English, Chinese or pinyin; for example a word the child said. (Qing)
- R20a. **Adding your own words and sentences by hand is always free.** They go into review. No content is generated for them without credits. (Qing, 5 Oct afternoon) New content can be added three ways: single words, themed packs made by talking to the mouse's model, and photos. (Qing)

Consequences:

- R21. A scanned book and a described story are the same kind of object afterwards: a **source book** with pages, text and a vocabulary list. Everything downstream treats them alike. (Qing: "like putting in a book")
- R22. A source book is written in natural Chinese, at whatever level it happens to be. Its job is to supply vocabulary. The learner's own reading material is made separately (section 6).
- R23. A described story is written the way a real picture book on that subject would be: natural, complete, and using the words a parent would really use. Its job is to surface the right vocabulary. (assumed reading of "a fake book")

## 5. Choosing what to learn, with help from a model

The existing app already uses a model here, for example to suggest companion words. The new product extends that. (Qing)

- R24. **Resolve the word.** From whatever the learner typed or the book contained, propose the intended word with pinyin and meaning, and show the choices when there are several (disposable nappy or cloth nappy).
- R25. **Suggest companion words.** A word often cannot be used naturally without others: a measure word, a verb it goes with. The model proposes these so the learner's sentences need not be stilted. (Qing: as the existing app)
- R26. **Propose an order.** From a source book's vocabulary, propose which words to learn first and say why: how often the word appears in the book, how useful it is at home, what it unlocks. (assumed)
- R27. **Keep the pace.** A rule, not the model, limits how many new words are introduced per day. (assumed)
- R28. **The learner decides.** Proposals are shown; the learner can accept, skip a word, or mark it as already known.
- R29. A newly added word must always be learnable. The old app could add a word and then have no sentence for it, because every sentence needed a word the learner lacked. Companion words exist to prevent exactly this.

## 6. Comprehensible input: the new part

### 6.1 What it is

- R30. Reading and listening material written for one learner, almost entirely in words from that learner's record plus a small, chosen share of new ones, about that learner's own books and life.
- R31. It is passive. The learner reads and listens. There is nothing to answer and nothing is scored. (Qing)
- R32. It never changes the review schedule. (Qing)
- R32a. It has two jobs: meeting words already learned in many fresh sentences, and meeting a few new words in a setting that makes them guessable. Those new words are still taught and tested in the review app before they count as learned. (research: text with nothing unfamiliar builds fluency only; text with a little unfamiliar is what the term comprehensible input means)

### 6.2 What gets made

- R33. **New stories that use the source's words.** A source book gives the vocabulary; the learner's stories are new ones built from it, about the same things and about their daily life, so the same words come round in fresh sentences. (Qing, tentatively: "new story using words?")
- R33a. **Not a page-by-page retelling of the book.** That was in the demo plan and is withdrawn, which also means the product never reproduces a scanned book. (follows from R33)
- R34. **Stories are illustrated with generated pictures,** in one house style, with recurring characters. (Qing: custom, with image generation)
- R34a. **Moving pictures are worth a try:** short generated video, or a paper-cut style animation assembled from generated characters. Exploratory; pictures are the baseline. (Qing: "maybe we can see") As of 5 Oct this is the drama (R106 to R110), and how it is filmed is an experiment in `experiments-2026-10-05.md`.
- R35. **A custom audio tape.** Any of the learner's stories, and their sentences with recall pauses as the old listening lesson had, can be played hands-free and saved, for the washing up or a walk. (Qing)
- R36. **A printable version**, with pinyin, to read aloud to a child. (Qing)
- R37. **An English book can be a source too.** Its vocabulary is taken in Chinese, and stories are made from that. Producing a Chinese version of the book itself, to print and read aloud, was in Qing's original demo; whether it survives R33a is open decision 8.

### 6.2a One engine, three levels

Fluency material and comprehensible input come from the same story engine. So do the mouse's conversations (R71). Only the share of unknown words differs. The learner is offered them as easy, medium and hard. (Qing)

| Level | Unknown words | Which known words | What it is for |
|---|---|---|---|
| **Easy story** | None | Only words the learner is sure of | Fluency: reading and listening become quick and comfortable |
| **Medium story** | About 2% of running words | Any word in their record | Input: mostly consolidation, a few new words |
| **Hard story** | About 5% of running words | Any word in their record | Input: more new words, more effort |

- R66. **"Sure of" is decided by the schedule.** A word qualifies for an easy story when the schedule's estimate that the learner would recall it today is high, in the Chinese to English direction. The threshold is a setting; 95% is a starting value. (assumed; uses the statistical estimate in decision 2)
- R67. **The percentages are starting values and settings** (R39). Medium and hard are the low and high ends of the 2% to 5% range. (assumed mapping of Qing's levels onto the range)
- R68. **The learner picks medium or hard.** The app remembers the choice and may suggest moving up or down. (Qing for the choice; the suggestion is assumed)
- R69. **Everything else in section 6.3 applies at all three levels**, except that the rules about unknown words (R39 to R39c) have nothing to act on in an easy story.

### 6.3 Rules for anything generated for the learner

- R38. **Every word accounted for, checked by code.** A separate check, not the model, confirms that each word is either in the learner's record or one of the unknown words chosen for this text. Nothing else gets through. Failures go back for rewriting. (research: models obey vocabulary limits closely but not perfectly)
- R39. **A small, set share of unknown words.** Start at about 2% to 5% of running words unknown, which is one new word in every 20 to 50. The share is a setting per learner, and what each learner's share was is logged against what they later learned. (Qing: some percentage unknown. Research: nobody has established the best share for learning. The familiar 95% and 98% figures are about understanding, measured in English. The one direct test, a conference abstract with advanced learners, found most learning at 5% unknown. So this is a starting value to tune, and the product's own data is how it gets tuned)
- R39a. **The unknown words are chosen, not accidental.** They come from the learner's own queue: words from their source books and daily life that they have not yet been taught. Meeting a word in a story comes before learning it in review. (assumed. Research: in the one direct comparison, guessing a word from context and then being given its meaning beat being given the meaning first)
- R39b. **Each unknown word comes round again, in different sentences.** Aim for roughly 8 to 12 meetings spread over several texts and days. Ordinary reading cannot arrange this; generated text can, and that is the main advantage of generating it. (research: one meeting teaches little, and there is no fixed number that suffices; spacing across texts matters more than repeats within one; varied sentences usually beat the same sentence repeated, though one study found variety may hurt learners with small vocabularies, so for a beginner the first few meetings should stay close to each other in wording)
- R39c. **Guessing is not relied on.** Learners guess an unknown word correctly from context only about one time in five, and guess wrongly about half the time. So every unknown word must be resolvable by a tap (R44), and the sentence and picture should point at its meaning. (research)
- R40. **Recently learned words are favoured.** Words pick up depth from being met in many sentences, and reading alone teaches new words slowly, so input is best used to consolidate what review has taught. (research)
- R41. **Stories, not expository text.** (research: stories roughly double what readers pick up)
- R41a. **Familiar ground.** A story about the things in a book the learner already knows, or about their own day, is easier to follow than a new subject at the same level. (research: familiar content is read faster and understood better; evidence that personal relevance itself helps is thin)
- R41b. **Explain, don't only strip out.** When a needed word is beyond the learner, the text may keep it and add a few known words that make it clear, instead of removing it. (research: simplified and elaborated texts are understood equally well, and elaboration keeps the new word in front of the learner)
- R42. **Natural language.** The model must not dodge a needed word by writing a stilted sentence; if a natural sentence needs a word the learner lacks, that word is a candidate for the course (R25), not something to write around.
- R43. **Pinyin is available and correct**, including tone changes in speech, and the learner can turn it off. (research is thin: one eye-tracking study found adult beginners look mainly at the characters and find pinyin distracting; no trial compares the options)
- R43a. **Words are shown with spaces between them**, with the option to turn spacing off. (research: the best-supported Chinese-specific finding. Spaces between words help learners read and help them learn new words, and the benefit carries over to unspaced text. Tested on intermediate learners)
- R44. **Meaning on tap.** The learner can tap any word to see its meaning, in English, in a pop-up. Looking is free: it is help, not a review, and never counts against the word. (Qing. Research: glosses raise what readers learn from unknown words from about 27% to about 45% on immediate tests, and help beginners most)
- R44a. **Two small buttons on the pop-up: "I knew this" and "I didn't know this".** Pressing them is optional. "I didn't know this" marks the word as forgotten, so it comes back in review. "I knew this" changes nothing. They appear only for words already in the learner's record. (Qing for the buttons and the forget; the rest assumed)
- R44b. **On a word not yet taught, the pop-up offers "Learn this sooner"**, which moves it up the learner's queue. (Qing agreed)
- R45. **Audio with the text.** (research: learners prefer reading while listening, and it may help retention)

### 6.4 What the learner sees

- R46. A page is the generated picture, the text with pinyin above and spaces between words, a play button, and meaning on tap. No colour coding. (assumed, pending open decision 2)
- R47. A shelf of source books, each with the reading made from it.

## 7. Output: talking with the mouse

The mouse teacher is the output part of the daily four. (Qing: decided in session that the mouse asks questions about a page and the learner answers; its place as the output strand follows from decision 7)

As of 5 Oct a neighbour can be the conversation partner too (R114), and buying a gift is a small act of output (R98). Where this section says "the mouse", read "the mouse or a neighbour" unless a line is about the mouse himself.

- R54. The mouse asks a question about a page the learner has read, out loud.
- R55. The learner may first type what they heard, in pinyin with tones, and see each syllable marked. (Qing: typing pinyin from hearing is a key task)
- R56. The learner answers in pinyin with tones, or by speaking once that is proven reliable (R13).
- R57. The mouse replies in words the learner knows, with a corrected version of the answer when needed.
- R58. The questions are built so that a good answer needs words the schedule has due for English to Chinese. (Qing: the schedule dictates the practice)
- R59. **Answers to the mouse feed the schedule as evidence**, by the table in section 2a: a due word produced correctly counts for English to Chinese; typing what was heard counts for Chinese to English by ear; a clear error counts against. (Qing: useful statistical evidence should be included)
- R59a. **It counts only if the word was recalled, not copied.** If the mouse's question, or text on screen, contained the word, using it is not a review. (research: a context that gives the answer away removes the benefit of recalling)
- R59b. **Counted once per day**, per word and direction (R65).
- R59c. **Not using a word is never a miss.** The learner may have said it another way.

### Voice conversation (proposed)

Qing has proposed that output practice be a voice conversation. A quick look-up of how well OpenAI's voice models handle Mandarin is in `notes/06-voice-models-mandarin.md`. In short: they speak it well, and they cannot judge a learner's tones, which speaking mode does not ask of them.

- R70. **The mouse can be spoken with.** The learner talks; the mouse talks back. (Qing: proposed)
- R71. **A conversation is planned ahead, the way a story is made ahead: generate, then do.** (Qing) Before the learner starts, the engine writes the whole conversation: the mouse's lines, the answers a learner at this level might give to each, and what the mouse says next for each. Everything is checked by code against the learner's vocabulary and recorded.
- R71a. **During the conversation nothing new is written.** The learner speaks; their words are transcribed; a fast model decides which of the planned answers it is closest to; the mouse plays the planned next line. So there is no pause for writing and no unchecked speech. (assumed mechanism)
- R71b. **Going off script is handled by planned lines too.** If the learner's reply matches nothing, the mouse has ready-made moves: ask again more simply, offer a choice of two answers, or give the answer and move on. A conversation never dead-ends. (assumed)
- R71c. **It is made by the same engine as stories,** from the same record and the same day's words, usually about the story just read. (Qing: like pre-making a story; "about the story" is assumed)
- R72. **Speaking mode does not correct tones in detail. Review does that.** (Qing) This suits what the voice models can do: the recogniser picks the likely word from context, so a learner with shaky tones is still understood and the conversation keeps going, which is what speaking practice needs. It also means the mouse must never offer pronunciation feedback of its own; current models invent it when asked. (lookup)
- R73. **A spoken answer counts as evidence only after the learner confirms the transcript.** What it shows is that they produced the word, and nothing about how they pronounced it. (assumed; applies decision 2)
- R74. **The mouse speaks slowly and briefly.** Because its lines are written and recorded ahead, their length and speed are chosen, not hoped for. (lookup: earlier voice products would not slow down or keep replies short when asked)
- R75. **Untested.** None of this has been tried with a beginner's speech. It needs a test with Tom before it is relied on.

Why it is in: input is necessary for learning a language and not enough by itself; making sentences with a word is among the strongest things a learner can do with it; and practice in hearing and practice in speaking each improve only their own skill. (research)

## 7a. Paying for it

Because stories and conversations are made ahead as whole things, charging is simple. (Qing)

- R76. **Pricing is by usage, in credits.** Generating things spends credits; the exact unit is not fixed. One credit per generated story or conversation is the simple version to start from. (Qing)
- R77. **Doing is free.** Reviewing, re-reading, re-listening and repeating a conversation already made cost nothing, since nothing is generated. (assumed; follows from R76)
- R78. **Not yet decided:** the unit itself, what a scanned book costs, what a book made from a description costs, and whether audio and pictures are inside the credit. The old app charged one credit per saved sentence.
- R79. **The price of a credit must cover the real cost of a generation,** which now includes writing, checking and rewriting, audio, and sometimes pictures. That cost has not been measured. (assumed)

Added 5 Oct:

- R76a. **The base game is free.** The standard curriculum and its world are generated once, in advance, for everyone. (Qing)
- R76b. **Anything generated for one learner is billed by usage,** in tiers that follow what the generation costs: text only at the cheap end, pictures above that, and at the premium end a game generated for the learner every day. (Qing)
- R76c. **Radically personalised input is the paid product.** (Qing: "yeah duh! you can't have radically personalised input for free!" and then "it's expensive")
- R76d. **Coins and gems.** Extra slots (R92) can be paid for, "some paid for with ... coins and some with ... gems I guess! to use the standard freemium game analogy". (Qing) Read here as: coins are the reward points earned by doing dailies (R96), and gems are bought with money. (assumed definitions)
- R76e. **A consequence to confirm.** In the free game nothing is generated per learner, so stories and friends' lines are written in advance for each point in the standard course. They fit a learner who is following that course in order. For a learner whose record differs from it, that sits awkwardly with several earlier rulings: section 1 ("everything is generated from the learner's core vocabulary"), decision 4 and R48 (the schedule dictates all practice), R5 (lesson sentences only in words the learner has), R38 (every word accounted for) and R53 with R66 (easy stories only in words the learner is sure of). One reading: those rulings describe the paid, personal product, and the free game approximates them through the fixed course. (assumed; follows from R76a. Needs Qing's eye)
- R76f. **How the units relate is not settled:** credits (R76), gems, coins and reward points. Read here as coins and reward points being one thing; whether gems and credits are one thing is open. (assumed)

Added 5 Oct, afternoon:

- R76g. **The free game is bundled content.** A free learner gets "a duolingo-like or rosetta-stone-like experience going through pre-planned lessons or packs", with content included in each. (Qing) Every chapter of the standard course ships with stories, clips and games made in advance from that chapter's words plus some very simple basic words. (Qing: "that's how I think Rosetta Stone does it"; and the product goes further by mixing in the learner's core vocabulary where content is generated)
- R76h. **Bundled content is filtered against the learner's record** (decision 15). If a learner has taken things out of order and lacks the words for a piece, they do not get it until they have unlocked more words; then the mouse, the cat or the dog shows an exclamation mark because they have something new to show. (Qing) This answers R76e and open decision 18: the free game does not assume the learner followed the course in order; it holds each piece back until it fits.
- R76i. **Everyone starts with gift credits, enough for one full neighbour's worth of generated content.** (Qing: "I guess everyone should have enough gift credits for one full neighbour's worth of stuff?") What a neighbour's worth contains is "details, not important right now". (Qing; open decision 25) It could become the unit credits are sold in. (assumed)
- R76j. **Custom neighbour plots are not visible without a paid plan or bought credits.** When credits are bought, "the fog lifts, or the picture extends", and the plots appear. (Qing) With R76i, one custom plot is visible to everyone from the first day. (Fable's reading, put to her as a question; her answer was R76i's "oh yeah good point", which does not itself say a plot is visible) Coins can also buy more neighbour slots (R97a); how that sits with plots being hidden until money is spent is open decision 32. This replaces "a few free neighbour slots" in R90 as far as custom neighbours go.
- R76k. **Voice may need its own cheap base subscription.** (Qing: "hmmm yeah maybe you need a base subscription that's fairly cheap for the voice models"; open decision 26) The reason is that voice models cost money per use. (assumed)
- R76l. **Coins never buy anything generated.** "You never unlock extra generations with points but you can always put more of the stuff that you've already unlocked." (Qing) This confirms the reading in R92 and R97.

## 7b. The world: a home, a town, and what you earn

Added Mon 5 Oct 2026 from Qing's rulings that morning. Pricing detail and the depth of the game design are deliberately left for later (Qing: "pricing is details - as is depth of the full game design"); what is here is the shape.

The weight of it, in her words: "Gamifying the boring parts is the small piece. The big piece is we need to make sure the content part is actually as fun as possible. That part should be as addictive as a video game as we can come up with." (Qing)

### Home and town

- R80. **Two zones.** Home is the learner's own place and is bilingual. The town is full immersion. (Qing: "home doesn't have to be in Chinese. it's _your_ home. but the town is full immersion")
- R80a. The fiction that joins them: the learner has moved abroad, and the front door is the line. (assumed framing)
- R81. **The dailies are reached from inside the world, and they are at home.** (Qing) Both review directions live there. Review is translation between two languages, so it sits in the bilingual zone: decision 1 given a geography. (reasoning assumed)
- R82. **The listening tape (R35) is a radio at home,** and keeps the bilingual format Tom likes. (Qing)
- R83. **Home has small chores,** such as watering the plants. (Qing)
- R83a. Home needs no menu. Each core feature is an object in the room: a desk for reviews, the radio, the plants, the front door. (assumed)
- R84. **The daily stories are what the learner goes into town for.** (Qing) So the daily four (R49) start at home and finish in town.
- R85. **The town is a map the learner taps.** There is no walking. (Qing: "I think walking around probably feels like a waste of time in this sort of context... so tap a map is probably the best way? very Old Neopets isn't it?") One reason: travel time has no Chinese in it. (assumed)
- R85a. **Any time spent in the world should be immersion,** from the designer's side. (Qing) Home is the stated exception (R80).

### How the town grows

- R86. **The world grows because the learner could not understand it before.** (Qing) This is decision 10.
- R87. **Standard places are made in advance and are the same for every learner.** Each owns a fixed part of the syllabus, and the learner must be 80% through that part to be let in: learn the shopping words to go to the shopping mall. (Qing)
- R88. **Friends live next door from lesson one.** (Qing)
- R89. **The syllabus is reworked to support the map.** (Qing: "that's fine")
- R90. **The world has modular slots.** A few free neighbour slots, a few shop slots, a few "distant travels" slots, and so on, each customised with the learner's chosen topics. (Qing) For custom neighbours, how many are free and when they are visible was settled that afternoon: R76i and R76j. The kind of slot tells the generator what shape of thing to make: a person with a topic, a set of things to ask for, a whole other setting. (assumed)
- R90a. **What the learner brings fills a slot.** A scanned book or a described story (R18, R19) becomes part of the world. In Qing's demo the Very Hungry Caterpillar becomes a new neighbour. (Qing)
- R91. **Neighbours and shops move on.** When the spaced repetition statistics say the learner is fully fluent in theirs, they move to a different part of town, reached from an archive or list instead of the map. They are not lost, and the learner can revisit when they like. (Qing)
- R91a. Visits to neighbours who have moved on are a natural place for long-interval reviews. (assumed)
- R92. **Extra slots can be paid for,** some with coins and some with gems. (Qing) Under decision 11 the free slots must be enough by themselves. A slot is an empty plot; filling it with generated content is billed as generation whichever way the slot was paid for, which keeps R97 true. (both assumed readings)

### What is locked and what is not

- R93. **All the core features are there on day one.** The daily reviews in both directions are always there. (Qing)
- R94. **The line is between what is more game than learning and the rest,** "even though all of the game is learning". (Qing) Friendship scenes earned through gifts are on the game side. (assumed reading: it was her answer when Fable worried that gifts leading to scenes put currency behind an unlock)
- R95. Three different gates, kept apart: no gate on pedagogy; a money gate on anything generated for one learner (R76b); a game gate on fun only. Vocabulary is a fourth thing and not a gate of that kind: it is R86. (assumed summary)

### Coins, friends and coming back

- R96. **Deliberate practice earns coins** (decision 14). Doing the daily reviews, doing extra drills at the gym, finishing a lesson, and working a job scenario such as the café (R135) all earn them. (Qing, 5 Oct afternoon; the morning's ruling was "doing the dailies earns reward points") Extrinsic motivation for the dailies matters, and the coins have to feel worth something. (Qing) Watching or reading earns nothing. (assumed; it matches decision 2, since the same activities are the ones that can count as evidence)
- R96a. Points are earned for an honest attempt and never for the grade. Paying for "good" would pay the learner to press "good", and the schedule would believe it (R11). (assumed)
- R97. **Coins are not capped.** Cost is controlled by what coins can buy. (Qing: "coins don't have a ceiling, we just design what can be bought with coins") Since generation is billed by usage, that means coins buy things that are already made. (assumed reading)
- R97a. **What coins buy:** furniture, artwork, gifts, trinkets, "all the fun stuff", and more neighbour plots. (Qing, 5 Oct afternoon) Never content, and never a generation (R76l).
- R98. **Coins buy gifts for friends.** To buy one the learner has to say what they want, successfully. (Qing) That makes the shop output practice with a purpose (section 7). (assumed) In the Tom walkthrough he tells the shopkeeper he wants chocolate cake, and the cake is a gift for the butterfly. (Qing)
- R98a. **The same test applies to everything the learner can own** (decision 13). "Everything you add to your home, you have to first pass the translation test to be able to say in Chinese the thing that you want in order to get it." (Qing)
- R98b. **Fail, and try again tomorrow.** A failed attempt closes that item to the learner for 24 hours. (Qing; the sentence was tangled in dictation and this is the reading taken) People will want the green table enough to get it right next time. (Qing)
- R98c. **An owned thing can always be hovered over to see its words again.** Looking is free, because a schedule should not mind overlearning: the next review is simply easier. (Qing)
- R98d. **As many collectibles as possible.** (Qing, citing "the Bean thing" by the vlogbrothers, a focus timer where each finished session earned points and points unlocked collectibles: "People love that stuff") Fable identified it as Focus Friend, by Hank Green. (lookup) Each one carries a word the learner knows, so a collection is also a picture of their vocabulary. (assumed)
- R98e. **Artwork and wall hangings for the home show the Chinese characters for words the learner is learning,** so that they are surrounded by characters they know. (Qing)
- R99. **Gifts raise affection levels,** Stardew Valley style. (Qing: "or something")
- R99a. Knowing what a friend would like comes from having understood what they said. (assumed)
- R100. **No numerical streaks** (decision 12). The world shows care and absence instead: plants that are happy, neighbours who miss the learner and are glad when they are back. (Qing)
- R100a. Coming back after a gap never shows a broken count or a debt. (assumed; follows from R100)
- R100b. **The plants are the streak.** They sit on the windowsill and are watered and fed by doing the daily reviews. They grow bigger the more they are watered. When reviews pile up they wilt, shrink a little and lose a few flowers or leaves; they never die, and watering always brings them back. "The plant state represents how overwhelming your review backlog has got, but they can always be tended to." (Qing, 5 Oct afternoon) Read as two signals in one object: size is everything done so far, and wilting is today's backlog. (assumed)

### Home, object by object

Added 5 Oct, afternoon, from the Tom walkthrough. Everything that teaches can be reached at home, without going anywhere. (Qing: "You have all those practise experiences without needing to go anywhere") This fills in R83a.

- R115. **Plants on the windowsill** (R100b). (Qing)
- R116. **A bookshelf holds the lessons the learner could do next.** They open it and choose. (Qing) It is also where missed words from earlier lessons are finished off (R17j).
- R117. **The radio** plays the listening tape in the background, and can switch to old stories and dialogues the learner has unlocked, from stored audio. (Qing)
- R118. **The TV** shows earlier episodes of shows the learner has unlocked, and the ones bundled with each chapter (R76g). (Qing: "maybe")
- R119. **A phone or tablet on the table** scrolls short videos: the ready-made short dramas, and any personal episodes unlocked. (Qing)
- R120. **A games console** replays minigames the learner has unlocked. (Qing)
- R121. **A camera, and a keyboard at the desk, are how new content comes in** (R18 to R20a). (Qing)
- R122. **Bought furniture, artwork and trinkets live here** (R98a to R98e). (Qing)
- R123. New things turn up in town; home is where what has been unlocked is replayed. (assumed reading; it keeps R84)

### Town, place by place

Added 5 Oct, afternoon.

- R124. **Quest markers.** A neighbour or place with something new for the learner shows an exclamation mark. (Qing)
- R125. **A locked place always offers the lesson it is waiting on.** Tapping it says which lesson is needed. The lesson can also always be done from home. (Qing)
- R126. **While something is being generated, its plot shows a building site,** so the learner knows something is being made and can preview the lesson. The lesson's title is written by a small, cheap, fast model so it is ready almost at once. (Qing)
- R127. **A custom neighbour opens at 80% of its new words,** as standard places do (R87). (Qing)
- R128. **At a neighbour's house the learner can** have a voice conversation, watch TV, look around and tap on things, play a small game, and read a book from the coffee table. (Qing) Dramas on a neighbour's TV are R108.
- R129. **Old friends call the learner over when they have something new:** the mouse with a story or a magazine, the cat with a video game. Neighbours already unlocked can have further conversations generated. (Qing)
- R130. **Shops stock what the learner has learned.** After the caterpillar book, the food shop in the shopping mall has the new foods to buy. (Qing)
- R131. **Empty plots stand where the next standard neighbours will live.** Tapping one says "this will unlock when you do lesson 2", and so on, as in The Sims. (Qing)
- R132. **A gym and a play park for drills, open to everybody.** Tone drills: repeat a pattern of tones and match the pitch line, measured as plain pitch and not by a speech model, as singing apps do; hear a pattern of tones and type what they were; tongue twisters. (Qing: these are the drills Tom most needs now) Whether a drill's result counts as evidence is decided case by case (R64a).
- R133. **A place in town for grammar:** lessons and drills in sentences made from the learner's own vocabulary. (Qing)
- R134. **Every drill place is open from lesson 1, with only lesson 1's content,** and fills as lessons are done. (Qing)
- R135. **Job scenarios.** For example a café where the learner serves customers and must hand over what each asked for. These earn coins. How scenarios are chosen is not worked out. (Qing: "We'll have to think about how we come up with that"; open decision 27)
- R136. **An arcade with claw machines and a lucky-dip ("gacha") section,** as long as everything in it is in Chinese and within the player's vocabulary. It gives people more reason to grind. (Qing)
- R137. **The cast.** The existing artwork has the mouse, the cat and the dog. More long-standing characters can join if that helps the content; each has to be introduced and added to the learner's vocabulary. (Qing)

### The first day

Added 5 Oct, afternoon. The order for every new learner is R17i.

- R138. **Name and avatar.** The learner picks one of 10 ready-made avatars, or describes one; the description goes to the image model inside our own prompt, and comes back as about three versions to choose from. Generation is capped because it is expensive. (Qing) It is free, once. (Qing)
- R139. **Lesson 0, "with vocabulary 0".** (Qing) Read here as a lesson that needs no vocabulary. (assumed) The learner appears in a scene and is shown a ready-made video of the mouse and friends, a ready-made conversation, and a ready-made game for newcomers. (Qing) The game is Fable's to design. (Qing: "Maybe you can design something for me"; open decision 28) Then they are put in their room and shown round: the plants, the tape of lesson 1, the first reviews, the bookshelf. (Qing) What the town looks like on that day is R131, R134 and R76j; the shopping mall is locked because they cannot yet say "buy". (Qing)

### Today's game

- R101. **A themed minigame is written from scratch for the day by the strong model,** in one of a selection of genres, with the Chinese worked into it. It is played once. A game with no staying power is fine when it is only played once. It gives more input and a reward for earning points. (Qing)
- R102. **The learner can see what the game is, greyed out, until the day's reviews are done.** (Qing: "or something") On a day with no reviews due it is open. (assumed)
- R102a. Earlier the same morning: "we can use the minigames to get users into their review sessions". (Qing, 10:13) R102 is one way of doing that. Whether minigames should also lead into review more directly is open decision 21.
- R103. **It is play.** It never changes the schedule (decision 2, R32). Because of that it can be tap-to-choose, timed or silly. (assumed; follows)
- R104. **Its Chinese passes the same code check as everything else** (R38). The words and lines are kept as a list apart from the game's workings, so code can read and check them. (assumed)
- R105. **A personal game every day belongs to the premium tier,** where the price covers it. (Qing) What free players get is open; one game a day per point in the standard course, shared by everyone there, would cost nothing per player. (assumed suggestion)
- R105a. Generated game code runs boxed in, with no access to the learner's record or the network. (assumed)

### Dramas

- R106. **Stories and videos have the Chinese short-drama dynamic:** "excitement, silly drama, escalating stakes, cliffhangers - keep them coming back for tomorrow". (Qing)
- R107. **A drama is made from the new words together with the relevant parts of the learner's existing vocabulary that need more review.** (Qing) It is comprehensible input and obeys section 6.3. (assumed)
- R108. **In the world, a drama plays on the TV in a neighbour's house.** (Qing, from the demo dictation)
- R109. Script shape: six to ten lines; a hook in the first line; one reversal; stop at the peak, never resolving inside the episode; enormous stakes about something tiny; catchphrases that recur. (assumed, from the conventions of the form)
- R110. **How it is filmed is an experiment.** Generated video with the strong model writing the script (Qing: Seedance, if the rules allow), or stills, voice and captions staged like a visual novel. (the second is assumed, as the fallback)

### Presentation

- R111. **The video game is one version.** (Qing: "I've made it a video game but we can have lots of different versions that the actual user chooses from")

### Also agreed, and not yet worked through

- R112. **Stories can offer choices that change what happens next.** (Qing: "let's do all three!", to Fable's three suggestions: choices in stories, cliffhangers, and a place that changes daily) A choice is not scored and never feeds the schedule. It does mean R31's "nothing to answer" needs rewording: open decision 19.
- R113. **Something in the world has changed each day.** (Qing, same reply) The form is assumed: one new line from a friend, one thing moved.
- R114. **The learner can have a conversation with a neighbour.** (Qing, in the demo: "we go and have a conversation with that neighbour about the chocolate cake") It works as section 7 describes for the mouse, planned ahead, with the neighbour in his place. (assumed) R71c's "about the story just read" then widens to "about something the two of them share", such as the book the neighbour came from. (assumed)

## 8. What the research supports

Full detail, citations and caveats are in `notes/04-language-learning-evidence-base.md`. Most of this evidence comes from learners of English; applying it to Chinese is an assumption.

| Finding | Strength | Supports |
|---|---|---|
| Recalling a word beats re-reading it for long-term memory | Strong; many meta-analyses | Decision 2; R8 to R11 |
| Spaced practice beats massed practice for vocabulary | Strong | The schedule |
| Recognising and producing a word are learned separately, each in its own direction | Moderate; sources recalled, not re-checked | Decision 3; R2 |
| Understanding rises steadily with the share of words known; 95% to 98% known is the usual range for learning from a text | Moderate; the 98% figure rests on small studies | Decision 5; R39 |
| Reading alone teaches few new words per text, and they fade | Strong | Decision 1; R39b; R40 |
| The best share of unknown words for learning is not established; 2% to 5% is a defensible start | Weak; one conference abstract tests it directly | R39 |
| Guessing from context succeeds about one time in five; glosses nearly double learning from unknown words | Moderate for guessing; strong for glosses | R39c; R44 |
| Around 8 to 12 spaced meetings in varied sentences are needed | Moderate; no fixed number | R39b |
| Meeting a word in context, then being told its meaning, beats the reverse | Weak; one study | R39a |
| Spaces between words help learners of Chinese read and learn words | Moderate; intermediate learners only | R43a |
| Familiar content is read faster and understood better | Weak to moderate | R41a; R33 |
| Simplified and elaborated texts are understood equally well | Moderate | R41b |
| Input is necessary and not sufficient | Broad agreement among researchers | Section 7 |
| A balanced course mixes input, output, deliberate study and fluency | Expert framework; the proportions are untested | Decision 7; section 2a |
| Reading combined with deliberate study beats reading alone; teaching words before a text helps | Moderate | The two-layer design; R32a |
| Glosses help; looking a word up does not by itself help retention | Moderate | R44; decision 2 |
| Stories teach more than expository text | Moderate; one meta-analysis | R41 |
| Using a word generatively is what most drives learning it | Moderate | Section 7 |
| Tone training with varied voices works and lasts; hearing practice and speaking practice are separate skills | Strong for training; moderate for separateness | R10, R13 |
| Transcribing sound into pinyin tracks listening ability | Weak; correlational | R10 |

**On motivation, rewards and games (added 5 Oct).** The evidence behind section 7b is in `notes/07-motivation-and-game-design-evidence.md`. The short of it: rewards help on dull tasks and harm on ones people already enjoy, which supports rewarding review and leaving input unpaid (solid); points raise how much gets done, and for review that is the outcome (single study); forgiveness and low floors bring people back (company data); and the case for input that plays like a game is mostly design craft (weak).

**What the research does not establish**

- What share of unknown words teaches best. "i+1" was never turned into a number; it was a claim about grammar.
- Anything much about beginners in Chinese with a few hundred words. No controlled study of Chinese graded readers was found, and no Chinese study of how much of a text must be known.
- That the popular "hours of input" programmes work as claimed. No independent evidence was found.

- That a system tying a review schedule to generated reading improves learning. Two research prototypes exist; neither has outcome evidence worth the name.
- That adults learn from reading picture books with a child. No studies found.
- That any particular scheduling algorithm teaches better than a simpler one.

So the honest public line is: each layer rests on well-established findings, and the combination is new.

## 9. Open decisions

1. **How large is the unknown share, and does it vary?** The default is 2% to 5%. A beginner with 250 words may need it lower; it may rise as reading gets easier.
2. **Are new or recent words marked on a page at all?**
3. **Does fluency need a push for speed,** such as a timer or full-speed audio on easy stories, or is an easy story enough?
4. **How big is the core course** beside the learner's own material?
5. **Which parts of the old app's base are kept as they are:** the quiz after a lesson, list building, the report button?
6. **Is there any readability measure shown for a source book,** such as how much of it the learner can now read?
7. **What does the decay curve count from, and over what?** Days since a word was learned, since it was last met, or since its book was added; and whether the draw is over words, books, or both.
8. **Is a Chinese version of an English book still wanted,** given that stories are now new ones and not retellings? (5 Oct: for the demo it depends on how long generation takes)

Added 5 Oct. Qing parked pricing and the depth of the game design as detail for now; the items below are that detail, plus questions Fable has not yet put to her:

9. **Does tapping a place on the map open a picture of it,** with people and things to tap, or go straight to what is happening there?
10. **What does "80% through" measure** (R87): words introduced, or words that have stuck? And what counts as "fully fluent" for moving on (R91)?
11. **How many free slots,** and can a neighbour be sent to the list early to make room for something urgent?
12. **What else do coins buy,** beyond gifts and some extra slots? Answered 5 Oct afternoon: R97a.
13. **Where does the home-life vocabulary live in Chinese,** now that home is bilingual? The dad curriculum is nappies, bath and bedtime. A custom neighbour with a small child is one answer. (raised by Fable; Qing: thinking about standard places first)
14. **How big is the map, and how fast does it open?**
15. **What does a generated neighbour, shop, drama or game cost,** and what prices follow? (R79)
16. **Does meaning on tap (R44) still show English in town,** where everything is meant to be immersion? (raised by Fable, not yet put to Qing)
17. **Where does the mouse live?** `design.md` had him as the voice of the app and not a place. (not yet put to Qing)
18. **R76e:** is it acceptable that the free game fits the standard course and not the individual record? Answered 5 Oct afternoon: content is filtered against the record (R76h).
19. **R31 and choices (R112):** input was ruled passive, with nothing to answer. Do unscored choices in a story count as answering?
20. **R76f:** how do credits, gems, coins and reward points relate?
21. **R102a:** should minigames lead into review sessions more directly than by waiting for them?
22. **What do free players get as a daily game** (R105)? Partly answered 5 Oct afternoon: free players get the bundled content of their lessons or packs (R76g), which includes games; whether one of those is presented as "today's" is still open.

Added 5 Oct, afternoon:

23. **How is a right answer graded** (R11e)? By hand is out of favour. Fable's proposal is in R11e.
24. **Does typing a character count as producing it,** or only handwriting (R2c)?
25. **What is in "one neighbour's worth"** (R76i), and does a neighbour go on producing new things that each cost credits?
26. **Is voice a separate cheap subscription** (R76k), and do the free, bundled neighbours get live voice or recorded lines only?
27. **How are job scenarios chosen** (R135)?
28. **The newcomer game for lesson 0** (R139). Fable owes a design.
29. **The stop rule's numbers** (R17d), and how long a first swipe session should run before suggesting a break.
30. **What the grammar place is called and how it is laid out** (R133).
31. **Focus Friend** (R98d). Qing raised the comparison; the name and the details of how it works were given from Fable's recall and should be checked before they are relied on.
32. **Coins buy more neighbour slots (R97a), yet custom plots are hidden until credits are bought (R76j).** Which slots can coins buy: only ones already revealed by paying, or others too?

## 10. How this file relates to `spec-v2.md`

`walkthroughs.md` tells this file as three people using the product; where they disagree, this file is right.

`spec-v2.md` is the hackathon build plan; `design.md` describes its screens. Both now reflect the afternoon amendments. [build-prompts.md](build-prompts.md) translates the requirements into ordered implementation prompts and later full-product tasks; [experiment-run-sheet.md](experiment-run-sheet.md) prepares the content experiments. The build order and provisional implementation defaults are proposals, not new product decisions. Open decisions above remain open. The first draft of the demo plan, with coloured pages and a "nights to read" figure, is in git history and is superseded.
