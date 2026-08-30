# ToVA Help

Use this guide when you want to know where a project fact belongs, how an idea becomes verified current truth, or what to ask an agent next.

ToVA keeps durable project truth in the repository instead of relying on chat memory. Architecture, capabilities, features, active work, checks, decisions, handoffs, and retained outputs have different owners.

If the workflow is being deployed, fully initialized, adopted into an established repository, accepted, or upgraded, follow `docs/TOVA_SETUP.md` first. For established-repository adoption or any older/legacy ToVA layout, use `docs/TOVA_MIGRATION.md` with Setup. This page is the shorter everyday-use guide.

In the ToVA repository, run `npm.cmd run tova:help` to print this page. In an initialized project, read its installed help owner.

## Architecture, Capabilities, And Features

- **Architecture** answers: How is the system built, which components interact, and where do source, runtime, data, host, generated-output, and integration responsibilities live?
- **Capability** answers: What complete outcome or process can the product/application perform?
- **Feature** answers: Which concrete token, macro, tool, command, adapter, target, app, or other mechanism implements part of that outcome?

One capability usually depends on several features. A feature can exist structurally without establishing a complete capability.

The word capability also appears in technical target maps, package permissions, host classifications, and effect declarations. The Current/Future Capabilities documents use capability to mean a product/application outcome unless they say otherwise.

## Design And User-Facing Language

`docs/DESIGN_LANGUAGE.md` answers a different set of questions: What should user-visible surfaces look and feel like? Which tokens, components, controls, templates, assets, and string sources should be reused? Which fonts, semantic sizes, states, terminology, and copy patterns apply?

Read it before visual/UI or user-facing copy work. Update it when an accepted reusable rule or canonical path changes. Keep app-specific implementation in its token/component/template/string source, and keep visual or human acceptance in the applicable proof owner.

## The Everyday Workflow

```text
Future outcome or proposed mechanism
  -> Future Capabilities or Future Features
  -> Campaign or Slice plan
  -> Current Task
  -> Execute one Slice or Sub-slice
  -> Verify the claimed result
  -> Current Features for concrete implemented mechanisms
  -> Current Capabilities when the supported outcome changed
  -> Architecture when system structure or ownership changed
  -> Change log / compact state for a meaningful milestone
```

The documents have different jobs:

- `docs/ARCHITECTURE.md` owns current construction and responsibility boundaries.
- `docs/DESIGN_LANGUAGE.md` owns reusable visual/UI routes, typography, interaction patterns, terminology, and user-facing copy style.
- `docs/FUTURE_CAPABILITIES.md` remembers desired end-to-end outcomes that are not current claims or ordered work.
- `docs/FUTURE_FEATURES.md` remembers proposed concrete mechanisms that are not implemented current features.
- `docs/CURRENT_TASK.md` is the single live board for admitted active/paused work and the next action.
- `docs/CURRENT_FEATURES.md` inventories concrete implemented mechanisms.
- `docs/CURRENT_CAPABILITIES.md` explains supported end-to-end outcomes, their process, evidence, and limitations.
- `docs/DOC_CHANGE_LOG.md` records meaningful completed documentation, workflow, architecture, capability, or feature milestones.

When work ships, update only the owners whose truth changed. A new command may change Current Features without creating a new capability. A new complete workflow may change both. A new layering or ownership boundary may also change Architecture.

## Online, Local, And Multi-Machine Work

Cross-environment coordination has separate human-readable and machine-readable owners:

- `CURRENT_TASK.md` - approved work, paused work, next Slice, and stable local/external verification IDs;
- configured `EXECUTION_STATE.json` - durable mode, active Campaign/Slice, writer lease, integration branch, Exchange, relevant Agent Notes, owned paths, and checkpoint;
- active Slice - bounded behavior, Actions, checks, and stop conditions;
- PR checkpoint or ignored `.tova-runtime/` journal - exact in-progress Action state;
- `COLLABORATION_PROTOCOL.md` - online/local roles, development nodes, writer/branch rules, Notes, Exchanges, review mode, and recovery.

Serial work keeps one active branch and moves one writer lease between environments after a durable checkpoint. Several nodes may verify the same exact revision read-only. Parallel source writers use distinct work branches and isolated checkouts, then return through integration review.

Use an Agent Note for a bounded observation that may matter after a session boundary but is not yet truth. Use a v2 Exchange for an explicit execution transfer that pins source revision, mission/authority, capabilities, workspace strategy, required checks, returned evidence, and integration review. Use a generic handoff package when portable context or payload files are needed without execution authority.

The future Workflow Controller may automate these mechanics, but the current workflow remains human-readable and agent-operable without it.

## Campaigns, Slices, And Sub-slices

A **Campaign** coordinates several dependent outcomes, shared surfaces, multiple sessions or owners, or one meaningful end-to-end acceptance boundary.

A **Slice** is the smallest coherent outcome that can be changed, verified, documented, and reported without taking ownership of unrelated work.

A **Sub-slice** is a child created after inspection reveals separate owners, risks, transactions, consumers, or verification gates inside a planned Slice. It is not merely a list of implementation steps.

Use the lightest useful shape:

- Local polish with no shared behavior or risk boundary: handle directly.
- One coherent feature, capability improvement, architecture change, or fix: use one Slice.
- Several dependent outcomes: use a Campaign with ordered Slices.
- A Slice proves too broad: split it and execute only the first unblocked child.

`docs/WORK_MODEL.md` owns the formal definitions and closeout policy.

When a cold agent knows the intended work but not the repository layout, use the smallest matching route in `REPOSITORY_INDEX.json`. Its paths reduce discovery cost; they do not grant authority or replace Architecture, Current Task, Project Health, or direct source inspection.

## What To Ask An Agent

### Remember a desired outcome

```text
Add this to Future Capabilities: <outcome>.
Explain who needs it, the intended process, dependencies, and what proof would be required before it becomes current.
```

### Remember a proposed mechanism

```text
Add this to Future Features: <mechanism>.
Explain what capability it could enable, why it matters, dependencies, and what is explicitly out of scope.
```

### Choose work from the backlog

```text
Review Future Capabilities and Future Features for <goal>.
Inspect the repository, identify the smallest coherent outcome, explain dependencies and risks, and recommend a Slice or Campaign. Planning only.
```

### Plan a Slice

```text
Create a Slice plan for <goal>.
Inspect Architecture, Current Capabilities, Current Features, and the relevant future owner first. Put the live plan in Current Task with files, exact change, non-goals, risks, gate, docs updates, and stop conditions. Do not implement yet.
```

### Execute safely

```text
Do Slice <id>.
Inspect the planned files first. If the Slice is too broad, split it in Current Task and complete only the first unblocked child. Run its gate, update only changed truth owners, and stop.
```

### Check status or resume

```text
Where are we? Read Execution State, Current Task, compact state, Current Capabilities, and the relevant Architecture/Feature/Future owners. Tell me what is true, what is active, what remains deferred, and the next sensible request.
```

### Inspect a claim

```text
What current capability supports <outcome>? Show the process, enabling features, evidence, limitations, and any architecture boundary that matters.
```

## Concrete Promotion Examples

Suppose Future Capabilities says “Users can export and reopen documents offline,” while Future Features proposes a file format, save adapter, open adapter, migration rules, and recovery tests.

1. Plan the smallest Slice or Campaign in Current Task.
2. Implement concrete mechanisms in durable source.
3. Verify save, restart, reopen, failure, migration, and recovery behavior at the claimed boundary.
4. Move the implemented mechanisms into Current Features.
5. Move the outcome into Current Capabilities only when the complete supported process is proven.
6. Update Architecture only if persistence ownership, data flow, adapters, or generated boundaries changed.
7. Remove or narrow the completed future wording.

That prevents a partial feature from being mistaken for a complete capability.

## Useful Requests

- `ToVA help` - show this workflow guide.
- `Status from ToVA docs` - summarize durable current truth and the next action.
- `Explain the architecture` - summarize how the current system is built and link deeper technical owners.
- `What can it do today?` - summarize Current Capabilities with limitations.
- `What concrete features implement <capability>?` - trace an outcome to its mechanisms and evidence.
- `Create a slice plan for <goal>` - plan one bounded outcome.
- `Create a campaign plan for <goal>` - plan several dependent Slices.
- `Do the next slice` - execute one ready Slice and stop after its gate.
- `Split this slice` - create coherent Sub-slices after inspection.
- `Prepare a handoff` - create a transfer package only for an explicit receiver.
- `Save this as an output` - retain a useful non-handoff work product without replacing stronger truth.

## Guardrails

- A plan is not implementation; a checked box is not verification; a build is not release approval.
- A structural token, target-map entry, scaffold, or generated artifact is not automatically a product capability.
- Work one Slice at a time unless a coordinated Campaign explicitly requires otherwise.
- Use Current Task for live work, not handoffs, outputs, changelogs, capability documents, or feature documents.
- When a Current Task checklist is complete, remove or collapse it; leave only active work, paused work, the next candidate, and history pointers.
- Do not duplicate the same current fact across Architecture, Capabilities, and Features; link between owners.
- Do not run baseline acceptance, publish, install into another project, or delete artifacts merely because a Slice is complete.
- Classify every created or redirected build path as shared/reused, Slice-ephemeral, or intentionally retained. Gitignore is not deletion permission.

## Core Owners And Checks

- `AGENTS.md` - repository-specific working rules.
- `docs/TOVA_SETUP.md` - conditional deployment, full-core initialization, acceptance, and upgrade guide.
- `docs/TOVA_MIGRATION.md` - established-repository reconciliation, extension, retirement, and migration acceptance doctrine.
- `docs/README.md` - document ownership map.
- `docs/ARCHITECTURE.md` - current construction and boundaries.
- `docs/DESIGN_LANGUAGE.md` - visual/UI reuse, typography and sizing, interaction patterns, terminology, and user-facing copy.
- `docs/CURRENT_CAPABILITIES.md` / `docs/FUTURE_CAPABILITIES.md` - supported and desired outcomes.
- `docs/CURRENT_FEATURES.md` / `docs/FUTURE_FEATURES.md` - implemented and proposed mechanisms.
- `docs/CURRENT_TASK.md` - active/paused work and next action.
- `docs/WORK_MODEL.md` - Campaign, Slice, and Sub-slice policy.
- `docs/COLLABORATION_PROTOCOL.md` - online/local/multi-node execution and Exchange policy.
- configured `EXECUTION_STATE.json` - durable machine-readable live work and writer state.
- `docs/PROJECT_HEALTH.md` - proportional verification gates.
- the configured boot and compact-state owners - ordered startup and concise current truth.
- `docs/handoffs/README.md` and `docs/outputs/README.md` - conditional transfer and retained-output rules.

Useful ToVA commands include `npm.cmd run agent:start`, `workflow:check`, `architecture:check`, `token:explore`, `snapshot:check`, and `verify`. Read `docs/AI_AGENT_HELPERS.md` for the full command map.
