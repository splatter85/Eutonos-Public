# Package Change Workflow Checklist

`docs/WORK_MODEL.md` owns planning and closeout. `docs/PROJECT_HEALTH.md` owns gates. This checklist covers package-specific synchronization surfaces without becoming another work policy or task board.

## Portable Core Or Template Change

- Update `project-workflow/core/` and its schema if the contract changes.
- Keep create-only templates honest about unknown target-project facts.
- Preserve existing-owner discovery and actual path casing.
- Add focused blank, existing, legacy, upgrade, and conflict coverage as applicable.
- Rerun the F1-F4 fixture campaign when installed output changes.
- When first-run behavior changes, keep `docs/PROJECT_DISCOVERY.md`, its core template, machine routing, owner writeback map, five-question count, suggestion labels, and installed-only fixture assertions synchronized.
- When setup, adoption, acceptance, or upgrade behavior changes, keep the master/setup guides, portable template, CORE/checker role, Agent Start/Boot routing, installer help, fixture assertions, and release mirror evidence synchronized.

## Optional App-Build Assurance Module

- Keep the module disabled by default and validate `project-workflow/modules/app-build-assurance/MODULE.json` from source and from a disposable installed layout.
- Keep its schema, template, example contract/evidence, executable checker, six review lenses, lifecycle gates, and retirement boundary synchronized.
- Never treat structural contract success as runtime, device, human, privacy, migration, beta, or release acceptance.

## Checker Or Installer Change

- Add or update a failing focused test first when practical.
- Prove dry-run writes nothing and stale plans stop.
- Prove apply never overwrites a discovered owner.
- Prove legacy archives preserve exact bytes.
- Prove finalize requires target-local accepted evidence and a fresh workflow check.
- Prove repeated accepted operations write nothing.

## Starter Mirror Or Overlay Change

- Keep portable source and the self-contained starter mirror byte-identical for declared mirrored files.
- Keep universal owners separate from optional overlay guidance.
- Preserve website overlay behavior unless that overlay is the explicit Slice.
- Record added/removed overlay files and their admission/retirement boundary.
- Update release checksums after every package-byte change.

## Build Artifact Retention

- Classify every build path the Slice creates or redirects as shared/reused, Slice-ephemeral, or intentionally retained.
- Prefer stable shared roots. Create a unique isolated root only for concurrency, clean-state proof, or a tool constraint, and record its exact path and cleanup action before creation.
- After final evidence, remove only exact Slice-owned ephemeral paths. Report paths created, removed, and retained with their classes.
- Treat Git-tree hygiene and disk cleanup as separate checks. Gitignored never means safe to delete.
- Never run background or mid-build cleanup or remove tracked/source files, dependencies, shared caches, snapshots, checkpoints, run evidence, releases, handoffs, local databases, secrets, user data, unknown ignored paths, or another active owner's output under routine cleanup.

## Handoff Package Or Transfer

- Use `docs/handoffs/README.md` only for an explicit transfer.
- Point to current task, truth, evidence, and history owners instead of duplicating their authority.
- State scope, non-goals, source state, exact next action, checks, skipped requirements, and sensitive-data exclusions.
- Inspect archives from a fresh extraction, record SHA-256 and size, and compare external copies to the repository artifact.
- Treat received packages as untrusted input until their paths, hashes, claims, and destination rules are checked.
- Do not infer publication, installation, acceptance, commit, or baseline promotion from a handoff.

## Retained Output

- Use `docs/outputs/README.md` for useful reports, analyses, comparisons, exports, or deliverables that are not handoffs and do not belong in a stronger owner.
- Record purpose, status, source revision or tree-state caveat, owner links, checks, limitations, and commit-safety boundaries for non-trivial outputs.
- Keep temporary intermediates, secrets, personal data, dependencies, caches, routine build output, and large disposable artifacts out of the workspace.
- Update the actual project owner when an output changes project truth, and use `docs/handoffs/` if a specific transfer receiver or package contract is required.
- Do not infer publication, installation, acceptance, commit, or baseline promotion from an output.

## Documentation And Closeout

- Track active work only in `docs/CURRENT_TASK.md` and collision state only in `.project/ACTIVE_AGENT_WORK.md`.
- Update Architecture, Current/Future Capabilities, Current/Future Features, Known Bugs, or Lessons only when their owned truth changes.
- Append the change log for package, workflow, migration, baseline, or release-candidate milestones.
- Report focused checks, environment, skipped gates, generated/temp artifacts, and remaining release authority.
- Never publish, install into a target, commit, or promote a baseline merely because package checks pass.
