# App Build Assurance

Purpose: help founders and AI agents build maintained applications around user workflows, explicit responsibility boundaries, safe data handling, proportional review, and evidence instead of accumulating unrelated screen-level features.

This optional module extends the universal project workflow. It does not replace project goals, architecture, active tasks, Project Health, source code, tests, or app acceptance. An `app.build.json` contract links those owners and records the product-level questions that must remain visible while an app evolves.

## When To Enable It

Enable this module when the repository builds or maintains a software application and at least one of these is true:

- several screens or targets share business rules;
- user-created or imported data must survive changes;
- storage, sync, migrations, backup, permissions, privacy, or external services are involved;
- the project expects MVP, beta, release, or real-user claims;
- AI agents need a stable product and review contract across sessions.

Do not require it for a throwaway experiment whose only claim is a bounded technical proof. Add it when that experiment becomes maintained or starts making product, persistence, or release claims.

## Founder-Friendly Intake

Ask only what is still unknown:

1. What is the app for, who uses it, and what problem should feel easier after using it?
2. What are the two or three complete workflows users must be able to finish?
3. Where should it run, and what existing code, service, or design must it preserve?
4. What data, files, accounts, permissions, imports, exports, integrations, sync, or backup responsibilities exist?
5. What should count as the first usable success, and what is explicitly out of scope?

If the user does not know a technical answer, inspect the repository and offer two or three plausible options plus one conservative default. Explain the tradeoff briefly, record the selected answer or a labeled assumption, and never convert a suggestion into confirmed project truth silently.

## Contract Responsibilities

An app contract records:

- product purpose, users, targets, and lifecycle stage;
- complete user workflows and testable success criteria;
- source-of-truth and responsibility boundaries;
- generated artifacts and external systems;
- data models, persistence, migration, backup/recovery, sync, and destructive operations;
- error/empty states, performance risks, and security/privacy risks;
- unit, integration, UI, migration, regression, and manual-QA status with evidence;
- architecture, data, testing, performance, security/privacy, and product-workflow review lenses;
- constraints, non-goals, open questions, unresolved acceptance, and the required health gate.

The contract must point to existing source and evidence. It must not copy implementation semantics that already belong in code, schemas, tokens, architecture owners, or acceptance files.

## Proportional Use

- **Prototype:** planned or explicitly inapplicable checks are allowed. Keep unresolved product and human acceptance visible.
- **MVP:** require a stable source of truth, recoverable errors, relevant automated checks, and an honest persistence/recovery position.
- **Beta:** use the Full gate and require real manual-QA evidence. Real-user, device, data, privacy, recovery, and telemetry claims remain explicit.
- **Release:** use the Full gate, close blocked/planned test categories or mark them inapplicable with a real reason, and leave no unresolved release acceptance.

Conventional UI, controller, service, engine, repository, and storage layers are useful review vocabulary, not mandatory class names. The contract asks who owns each responsibility and whether rules are duplicated or bypassed.

## Final Release-Candidate Acceptance

Use `RELEASE_ACCEPTANCE_TEMPLATE.md` only when the project has a distinct final release-candidate gate. Project Health owns what must be proven, Slice/Campaign checks own intermediate change evidence, and the release record owns fresh proof for one exact candidate across the required device/environment, migrated data, accessibility, performance, integrations, recovery, privacy/security, and human product-quality boundaries.

## Review Lenses

Run focused passes instead of one broad "is this good?" review:

1. Architecture: ownership, coupling, duplicated rules, generated-source boundaries, and one-off stacked systems.
2. Data: schemas, relationships, identifiers, persistence, migrations, imports/exports, backup, recovery, and sync conflicts.
3. Testing: requirements mapped to unit, integration, UI, migration, regression, and manual evidence.
4. Performance: repeated work, rendering cost, large collections, blocking operations, caching, progress, cancellation, and retries.
5. Security/privacy: secrets, permissions, personal data, unsafe tools, AI output validation, audit, and approval boundaries.
6. Product workflow: user success, empty/error states, edge cases, feedback, accessibility, and manual verification.

Review output should separate blockers, non-blockers, evidence, missing tests, suggested fixes, skipped checks, and the remaining acceptance owner.

## Commands

Validate one contract:

```powershell
node tools/app-build-assurance.js --contract path/to/app.build.json
```

Discover and validate every `app.build.json` below `apps/`:

```powershell
node tools/app-build-assurance.js
```

Add `--markdown` for a human-readable report. A passing report proves structural completeness and reference integrity only; use the Project Health gate and app acceptance required by the contract before claiming behavior, beta, or release readiness.

## Removal

Remove only the module manifest, installed module docs/examples, and checker declared in `MODULE.json`. Preserve project-owned app contracts and accepted evidence when they still explain current or historical product decisions. Remove the module from the installation manifest only after its retirement checks pass.
