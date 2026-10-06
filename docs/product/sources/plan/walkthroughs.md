# Laoshu Laoshi: what using it is like

Status: first write-up, Mon 5 Oct 2026, evening. Written by Fable from Qing's dictation that afternoon. Her own words are in `notes/09-user-walkthroughs-2026-10-05.md`.

This is the real product, described as three people using it. It is deliberately more than the hackathon can build: Qing's angle is "speccing out lots of the real product", and then scoping down for the hackathon "by turning the plan into an ordered backlog of prompts". The rules behind each step are in `requirements.md`; the numbers in brackets point there.

**Marks.** Everything here is Qing's unless marked **(assumed)**, which is Fable's proposal or reading. Strike or change freely.

The three people:

1. **Tom, on an ordinary day.** He already has a vocabulary in the app. This is also the demo.
2. **Someone who knows no Chinese,** on their first day.
3. **Someone who already knows some Chinese,** on their first day.

---

## 1. Tom, on an ordinary day

### At home

Tom opens the app and is in his home, drawn in the game's art style. Home is where everything that teaches can be reached without going anywhere. Each thing is an object in the room (R115 to R123):

| Object | What it does |
|---|---|
| Plants on the windowsill | Watered and fed by doing the daily reviews. They are the only streak there is |
| The two daily reviews | Chinese to English, then English to Chinese, in the amounts he has set. The same as the existing app, better looking |
| Bookshelf | The lessons he could learn next. He picks one. He can also finish off words he missed in earlier lessons |
| Radio | Plays his listening tape in the background, or old stories and dialogues he has unlocked. The audio is already stored |
| TV | Earlier episodes of shows he has unlocked, and the ones that come with each chapter |
| Phone or tablet on the table | Short videos to scroll: the ready-made short dramas, and personal episodes he has unlocked |
| Games console | Replays of minigames he has unlocked |
| Camera, and the keyboard at the desk | Bringing in something new: a single word, a themed pack made by talking to the mouse, or photos of a book |
| Walls and shelves | Artwork and furniture he has bought. The artwork shows the Chinese characters for words he is learning; anything he owns can be hovered over to see its words |

New things turn up in town. Home is where he replays what he has already unlocked. (assumed reading; it keeps this morning's "stories are what you go into town for")

### Bringing in a book

Tom photographs the Chinese Very Hungry Caterpillar with the camera. The app reads it, compares its words with his list, and queues a lesson on the new ones (this is from the morning's demo dictation). Making the neighbour from the book starts straight away and is given priority.

### Going out

He taps the door and sees the town map. Neighbours and places with something new for him carry an exclamation mark, like a quest marker (R124).

- **A new neighbour's plot is there at once, as a building site,** so he can see something is being made (R126).
- **It is locked until he has learned the book's words.** Tapping it says he needs to do the caterpillar lesson, and offers it. The lesson's title is written by a small fast model so it is ready almost at once (R125, R126).
- **The lesson can always be done from home as well.** Locked places always offer the lesson they are waiting on, for someone who is not sure what to do next (R125).
- **The neighbour opens at 80% of the new words,** the same bar as the standard places (R127).

### At the new neighbour's

Perhaps the neighbour is a butterfly with a baby caterpillar at home, since Tom already has the baby words; or a butterfly with its favourite foods laid out. At their house he can (R128):

- have a voice conversation with them
- watch TV there
- look around and tap on things
- play a small game
- read a book from the coffee table

### The rest of town

- **Old friends call him over.** The mouse has a new story or a magazine. The cat has a new video game to try. Any neighbour he has already unlocked may have a new conversation (R129).
- **The shops change with his vocabulary.** There is an exclamation mark over the shopping mall, because the food shop now stocks everything he learned from the book (R130).
- **Buying means asking.** To buy the chocolate cake he has to tell the shopkeeper he wants it, in Chinese. He pays in coins. The cake is a gift for the butterfly (R98, R99).
- **The gym and the play park** are for drills, and are open to everybody: repeating a pattern of tones and matching the pitch line, hearing a pattern and typing the tones, tongue twisters (R132).
- **A place for grammar:** short lessons and drills, in sentences made from his own words (R133).
- **Jobs.** At the café he serves customers: he has to understand what each one asked for and hand over the right thing. How these scenarios are chosen still needs thought (R135).
- **The arcade.** Claw machines and lucky-dip prizes, all in Chinese and all within his vocabulary (R136).

### Coins

- **Earned by deliberate practice:** the daily reviews, extra drills at the gym, finishing a lesson, a shift at the café (R96). Watching and reading earn nothing. (assumed)
- **Spent on fun:** furniture, artwork, gifts, trinkets and collectibles, as many kinds as possible, and extra neighbour plots. Coins never buy anything generated (R97a, R98d).
- **Nothing is only decoration.** To own a thing he has to say it in Chinese first. If he fails, that item is closed to him until tomorrow. Once he owns it he can hover over it at any time to see the words again (R98a to R98c).

### In the demo

The demo will probably do the lesson at home, while the neighbour is being made, and then walks out to find them. If the book has too many new words for 80% to be reached quickly on stage, some are added to the stand-in Tom's list beforehand, or a different book is used.

---

## 2. Someone who knows no Chinese, on their first day

1. **Name and avatar.** They give a name and make an avatar: one of 10 ready-made ones, or a description that goes to the image model inside our own prompt and comes back as about three versions to choose from. The number of tries is capped. It is free, once (R138).
2. **"Do you already know some Chinese?"** No, so they start at the beginning (R17i).
3. **Arrival.** A ready-made video of the mouse and friends, a ready-made conversation, and a ready-made newcomer game. This is lesson 0, "with vocabulary 0", read as needing no vocabulary (assumed). The game is Fable's to design (R139).
4. **Their room, with a short tour.** "Welcome to your room." Small plants on the windowsill. The radio already has the lesson 1 tape. There are first reviews to do. The bookshelf offers the next lesson (R139).
5. **Town.**
   - The immediate neighbours are there.
   - The park, the gym and the grammar place are open, with only lesson 1's words in them. They fill up as lessons are done (R134).
   - The shopping mall is locked: they cannot say "buy" yet.
   - Empty green plots stand where the next neighbours will live. Tapping one says "this will unlock when you do lesson 2", and so on (R131).
   - Everyone starts with gift credits for one full neighbour's worth of content. So one plot for a neighbour of their own is visible (assumed). Any further ones are hidden until they pay; then the map extends (R76i, R76j).
6. **Always free:** adding their own words and sentences by hand. These go into review. Nothing is generated for them (R20a).

**The plants** (R100b). They grow the more they are watered, and there is no number. If reviews pile up, the plants wilt, shrink a little and lose a few leaves or flowers. They never die, and watering always brings them back. So the plants show how heavy the backlog is, and size shows everything done so far. (the split into two signals is assumed)

**After that, without paying,** the days are reviews, drills, tapes, and the lessons or packs of the standard course, each with its own stories, clips and games included. It is the kind of experience Duolingo or Rosetta Stone gives. Anything made for one learner is the paid product (R76g).

---

## 3. Someone who already knows some Chinese, on their first day

1. **Name and avatar,** as above.
2. **"Do you already know some Chinese?"** Yes.
3. **Swiping through words** (R17a to R17h):
   - One word at a time, with a sentence, going from easy to hard, taken to mean commonest first (assumed). Keep, or don't know. Keys do the same as swipes.
   - A word is marked known only because they swiped it. Nothing is marked in batches or by estimate.
   - A strip shows the next ten or so words coming, all the time, so they can see when they are nearing the end of what they know.
   - After a run of don't-knows, the app offers "stop here". They can carry on if they like. (the second is assumed)
   - Swiping may earn coins. It can be left and picked up again. (the second is assumed)
   - Anything missed is caught later: every lesson lets them say "I already knew this word".
4. **Arrival.** They skip lesson 0 and still see the arrival video (R17j). (Fable's picture; Qing: "yeah exactly")
5. **Their town is already partly built.** Every place where they know 80% of the words is open. Because the swipes run by how common a word is and lessons are grouped by subject, most places will be partly done. (both Fable's picture, agreed in the same answer) The bookshelf lets them finish off the words they are missing from earlier lessons, as the existing app does (R17j).

---

## 4. What holds across all three

- **Four records for each word,** per learner. Read as: recognising it by sound or pinyin, recognising the character, producing it by saying or typing pinyin, and producing the character (the split is assumed; her words are in R2). Someone who only wants to speak switches character fluency off. Characters are still shown everywhere; they are just never tested (R2, R2a).
- **One way for any activity to report what happened:** for this word, in this record, an easy pass, a medium pass, a hard pass or a fail. The activity knows nothing else about the schedule. Which activities count is decided case by case (R64a).
- **Content is always filtered.** Nothing is shown to a learner who lacks its words. It waits, and a friend gets an exclamation mark when it is ready (R76h).
- **Touch and keyboard, everywhere.** A phone browser and a keyboard both work for everything, reviews included. Everything has to be very easy (R14a).
- **No numerical streaks.** Plants, and neighbours glad to see you back.

## 5. Not settled yet

These are in `requirements.md` section 9, items 23 to 32. The ones that most affect a build:

- How a right answer is graded. Pressing hard, good or easy by hand is out of favour.
- What "one neighbour's worth" of credits contains.
- Whether voice conversation needs its own cheap subscription.
- The newcomer game, which Fable owes.
