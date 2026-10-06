# Product decisions and contract conflicts

Recorded 6 October 2026. Distinguish product intent, event implementation contracts, provisional defaults and later user decisions. Complete historical open questions remain in [requirements section 9](sources/plan/requirements.md#9-open-decisions).

## New decisions for this repository

**Short videos are in scope.** Qing confirmed on 6 October 2026 that Lovable has a Video Agents connector and brought short videos back into the product. This supersedes the old stage-38 restriction that video is an optional addition if a video model happens to be available. Build the connector integration for short drama videos as described in [Short videos](../PRODUCT-SPEC.md#short-videos). Connector availability is user-provided context; exact actions, account permissions, quotas, costs and callback behaviour need inspection during implementation. This documentation does not claim a connected or tested service.

## Conflicts that must stay visible

| Topic | Source disagreement | Guidance and remaining decision |
|---|---|---|
| Custom neighbour opening | Planning R127/source gate: acquire `ceil(0.8 × N)` of frozen approved not-yet-acquired senses. Event SPEC section 7 Exact: finish prerequisites and lesson 1, with host/lines ready. | Event Exact is the existing repo build baseline. Preserve the 80% intent; a switch requires an explicit policy decision and consistent tests. Bundled gates remain 80%. |
| Medium/hard stories | Stage 21 includes selected queued unknowns. Exact chooser requires every required word in repertoire, derived from all tokens. | Strict serving withholds these stories. Define a scoped story policy before stage 21 can pass; retain selected unknown IDs/budgets, never globally loosen checks or mark unknowns learned. The pack leaves this exception incomplete. |
| Town immersion | Plan says Chinese-only; SPEC popovers show meaning and stage 12 shows English captions. Rehearsal proposed returning home for English. | Preserve meaning access and immersion intent. The home detour is a proposal, not approved final policy. Decide gloss/caption presentation before claiming full immersion. |
| Word identity | Planning R1 distinguishes senses sharing Hanzi; Exact course matching uses Hanzi first. | Follow the explicit import/course rule for that pipeline; retain source senses. Do not infer all homographs collapse everywhere. |
| Retirement | Stage 35 requires solid in both skills; SPEC defines solid from recognition only. | Define per-skill solidity before automatic retirement. Recognition alone is not production mastery. |
| Shared easy stories | Stage 20 creates shared easy stories from course words; stage 21 defines easy using individual solidity. | Check learner strength before labelling shared content easy for them. |
| Free intake | Stage 37 charges personal generation but lets no-credit learners scan books and learn words. | Preserve free intake; define OCR/extraction/example allowances before credit enforcement. |
| Conversation replay | Stage 37 says replay is free but live voice costs credits per conversation. | Distinguish stored replay from new live sessions; define exact charging boundaries. |
| Decay selection | Stage 26 uses `2 / daysSinceLearned^1.2`; planning also discusses source/word timestamps. | Define zero-day handling and timestamp basis. Do not divide by zero or present a new default as approved. |
| Map extension | Initial eight slots versus later grammar, jobs, arcade and extra plots. | Preserve domain slot IDs. Grammar defaults to a third park/gym door; design later extensions explicitly. |
| Known declarations | Old rehearsal seeds easy evidence or untested production; event Exact directly writes 30/7-day cards. | Use the event direct-card rule without fake evidence. |
| Scheduler | Rehearsal proposes simple intervals; event Exact requires ts-fsrs 5.2.3. | Use event FSRS; historical intervals are not a parity fallback. |
| Games | Rehearsal permits a matching prototype; event requires generated mechanics/browser acceptance. | A prototype or ready event is not accepted generated gameplay. |
| Speech | Old plan mentions Azure; VOICES specifies OpenAI. | OpenAI TTS, stable casting and completeness checks govern. Final cast assignment is still unapproved. |
| Video | Historical conditional scope versus new user decision. | Lovable Video Agents short-video integration is required; missing setup is a blocker to report, not feature removal. |

## Explicit provisional defaults

The backlog directs that these be configurable developer settings, not treated as settled policy.

| Stage | Default | Open decision |
|---|---|---|
| 23 | Shared course daily game without credits; personal with credits | Final free/personal entitlement |
| 29 | Manual grades default; optional automatic good/hard/fail, no timing; speech experimental/off | Final grading UX and speech reliability |
| 31 | Stock schoolroom, third park/gym door | Name and final layout |
| 32 | Café first, further jobs attached to shop-type places | Scenario selection |
| 34 | Meet three neighbours and identify spoken names | Newcomer game design |
| 36 | Optional character recognition; production greyed | Whether pinyin-keyboard selection counts as character production |
| 37 | Gift covers host/art and level-1 story/game/drama/conversation; voice per conversation | Prices, gift allowance, ongoing content and separate voice plan |

Other historical questions include unknown percentages, fluency encouragement, source readability, placement duration and plot/credit relationships. All remain available in the complete requirements snapshot. No real checkout and no walking around town remain explicit exclusions. Audio postcards/greeting cards remain exploratory; short videos no longer do.

## Updates

Record new user decisions here with date, update the main spec and acceptance together, and preserve historical snapshots and hashes. A source refresh requires provenance and conflict review. Never rewrite an old prompt to imply it produced an accepted result or contained a later decision.
