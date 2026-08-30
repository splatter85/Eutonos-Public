# Project Health

Use the smallest gate that proves the active Slice. Never list a command unless discovery confirmed it exists.

## Quick Slice

- Manual check: inspect changed files, links, formatting, and the exact behavior or document contract touched.

## Standard Project Health

- Manual check: run the project-specific test/build checks confirmed by the owner, then record the evidence here.

## Full Acceptance

- Manual check: run every confirmed project gate plus release, migration, or baseline evidence required by the active Campaign.

Workflow installation or file presence is not acceptance. Record command output or manual evidence, resolve related failures, and use Full Acceptance only for release/baseline decisions.

When Execution State, repository routes, development nodes, Agent Notes, Exchanges, context packets, or Collaboration Protocol change, run the Cross-Environment Continuity checker from the starter package or target-integrated equivalent. Its PASS proves structural owners/routes, v1/v2 shape, active references, workspace rules, and returned-result consistency only—not lifecycle monotonicity, globally unique IDs, absence of remote writers, a real round trip, or machine capability.

Verification follows semantic impact, not SHA movement alone. An Evidence SHA proves one named claim/domain at the revision and environment where it ran; Current HEAD may advance across non-impacting work. Preserve historical evidence and record whether it remains current by direct proof, documented carry-forward, or a named stale reason. Documentation/planning changes normally carry product proof forward; workflow/tooling/test changes need focused affected-domain scrutiny; product/runtime changes require affected-domain proof; shared security, persistence, middleware, configuration, dependency, test-framework, or artifact-integrity changes may require integration or full proof. Record the Current HEAD, Assignment Base when relevant, Evidence SHA/claim/status, work that may continue, and the smallest next gate in the active Slice, Exchange/PR evidence, report, or handoff.

## Migration Gate

An established-repository adoption or version upgrade cannot finalize on file presence alone. The gate must establish that current-baseline owners exist, the migration ledger is accepted, no unresolved duplicate authority or blocking conflict remains, retirement candidates have accounted for unique current content and updated references, retained extensions declare their baseline relationship, and real project checks remain truthful. Use `docs/TOVA_MIGRATION.md`; when the package provides a migration checker, run it in addition to workflow, collaboration, proportional project, and cold-start checks.

Git-tree hygiene and disk cleanup are separate checks. For every build path created or redirected by the Slice, report its shared/reused, Slice-ephemeral, or intentionally retained class. After final evidence, remove only exact Slice-owned ephemeral paths. Ignored does not mean disposable; retained history, dependencies, shared caches, unknown paths, and another active owner's output are not routine cleanup targets.

When a Slice produces a handoff archive, verify its declared file set, inspect a fresh extraction, record SHA-256, and keep required checks that did not run explicit. An external copy passes only when its hash matches the in-repository package.
