# Project Workflow Generation 1 Migration

Generation 2 retired four duplicate live owners after routing current responsibilities to Current State, Current Task, Future Features, Active Agent Work, Known Bugs, Git, and the documentation change log.

- `.project/SESSION_RESUME.md` -> archived at the same relative path below this folder
- `.project/TASK_STATE.md` -> archived at the same relative path below this folder
- `docs/NEXT_TASK_CANDIDATES.md` -> archived at the same relative path below this folder
- `docs/BUG_WORKFLOW.md` -> archived at the same relative path below this folder

The files were moved without rewriting their bytes. Generic connector, development, and error/logging templates were moved to `overlays/integrations-and-operations/docs/`; the website overlay remained separate and unchanged. Git remains the exact history and rollback source.
