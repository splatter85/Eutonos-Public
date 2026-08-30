# Project Boot Protocol

Workflow generation: 2 + Cross-Environment Development Continuity

1. Read `AGENTS.md`.
2. Check Git startup state. If Git is missing or this folder is not a Git worktree, ask the user before installing Git, running `git init`, or connecting a remote.
3. Read `.project/EXECUTION_STATE.json` for durable mode, active Campaign/Slice, writer lease, branch, Exchange, relevant Notes, owned paths, and checkpoint. When `active_exchange` is non-null, read that Exchange's README and JSON before taking its lease or editing; terminal Exchanges cannot remain active.
4. Read `docs/CURRENT_TASK.md` and `docs/PROJECT_GOALS.md` for the approved work and intended outcome.
5. Read only the active Slice document and Agent Notes named by Execution State.
6. If an Action may be incomplete, inspect the active PR checkpoint or only the necessary tail of ignored `.tova-runtime/` journals; never infer success.
7. Read `.project/CURRENT_STATE.md` only when broader project truth is needed.
8. Read `docs/COLLABORATION_PROTOCOL.md` only for handoff, recovery, review mode, writer transfer, or multi-node work; read `docs/WORK_MODEL.md` when planning, splitting, admitting, or closing work.
9. If the workflow is being installed, adopted, or upgraded, or initialization remains open, follow `docs/TOVA_SETUP.md`. For an established repository, legacy/untrusted layout, or accepted older ToVA version, also read `docs/TOVA_MIGRATION.md` before reconciliation, retirement, or finalization. Use `docs/PROJECT_DISCOVERY.md` only for facts still open after repository inspection.
10. Read `docs/PROJECT_HEALTH.md` before selecting or claiming a gate. Use `docs/README.md` to load only product/technical owners needed by the Slice. When the Slice or layout is unfamiliar, select the smallest route from `docs/REPOSITORY_INDEX.json`; it is navigation-only, so inspect direct sources if stale or contradictory. Read `docs/TOVA_HELP.md` for everyday routing help.
11. Read `docs/DESIGN_LANGUAGE.md` for user-visible design, reusable UI surfaces, interaction text, or product copy. Read `docs/handoffs/README.md` only for an explicit transfer and `docs/outputs/README.md` only for a retained non-handoff work product.
12. Inspect durable source, preserve project content/casing, implement one Slice, run its gate, update named owners, and stop. Remove only exact Slice-owned ephemeral paths after evidence capture; retained and shared/reused paths remain under their owners.

When the user does not know an answer, offer two or three repository-informed options plus one conservative default and label the result until confirmed. Do not infer successful commands, accepted baselines, product capabilities, completed work, goals, or architecture from workflow installation. Ask before destructive operations, dependency expansion, publication, or baseline promotion.
