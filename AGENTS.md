<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Type-check: noUncheckedIndexedAccess/exactOptionalPropertyTypes/noPropertyAccessFromIndexSignature are off — they fight the dynamic JSON-heavy data paths.
- Architecture: four layers per BUILD-RULES §2. Word memory lives only in src/lib/memory/core.server.ts (submitEvidence, checkText, splitText, queryWords, declareKnown, queueWords, undoLast); nothing else touches cards/learner_words — keeps scheduling rules in one place.
- Course/compound reference data is bundled in src/data and loaded idempotently by ensureCourseLoaded (src/lib/course.server.ts) via the server admin client; counts are verified on the dev page — never fabricate a successful load.
- Shared Chinese rendering is src/components/WordText.tsx + src/lib/chinese/pinyin.ts; all Chinese UI goes through it.
- Build status is the single list in src/lib/stages.ts; world hotspots grey out via stageBuilt(n).
- Word import runs as one SQL transaction (public.apply_word_import, service_role only) called after auth by importMyWords.
