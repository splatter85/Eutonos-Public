# Current Features

This is the concrete implementation inventory for the portable workflow package. Complete supported package workflows belong in `CURRENT_CAPABILITIES.md`; structure and ownership boundaries belong in `ARCHITECTURE.md`.

## Portable Generation 2 Core

- Versioned `CORE.json` manifest with create-only/reuse-aware owner roles, including checked repository route indexes, Execution State, safe Development Nodes, Collaboration Protocol, Agent Notes, Exchanges/receipts, adaptive context templates, and separate Setup, Migration, Architecture, Design Language, Current/Future Capabilities, and Current/Future Features owners.
- Templates for boot, compact state, durable execution, compatibility active work, development nodes, collaboration, Agent Notes, Exchanges, receipts, discovery, goals, architecture, design/copy language, capability/feature truth, work policy, task, handoffs, outputs, health, bugs, lessons, history, and Campaign/Slice plans.
- The Agent Contract treats an owner-announced transfer to ChatGPT, Claude, a GitHub agent, a local model, another Codex session, or any AI without reliable prior context as a cold-agent handoff trigger. It routes the agent to `docs/handoffs/README.md`, the indexed Capsule/Packet templates, and expanded-by-default context when no profile is requested.
- Exact preservation of discovered project owners and actual `docs`/`Docs` plus `.project`/`.tova` casing.
- Schema-backed optional-module admission, health, example, and retirement contracts; no module is enabled by default.

## Installer And Checker

- Deterministic explicit-root discovery/dry-run, plan hashing, semantic role suggestions, nested-project exclusion, exact-plan bootstrap, ledger-gated retire, accepted-evidence finalize, supported upgrade classification, and idempotent repeat operations.
- Owner-collision, stale-plan, unavailable-command, occupied-archive, newer-version, and case-only path guards stop before writes.
- `workflow:check`, `workflow:migration-check`, five-phase install tools, real `workflow:install -- --help` usage, machine-readable upgrade contracts and ledgers, and migration-evidence-aware installation identity.
- `workflow:collaboration-check` with Action Registry, repository-route, context-profile, one-writer lease, safe-node, v1/v2 Exchange lifecycle/workspace/authority, exact tested-revision, return-accounting, terminal-pointer, and durable/volatile-state validation.

## Guidance And Coordination Owners

- TOVA Help explains Architecture versus Capabilities versus Features and the future-to-task-to-proof-to-current promotion flow.
- TOVA Setup gives humans and agents one conditional path through blank, established, legacy, and upgrade deployment; full-core population; target-local acceptance; finalization; and everyday-use handoff.
- TOVA Migration owns current-baseline precedence, project-truth preservation, role-first reconciliation, extension admission, content-gated retirement, and independent nested-root rules.
- Agent Start, boot, compact state, navigation-only repository index, durable Execution State, safe Development Nodes, compatibility active-work pointer, Collaboration Protocol, Agent Notes, Exchange/receipt/context templates, Work Model, Project Health, Current Task, documentation map, discovery, handoff, output, lesson, bug, and change-log owners.
- Five-question first-run discovery with repository-evidence-first options, a conservative default, and explicit uncertainty labels.
- Campaign and Slice templates with readiness, verification, stop, owner-update, artifact-retention, Action Registry, repository-route, and cold-agent context fields.

## Artifact, Handoff, And Output Controls

- Shared/reused, Slice-ephemeral, and intentionally retained build-path classifications.
- Explicit Gitignore-versus-deletion boundary and exact-path cleanup rules.
- Handoff sender/receiver, lifecycle, sensitive-data, and archive-integrity fields.
- Retained-output provenance, owner-link, check, limitation, safety, and lifecycle fields.

## Fixtures, Tests, And Release Evidence

- F1-F4 baseline fixtures plus F5 mature versioned upgrade, F6 mature native adoption, and F7 nested independent-project disposable fixtures.
- Installed-only cold-start audit, preservation hashes, real-command health execution, installation finalization, and idempotency assertions.
- Exact source/starter mirror checks and starter payload SHA-256 manifests for each release candidate.
- Website and integrations/operations overlays kept outside universal boot ownership.

## Optional App-Build Assurance Module

- Disabled-by-default removable module with schema, contract template, example evidence, six review lenses, checker, health command, final release-acceptance template, and retirement boundary.
- Conditional Roadmap, acceptance-workspace, and capability-maturity templates remain outside universal boot and require a distinct-role rationale.
- Fail-closed checks for missing evidence, unsafe durable-data positions, missing review lenses, and unsupported beta/release claims.

Limit: these mechanisms support the package capabilities described in `CURRENT_CAPABILITIES.md`; they do not by themselves establish owner approval, publication, target acceptance, or portable-baseline promotion.
