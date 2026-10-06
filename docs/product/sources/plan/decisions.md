# Decisions

## 5 October evening: personalised scenes and shared ruby

- Qing accepted the corrected illustrated prototype's style. The home is personal, with no resident stock Laoshu teacher; teaching appearances are contextual.
- The generative pipeline is strictly vocabulary-first: interactions → verbal scene design → invisible layout → images. Astra directly tests this; Fable reviews the textual checkpoint afterwards.
- Every learner's world is radically personal. Shared textbook content alone does not demonstrate the product. Test actual private Tom vocabulary and an uploaded book; registered words remain distinct from mastery.
- [Pinyin placement contract](pinyin-ruby-contract.md) and [legacy study](pinyin-legacy-study-2026-10-05.md) govern every shared Chinese-text surface. Pronunciation appears above corresponding Hanzi when visible; concealed recall answers remain concealed.
- Authority: [Qing's verbatim evening messages](../notes/11-generative-world-and-ruby-2026-10-05.md). Style approval does not imply interaction approval or verified production services.

What was decided and why, newest first. The detail and the requirement numbers are in `requirements.md`; Qing's own words for 5 Oct are in `notes/08-world-and-demo-session-2026-10-05.md` (morning) and `notes/09-user-walkthroughs-2026-10-05.md` (afternoon).

## Mon 5 Oct 2026, evening (Qing, workstation corrections)

The product is a maximally addictive, immersive online-game-style world. All visible scene graphics must be illustrated image-generation assets; geometry only defines where modular pieces go. Required motion uses paper cut treatment. Preserve yesterday’s C-background/B-foreground style direction and the established cast throughout the whole universe. Fable is not multimodal and browser Fable has no image generation: visual work stays here with Opus/Astra and GPT Image Gen. Qing requested context recovery before further work; [the recovered checkpoint](CONTEXT-CHECKPOINT.md) and [exact messages](../notes/10-context-and-visual-corrections-2026-10-05.md) record the result. The earlier geometric Opus/Astra mockups are rejected as a visual direction.

## Mon 5 Oct 2026, afternoon (Qing, dictating walkthroughs to Fable)

| Decision | Why (Fable's summary, unless in quotation marks) | Where |
|---|---|---|
| Spec the real product in full, then scope down for the hackathon by turning the plan into an ordered backlog of prompts | "Speccing out lots of the real product"; "we can always scope _down_ for the hackathon" | `walkthroughs.md` |
| Write down the exact prompt every time anything is generated or tried | She has to recreate everything under time pressure at the hackathon | `CLAUDE.md`; `prompt-log/` |
| Four records per word, replacing two. Read by Fable as: recognise by sound, recognise the character, produce by pinyin, produce the character | Someone who only wants to speak can switch characters off; advanced learners can be asked to write | decision 3; R2 |
| Characters off still shows characters; they are never tested | "You'll still get the familiarity" | R2a |
| One way for any activity to report evidence: easy, medium or hard pass, or fail, for a word in a record | Games and drills can be made to count later without knowing how the schedule works | R64a |
| You do not get a thing if you cannot say it in Chinese; nothing is purely cosmetic | Every purchase is a reason to produce a word | decision 13; R98a |
| A failed purchase closes that item for 24 hours | People will want the green table enough to get it right | R98b |
| Coins come from deliberate practice, and never buy anything generated | The reward is for the hard work; generation costs money | decision 14; R96, R76l |
| As many collectibles as possible; an arcade with claw machines | "People love that stuff", as in "the Bean thing" (identified by Fable as Focus Friend) | R98d, R136 |
| Home holds every way to practise, each as an object in the room | Nothing that teaches needs a trip | R115 to R123 |
| Locked places offer their lesson; a building site shows while a neighbour is generated; custom neighbours open at 80% of their words | The learner always knows what to do next, and that something is coming | R125 to R127 |
| A gym and play park for tone drills, and a place for grammar, open to everybody from lesson 1 | Drills are pedagogy, so never locked | R132 to R134 |
| The free game is bundled content per lesson or pack, filtered against what the learner knows | A Duolingo or Rosetta Stone kind of experience for free; personal content is the paid product | decision 15; R76g, R76h |
| Everyone starts with gift credits for one full neighbour; further custom plots are hidden until paid | A taste of the paid product on day one | R76i, R76j |
| Voice may need its own cheap base subscription | The voice models cost money per use | R76k |
| Starting with existing Chinese is swiping one word at a time, easy to hard, with a strip of upcoming words and an offer to stop | No word may be marked known by accident, so no batches | R17a to R17h |
| The first day: name, avatar, "do you already know some Chinese?", then lesson 0 or the swipes | Everyone needs the avatar; only some need the swipes | R17i, R138, R139 |
| The plants are the streak: they grow with watering, wilt with a backlog, never die | No numbers, and coming back is always possible | R100b |
| Everything works by touch in a phone browser and by keyboard | "Everything needs to be super easy" | decision 16; R14a |
| Pressing hard, good or easy by hand is out of favour; what replaces it is not decided | "Way too funky" | R11e; open decision 23 |
| In the demo the lesson is probably done at home; if 80% is too far for the stage, pad the stand-in Tom's list or use another book | "This is hackable for the demo" | `walkthroughs.md` section 1 |

## Mon 5 Oct 2026 (Qing, in a morning session with Fable)

| Decision | Why (Fable's summary, unless in quotation marks) | Where |
|---|---|---|
| The aim is an app people come back to daily, with every hook in service of the pedagogy | Duolingo fails on pedagogy, not on pull. Extrinsic motivation is a stepping stone to mastery, as at Alpha School | requirements section 1 |
| Rewarding the dull parts is the small piece. Making the content as fun as a video game is the big piece | Her steer at 09:59, correcting the direction of the session | requirements section 7b, opening |
| The story is: "you bring the content you want to learn, and it becomes a part of your world with gen AI" | It is the pitch and the spine of the demo | requirements section 1 |
| Home is yours and bilingual; the town is full immersion | Review is bilingual by nature; input should be all Chinese. Home keeps the tape format Tom likes | decision 8; R80 to R85 |
| Dailies are at home. Stories are what you go into town for | Keeps everything that teaches in reach on day one, and makes going out the treat | R81, R84 |
| The town is a map you tap; no walking | Walking is time with no Chinese in it | R85 |
| Nothing that benefits pedagogy is game-locked. What is locked is more game than learning | The game exists to bring people back to what works | decision 9; R93, R94 |
| Learning the language is the natural gate: standard places open at 80% through their words | "The world grows because you couldn't understand it before" | decision 10; R86, R87 |
| Friends are next door from lesson one | There is always someone to visit | R88 |
| The syllabus is reworked around the map | Each standard place owns a fixed part of it | R89 |
| Modular slots: neighbours, shops, distant travels, filled from the learner's topics | Personal content has a place to land, and the kind of slot shapes what is generated | R90 |
| Neighbours and shops move on to a list when the review data says fluent | The map stays about what is being learned now, and nothing is lost | R91 |
| Reward currency is never required for an unlock. Coins buy gifts, which you must be able to say you want; gifts raise affection | Keeps the currency on the fun side, and makes buying a reason to speak | decision 11; R96 to R99 |
| Coins are not capped; cost is controlled by what they can buy | Only pre-made things are for sale for coins | R97 |
| No numerical streaks. Happy plants, and neighbours who miss you and are glad you are back | Qing is not interested in streak counts | decision 12; R100 |
| The base game is free and made in advance. Anything generated for one learner is billed by usage, in tiers by cost. Personalisation is the paid product | Generation is expensive; a premium price can carry a daily personal game | R76a to R76d |
| A daily one-shot minigame written by Astra, greyed out until reviews are done | A game played once needs no staying power; it is more input and a reward | R101 to R105 |
| Dramas in the Chinese short-drama style, with cliffhangers | "keep them coming back for tomorrow" | R106 to R110 |
| Choices in stories, cliffhangers, and a place that changes daily: "let's do all three!" | Agreed in passing; not worked through | R112, R113 |
| The learner can talk with a neighbour | In the demo | R114 |
| Azure for Mandarin speech; Seedance for video if the rules allow; Astra writes | A specific technical need can be met elsewhere, but what Astra made must be visible | experiments-2026-10-05.md |
| In the demo, the game replaces the closing song | The game shows Astra's work, and removes the untested sung-audio risk | spec-v2 section 4 |
| The video game is one presentation; users could choose others | Radically personal extends to the form | R111 |
| Pricing detail and the depth of the game design are left for later | "We just have to have enough of the picture to show a glimpse of it in the hackathon demo" | requirements open decisions 9 to 18 |
