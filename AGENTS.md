# Agent Contract For The Universal Starter Kit

This directory is the release mirror of ToVA Project Workflow generation 2. Its durable source is the versioned core, tools, schemas, fixtures, tests, overlays, and maintained package docs. The workflow supports target projects; it does not own their product meaning.

Start with `.project/PROJECT_BOOT_PROTOCOL.md`. `.project/EXECUTION_STATE.json` owns durable machine-readable execution/writer state. `docs/CURRENT_TASK.md` is the sole live agent work board for approved bounded work, paused work needing an owner decision, and the next ready Slice. It is human-readable so the human owner can understand, steer, and authorize agent work; it is not a task list for the human to perform. `.project/CURRENT_STATE.md` provides compact orientation and pointers, never a second task board; `docs/README.md` maps durable document ownership, while `docs/REPOSITORY_INDEX.md` and `.json` provide navigation-only routes to exact owners/source/tests/proof. `docs/WORK_MODEL.md` owns Campaign/Slice policy, `docs/COLLABORATION_PROTOCOL.md` owns online/local/multi-node coordination, and `docs/PROJECT_HEALTH.md` owns proportional gates and real package commands. `docs/ARCHITECTURE.md` owns current construction, `docs/DESIGN_LANGUAGE.md` owns visual/UI reuse plus user-facing language and copy, Current/Future Capabilities own supported/desired end-to-end outcomes, and Current/Future Features own implemented/proposed mechanisms. `docs/TOVA_SETUP.md` owns conditional deployment through acceptance, `docs/TOVA_MIGRATION.md` owns established-repository and older-version reconciliation, and `docs/TOVA_HELP.md` owns shorter everyday routing. `docs/handoffs/README.md`, `docs/agent-notes/README.md`, and `docs/outputs/README.md` own transfers, sparse observations, and retained-output conventions. `docs/PROJECT_DISCOVERY.md` owns only the conditional five-question interview for target facts that remain open; none becomes a second truth owner.

## Migration Mode

During initial adoption or a version upgrade, the current supported Starter Kit owns ToVA workflow semantics while the project continues to own project facts, commands, compatible stronger rules, history, and evidence. Follow `docs/TOVA_MIGRATION.md`, review the migration ledger, and do not retire an old owner until every unique current fact has an accepted destination. Keep workflow migration separate from new product behavior unless a bounded repair is required to preserve an existing check or behavior.

## Required Workflow

1. Read Execution State and Current Task; load compact Current State only when broader context is needed.
2. Confirm whether work changes portable core, installer/checker behavior, acceptance fixtures, package docs, or an optional overlay.
3. Use the smallest repository route when the source layout is unfamiliar; inspect direct sources if it is stale or contradictory.
4. Preserve target-project content, casing, commands, overlays, and in-repository history.
5. Read `docs/DESIGN_LANGUAGE.md` before changing user-visible design, reusable UI surfaces, interaction text, or product copy.
6. Change the package source and focused tests together; do not patch disposable temp installations as the durable fix.
7. Track active or paused work in one named section of `docs/CURRENT_TASK.md`.
8. Run the gate declared by Project Health and report the exact result.

Preserve an unfinished paused checklist in Current Task. When it completes, remove or collapse it and place detailed history in Git, `docs/DOC_CHANGE_LOG.md`, archives, or the relevant truth owner. Do not update broad status, feature/capability, architecture, handoff, or change-log documents for every small step.

When the owner says work will be handed to ChatGPT, Claude, a GitHub agent, a local model, another Codex session, or any AI without reliable prior context—or asks for more context for assigned Slices—treat it as an explicit cold-agent handoff request. Follow `docs/handoffs/README.md`. Create or reuse a revision-backed Campaign Context Capsule from `docs/templates/CAMPAIGN_CONTEXT_CAPSULE_TEMPLATE.md` and prepare one bounded Slice Execution Packet per assigned Slice from `docs/templates/SLICE_EXECUTION_PACKET_TEMPLATE.md`. Use `compact`, `expanded`, or `auto` as requested; if unspecified, prefer `expanded` for a cold agent.

On the first agent run in a newly initialized target, inspect repository evidence before asking discovery questions. If the user is unsure, offer two or three plausible options plus one conservative default, explain tradeoffs briefly, and keep the result labeled until the user confirms it.

Before creating or redirecting a build root, classify its exact path under the Work Model as shared/reused, Slice-ephemeral, or intentionally retained. Prefer stable reused roots. Record the cleanup action before creating an isolated root, then remove only that exact Slice-owned ephemeral path after final evidence. Gitignored never means safe to delete; dependencies, shared caches, snapshots, checkpoints, run evidence, releases, handoffs, unknown paths, and another active owner's output retain their normal ownership.

For complex work, plan before execution. A ready Slice names its goal, files to inspect/edit, exact change, non-goals, risks, rollback, verification, owner updates, stop conditions, and expected report. Split broad shared-file clusters before execution when the child boundaries are already visible. Execute one Slice at a time, narrow when appropriate, and stop for contradictory ownership, destructive ambiguity, or failures outside the bounded Slice.

## Package Boundaries

- Existing target owners are reused; missing owners are created from `project-workflow/core/templates/`.
- Retired generation 1 files move to the target's `archive/old-projects/` with unchanged bytes.
- Optional modules and overlays are not universal boot owners and are never enabled merely because they ship in the package.
- The optional `project-workflow/modules/app-build-assurance/` module provides maintained-app product, architecture, data, review, testing, and lifecycle contracts without changing the universal core or becoming enabled by file presence.
- Installation identity is written only after independent target-local acceptance evidence plus a fresh workflow check.
- Handoff packages point to authoritative project owners and remain transfer artifacts; they never become a second task, truth, history, or acceptance owner.
- Retained outputs point to authoritative project owners and remain convenience artifacts; they never become a second task, truth, history, or acceptance owner.
- Git owns exact history and rollback. Release, publication, target mutation, commit, and accepted-baseline promotion remain explicit owner decisions.
- Serial work keeps one active branch and moves one writer lease. Parallel source writers use distinct branches and isolated checkouts; read-only verification may fan out only against one exact revision.
- Volatile Action progress belongs in a pull-request checkpoint or ignored `.tova-runtime/`, not durable Execution State.
- Agent Notes and Exchanges point to current owners and exact source/test revisions; they do not replace tasks, history, or acceptance.

## Hard Rules

- Do not overwrite a target owner or silently normalize target casing.
- Do not invent product claims, commands, capabilities, completed work, or acceptance history.
- Do not treat an AI-suggested first-run answer as confirmed goal or architecture truth without the user's selection or confirmation.
- Do not leave retired resume, task-state, ranked-next, or duplicate bug-process files live.
- Do not claim a separate human/fresh-model review from the deterministic installed-only cold-start audit.
- Do not publish or promote a baseline from this release-candidate package without owner approval.
- Do not package secrets, credentials, personal/user data, signing material, caches, dependencies, build output, or unrelated files into `docs/handoffs/`.
- Do not place secrets, personal/user data, dependencies, caches, routine build output, or artifacts already owned elsewhere into `docs/outputs/`.
- Do not run background or mid-build cleanup, and do not infer a deletion policy from `.gitignore`.
- Do not implement or imply the shelved deterministic Workflow Controller merely because its continuity contracts are present.
