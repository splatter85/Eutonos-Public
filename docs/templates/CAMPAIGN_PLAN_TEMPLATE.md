# Campaign Plan Template

Use this template only when the outcome needs several dependent Slices, multiple sessions or owners, shared-surface coordination, or Campaign-level acceptance. For one coherent outcome, use `SLICE_PLAN_TEMPLATE.md`. For local copy, color, or spacing changes without material risk, use Routine Polish and skip formal planning.

Replace bracketed prompts. Keep the short field guidance until planning is reviewed, then remove guidance that no longer helps. `docs/WORK_MODEL.md` owns all definitions and status vocabulary.

## Identity

- **Campaign ID:** `[MNEMONIC + integer, for example DATA4]`
  - Why: gives every child Slice and handoff a stable parent reference.
- **Name:** `[outcome-oriented name, for example Persistence Model Migration]`
  - Why: states the coordinated result, not a vague activity such as "database work."
- **Status:** `[PROPOSED | PLANNED | READY | IN_PROGRESS | PAUSED | BLOCKED | IMPLEMENTED_AWAITING_GATE | AWAITING_ACCEPTANCE | DONE | CANCELLED | SUPERSEDED]`
  - Why: separates current execution state from prose and document lifecycle.
- **Owner:** `[person, team, or session label; for example Data lane]`
  - Why: identifies who reconciles the whole Campaign when Slices have different executors.

## Outcome And Admission

### Outcome

`[Describe the observable state that will be true when the Campaign is done. Example: Existing projects open through the new store, preserve all records, and can roll back without data loss.]`

Why: all Slices must contribute to one shared Campaign result.

### Why Now

`[Name the current need or blocker. Example: The legacy store prevents schema evolution required by the next release.]`

Why: prevents an important but unscheduled idea from silently becoming active work.

### Campaign Admission Evidence

- `[Dependency evidence. Example: schema, write path, read path, migration, and rollback must land in order.]`
- `[Coordination evidence. Example: changes span storage, import, UI state, and release acceptance.]`
- `[Acceptance evidence. Example: final migration and rollback must be proven against a production-shaped fixture.]`

Why: a Campaign is admitted for coordination complexity, not merely because work is large or important.

## Invariants And Non-goals

### Invariants

- `[Condition every Slice must preserve. Example: existing user records remain readable at every checkpoint.]`
- `[Source-of-truth boundary. Example: schema changes live in migrations, never generated snapshots.]`

Why: lets child Slices make local decisions without weakening the Campaign contract.

### Non-goals

- `[Explicit exclusion. Example: no unrelated settings-screen redesign.]`
- `[Deferred capability. Example: no cloud synchronization in this Campaign.]`

Why: blocks attractive adjacent work from expanding acceptance and rollback scope.

## Current Truth And Owners

| Concern | Current owner/source | Why it matters |
| --- | --- | --- |
| `[current behavior]` | `[path or system; example src/storage/legacy-store.ts]` | `[example: authoritative read/write behavior]` |
| `[active status]` | `[example docs/CURRENT_TASK.md]` | `[example: sole live queue]` |
| `[verification]` | `[example docs/PROJECT_HEALTH.md]` | `[example: gate policy owner]` |

Why: planning begins from existing owners and does not create duplicate truth.

## Cold-Agent Context Plan

- **Needed:** `[No | Yes; only for a substantial transfer]`
- **Profile:** `[compact | expanded | auto]`
- **Repository routes:** `[route://... IDs from docs/REPOSITORY_INDEX.json]`
- **Capsule owner/path:** `[planned repository-relative path, or None]`
- **Freshness triggers:** `[architecture, prerequisites, invariants, ownership, routes, or major discoveries]`

Why: a Campaign Capsule reduces cold-start selection risk without copying canonical truth or spending those tokens on every local executor.

## Slice Map

| Slice | Coherent outcome | Depends on | Required gate | Status |
| --- | --- | --- | --- | --- |
| `[DATA4.0]` | `[inventory current schema and recovery boundary]` | `[none]` | `[Quick]` | `[PLANNED]` |
| `[DATA4.1]` | `[add versioned schema and migration contract]` | `[DATA4.0]` | `[Standard]` | `[PLANNED]` |
| `[DATA4.2]` | `[switch production reads with rollback proof]` | `[DATA4.1]` | `[Full]` | `[PLANNED]` |

Why: each row must be independently implementable, verifiable, and reportable. Implementation steps belong inside a Slice, not as fake Slices.

## Dependency And Shared-Surface Rules

- **Required order:** `[example: 4.0 -> 4.1 -> 4.2; 4.3 may run after 4.1]`
- **Shared-file hotspots:** `[paths and consumers; example storage/index.ts is shared by read and write paths]`
- **Collision policy:** `[example: only the active Slice edits storage/index.ts; parallel work stays in isolated fixtures]`
- **Build-root policy:** `[shared/reused roots by default; exact Slice-ephemeral paths and cleanup owners where isolation is required; intentionally retained owners]`
- **External dependencies:** `[people, services, devices, approvals, or none]`

Why: makes sequencing and overlapping ownership explicit before execution.

## Campaign Acceptance

- `[Campaign-level proof. Example: migrate a production-shaped fixture and compare record counts and hashes.]`
- `[Recovery proof. Example: inject failure at each migration phase and restore the original store.]`
- `[Human/external acceptance owner. Example: product owner verifies the upgraded project opens correctly.]`
- **Required Project Health gate:** `[normally Full Acceptance for closeout]`

Why: passing each Slice does not automatically prove the composed Campaign outcome.

## Interruption And Discovery Routing

- **Pause when:** `[example: fixture data cannot be backed up or schema ownership is contradictory]`
- **Route lower-priority discoveries to:** `[CURRENT_TASK later Slice, FUTURE_CAPABILITIES, FUTURE_FEATURES, KNOWN_BUGS, or lessons owner]`
- **Exact resume pointer:** `[file, section, command, or next Slice]`

Why: interruptions preserve state without broadening the active Slice.

## Rollback And Recovery Boundary

- **Git/recovery checkpoint:** `[branch, commit, backup, or not yet created]`
- **Data/state rollback:** `[how durable state is preserved and restored, or not applicable]`
- **Irreversible decisions requiring approval:** `[release, migration, deletion, publication, baseline acceptance, or none]`

Why: Campaign coordination must not turn destructive ambiguity into assumed permission.

## Closeout Checklist

- [ ] Every required Slice is `DONE`, `CANCELLED` with rationale, or `SUPERSEDED` with a successor.
- [ ] Campaign acceptance and required Project Health gates passed in the stated environment.
- [ ] Shipped behavior, architecture, bugs, lessons, and deferred work moved to their sole owners where applicable.
- [ ] Active pointers and collision leases were cleared.
- [ ] Remaining human, device, visual, physical, or external acceptance is explicit.
- [ ] Git tree and disk retention were reviewed separately; every Slice-owned ephemeral build path was removed after evidence capture, and retained/shared paths have explicit owners.
- [ ] Commit, release, publication, and accepted-baseline decisions were handled separately.

## Expected Final Report

`[Summarize the outcome, completed/cancelled Slices, strongest evidence, environment, skipped or remaining acceptance, docs/state reconciliation, tree state, and exact next owner decision.]`
