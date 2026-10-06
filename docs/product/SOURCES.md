# Specification sources

The source repositories are [laoshu-laoshi-plan](https://github.com/yanqingcheng/laoshu-laoshi-plan) for product intent and [laoshu-prompts](https://github.com/yanqingcheng/laoshu-prompts) for event build and runtime instructions.

Local snapshots let agents work without access to either repository. [source-manifest.json](source-manifest.json) records repository, HEAD commit, originating path, commit-pinned URL, local snapshot and SHA-256 for every copied file. Snapshots reflect local working files; hashes identify exact content even if a source differs from HEAD. No private learner export or book scan is included.

## Event instructions

- [Original BUILD-RULES](sources/prompts/attachments/BUILD-RULES.txt) is complete. Its eight section bodies are extracted unchanged into `contracts/`: SPEC, RUBYTEXT, PIPELINES, COSTING, GAME-CONCEPT, MEDIA, VOICES and BACKLOG. Historical relative links refer to original attachment sections; PROMPTS means the runtime file below.
- [Runtime prompts](sources/prompts/attachments/RUNTIME-PROMPTS.txt) retains all shared blocks, source.read/words/describe, compound.judge, lesson.sentences, place.theme/scenario/neighbour/shop, talk.brief/instructions, game.data/script/design/page, mechanic/style/schema blocks, drama.script/animation, story.pages, repair, art prompts and final media updates.
- [Build app](sources/prompts/prompts/01-lovable-build-the-app.txt), [generate art](sources/prompts/prompts/02-astra-generate-all-art.txt), [apply art](sources/prompts/prompts/03-lovable-apply-art-and-finish.txt), [verify](sources/prompts/prompts/04-astra-finish-and-verify.txt), [integration](sources/prompts/prompts/05-lovable-final-integration.txt), [demo](sources/prompts/prompts/06-astra-edit-the-demo.txt), [submission](sources/prompts/prompts/07-astra-prepare-submission.txt) and [new learner side phase](sources/prompts/prompts/side-lovable-new-learner-first-lessons.txt) retain all event handoffs.
- [Data attribution](sources/prompts/attachments/DATA-ATTRIBUTION.txt) accompanies existing learning data. The data envelope is not duplicated here.

## Product and historical reference

- [Requirements](sources/plan/requirements.md) retains every original numbered requirement and all 32 historical open questions, including Qing/assumed/research labels.
- [Walkthroughs](sources/plan/walkthroughs.md), [decisions](sources/plan/decisions.md), [source gates](sources/plan/source-lesson-gate-contract.md), [ruby](sources/plan/pinyin-ruby-contract.md) and [visual brief](sources/plan/ILLUSTRATED-WORLD-BRIEF.md) preserve journeys and design intent.
- [Site spec](sources/plan/site-spec.md) and [acceptance](sources/plan/site-acceptance.md) preserve route, failure and interruption details. Their rehearsal algorithms/fixtures do not override event Exact contracts.
- [Earlier build prompts](sources/plan/build-prompts.md), [coverage backlog](sources/plan/build-backlog.json), [v2](sources/plan/spec-v2.md) and [earlier prompts](sources/plan/prompts.md) preserve broader details and historical coverage, not permission to shrink the 38-stage scope.
- [Legacy product descriptions](https://github.com/yanqingcheng/laoshu-laoshi-plan/tree/main/docs/product-description) are reference behaviour/defect history. The delivered [art handoff](../../ART-HANDOFF.txt) governs current asset integration.

Historical snapshots may link paths in their originating repositories; these are not all local files. Experimental assets, private raw traces and private book/learner data are not copied. Historical claims about models, prices or completed experiments are source claims, not freshly verified services.

## Completeness

The documentation package preserves the full BUILD-RULES, all eight extracted sections, all runtime prompts, all 38 complete stage descriptions and the entire requirements document. The main spec's stage table is navigation, not a substitute for detailed acceptance. Documentation coverage does not certify implementation. New user decisions override historical wording through [DECISIONS](DECISIONS.md) without changing snapshots.
