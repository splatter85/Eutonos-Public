# Work Model

Routine work is a small, low-risk edit with an obvious owner and proportional check. A Slice is the smallest coherent behavior, docs, or state change that can be verified and reported independently. A Sub-slice is a child created when a planned Slice proves too broad. A Campaign coordinates several Slices toward one outcome.

Before execution, name the goal, exact behavior, files to inspect/edit, non-goals, risks, verification, required owner updates, and stop conditions. Execute one Slice at a time. Narrow or split when shared files reveal independent feature clusters. Close only after the declared proof passes and the live checklist is truthful. Stop before the next Slice unless it is separately authorized.

Route current construction and responsibility boundaries to `docs/ARCHITECTURE.md`, supported end-to-end outcomes to `docs/CURRENT_CAPABILITIES.md`, concrete implemented mechanisms to `docs/CURRENT_FEATURES.md`, desired outcomes to `docs/FUTURE_CAPABILITIES.md`, and proposed mechanisms to `docs/FUTURE_FEATURES.md`. Current Task alone owns admitted sequencing and live checklists.

`.project/EXECUTION_STATE.json` owns durable machine-readable mode, active Campaign/Slice, writer lease, integration branch, Exchange, relevant Notes, owned paths, and checkpoint. The active Slice owns Actions, behavior, checks, and stop conditions. PR checkpoints or ignored `.tova-runtime/` journals own volatile Action progress. `docs/COLLABORATION_PROTOCOL.md` owns online/local/multi-node writer, node, Note, Exchange, review, and recovery rules.

Source ownership and disk retention are separate. Classify every build-output path a Slice creates or redirects as **shared/reused**, **Slice-ephemeral**, or **intentionally retained**. Prefer stable reused roots. Use a uniquely named Slice-ephemeral root only when isolation, concurrency, clean-state proof, or a tool requires it; record its exact path and cleanup action before creation, then remove only that Slice-owned path after final evidence is captured. Snapshots, checkpoints, run evidence, releases, handoffs, user-designated history, dependencies, and shared caches follow their own owners.

Gitignore keeps files out of source-control diffs; it does not reclaim disk and never proves that a path is safe to delete. Do not run background or mid-build cleanup. If a path is tracked, unknown, shared, active, user-owned, or cannot be confidently classified, retain it and stop for review. Closeout reports paths created, removed, and retained with their classes.

Use `docs/handoffs/README.md` only for an explicit transfer between AIs, Codex sessions, machines, or humans. A generic handoff packages current owner references/payloads; a v2 Exchange assigns bounded execution and returned evidence. Neither becomes a second task board, truth owner, history system, or acceptance record. Campaign Capsule and Slice Packet templates provide compact/expanded navigation context for substantial cold transfers without replacing the plan. Verify archives and exclude sensitive/local-only files before transfer.

## Migration Planning Pattern

A small repository may use one Migration Slice when it has few owners, no active conflicting writer, no customized legacy workflow, no nested project root, and no unresolved content conflict. A mature repository uses a Campaign when reconciliation spans several owners, active work, custom verification, nested projects, retirement candidates with unique content, extensions, or multiple acceptance gates.

The default mature sequence is: inventory; baseline bootstrap; owner reconciliation; extension reconciliation; safe retirement; acceptance and finalization. `docs/TOVA_MIGRATION.md` owns the semantic rules. Migration should not be casually combined with new product behavior.
