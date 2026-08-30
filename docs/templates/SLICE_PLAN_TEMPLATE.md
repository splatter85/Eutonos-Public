# Slice Plan Template

Use this template for the smallest coherent behavior, documentation, state, or proof outcome that can be implemented, verified, and reported without owning unrelated changes. The same template supports a standalone Slice, a Campaign Slice, or a Sub-slice through the parent fields below.

Do not use it for Routine Polish unless shared behavior, accessibility, interaction, navigation, destructive actions, persistence, data, architecture, or material risk appears. Replace bracketed prompts; remove guidance that no longer helps after review. `docs/WORK_MODEL.md` owns definitions and `docs/PROJECT_HEALTH.md` owns gate policy.

## Identity And Relationship

- **Work ID:** `[campaign child such as TOVA7.2, standalone ID such as SL12, or Sub-slice such as DATA4.1]`
  - Why: provides a stable execution and handoff reference.
- **Name:** `[outcome-oriented name, for example Work Model Planning Templates]`
  - Why: names the result rather than the activity.
- **Status:** `[PROPOSED | PLANNED | READY | IN_PROGRESS | PAUSED | BLOCKED | IMPLEMENTED_AWAITING_GATE | AWAITING_ACCEPTANCE | DONE | CANCELLED | SUPERSEDED]`
  - Why: exposes whether work is ready, active, gated, or closed.
- **Parent type:** `[None | Campaign | Slice]`
  - Why: `None` means standalone, `Campaign` means an originally planned Campaign Slice, and `Slice` means a Sub-slice discovered after inspection.
- **Parent ID:** `[ID or None; example TOVA7 or DATA4]`
  - Why: keeps inherited outcome and closeout traceable without separate template variants.
- **Owner:** `[person, team, or session label; example Workflow lane]`
  - Why: identifies who may change the Slice boundary and reconcile its result.

## Goal

`[One observable outcome. Example: A fresh agent can classify work and produce a complete bounded plan from repository docs alone.]`

Why: a Slice has one coherent result, even when implementation needs several steps.

## Why This Matters

`[Connect the result to a current need, risk, dependency, or user outcome. Example: Later workflow Slices need one stable planning contract instead of chat-only conventions.]`

Why: explains priority without inflating the Slice boundary.

## Parent Outcome And Inherited Constraints

- **Parent contribution:** `[how this Slice advances its parent, or None for standalone work]`
- **Inherited invariants/non-goals:** `[references or concise list; example preserve existing continuity owners and do not start TOVA7.3]`

Why: child work stays locally bounded while preserving the larger outcome.

## Cold-Agent Execution Context

- **Needed:** `[No | Yes; only for an explicit cold-agent/session/machine transfer]`
- **Profile:** `[compact | expanded | auto]`
- **Campaign capsule:** `[repository-relative path and prepared revision, or None]`
- **Repository routes:** `[route://... IDs from docs/REPOSITORY_INDEX.json]`
- **Slice packet:** `[planned repository-relative path, or None]`

Why: the executor gets bounded navigation context while the Slice and canonical owners retain authority.

## Files To Inspect First

- `[existing owner or implementation path; example docs/WORK_MODEL.md]`
- `[consumer, test, or shared surface; example docs/README.md]`

Why: execution starts with known evidence instead of broad rediscovery.

## Files Likely To Edit

- `[durable source path; example docs/templates/SLICE_PLAN_TEMPLATE.md]`
- `[required consumer/status path; example docs/CURRENT_TASK.md]`

Why: makes ownership and collision risk reviewable before mutation. Generated output belongs here only when it is itself the requested artifact, never as a permanent behavior fix.

## Exact Change

- `[Observable behavior, ownership, state, documentation, or proof change.]`
- `[Important edge or failure behavior.]`

Example: "One template handles standalone, Campaign, and Sub-slice planning by requiring an explicit parent type and parent ID."

Why: distinguishes the claim being implemented from general aspiration.

## Non-goals

- `[Adjacent work explicitly excluded. Example: no documentation-checker implementation.]`
- `[Authority not granted. Example: no release, publication, or baseline promotion.]`

Why: prevents opportunistic expansion and makes stop decisions easier.

## Implementation Notes And Shared Consumers

- **Approach:** `[important sequence or design decision]`
- **Existing concepts to reuse:** `[contracts, helpers, tokens/macros for behavior work, or none]`
- **Shared consumers/hotspots:** `[files, APIs, users, agents, generated artifacts]`
- **Compatibility boundary:** `[what must continue to work]`

Why: captures choices that an executor needs without prescribing every keystroke.

## Build Artifact Plan

Complete this section when the Slice creates or redirects build output. Use `None` when it does not.

| Exact path | Class | Why this location is needed | Cleanup or retention owner | Active consumer/concurrency boundary |
| --- | --- | --- | --- | --- |
| `[path or None]` | `[shared/reused | Slice-ephemeral | intentionally retained]` | `[reason]` | `[command/owner and timing]` | `[consumer or None]` |

Prefer shared/reused roots. A uniquely named Slice-ephemeral root is justified only by isolation, concurrency, clean-state proof, or a tool constraint. Gitignored does not mean safe to delete. Cleanup occurs only after final evidence is captured and removes only exact Slice-owned ephemeral paths.

## Risks And Rollback

- **Primary risks:** `[example: examples accidentally encourage Campaigns for routine fixes]`
- **Detection:** `[focused check or review that exposes each risk]`
- **Rollback boundary:** `[Git path/commit, reversible edit, data backup, or not applicable]`
- **Destructive or external action:** `[approval required, or none]`

Why: a ready Slice identifies how failure will be noticed and contained.

## Verification

- **Required Project Health gate:** `[Quick | Standard | Full]`
- **Focused checks:**
  - `[exact command or inspection; example reference search for every new template]`
  - `[behavior, classification, parsing, UI, device, or acceptance check as applicable]`
- **Integration checks:**
  - `[exact command; example npm.cmd run verify]`
- **Environment/access needs:** `[normal Windows SDK, device, service, browser, none, and any unavailable boundary]`
- **Remaining human/external acceptance owner:** `[owner or None]`

Why: passing evidence is selected before implementation and matches the claimed boundary.

## Required Docs And State Updates

- `[active task/status owner]`
- `[shipped behavior, architecture, bugs, lessons, changelog, or none with reason]`

Why: closeout reconciles sole owners without duplicating routine progress everywhere.

## Stop Conditions

- `[contradiction with inspected code or accepted contract]`
- `[need to own files outside this Slice]`
- `[unclear expected behavior or destructive ambiguity]`
- `[verification failure pointing outside the Slice]`

Why: stopping is an explicit safety boundary, not an excuse to abandon a merely difficult implementation.

## Readiness Check

- [ ] Goal and exact change describe one coherent outcome.
- [ ] Parent relationship and inherited constraints are explicit.
- [ ] Planned files do not require ownership of unrelated changes.
- [ ] Shared consumers and generated/local-only artifacts are separated from durable source.
- [ ] Build paths are classified; any Slice-ephemeral path has an exact closeout action and no other active owner.
- [ ] The required gate and focused checks can prove the claim.
- [ ] Risks, rollback, docs/state updates, and stop conditions are actionable.
- [ ] If the Slice is too broad, likely Sub-slice boundaries are visible.

## Execution And Closeout Record

- **Implemented boundary:** `[what actually changed, including any narrowing or Sub-slice split]`
- **Verification result:** `[commands, environment, pass/fail, strongest evidence, skipped checks]`
- **Generated/local-only artifacts:** `[exact paths, shared/reused | Slice-ephemeral | intentionally retained, removed/retained, and why; or None]`
- **Docs/state reconciled:** `[paths or None]`
- **Tree state:** `[clean, intentional changes, staged, committed, or awaiting separate authority]`
- **Next remaining Slice/decision:** `[exact pointer]`

Why: a completed plan remains a useful handoff without becoming a second live queue.

## Action Registry

Optional for legacy or short-lived plans; required when tracked `EXECUTION_STATE.json.last_durable_checkpoint.action_id` points into this Slice. Keep the list bounded to durable Actions declared by this Slice. The registry is an exact-reference aid, not another task board or progress log.

```json
{
  "schema_version": 1,
  "actions": [
    {
      "id": "EXAMPLE-SLICE-DESIGN",
      "status": "planned",
      "summary": "EXAMPLE-Resolve the bounded design decision before implementation."
    }
  ]
}
```

## Expected Final Report

`[Summarize changed outcome, verification, docs/state updates, narrowing/splitting, remaining acceptance, tree/commit state, and the exact next Slice or owner decision.]`
