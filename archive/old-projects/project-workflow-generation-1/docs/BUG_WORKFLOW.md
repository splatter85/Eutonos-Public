# Bug Workflow

Purpose: define how the project records and closes bugs without depending on chat memory.

## Workflow

1. Record confirmed bugs in `docs/KNOWN_BUGS.md`.
2. Link the best available evidence.
3. If the bug becomes the active work item, reference it from `docs/CURRENT_TASK.md`.
4. Fix the owning source layer, not generated output.
5. Run the narrow reproduction or acceptance check first.
6. Run the full project verification command before calling the fix complete.
7. Move the bug to `Fixed Bugs` only after verification succeeds.

## Rules

- Keep fixed-bug history.
- Keep entries short and searchable.
- Use one stable bug entry rather than repeating the same defect in multiple docs.
