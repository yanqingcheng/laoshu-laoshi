ART PROMPT LIBRARY

historical-runs.jsonl: exact prompts recovered from the saved generation annotations,
including retries, timing where retained, and source pointers. These are historical
records reconstructed now, not a claim they were logged before each original call.
Missing timestamps/reference lists are null rather than invented.

templates.json and art.*.v1.txt: seven reusable adaptations for houses, hosts, rooms,
objects, story scenes, plant conditions and markers. Reference images and validation
rules are in templates.json. Individual text files are prompt bodies for easy reuse.
These parameterized versions are NOT newly tested outputs; inspect every generation.

The ready-made nine plant states and ten markers should normally be reused directly.
Do not spend a new image call each time a learner waters plants or sees new content.
Personal neighbour themes, characters, items and story scenes are on-demand candidates.

FOR EACH FUTURE CALL
1. Select a versioned template; resolve approved image references and trusted art inputs.
2. Fully expand all placeholders. Append a request event to live-runs.jsonl BEFORE
   generating: run_id, UTC timestamp, exact_prompt, reference paths + roles,
   transparent_background, intended output path. Do not log private learner material.
3. Generate, preserve the original, validate alpha/identity/layout/content.
4. Append a result event with the same run_id: saved output, validation, duration,
   and only model/usage/cost fields actually exposed. Unknown values remain null.
5. Every repair is a new request/result pair with its full actual prompt.

JSONL is append-only: one JSON object per line. Results do not overwrite requests.
Use a new version for a changed template. Keep the recipe that produced accepted art.
Project AGENTS.md carries this workflow for subsequent art work in this workspace.

Image model IDs, usage and costs were not exposed in these runs. Cost is unknown.
Application vocabulary checks, eligibility, ownership and job state live outside art
prompts; a successful image generation never proves those conditions.
