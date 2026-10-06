<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Measure cost per completed user request

The unit is a complete unattended pipeline, not one model call. During API trials, measure the cost and elapsed time from the initial request until a usable result is ready or the run fails. Count planning, generation, verification, repairs and failed attempts. Current Codex trials do not establish API cost.

## Record each call

Attach a run ID, parent request ID, stage and attempt number. Retain the provider request ID, exact model ID, reasoning/settings, start/end timestamps, reported usage (including cached input, output and reasoning detail where exposed), outcome, validation findings and the artifact hash. For image/audio calls retain the relevant reported units and configuration. Keep private inputs and credentials out of public logs.

Calculate a price estimate using the official rates checked on the trial date; save the rate source, date, currency and calculation. Do not count reasoning tokens twice when they are already included in billed output tokens. Distinguish a usage-based estimate from charges actually reconciled against provider billing. Missing usage or an unknown image-tool model/rate means cost unknown, not zero. Record any separately billed tool or service charges.

## Report the whole run

For each tested feature show: input size, outputs delivered, model-call count, repairs, final usability verdict, total estimated API cost and wall-clock duration. Sum costs across parallel calls, but measure elapsed time from request start to ready; do not add overlapping durations.

Keep these separately visible:

- One-time fixed-world/art setup.
- A new book to its vocabulary, lessons and themed world, including whichever content/art jobs that trial actually completes.
- One additional game, story, lesson batch or drama.
- A live conversation of a stated duration, including audio and transcription charges.
- Reopening cached content, distinguishing generation cost from hosting, storage and speech costs.

Across a small test batch report every run, success rate, median and highest observed cost/time, and total spend divided by usable outputs. These are observed samples, not a production guarantee. Retain failed runs in the accounting. This lets Qing answer what it costs to make a working result, what drove the cost, and what happens when a stage needs another attempt.

API trials begin after the Codex pipelines are satisfactory, following Qing's credit-saving instruction. Set an explicit trial spend cap before a batch; report the cap and stop when exhausted. Game/text API measurements are still pending. The live-voice trial is separately authorised by Qing.

## Rates checked for the voice trial

The [official pricing page](https://developers.openai.com/api/docs/pricing), checked 6 October 2026, lists gpt-realtime-2.1 at $4 / $0.40 / $24 per million text input / cached input / output tokens, and $32 / $0.40 / $64 per million audio input / cached input / output tokens. Input transcription is separate: gpt-4o-mini-transcribe is listed at $1.25 input and $5 output per million tokens. Preserve modality and cache details from the actual usage events before calculating. Report incomplete usage as incomplete, especially if a call stops mid-response. These rates are not a measured session cost.

## Preliminary Codex-to-API equivalents

For the two staged serving experiments, applying Astra standard short-context rates ($10/million uncached input, $1/million cached input, $50/million output) gives:

| Run | Input (cached subset) | Output | API-equivalent estimate | Scope |
|---|---:|---:|---:|---|
| run5 | 121,087 (34,944) | 18,805 | $1.836624 | Six generation/review calls, no repairs |
| run4 | 174,046 (34,944) | 25,127 | $2.682314 | Eight generation/review calls, including design repair |

These are NOT paid API measurements or a whole workshop total. They include the recorded calls in each run, but exclude prior failed workshop runs, subsequent polishing and browser acceptance. Codex harness context and API cache behavior can differ. Reported reasoning is not added a second time to output. Both runs report zero cache-write tokens; this estimate assumes the reported cached subset qualifies as cache reads, while actual API cache writes could add cost. Recompute from actual API responses for production costing.
