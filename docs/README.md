# Documentation Map

- `docs/PROJECT_GOALS.md`: project purpose, users, success criteria, constraints, and non-goals
- `docs/ARCHITECTURE.md`: durable source ownership, components, generated output, and integration boundaries
- `docs/REPOSITORY_INDEX.md` and `docs/REPOSITORY_INDEX.json`: navigation-only routes to exact owners, source, tests, proof, and conditional references
- `docs/WORK_MODEL.md`: Campaign, Slice, Sub-slice, readiness, execution, pause, and closeout rules
- `docs/CURRENT_TASK.md`: sole live active/paused checklist
- `docs/CURRENT_CAPABILITIES.md`: supported end-to-end product/application outcomes, processes, evidence, and limitations
- `docs/CURRENT_FEATURES.md`: concrete implemented mechanisms such as commands, controls, adapters, formats, and target operations
- `docs/FUTURE_CAPABILITIES.md`: desired end-to-end outcomes that are not current claims or ordered work
- `docs/FUTURE_FEATURES.md`: proposed concrete mechanisms that are not implemented current features
- `docs/PROJECT_HEALTH.md`: proportional gates and commands that actually exist
- `docs/KNOWN_BUGS.md`: bug lifecycle and durable defect ledger
- `docs/lessons/README.md`: reusable lessons and routing
- `docs/DOC_CHANGE_LOG.md`: append-only workflow/document milestones
- `docs/TOVA_SETUP.md`: conditional deployment, full-core initialization, established-repository adoption, acceptance, and upgrade guide
- `docs/TOVA_MIGRATION.md`: conditional established-repository adoption, older-version reconciliation, extension admission, retirement safety, and migration acceptance doctrine
- `docs/TOVA_HELP.md`: practical guide to Architecture, Capabilities, Features, Current Task, and how to request Campaigns, Slices, and Sub-slices
- `docs/DESIGN_LANGUAGE.md`: visual character, reusable UI/source locations, typography and sizing, control patterns, accessibility defaults, terminology, and user-facing copy style
- `.project/EXECUTION_STATE.json`: durable machine-readable mode, active Slice, writer/branch, Exchange, relevant Notes, owned paths, and checkpoint
- `docs/COLLABORATION_PROTOCOL.md`: online/local roles, development nodes, writer rules, Action checkpoints, Notes, Exchanges, and recovery
- `docs/agent-notes/README.md`: sparse non-authoritative working-memory rules
- `docs/handoffs/README.md`: cross-AI, cross-session, and cross-machine handoff package contract and safety workflow
- `docs/outputs/README.md`: retained non-handoff reports, analyses, exports, and other bounded work products
- `docs/PROJECT_DISCOVERY.md`: conditional five-question first-run interview and evidence-based suggestion protocol; answers belong in the goal, architecture, state, task, and health owners

Machine/startup owners live under `.project/`. The boot order is owned only by `.project/PROJECT_BOOT_PROTOCOL.md`.

## Baseline Owners, Project Extensions, And Evidence

The owners above are the ToVA baseline. A project-specific extension remains live only when it declares its purpose, what it owns and does not own, when it is read and updated, what baseline owner it extends or complements, and why that baseline owner cannot cleanly own the same truth. Historical and acceptance collections preserve evidence; they do not become current task, workflow, architecture, capability, or feature authorities.

Conditional templates live under `docs/templates/`: Roadmap for dependency-ordered strategy, Acceptance Workspace for durable claim-scoped evidence, and Capability Maturity for multi-environment/platform readiness. Admit them only when their distinct-role criteria are true. App Build Assurance separately offers a final release-acceptance template.
