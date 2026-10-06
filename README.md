# Laoshu Laoshi

Build me Laoshu Laoshi from scratch now: a beautiful, working, mobile-friendly Chinese-learning app where the words I want to learn become an explorable personal world. Implement it, run it and give me the working preview. Do not stop at a plan or ask me to send a separate prompt for each feature.

WHY THIS APP

I'm Qing. My husband Tom wants to learn Chinese to keep up with our bilingual toddler Bea and read her favourite books. Tourist phrases and generic beginner courses do not meet that need. Tom brings a book; the app finds the words he needs, teaches them, and expands his world with a themed neighbour, stories, games and conversations that reuse his existing vocabulary as well as the new words.

The below is a long prompt and lots of attachments describing what I want - but I don't know you and I don't know your capabilities, so please feel free to break out the work and do it how it works best for you - I will be here and you can talk t me

INPUTS ATTACHED TO THIS MESSAGE

- BUILD-RULES.txt: detailed learning rules, Chinese typography, generation, verification, voices and cost requirements, and at its end the BACKLOG: all thirty-eight build stages of the whole app, each with its own done-when and check. These are instructions for new work, not code.

- RUNTIME-PROMPTS.txt: prompt templates to implement in the app's backend, not pregenerated content.

- learning-data.json: existing curriculum, dictionary and compound reference data; its files mapping contains original filenames and their JSON contents. Load them idempotently. It contains no Tom export.

- DATA-ATTRIBUTION.txt: retain the supplied data attribution.

- d-story-garden-paper-detail.png, mockup-home-room.png, mockup-neighbour-room.png, mockup-review-card.png, mockup-phone-width.png: visual guidance only. Do not use these pictures as final application artwork.

Read and apply all supplied instructions. Do not assume repository access or ask me to clone a preparation project. If an attachment is actually missing or unreadable, identify it rather than inventing its contents.

LOOK AND INTERACTION

Warm cream paper, indigo, muted jade and terracotta; illustrated storybook rooms with painted-paper detail. Make it feel like a personal world, with crisp readable interface controls. Home is a room: desk for review, shelf for lessons and stories, camera for a book, console for games, radio for listening, phone for media, door to the town. Real buttons overlay objects, with accessible text alternatives. The town has eight authoritative slots and illustrated houses seen from a raised three-quarter view; unlock markers reflect real vocabulary eligibility. A neighbour's room has a host to speak to, a console, book and TV. Use the supplied mockups for composition, but generate or await newly generated final art. Local Astra will generate fixed art in parallel; build functional layouts with clearly temporary neutral placeholders until I upload that new art.

BUILD THE WHOLE DEMO PATH, IN THIS PRIORITY

1. Sign-in and learner-owned storage, course/dictionary import, word memory, scheduling, lessons and review. Keep scheduling and word checks in one module with the interfaces in BUILD-RULES. Seed 26 lessons, 326 unique words and 1,028 supplied sentences; report errors, never fabricate successful loads.

2. Shared Chinese rendering across the app, stories, game frames and video captions. Whole-word native ruby, proper tone marks, natural spacing and wrapping. Do not stretch Hanzi or make each character a separate card. Verify real sentences at phone and desktop sizes. The previous trial looked awkward despite passing overflow checks; inspect the actual appearance. Sandboxed games get the trusted injected adapter, not their own pinyin implementation.

3. Private 'Import my words' in Settings. Tom supplies his real export through the running app. Preserve learner progress according to the exact import contract. Never put the raw export in chat, code, logs or a public repo. Importing twice must not duplicate words. Use a clearly labelled synthetic learner only for development checks until Tom imports.

4. Illustrated home and town, reusable content shelf and eligibility rules. Wire actual actions before polishing. New content is offered only when its required words are in the learner's repertoire; unseen content first. Locked houses say what must be learned.

5. Camera/book import: title plus ordered uploaded photos, OCR with verification, extracted vocabulary with source evidence, unfamiliar words compared with the actual learner snapshot, proposed lessons, learner approval, first custom lesson. Show meaningful progress and allow review of uncertain OCR. Preserve approval steps. Also allow an original story description as a source.

6. After approval, create the themed place and generate its host, greeting, objects, house and room through real backend model jobs. Unlock it when its lessons are complete. Generate each level from its frozen approved vocabulary. Show truthful pending/failure states with bounded repair; do not substitute canned success.

7. A four-page illustrated story/webcomic using the new theme AND a meaningful selection of Tom's wider existing review vocabulary. Plan character motivation, obstacle, action and payoff before captions and images. Captions must be natural Mandarin within the allowed words; images carry what vocabulary cannot yet express. Use shared ruby; no model-drawn text. Add narration and a motion-comic export if the core reader works in time. Follow the attached media pipeline.

8. Real generated games: one learner request starts vocabulary checks, creative concept selection, mechanic-specific data, script, design, build, verification and bounded repair. Offer genuinely different play including moving a sprite, snake-like collection, mazes or collecting and delivering things. Chinese comprehension must matter, not matching a picture alone. Separate gameplay from art style: paper, pixel and real low-poly 3D are choices, not different mechanics. Build an actual safe sandbox and browser acceptance integration. A ready message is not proof of a playable game. At least one generated movement game must complete its full loop with touch and keyboard controls, readable Chinese, feedback and restart. Use short onboarding and clear held keys when focus changes.

9. Item collection and progression: reward real practice, acquire an item and place it at home or give it to a neighbour. Follow the coin, shop, buying, gift and plant rules in BACKLOG stage 17. Never claim collection from a decorative icon. Show a real vocabulary-based unlock.

10. Live voice conversation with the generated neighbour. Use a short-lived backend-created session credential, real microphone and text fallback, the actual learner vocabulary and situation, an End control and transcript highlighting unfamiliar words. Keep provider secrets server-side. Wire an early connection check so this does not wait until the last minute.

Each item above is one or more stages of the BACKLOG at the end of BUILD-RULES.txt; that stage's full text, done-when and check apply. When the ten items work, do not stop: carry straight on through the remaining BACKLOG stages in the order it gives (animated dramas, new learner and placement, word library and adding words, listening tape and spoken cards, park and gym drills, settings with export and report a problem), and then stages 20 to 38, the rest of the planned product, in number order. I want the full app built, demo path first. I will tell you when to stop.

Show the whole app from the first preview. Everything planned has its place in the world from the start; anything whose stage is not built yet is visibly greyed out with a short "Not built yet" label and does nothing when tapped. Take the grey off as each stage lands. Never disguise a missing feature with a fake generation, fake API result or prerecorded interaction. Keep a true list of built, partly built and unbuilt stages on the developer page, and report it whenever you pause.

MODELS AND JOBS

Use GPT-6 Astra for actual runtime text/planning/code generation and the configured OpenAI image, TTS and Realtime models for their capabilities. Confirm supported model IDs against the account at runtime rather than guessing. OpenAI TTS replaces the earlier Azure idea. Cast voices consistently by character, transcribe generated speech to check completeness, and listen to demo-selected clips. Store one configuration for exact model IDs. Ask for the OpenAI key through backend secret configuration, never in source or browser code.

One-shot means no human steering after the learner starts generation: multiple stages, independent checks and one repair per failing stage are allowed. Count every attempt, review and repair, input/output/cached tokens where reported, cost and end-to-end elapsed time. Missing usage is unknown, not free. Keep failed outputs private for debugging. Follow BUILD-RULES for sandbox restrictions and vocabulary checks.

WORKING WITH LOCAL ASTRA

I am also giving local Astra a prompt to generate new art. Build an import screen that accepts its event-art.zip or the individual files named by its asset-manifest.json. Associate files by exact name, check dimensions/alpha and place hotspots from actual images. The generator will provide home-room.png, stock-room.png, stock-house.png, town-ground.png, house-home.png, house-mouse.png, house-dog.png, house-cat.png, empty-plot.png and sheet-mouse.png, sheet-dog.png, sheet-cat.png. Optional avatars.png comes last. Do not wait for art to implement the app. Never reuse the attached design references as production art.

If this environment cannot run browser acceptance, implement the job/request and callback contract, explain the exact required service configuration, and keep generated games awaiting acceptance. Local Astra can build that service during the event; do not claim an edge function or hidden iframe already supplied it.

DELIVERY

Build and test now. Give me the working preview, concise setup actions genuinely requiring my account, what I can try, and any actual blockers. Verify the book-to-lesson-to-world path with real runtime calls once secrets are configured. Record the development/tool contribution and event-time changes for the submission. All implementation and final content must be created during this event; only these prompts, existing reference data and design guidance are prepared beforehand.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0446607f-8a47-4a51-9870-b34d98b84354).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
