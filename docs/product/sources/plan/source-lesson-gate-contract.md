# Source intake, lesson diff and personal-content gates

This is the required upstream flow before the [four-stage scene generator](../prototypes/illustrated-world/generative-pipeline.md). It follows today's [walkthrough](../notes/09-user-walkthroughs-2026-10-05.md) and [site specification](site-spec.md); Qing explicitly corrected a scene-only book test that skipped this work.

1. Retain ordered book units and known gaps. Extract Mandarin lexical senses. For an English book, make the Mandarin vocabulary adaptation explicit rather than comparing English strings to a Chinese library or calling original adaptation a faithful translation.
2. Match exact senses against the learner's library. Show lexically new entries separately from registered entries. Reconcile acquisition evidence separately; imported words are not automatically learned.
3. Preview and approve source lesson candidates plus necessary companions. Freeze all approved senses not acquired at this moment as the learning denominator. The first lesson can be five words; that does not turn a 48-word approved source into a five-word denominator.
4. Prepare lessons immediately and generate personal identity/content/images in the background. Prepared content is not unlocked content. A construction/locked plot offers the appropriate lesson without requiring a generation result.
5. After postapproval acquisition reaches `ceil(0.8 × N)`, and checked identity is ready, open the neighbour. Deduplicate evidence by learner, word sense and approved intake. Reject preapproval, unrelated or replayed events.
6. Apply the policy of each story, conversation, episode, game and inspectable object independently. The last 20% remains in the lessons and can still withhold a dependent piece. A word forgotten later becomes due for review; it does not evict a previously opened neighbour.

The same immutable source ID, approved-set version, vocabulary snapshot and per-piece required sense IDs must survive extraction, lesson planning, generation, serving and cache reuse. Changing a queue does not change the denominator. Regenerating a scene does not waive acquisition.

The corrected [actual-input trial](personal-pipeline-trial-2026-10-05.md) proposes an original Spring-book adaptation: 32 lexically absent senses, eight registered source overlaps and eight necessary registered companions. Acquisition for all registered overlaps remains unestablished. If approved unchanged, the proposed learning denominator is 48 and its threshold is 39. Actual private approval is absent and actual acquired evidence is empty: its prepared content remains locked. This is a proposed adaptation manifest, not certified exhaustive extraction of every possible Mandarin translation word. Prototype rehearsal decisions are synthetic; they do not write Tom's learner history.

The earlier six-line lexical test remains useful for exact allowed-word checks but does not establish this end-to-end flow. Do not describe its finished image as an unlocked personal neighbour.
