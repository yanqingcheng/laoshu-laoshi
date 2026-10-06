# Laoshu Laoshi v2: hackathon build plan

Current text/image checkpoint: [site-spec.md](site-spec.md), [rehearsal-prompts.md](rehearsal-prompts.md), and [design reference](../design/README.md). The S-stage sequence controls the next rehearsal; earlier B/P stages remain coverage and later-product context. Voice/video can wait.
Status: draft 3, Mon 5 Oct 2026, midday: sections 3, 4, 6 and 7 rewritten for the world and the demo Qing dictated that morning. Drafts 1 and 2, both from Sun 4 Oct 2026, are in git history.
For: GPT-6 Astra Hackathon London, Tue 6 Oct 2026, 17:30 to 21:30.
Updated 5 Oct evening: the afternoon rulings are reflected in the build sequence below. Copyable implementation prompts and the full-product backlog are in [build-prompts.md](build-prompts.md). The order and time targets are proposals, not promises of a four-hour completion.

**What to build is defined in `requirements.md`.** This file only says how Tuesday goes: the order of building, the demo, and what to prepare. Where the two disagree, `requirements.md` is right.

Marks: **(Qing)** she said it; **(assumed)** my proposal.

---

## 1. What is fixed

- Qing builds alone. Tom is at home with Bea. (Qing)
- One evening, four hours door to door, so less than four of building.
- Built with Astra and Lovable, during the event, into a public repository. Existing product code cannot be used.
- Finalists demo live on stage to OpenAI and Lovable judges. Demo length and judging criteria are not published.
- What the organisers allow by way of prepared specs, prompts and data is unknown. (Qing: "no idea")
- Tom's real data is in the existing app's database and can be exported. (Qing: "we have real database")
- Usage ran short for teams at the earlier events. Assume it is tight.

## 2. The approach

**The spec is the asset.** Writing code is not the hard part for Astra; knowing exactly what to build is. So the more precisely `requirements.md` says it, the more gets built in the time. (Qing)

That gives Tuesday this shape:

1. `requirements.md` goes into Lovable as the project's standing notes.
2. One opening message asks for the base, described as a finished result.
3. One message per later stage, each naming the requirements it covers and one sentence saying how to tell it works.
4. Every model prompt the app needs has been written and tried beforehand, and travels with its stage's message.
5. Each stage leaves something that can be shown. If time runs out, the demo is shorter, not broken.

Use Lovable's own backend for the night. It is the quicker route, and its database is the same kind as the existing app's, so moving later is possible, if manual.

## 3. Build order

Use [the ordered build prompts](build-prompts.md) and [their dependency graph](build-backlog.json). Requirements remain the full product; event scope is a cut through working stages.

| Prompt | Stage | Can then show |
|---|---|---|
| B00 | Independent vocabulary/pinyin/shape check | Accepted and rejected content fixtures |
| B01 | Four word-skill record slots, evidence log, reliable typed review | Both spoken-language directions; characters remain visible when their testing is off |
| B02 | Bilingual home and recoverable plants | Desk, bookshelf, radio, TV, phone, console, camera/keyboard and door |
| B03 | Scan a book or resolve a word; choose the queue | Known/taught/saved distinctions and new words selected |
| B04 | Lesson, quiz, stored Azure speech | Teach a few chosen words at home |
| B05 | Shared vocabulary snapshot and recoverable generation jobs | A building site while content is made |
| B06 | Tapped map, lesson offers, 80% new-word gate and content eligibility | A source neighbour's house opens when ready |
| B07 | Checked drama with stills, voice and captions | A cliffhanger on the neighbour's TV |
| B08 | Checked DATA and isolated generated game | The game climax |
| B09 | Preplanned conversation, typed route before tested voice | Talking to the neighbour, with no dead ends |
| B10 | Name/avatar, lesson 0 or individual onboarding swipes | A useful first day for either new-learner route |
| B11 | Three story levels, print and radio | Wider daily practice and replay |

B09 depends on B06, not the drama/game: it can be built as soon as the neighbour exists. Conversation remains in Qing's full demo. Its microphone route waits for beginner/noise testing; typed pinyin remains usable. Presentation order is neighbour → conversation → drama → game, regardless of build order.

A complete short demo ends after B04; adding B06–B07 shows the world and drama; adding B08 supplies the game; adding B09 supplies conversation. B10–B11 extend beyond the core demo. P01–P07 retain all remaining full-product work, including the daily four, drills, shops, coins, credits and broader world. Their R-ID assignments are planned coverage, not implementation evidence.

Generation follows the lesson-ready path: prepare the lesson, start neighbour/conversation/drama/game jobs, then present the lesson while they run. Measured experiment timings decide whether results are live or permitted pre-made content. Unknown-word budgets and whole-content eligibility still apply even after a place opens. The 80% metric is open; the rehearsal's quiz-passed predicate is labelled provisional, not a settled product ruling.

No replacement grading policy is settled: B01 retains existing manual grades temporarily as R11e requires. Starting means one explicit word decision at a time, with the next ten visible and an optional stop, never a batch. Coins never buy generation. Full pricing, gift-neighbour contents, voice access and plot entitlement wait for the named decisions in the backlog.

## 4. The demo

Rewritten Mon 5 Oct 2026 from Qing's dictation (`notes/08-world-and-demo-session-2026-10-05.md`, 11:33). This replaces the six wins of draft 2. Length is still unknown; "we trim what we don't have" (Qing).

**The talk.**

1. **The story.** Qing and Tom. He wants to learn Chinese. He learns fast, and languages are still hard work. We know how to do it, and it has four pillars: spaced repetition, output practice, fluency practice and, the big one, comprehensible input.
2. **The problem.** There are apps, and the vocabulary a dad needs is not what they target. On Duolingo alone it is about two years before "nappy" is taught, and it is not even the kind of nappy used at home.
3. **The belief.** The future of software is radically personal. With generative AI everyone can have their own vocabulary list. The limit before was that everybody had to have the same textbook.
4. **The product.** Laoshu: bring the content you want to learn, and all the content in the app is tailored to your own vocabulary list, in the forms that are most engaging and fun for you.

**The product, on screen.**

| Beat | What happens | What generative AI made |
|---|---|---|
| 5. Home | Laoshu is loaded with Tom's current vocabulary. "I've made it a video game but we can have lots of different versions that the actual user chooses from." Tom is at home in the game: plants to water, reviewing to do. A short look at a review shows a basic, solid Chinese app with his words | |
| 6. Bring | He wants the words in one of Bea's favourite books, the Chinese Very Hungry Caterpillar. The camera scans it. The app pulls out the vocabulary and compares it with his list | Reading the pages |
| 7. The lesson | A lesson is queued. He ticks which words to learn and clicks through a few, the caterpillar and chocolate cake among them. While that happens, the app is generating today's content from the new words | The lesson |
| 8. Out the door | A new neighbour has moved in, and it is a caterpillar. He has a conversation with them about chocolate cake. He turns on the TV in their house and watches the drama. It is made from the new words and from the parts of his existing vocabulary that need more review | The neighbour, the conversation, the drama |
| 9. The climax | He goes to where today's game has been generated, and plays it | The game |

Notes on running it:

- **The lesson covers the wait.** So pieces are generated in the order they are shown: neighbour, conversation, drama, game. (Qing for the cover; the ordering is assumed)
- **The game replaces the closing song.** (Qing) That also removes the untested sung-audio dependency from spec v1.
- **Plant the game early.** Show it greyed out at beat 5, so that the ending pays off something already seen. (assumed)
- **End on the cliffhanger.** If the drama is the last thing shown before the game, "next episode tomorrow" makes the point about coming back. (assumed)
- **What must visibly be Astra's.** "We have to be able to show what's made with Astra." (Qing) That is the lesson, the neighbour, the drama script and the game. (the list is assumed) Speech is Azure; video may be Seedance. (Qing)
- **The English book made into a Chinese one** is in or out depending on how long generation takes. (Qing)
- **The "show the fit" switch** from draft 2 is optional presentation-only work, outside the core build prompts; it was proposed for an audience that reads no Chinese: one tap colours a text's words by whether Tom knows them. A presentation aid only. (Qing, 4 Oct)

**Live or made earlier.** Beats 5 and 6 run live. For 7 to 9, generation is started live; whatever experiment 8 shows to be too slow is shown from results made earlier in the evening, if the organisers allow it.

**Care with the book.** The product takes a scanned book's vocabulary and never stores or retells the book. On stage, show the book as a prop and one short page at most. Nothing of it goes in the public hackathon repository. (The page photos are in this private planning repository, in `photos/` on `main`.)

## 5. Before Tuesday

Qing does these alone, with the books. (Qing)

**Data**

1. Export Tom's current words from the real database, with both schedules if possible. Keep the file out of any public repository.
2. Photograph the caterpillar book's pages and one of Bea's English books. (Book photos are in `photos/` on `main` as of 4 Oct.)

**Prompts to write and try, on real material**

3. Read a page photo into words with pinyin and meanings.
4. Resolve a typed word and suggest companion words.
5. Propose which of a book's words to learn first.
6. Write a source book from a description.
7. Write a story at easy, medium and hard, and pass the code check within two rewrites.
8. Write a lesson for a word, with a picture prompt.
9. Plan a conversation, with the answers a learner might give.

**Added 5 Oct.** The afternoon's work is the nine experiments in `experiments-2026-10-05.md`, which use prompts 10 to 12 for the neighbour, the drama and the game. Items 3 to 9 above still apply to the lesson and the scan.

**Things to try**

10. One generated picture in a house style, twice, to see if the characters hold.
11. Qing speaking beginner-level sentences to the speech recogniser. Tom's own speech if he can spare ten minutes.
12. Azure speech called from Lovable's backend.
13. One small goal run in a throwaway Lovable project, noting credits and minutes.
14. A full rehearsal on the workstation, building from `requirements.md` and `build-prompts.md` in a throwaway repository. This tests the spec. The code is discarded.

## 6. Questions for the organisers

1. How long is the build window, and how long is a demo?
2. Are a prepared spec, prompts and data files allowed?
3. Must Lovable be the only builder?
4. What usage do teams get, for Astra and for Lovable?
5. May the demo show things the app generated earlier in the evening?
6. May speech come from Azure, and video from Seedance, where Astra writes everything they perform? (added 5 Oct)

## 7. Assumptions to strike

- The build order, time budgets and demo cuts in `build-prompts.md`.
- That pieces are generated in the order they are shown.
- Showing the game greyed out at beat 5, and ending on the cliffhanger.
- Lovable's own backend for the night.
- The "show the fit" switch exists only for the stage.
