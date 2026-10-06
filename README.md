# Laoshu Laoshi · 老鼠老师

**[Try the live app → laoshulaoshi.lovable.app](https://laoshulaoshi.lovable.app)**

**Learn the Chinese that matters to you, and turn it into a world you can explore.**

![The illustrated world of Laoshu Laoshi](public/art/landing/landing-hero-desktop.webp)

Built for the OpenAI × Lovable hackathon in London, 6 October 2026, using Lovable and GPT-6 Astra.

## Why we built it

Qing’s husband Tom wants to learn Chinese to keep up with their bilingual toddler Bea and read her favourite books. A generic course does not necessarily teach the words a family needs tonight.

Laoshu Laoshi starts with what you want to understand: a book, a story idea, or your own vocabulary. The ambition is to turn those words into lessons, neighbours, conversations, stories and games in a personal illustrated village. Learning more Chinese gives you more things to do there.

## Explore the submission

1. **Try the prepared panda garden at `/demo-pack`.** This public route introduces the illustrated world and a movement game: read a Chinese word, find its object, collect it and complete the four rounds. It supports keyboard and on-screen controls, pinyin, English help and restart. This is a prepared example; playing does not update learner progress.
   For the explicitly dispatched Astra game, open `/game-preview`: *Lanternwing* asks you to collect and deliver the number of fireflies requested in Chinese. It is a playable preview with recorded browser checks; full production acceptance remains outstanding.
2. **Sign in and explore `/home` and `/town`.** Open lessons and reviews from the illustrated room, and see the village and its neighbours. Settings includes a private vocabulary import.
3. **Open `/book` to bring your own material.** Describe a story or upload ordered book photos, review the extracted text, inspect the proposed lessons and approve the plan. Approval starts custom-place, conversation and drama preparation; generation requires the configured backend services.
4. **Visit a custom neighbour.** Explore its checked greeting and conversation, or open its TV for the drama script and video scenes. Live microphone and book-to-video acceptance testing remain outstanding.

The described-story flow has been exercised, and Lovable’s [event roadmap](roadmap.md) records photo import tests with real page photos and both demo books. These records do not establish full book-to-video acceptance. The prepared panda pack and Lanternwing preview are separate from the on-demand generation pipeline.

## How we used Lovable and Astra

**Lovable built the initial application scaffolding**: the React and TanStack Start app, navigation, authentication, database-backed learner flows and the foundation for lessons and review. We continued using Lovable for application features, then merged its updates with local integration work.

**Astra led the art production**, using image-generation tools to create the painted-paper world: rooms, houses, the mouse/dog/cat cast, objects, plants and landing illustrations. The art work included reusable prompts, consistent character references, asset manifests and placement guidance. Image synthesis is credited to the image tools; Astra’s contribution includes direction, prompting, review and assembly. Original assets and generation records are preserved in the [art handoff](docs/art/START-HERE.txt) and [prompt library](docs/art/prompt-library/README.txt).

Alongside the main app, we split the work into several strands:

| Strand | Contribution and current state |
| --- | --- |
| Illustrated world and integration | Generated the asset library and integrated it into responsive home, town and neighbour scenes, with real controls aligned to the artwork. [Integration record](docs/art/INTEGRATION-STATUS.txt). |
| Personal learning content | Runtime Astra prompts read sources, extract vocabulary, generate lesson sentences, propose themed places and write hosts, greetings and conversation briefs. These run against the learner’s vocabulary and application checks. |
| Games | Integrated the explicitly dispatched Astra game, Lanternwing, in a sandboxed preview, alongside the prepared panda activity. On-demand production generation remains work in progress. [Dispatch provenance](docs/games/lanternwing-provenance.json) and [browser checks and limits](docs/games/LANTERNWING-TESTING.v1.txt). |
| Short video microdramas | Wired vocabulary-checked script planning and review to four silent video scenes through Lovable’s AI gateway, with captioned playback in the neighbour’s TV. Live end-to-end rendering remains unverified. The separate pilot, *The Teacher’s Portrait*, has a [production prompt pack](docs/product/prompts/microdramas/README.md). |
| Pronunciation practice and demo integration | Local coding work added illustrated park/gym practice, tone and pinyin drills, and worked through integration and demo readiness. Microphone feedback still needs human validation. |

These are development workstreams, not a claim that every supporting script or prototype was generated by Astra. In particular, the first game batch used inherited model settings and was rejected as an Astra demonstration; its records are retained separately from the explicitly dispatched replacement.

## Astra inside the app

Astra is also part of the runtime design, beyond helping us build the project:

1. **Bring something you care about.** Upload ordered book photos or describe a story. Review the extracted text before continuing.
2. **Find the words you need.** Compare source vocabulary with the learner’s existing repertoire and approve a lesson plan.
3. **Make it a place.** Generate a theme, scenario, neighbour and checked dialogue around that vocabulary.
4. **Practise in context.** Use a generated conversation brief with the voice experience; extend the same approach to stories, games and microdramas as those pipelines are integrated.

The application owns vocabulary checks, scheduling, progress and unlocks. Generated content must fit those rules. Chinese text is rendered by shared components with word-level pinyin, rather than baked into illustrations.

Runtime model choices live in [one configuration](src/lib/ai/config.ts). Text/planning is configured for `gpt-6-astra`; images, speech, transcription and live voice use separate capability-specific models. The app includes an account model-availability check. Configuration alone is not evidence of a successful live run.

### How game generation calls Astra

The on-demand game pipeline is designed to start with a frozen snapshot of the learner’s approved vocabulary. It asks Astra to develop a scenario and game mechanic, produce checked round data, then write the playable HTML from an explicit gameplay and art brief. Understanding Mandarin must matter to winning the game.

The existing [server-side model runner](src/lib/ai/run.server.ts) calls the OpenAI Responses API with `AI_MODELS.text`, configured as `gpt-6-astra`. It supports structured JSON results, records attempts, elapsed time and reported token usage, and provides one repair attempt for a failing stage. The [game pipeline](docs/content/games/PIPELINE.v1.txt) defines how to extend that infrastructure to game production; full game orchestration and publication are still being integrated.

For the page-building step, Astra receives the accepted rules, controls, visual direction, sandbox protocol and an English description of the data. The host injects checked Chinese and the shared pinyin renderer at play time. Generated code must pass sandbox checks and real browser playthroughs, including win, loss and restart, before publication. The current explicitly dispatched Astra experiment is a development run, separate from a completed unattended API workflow.

### How video generation uses Lovable’s AI gateway

The implemented microdrama path pairs **Astra for writing and planning** with **a video model accessed through Lovable’s AI gateway for rendering**. The [script preparation service](src/lib/video/prepare.functions.ts) proposes scenarios, writes an eight-line episode from the neighbour’s vocabulary, checks the text and reviews the script before preparing four video scenes.

The [runtime gateway](src/lib/video/gateway.server.ts) submits visual prompts to Lovable’s video API using the server-only `LOVABLE_API_KEY`. Its configured model is `google/gemini-omni-1.1-flash`; this is a code setting, not evidence of a successful provider run. The [video service](src/lib/video/drama.functions.ts) creates and polls jobs, copies completed MP4 files into the private `drama-videos` bucket and serves signed playback URLs. Requests are tracked per learner and content reference, with uncertain submissions held for reconciliation.

The video model receives visual instructions without Mandarin dialogue or text. Hanzi and pinyin captions come from the application’s shared text renderer. Current clips are intended to be silent; speech, reference-image consistency and final media quality checks remain unfinished. The separate scripted pilot, *The Teacher’s Portrait*, is a six-shot, 48-second village misunderstanding and is not a completed runtime episode.

**Current integration boundary:** book approval is wired to script preparation and video submission, and the neighbour’s TV exposes the checked script and scene controls. A live book-to-video run has not been validated. The separate [custom-generation adapter contract](src/lib/ai/custom-generation/video-gateway.server.ts) is an additional integration seam; it is not the runtime gateway described above.

## Hackathon build status

Implemented paths include sign-in, lesson and review flows, learner-word import, illustrated navigation, source-to-lesson planning, the prepared panda game and the sandboxed Lanternwing preview. Custom places, live voice, pronunciation drills and video microdramas are partially implemented. On-demand generated games, story readers and the wider progression systems are still in development. Game previews do not mark the full generated-games stage as complete.

See the [stage registry](src/lib/stages.ts) for the current built/partial/unbuilt breakdown. The [full product specification](docs/PRODUCT-SPEC.md) describes the larger ambition, not a list of completed demo features.

## Run locally

Stack: TypeScript, React 19, TanStack Start, Vite, Tailwind CSS, Supabase and the OpenAI SDK.

```sh
npm install
npm run dev
```

Use Node.js and npm. Connect a Supabase project, apply the migrations in `supabase/migrations`, and configure authentication and these environment variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Browser Supabase endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser publishable key |
| `SUPABASE_URL` | Server Supabase endpoint |
| `SUPABASE_PUBLISHABLE_KEY` | Server authentication key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only database administration |
| `OPENAI_API_KEY` | Server-only generation and speech access |
| `LOVABLE_API_KEY` | Server-only Lovable video gateway access |

Keep service-role, OpenAI and Lovable keys out of browser variables and source control. Authenticated and AI features require the backend configuration; installing dependencies alone does not provision it. Apply the video migrations as well as the learning-data migrations so the video job table and private storage bucket exist. The public `/demo-pack` route provides a prepared activity without a learner sign-in.

```sh
npm test
npx tsc --noEmit
npm run build
```

You can also continue development in the [Lovable project](https://lovable.dev/projects/0446607f-8a47-4a51-9870-b34d98b84354).

## Project records

- [Product decisions](docs/product/DECISIONS.md) and [38-stage backlog](docs/product/contracts/BACKLOG.md)
- [Source and handoff index](docs/product/SOURCES.md), including the original build prompts
- [Runtime prompt contracts](docs/product/contracts/PROMPTS.md)
- [Art direction](docs/art/ART-DIRECTION.txt), [asset manifest](docs/art/asset-manifest.json) and [generation log](docs/art/prompt-library/live-runs.jsonl)
- [Learning-data attribution](public/DATA-ATTRIBUTION.txt)

Prepared specifications, reference data and design guidance are distinguished from event implementation and generated assets in the source records. Private learner exports do not belong in this repository.
