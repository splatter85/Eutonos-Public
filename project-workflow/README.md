# ToVA Project Workflow Portable Package

- Version: `2.0.0-rc.11-dev` (unassembled successor; `2.0.0-rc.10` remains immutable historical evidence)
- Architecture generation: 2

This package is the reusable documentation, planning, verification, and continuity layer proven first in the ToVA repository. It supports a project's product and architecture; it does not redefine that project as a repository operating system.

Start with `docs/TOVA_SETUP.md` in the ToVA repository or starter package for the complete blank, established, legacy, and upgrade journey. This file remains the deeper installer implementation contract.

## Package Layout

- `core/CORE.json` declares the versioned core roles, including the project Design Language owner, navigation-only repository indexes, Execution State, safe Development Nodes, Collaboration Protocol, Agent Notes, Exchange/receipt/context templates, workflow help, handoffs, retained outputs, and first-run project discovery, plus default targets, compatible existing-owner candidates, retired generation 1 paths, and the in-repository archive root.
- `core/templates/` contains conservative create-only templates. They state unknowns honestly and never replace a discovered project owner.
- `schemas/installation-manifest.schema.json` defines finalized installation identity; `schemas/upgrade-contract.schema.json` defines release-to-release migration metadata.
- `releases/<version>/UPGRADE.json` is the machine authority for supported source versions, version chains, owner/schema/state/module changes, reconciliation requirements, fixtures, gates, and rollback boundaries. `UPGRADE.md` explains the operator path.
- `schemas/module-manifest.schema.json` and `modules/README.md` define optional, removable extensions. No module is enabled by the core package.
- `tools/project-workflow-install.js` in the host ToVA repository provides discover, plan/dry-run, bootstrap/apply, accepted retirement, and finalize phases.
- `tools/project-workflow-migration-check.js` validates accepted reconciliation, extension, retirement, and duplicate-authority boundaries.
- `tools/project-workflow-check.js` validates installed owner, retired-path, meaningful-content, command, and enabled-module contracts.
- `tools/collaboration-workflow-check.js` validates repository routes, Action references, adaptive context selection, the durable/volatile execution split, one-writer lease, safe node metadata, named Notes, and v1/v2 exact-revision Exchange integrity.

## Installer Phases

All target paths are resolved inside the selected repository. No external workflow home is created.

1. `discover` and `dry-run` inspect one explicit project root, report/exclude nested ToVA roots, separate structural facts from non-authoritative semantic role candidates, and perform zero writes.
2. `apply` requires the exact dry-run plan hash. It creates only missing owners, preserves existing bytes/casing, and records migration-pending state for established/legacy/upgrade targets. It does not retire source documents.
3. Reconcile content through the reviewed migration ledger. `workflow:migration-check` blocks unresolved conflicts, unsafe retirement, incomplete extensions, and duplicate canonical authorities.
4. `retire` requires the accepted ledger and archives only entries whose content and reference accounting explicitly mark them safe.
5. Run project-specific workflow, collaboration, health, and cold-start acceptance. `finalize` validates that evidence and the accepted ledger when migration applies, records both hashes, and writes `<state-root>/TOVA_INSTALLATION.json`.

After apply and before finalize, a fresh agent reads the installed owners only. If project definition remains open, `docs/PROJECT_DISCOVERY.md` asks exactly five grouped questions about purpose/users, complete workflows, target/preserved materials, data/integrations, and first-version success/constraints. The agent inspects the repository before asking, offers two or three evidence-based options plus one conservative default when the user is unsure, and writes only confirmed or clearly labeled answers into the existing goal, architecture, state, task, and health owners.

Example from the ToVA package root:

```powershell
npm.cmd run workflow:install -- --help
npm.cmd run workflow:install -- --root C:\path\to\project --phase dry-run
npm.cmd run workflow:install -- --root C:\path\to\project --phase apply --plan-hash <exact-plan-hash>
npm.cmd run workflow:migration-check -- --root C:\path\to\project --ledger .project\migration-ledger.json
npm.cmd run workflow:install -- --root C:\path\to\project --phase retire --migration-ledger .project\migration-ledger.json
npm.cmd run workflow:install -- --root C:\path\to\project --phase finalize --acceptance-evidence .project\workflow-acceptance.json --migration-ledger .project\migration-ledger.json
```

Before collaboration acceptance, ensure `.tova-runtime/` is ignored in the target repository. From the starter-package root, validate the initialized target with:

```powershell
node tools\collaboration-workflow-check.js --root C:\path\to\project
```

The CLI emits JSON and exits nonzero for a stopped phase. A fresh dry-run is required after any target change. Repeating dry-run plus apply after successful application performs zero additional writes; repeating finalize with the same accepted evidence is also a zero-write success.

`--help` or `-h` prints usage without inspecting or changing any target.

## Discovery And Stop Rules

Discovery classifies blank repositories, existing non-ToVA repositories, generation 1 layouts, pending-finalize layouts, installed-current layouts, upgrades, invalid installations, and targets newer than the package. It preserves an existing `docs`/`Docs` and `.project`/`.tova` layout, reports semantic role suggestions as non-authoritative, and excludes detected nested project roots.

Apply stops before writing when the target changed after planning, owner candidates compete, paths differ only by case, an archive target or migration note already exists, an existing Project Health file advertises an unavailable npm script, installation identity is invalid, or the target workflow version is newer. Retirement additionally stops unless the accepted ledger matches the planned migration and authorizes every exact source. Conflicts require an explicit project-owner decision; the installer does not guess.

## Acceptance And Versioning

Installation identity is an acceptance record, not a file-presence marker. Evidence must report `ok: true`, the exact workflow version, a valid acceptance timestamp, the target root when supplied, and at least one completed check. Finalization records the evidence path and SHA-256 digest.

An accepted older installation can be upgraded only through a path declared by the target release's `UPGRADE.json` and after a new acceptance run. The previous installation manifest is archived in-repository, while valid module selections and project Variant identity are preserved. A newer target is never downgraded by this package. Unsupported or unversioned sources use legacy/untrusted discovery and reviewed reconciliation rather than an invented direct path.

Publication, Git commit, project baseline promotion, and `npm.cmd run accept` are separate owner decisions.

## Build Artifact Retention

The portable Work Model classifies every build path a Slice creates or redirects as shared/reused, Slice-ephemeral, or intentionally retained. Stable roots are preferred. An isolated Slice root must have an exact path and cleanup action before creation and is removed only after its final evidence is captured.

Gitignore is not a storage or deletion policy. The workflow does not run background cleanup, treat ignored paths as disposable, or change retention for snapshots, checkpoints, run evidence, releases, handoffs, dependencies, shared caches, or user-designated history.

## Acceptance Fixtures

`npm.cmd run workflow:fixtures` materializes the committed F1 blank, F2 existing non-ToVA, F3 legacy, and F4 customized-legacy sources into disposable operating-system temp directories. It proves preservation, exact-byte archival, actual path casing, real health commands, the installed five-question discovery/suggestion contract, installed-only cold-start answers, finalize identity, repeat-run idempotency, and zero-write adversarial stops. `-- --markdown` prints the human report.

The current first-run discovery fixture run is recorded in `project-workflow/evidence/TOVA8.2_FIRST_RUN_DISCOVERY_ACCEPTANCE.json` and its Markdown companion; historical accepted runs remain alongside it. Automated evidence does not replace separate human release approval and does not authorize baseline promotion or publication.
