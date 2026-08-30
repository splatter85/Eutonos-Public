# Campaign Context Capsule Template

## Purpose

Give a cold agent the minimum campaign-level architecture and product context it could not reliably discover from the Slice alone.

## Write Here When

Create or materially refresh one capsule for a substantial Campaign that will cross an agent, session, repository interface, or machine boundary. Reuse the same revision-compatible capsule across related Slices.

## Do Not Use For

Do not use this as a task board, architecture owner, decision log, proof ledger, or substitute for canonical sources. Do not create a capsule for routine same-session work that normal boot and a Slice plan already explain.

## Format And Profile Selection

Produce one selected profile, not both. Remove unused template guidance.

- `compact`: target 500–900 tokens. Choose for a narrow Slice, a context-constrained local model, or a receiver already familiar with the project when the repository index is current.
- `expanded`: target 1,500–3,000 tokens, excluding linked source contents. Choose for a cold remote agent, multi-Slice/shared-architecture work, high-risk invariants, previous regressions, or unfamiliar ownership boundaries.
- `auto`: the sender permits the receiver to choose. The receiver records `compact` or `expanded` and a one-sentence reason before acting. Prefer `expanded` when ambiguity or risk remains; use `compact` when context capacity is constrained. If mandatory context still does not fit, stop rather than silently omit it.

Compact normally names no more than five required primary sources and three conditional sources. Expanded normally names no more than ten primary sources and does not preload conditional sources. If safe execution needs more, narrow the Slice or explain why the larger reading set is mandatory.

An explicit sender profile overrides automatic selection. Compact is not reduced authority or reduced proof; it is reduced explanatory context. Either profile must link canonical sources and retain stop conditions.

---

# Campaign Context Capsule: `[CAMPAIGN-ID]`

- **Selected profile:** `[compact | expanded]`
- **Selection reason:** `[one sentence]`
- **Prepared against Git revision:** `[exact 40-character source revision]`
- **Prepared/updated:** `[date or durable checkpoint]`
- **Authority label:** Navigation context only; canonical linked sources win.

## Goal And Why

- **Goal:** `[outcome pursued]`
- **Why:** `[problem, user value, or product reasoning]`
- **Non-goals:** `[explicit exclusions]`

## Repository Routes

- `[route://smallest/matching-route]` from `docs/REPOSITORY_INDEX.json`
- `[additional route only when genuinely needed]`

If a route is missing, stale, or contradicts a canonical owner, inspect direct sources and refresh or bypass the capsule; do not guess.

## Current Architecture And Ownership

`[Compact: 3-6 sentences naming the relevant current flow, canonical owner, shared system, local specialization, and generated/external boundary. Expanded: add the important component relationships and why the current ownership split exists.]`

## Invariants

- `[behavior, data, semantic, compatibility, authority, or evidence invariant]`
- `[invariant]`

## Known Risks And Traps

- `[previous regression, hard edge case, collision surface, or misleading shortcut]`
- `[risk and where its direct evidence lives]`

## Required Reading

Every profile names exact paths. Expanded profiles also name relevant headings/sections and why each source matters.

| Source | Required section | Why |
| --- | --- | --- |
| `[path]` | `[whole file for compact, or exact section for expanded]` | `[authority/fact needed]` |

## Conditional Reading

`[Compact: route IDs or up to three sources to open only on a named trigger. Expanded: a trigger -> exact source/section table.]`

| Trigger | Source/section |
| --- | --- |
| `[decision, contradiction, or failure]` | `[path and section]` |

## Verification Boundary

- **Locally/automatically provable:** `[checks and environment]`
- **Platform/external/human-only:** `[claims that remain outside this receiver's proof]`
- **Claims not permitted:** `[deployment, device, provider, publication, acceptance, etc.]`

## Stop Conditions

- `[contradiction or missing evidence that requires stopping]`
- `[authority, revision, ownership, environment, or collision boundary]`

## Freshness Notes

Refresh this capsule when architecture, campaign goal, prerequisites, invariants, ownership, route paths, or a major discovery changes. Routine Action progress does not trigger a rewrite. Record major discoveries concisely and keep all authoritative detail in its canonical owner.
