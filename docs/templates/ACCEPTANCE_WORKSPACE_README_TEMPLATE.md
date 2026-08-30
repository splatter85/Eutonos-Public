# Acceptance Evidence Workspace

Purpose: retain durable claim-scoped proof without replacing `docs/PROJECT_HEALTH.md`, Current Task, product truth, or release authority.

Owns: records of what was actually proven at a named source revision and environment.

Does Not Own: verification policy, active work, capability definitions, or automatic release approval.

Read When: inspecting a current/historical claim, handoff proof, or supersession chain.

Update When: a named claim receives new pass/fail/blocked evidence.

Referenced By: Project Health, the accepting Slice/Campaign, release readiness, or a handoff.

Extends/Complements: `docs/PROJECT_HEALTH.md`.

Why separate: Project Health owns what must be proven; this workspace owns immutable records of what actually ran.

Each record names the claim/domain, Evidence SHA, Current HEAD when relevant, environment, commands/checks, result, proof limit, remaining external/human acceptance, and supersession relationship.
