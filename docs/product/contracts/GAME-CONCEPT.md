<!-- Extracted verbatim from ../sources/prompts/attachments/BUILD-RULES.txt; see ../source-manifest.json. -->

# Game concept stage: invent the play, then build it

Build this pipeline during the event. This file is a prompt and integration requirement, not game code. All final outputs are generated on the night.

After vocabulary extraction and verification, make the first game-planning stage creative. Do not restrict it to the four earlier mechanic templates or confuse new artwork with new gameplay. Sequence: checked vocabulary and learning goals → concept alternatives and selection → mechanic-specific checked content/data → script → detailed design → implementation → independent checks and bounded repair. All steps run unattended after the learner's intentional source/lesson choices. Existing four templates remain examples, not an exhaustive enum for new content.

## Concept prompt

You are designing a small, appealing game that helps an adult practise the supplied Mandarin vocabulary. Invent the gameplay before planning screens or code. The learner should feel they are playing, not answering a multiple-choice quiz with a different background.

Inputs supplied by the application:
- Checked words with stable IDs, readings, meanings, newly introduced words and due/review words.
- The current place, characters, theme and learning objective.
- Recent game concepts/mechanics, so this request avoids repeating the same interaction.
- Phone/desktop constraints, supported controls and available build-time capabilities.

Explore six substantially different concepts. At least four must involve directly moving a player sprite through space, with meaningful navigation or position decisions. Consider snake-like collection, a readable maze, carrying items to characters, routes with limited carrying capacity, following spoken/written clues, or a different idea you invent. These are springboards, not mandatory templates. Do not reduce all six to walking onto one of three answer buttons.

For each concept state:
1. The fantasy and a concrete example of a 20-second play sequence.
2. How the player moves and acts, including phone controls.
3. The decision that makes Mandarin comprehension necessary. If a player can ignore the language and win by following a matching colour or icon, explain how you remove that shortcut. Keep introductory scaffolding explicit.
4. The target words and review words it practises, with no invented vocabulary or changed readings.
5. The core loop, reward, recoverable failure, short win condition and progression. Learning feedback must identify the right answer; speed must not overwhelm a beginner's reading time.
6. The minimum state/data required and the concrete tests that would establish the mechanic works.
7. One likely usability/engineering risk and how to keep the first version small.

Choose one concept that fits the supplied theme and learner, differs from recent games, gives the best combination of genuine play and language practice, and can be built and verified within the request's limits. Explain the tradeoff, not just a self-assigned score. Variety belongs across generated games; do not cram several unrelated games into one request. Return structured JSON with `concepts`, `selectedId`, and `selectionReason`; give each concept a stable `id`. Do not write implementation code at this stage.

## Downstream contract

Pass the selected concept intact to content, script and design. Keep stable references to checked vocabulary and generated content throughout. Define the required data shape and validation before generating the page; a novel concept must not silently inherit the wrong schema from a serving game. Build versioned mechanic contracts during the event. If a concept exceeds supported implementation capabilities, simplify/replan once or report it withheld; do not secretly replace it with an unrelated quiz.

The design stage specifies player controls, world bounds, collision/collection/delivery rules, item and customer states, inventory, goals, feedback, restart and touch equivalents as needed by the selected concept. Test reachability, no impossible delivery/collection states, no lost or duplicated items, and complete win/failure/restart flows. Game text always uses the shared RUBYTEXT.md adapter and must remain readable while moving. A visual style is chosen separately from the mechanic; changing a style must preserve the tested rules.

Judge the generated game on playability, understandable controls, useful language practice and text layout. Do not treat a successful concept JSON or designer praise as evidence that the built game is fun or works.
