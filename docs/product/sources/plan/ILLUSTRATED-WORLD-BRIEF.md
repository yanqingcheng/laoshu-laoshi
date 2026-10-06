# Illustrated modular world — local Opus/Astra/Image Gen brief

**Historical design brief:** the illustrated experiment has now run and Qing approved its art direction. Its details remain provisional. Read [the experiment report](game-art-experiments-2026-10-05.md) and [current Fable handoff](FABLE-CHECKPOINT.md) for the next step; the prompt below records the earlier visual assignment.

Qing's correction supersedes the prior prototype's visual recommendation: “there shouldn't be any geometric rendering peeking through - the geometry is just to define where the modular image gen pieces go”. For motion: “if animation or motion is required we do it in a paper cut style”. The existing Opus/Astra artifacts are useful only as slot and interaction experiments. Neither is an accepted visual direction.

Run the visual work here with Opus/Astra and built-in GPT Image Gen. Fable is not multimodal and Qing's browser Fable has no image generation. It may review textual product contracts, not inspect or produce scene graphics. Start with [the recovered context](CONTEXT-CHECKPOINT.md) and [the actual style/art pack](../design/style-references/README.md), not the rejected modular mockups.

## Local visual-design brief

```text
We are designing Laoshu, a Mandarin learning site whose vocabulary unlocks a warm illustrated room and a small village. Tomorrow's hackathon should reproduce a design and a sequence of prompts already worked out tonight. The target is a maximally addictive, immersive online-game-style world, not a language dashboard with decoration. Help us establish that visual recipe in one bounded design pass; ordinary implementation details can be handled by strong builders tomorrow. Voice and video can wait.

Inspect the actual C, B and D boards in design/style-references/ and the recovered reading-room/garden/cast artwork. Qing chose C backgrounds with moderately richer B foreground detail; D is the synthesis study, not independently approved production art. Reference the original teacher/Chow/Lihua identity files. Reuse prior useful artwork where appropriate; do not restart art direction. Learner/family avatars and personalised printable stories remain product scope.

The previous prototype misunderstood the graphics. It drew SVG houses, furniture and animals, then added a few image-generated assets. Qing rejected the result: "there shouldn't be any geometric rendering peeking through - the geometry is just to define where the modular image gen pieces go". Treat that as the governing visual requirement. We want a cohesive illustrated world built from modular image-generated pieces. Invisible geometry specifies placements, scale, layering, alignment and hit targets. No visible polygon/rectangle/ellipse stand-ins for houses, characters, furniture, artwork or decorative room features. Ordinary interface text, controls and app-rendered vocabulary labels are fine, but scene graphics must come from the illustrated asset system. Debug geometry is opt-in and absent from the default presentation.

Qing also says: "if animation or motion is required we do it in a paper cut style". Use illustration cutouts translated, gently pivoted or replaced with a small set of authored poses. Keep their painted texture and identity intact. Plan clean pivots, layer order, contact shadows and occlusion. No morphing geometry, skeletal deformation, glossy 3D or synthetic shape animation. Motion is optional; the still composition must stand on its own. Respect reduced motion. Wandering characters, if included, follow app-owned paths using the same cutouts; do not regenerate frames live.

Design these five views as one visual family:
1. Learner's room: fixed illustrated shell/furniture/character pieces, with modular framed artworks based on vocabulary. Make the vocabulary genuinely recognisable through the art. Labels are selectable app text, never image-generated glyphs.
2. Village: a fixed illustrated landscape/path composition with modular house and character slots. Optional wandering cutout characters. Fixed house shells first, then theme variants on demand.
3. Other buildings: school, shop and teahouse as compatible fixed illustrated pieces, where useful to the village.
4. A fixed neighbour's home: illustrated interior and host, dedicated gift positions and furniture upgrades. Upgrades should look richer while preserving compatible placements.
5. An on-demand theme-based neighbour's home: theme changes coherent illustrated pieces within a stable composition. Show the house exterior in the village; the interior should read as a room, without an arbitrary house preview floating inside it. Propose a different presentation only if it clearly improves the experience.

We need TWO kinds of repeatable prompts: fixed assets/layouts that can be generated or built in one shot at the hackathon, and parameterised prompts that can generate new vocabulary art and neighbour themes during use. Runtime text planning may propose appearance only; layout, state and actions belong to the app. Generated rasters must never carry navigation, interaction logic or learner labels.

Known experiment findings: transparent house cutouts and a surface edit using a base-house reference work as an initial technique, but generated padding and small silhouette details drift. Code must measure alpha bounds, fit to anchors, clip within slots and retain an accepted piece on failure; a prompt alone cannot guarantee pixel-identical shape. A blank room background can be generated separately. Its doors/windows must either be included consistently in that fixed plate or supplied as separate illustrated assets, never primitive code drawings. Two actual constrained text-planner trials worked with allowed word IDs, a pinned palette, an allowed host ID and four English appearance descriptions, rejecting coordinates and unknown fields. The planner guard is still a prototype, not a semantic guarantee or production backend.

Return a compact, decisive design packet:
- One strong art direction and concrete composition for each of the five views. Be specific about perspective, visual hierarchy, depth, texture, character identity, negative space and mobile framing. Do not return a grid of unfinished geometric placeholders as the design.
- An asset decomposition: which pixels belong to the fixed background, which are independent cutouts, which are frame inserts, and which are runtime theme pieces. Include invisible placement/anchor and overlap rules. Avoid splitting so much that seams and mismatched perspective become obvious.
- Exact reusable prompts for the initial fixed pieces and the on-demand variants, including the shared style text, reference-image requirements, variables, true-alpha requirements for cutouts and rejection criteria. Use a stable reference sheet for recurring character identity. A house variant edits the approved shell; a theme interior reuses its approved perspective and composition.
- A small paper cut motion recipe, only where motion improves the experience. Name the required poses/layers and pivot points. Include a still/reduced-motion form.
- A self-contained Astra builder prompt that reproduces the design and assembly rules without seeing your implementation. It may receive the same approved asset pack and exact image prompt recipes. It must not substitute shape drawings when images are unavailable.
- A bounded first image experiment for Codex to run immediately after your return: enough pieces to demonstrate a finished-looking room and village, plus one theme swap. Include actual full prompts so we can run it without another design round. The coding worker hands exact prompts to the parent for built-in GPT Image Gen; do not claim images exist until actual outputs are retained and inspected.

Select one direction rather than conducting repeated critique loops. Clearly separate design proposals, generated assets and verified results. The key acceptance check is visual: once assembled, the room and village must look like a coherent illustrated world, with no scaffold peeking through. We then compare your reference against Astra's recreation, using equal assets and viewport sizes. No need to implement the full learning backend in this pass.
```

## Current state and next return

The rejected runnable artifacts remain interaction/slot evidence only. The later illustrated prototype and exact recipes are retained on main. The Tom Opus draft was partial; direct Astra assembly and parent Image Gen produced the current art. No finished Opus/Astra visual parity comparison was completed. Qing has requested a textual Fable pass to reconcile the remaining details and build prompts.
