# ToVA Universal Development Starter Kit

## Start here

Copy this starter kit into the repository you want to work on, then point your AI agent at this `README.md`. The agent should follow `docs/TOVA_SETUP.md` to inspect the target repository and install the workflow safely.

For an existing repository, use the included installer rather than overwriting its files blindly. It first makes a zero-write plan, preserves existing project truth, and applies only the missing workflow owners after you review that plan.

Workflow version: `2.0.0-rc.11-dev`
Architecture generation: 2
Release status: unassembled successor; not published

This is the self-contained distribution mirror of ToVA Project Workflow: a documentation, planning, verification, and continuity layer for long-running development repositories. It supports a target project's product and architecture; it does not redefine that project as a repository operating system.

Existing repositories are migration sources, not alternate ToVA standards. This current Starter Kit defines the target ToVA workflow contract; preservation-first automation protects project information and user work while deliberate reconciliation adopts the current baseline. Preserve project truth and compatible local improvements, retain distinct declared extensions, and never retire a document before its unique current content has an accepted destination. Use `docs/TOVA_MIGRATION.md` with Setup for established adoption or upgrades.

## Safe Installation

Do not copy unfinished placeholder files over an existing repository. Use the version-aware installer so current project owners, commands, casing, and bytes are discovered before mutation.

Follow `docs/TOVA_SETUP.md` for the complete blank, established, legacy, and upgrade path, including full-core population, acceptance evidence, finalization, and normal use.

For established or older-version targets, read `docs/TOVA_MIGRATION.md` before approving the dry-run. Create-only does not mean the old workflow remains authoritative.

For older ToVA-enabled repositories, use the **Upgrade An Older ToVA-Enabled Repository** checklist in that guide. Upgrade one repository at a time from this current Starter Kit; never reuse another repository's dry-run `planHash`, acceptance evidence, manifest, classification, or proof.

From this folder:

```powershell
npm.cmd run workflow:install -- --help
npm.cmd run workflow:install -- --root C:\path\to\project --phase dry-run
npm.cmd run workflow:install -- --root C:\path\to\project --phase apply --plan-hash <hash-from-reviewed-dry-run>
npm.cmd run workflow:install -- --root C:\path\to\project --phase finalize --acceptance-evidence .project\workflow-acceptance.json
```

Dry-run performs zero writes. Apply creates only missing owners and archives retired generation 1 owners inside the target repository. Finalize writes installation identity only after independently produced target-local acceptance evidence and a fresh workflow check pass.

After apply, a fresh AI agent uses `docs/PROJECT_DISCOVERY.md` only while project definition remains open. It asks five grouped founder-friendly questions and, when an answer is unclear, inspects the repository before offering two or three options plus one conservative default. Confirmed answers are written into the existing goal, architecture, state, task, and health owners; the discovery file never becomes a duplicate answer ledger.

## Included Package

- `project-workflow/`: versioned core, create-only templates, schemas, optional app-build-assurance module, and acceptance evidence
- `tools/`: checker, installer, and disposable fixture campaign
- `tests/` and `test-fixtures/`: focused installer and F1-F4 migration proof
- `.project/` and `docs/`: the starter package's own generation 2 continuity owners and reference workflow
- `.project/EXECUTION_STATE.json`, `.project/DEVELOPMENT_NODES.json`, and `docs/COLLABORATION_PROTOCOL.md`: durable cross-environment routing, serial writer-lease transfer, parallel isolation, and exact-revision rules
- `docs/REPOSITORY_INDEX.*`: checked navigation-only routes to canonical owners, source, tests, proof, and conditional references
- `docs/DESIGN_LANGUAGE.md`: project visual character, reusable UI/template/source locations, typography, control patterns, accessibility defaults, terminology, and user-facing copy style
- `docs/agent-notes/` plus Exchange, Campaign Capsule, Slice Packet, and receipt templates: sparse observations, adaptive cold-agent context, and verified return artifacts
- `docs/handoffs/`: portable transfer-package contract for AI-to-AI, AI-to-Codex, cross-session, and cross-machine exchanges
- `docs/outputs/`: portable workspace contract for intentionally retained non-handoff reports, analyses, exports, and other deliverables
- `docs/PROJECT_DISCOVERY.md`: the conditional five-question first-run protocol and writeback map
- `docs/TOVA_SETUP.md`: the conditional complete deployment, initialization, acceptance, use, and upgrade guide
- `docs/TOVA_MIGRATION.md`: the conditional migration doctrine, reconciliation, extension, retirement, nested-root, and acceptance owner
- `docs/ARCHITECTURE.md`: current package construction and responsibility boundaries
- `docs/CURRENT_CAPABILITIES.md` / `docs/FUTURE_CAPABILITIES.md`: supported and desired end-to-end outcomes
- `docs/CURRENT_FEATURES.md` / `docs/FUTURE_FEATURES.md`: implemented and proposed concrete mechanisms
- `overlays/website/`: preserved website-specific UX, accessibility, connector, and quality guidance
- `overlays/integrations-and-operations/`: optional connector, error/logging, and general development guidance removed from universal boot ownership
- `archive/old-projects/`: exact generation 1 history retired from the live package

## Package Checks

```powershell
npm.cmd run workflow:check
npm.cmd run workflow:collaboration-check
npm.cmd run workflow:fixtures
npm.cmd test
```

The fixture command mutates only disposable operating-system temp copies. Package checks do not authorize publication, Git commit, target-repository installation, or baseline promotion.

## Workflow Shape

- `docs/CURRENT_TASK.md` is the sole live checklist owner.
- `docs/WORK_MODEL.md` owns Campaign, Slice, and Sub-slice policy.
- `docs/PROJECT_HEALTH.md` owns proportional verification and real package commands.
- `.project/EXECUTION_STATE.json` holds the compact durable execution pointer; `.project/CURRENT_STATE.md` holds broader compact project truth.
- `.project/DEVELOPMENT_NODES.json` holds safe routing capabilities without credentials; `.project/ACTIVE_AGENT_WORK.md` is compatibility-only.
- `docs/COLLABORATION_PROTOCOL.md` owns serial/parallel writer rules, Agent Notes, Exchange v2 with v1 compatibility, adaptive context profiles, and volatile Action-state rules.
- `docs/handoffs/README.md` owns explicit transfer packaging and receipt checks; it never replaces current project owners.
- `docs/outputs/README.md` owns retained non-handoff work-product conventions; outputs never replace current project owners or acceptance evidence.
- `docs/PROJECT_DISCOVERY.md` owns first-run questions only while project definition is open; confirmed answers move into existing project owners.
- `docs/TOVA_SETUP.md` owns deployment-to-acceptance and upgrade guidance only while setup is in scope; routine agents do not load it afterward.
- `docs/ARCHITECTURE.md` owns construction; capability owners explain complete outcomes; feature owners inventory concrete mechanisms.
- `docs/KNOWN_BUGS.md`, `docs/lessons/`, and `docs/DOC_CHANGE_LOG.md` retain durable defects, reusable lessons, and milestone history.
- Git is the exact history and rollback source.

The completed `2.0.0-rc.10` manifest, checksums, automated mirror evidence, limitations, and owner decision packet live under `project-workflow/releases/2.0.0-rc.10/` and remain immutable history. The live `2.0.0-rc.11-dev` successor has no release packet, checksums, or approval claim until its named release-assembly Slice. The `2.0.0-rc.1` through `2.0.0-rc.9` directories also remain immutable history.
