# General Lessons

- Keep source files, tests, and explicit docs as durable truth.
- Keep generated artifacts disposable unless the project deliberately defines them as source.
- Preserve reusable lessons in this folder instead of leaving them only in chat history.
- Keep active task state in `docs/CURRENT_TASK.md`; lessons are for reusable knowledge after the finding is clear.

## Multi-Slice Planning

For complex or multi-step work, separate planning from execution. The planning pass should inspect the code, verify assumptions, choose sequence, and produce slices with concrete goals, files to inspect, likely edits, behavior changes, non-goals, risks, verification, docs/state updates, and stop conditions.

Planning should inspect the change shape, not just likely files. Use file lists, diffs, test names, docs sections, and search hits to find shared-file hotspots and mixed feature clusters. Treat broad cleanup or architecture areas as discovery buckets; turn them into smaller execution slices before handing them off when the breakup is already visible.

Execution slices should begin by checking the plan against the listed files. If the plan still matches, implement only that slice and run the named checks. If the plan is mostly right but too broad, narrow to the smallest coherent subset inside the listed files, record the narrowed scope, and execute that subset. If the listed files reveal several coherent tracks, split the slice into child slices such as 4a/4b/4c, record what moved into each child, and continue with the first unblocked child slice.

Strong slice plans reduce context rediscovery, keep scope small, make verification explicit, and prevent confusion when multiple priority lists exist. They should not make agents passive: stop only when the plan is contradicted by the repo, the work requires unlisted files and cannot proceed safely, the expected behavior is unclear, or verification points outside the narrowed slice.
