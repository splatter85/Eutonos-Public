# Slice Execution Packet Template

## Purpose

Turn one approved Slice into a bounded execution packet that a receiving agent can act on without reconstructing the Campaign from chat history.

## Write Here When

Use for an explicit agent/session/machine transfer or when a cold executor needs a stable packet. It may accompany an Exchange or a generic handoff, but it does not replace either contract.

## Do Not Use For

Do not create a second live checklist, expand Slice authority, summarize unverified claims as fact, or assign several independent Slices in one packet. Stop after the named Slice(s) and gates.

## Format And Profile Selection

Produce one selected profile and remove unused guidance.

- `compact`: target 350–700 tokens. Use when the Slice is narrow, the capsule/index is current, and receiver context is constrained or project familiarity is high.
- `expanded`: target 700–1,200 tokens, excluding linked source contents. Use for a cold receiver, shared-file hotspots, high-risk behavior, platform boundaries, or previous regressions.
- `auto`: receiver selects and records `compact` or `expanded` plus one sentence. If compact leaves an unresolved architectural or authority question, load the expanded fields or stop.

Both profiles carry the same behavior, authority, checks, deliverables, and stop conditions. Expanded adds section-level reading reasons, prerequisite evidence, shared-consumer detail, and conditional failure routes.

Compact normally names no more than five inspect-first sources; expanded normally names no more than ten. Conditional sources load only on their named trigger. If more are mandatory, narrow the Slice or state why the broader source set cannot be avoided.

---

# Slice Execution Packet: `[SLICE-ID]`

- **Selected profile:** `[compact | expanded]`
- **Selection reason:** `[one sentence]`
- **Base revision:** `[exact 40-character Git revision]`
- **Branch/workspace strategy:** `[serial shared branch or parallel isolated branch]`
- **Prerequisite Slices/evidence:** `[IDs and exact status/evidence boundary, or None]`
- **Campaign capsule:** `[repository-relative path and prepared revision, or None]`
- **Repository routes:** `[route://... IDs]`
- **Requested mode:** `[implement | review_only | verify | other valid mode]`

## Required Sources

| Inspect first | Required section | Why |
| --- | --- | --- |
| `[path]` | `[whole file for compact, exact section for expanded]` | `[authority, implementation, risk, or proof reason]` |

## Likely Edit Scope

- `[repository-relative path or pattern; advisory collision guidance, not independent authority]`

## Behavior Or Outcome To Implement

`[exact observable behavior/docs/state change]`

## Inherited Invariants And Non-goals

- `[invariant from capsule or canonical owner]`
- `[non-goal]`

## Known Traps And Shared Consumers

`[Compact: only the highest-risk trap/shared surface. Expanded: enumerate shared files/APIs/users/generated outputs and conditional failure routes.]`

## Required Checks

- `[stable verification ID -> exact owner path -> command/check]`
- `[mandatory integration gate]`

## Environment And Claim Limits

- **Available:** `[Linux/macOS/Windows/Xcode/Simulator/device/service/browser/etc.]`
- **Unavailable or external:** `[boundary]`
- **Allowed claims:** `[what this environment can prove]`

## Expected Deliverables

- `[source/tests/docs/state/response/report]`
- **Commit/push policy:** `[commit, push, report only, or no authority]`
- **Stop after:** `[exact Slice/sub-slices and gates]`

## Stop Conditions

- `[revision/branch mismatch, missing owner, scope contradiction, collision, failed out-of-scope proof, or authority gap]`

## Direct-Source Fallback

The capsule, packet, and repository routes are navigation context. When any summary conflicts with the pinned repository sources, the canonical source wins. Record the contradiction and stop if resolving it would change scope or authority.
