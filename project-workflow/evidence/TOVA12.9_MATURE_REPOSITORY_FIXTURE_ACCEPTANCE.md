# TOVA12.9 Mature Repository Fixture Acceptance

Status: passed
Workflow version: `2.0.0-rc.10`
Mutation boundary: temporary copies under the operating-system temp directory only.

## Fixture Matrix

### F1 - blank repository

- Result: passed
- Initial classification: `blank`
- Preserved layout: `.project` and `docs`
- Original files preserved: 0
- Retired files archived with exact bytes: 0
- Health mode: manual-project-health
- First-run questions: 5/5 from `docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `docs/PROJECT_GOALS.md`
- Cold-start current task: Workflow Initialization Review
- Cold-start parallel-work answer: This file is retained during the generation 2 migration because existing installations and tools may still name it as an owner.
- Cold-start health answer: manual project-health checks
- Cold-start known-bug answer: Record reproducible defects that should survive beyond the current task. States are `open`, `investigating`, `blocked`, `deferred`, and `fixed`.
- Cold-start next action: Run the five-question protocol in `docs/PROJECT_DISCOVERY.md`; confirm answers or preserve unknowns as labeled assumptions/open questions.
- Final identity: `.project/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

### F2 - existing non-ToVA repository

- Result: passed
- Initial classification: `existing-non-tova`
- Preserved layout: `.project` and `Docs`
- Original files preserved: 7
- Retired files archived with exact bytes: 0
- Health mode: declared-commands
- First-run questions: 5/5 from `Docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `Docs/PROJECT_GOALS.md`
- Cold-start current task: Export Audit Slice
- Cold-start parallel-work answer: This file is retained during the generation 2 migration because existing installations and tools may still name it as an owner.
- Cold-start health answer: npm run test, npm run build
- Cold-start known-bug answer: F2-EXPORT-001 - Duplicate identifiers are not rejected
- Cold-start next action: Add a duplicate-identifier fixture and focused assertion.
- Final identity: `.project/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

### F3 - generation 1 legacy repository

- Result: passed
- Initial classification: `legacy`
- Preserved layout: `.project` and `docs`
- Original files preserved: 7
- Retired files archived with exact bytes: 4
- Health mode: declared-commands
- First-run questions: 5/5 from `docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `docs/PROJECT_GOALS.md`
- Cold-start current task: Reconciliation Total Slice
- Cold-start parallel-work answer: This file is retained during the generation 2 migration because existing installations and tools may still name it as an owner.
- Cold-start health answer: npm run test, npm run build
- Cold-start known-bug answer: F3-LEDGER-004 - Refunds remain in available total
- Cold-start next action: Add the refunded-contribution sample.
- Final identity: `.project/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

### F4 - customized generation 1 repository

- Result: passed
- Initial classification: `legacy`
- Preserved layout: `.tova` and `Docs`
- Original files preserved: 14
- Retired files archived with exact bytes: 4
- Health mode: declared-commands
- First-run questions: 5/5 from `Docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `Docs/PROJECT_GOALS.md`
- Cold-start current task: Event Card Accessibility Slice
- Cold-start parallel-work answer: content-review-agent
- Cold-start health answer: npm run test, npm run build
- Cold-start known-bug answer: F4-SITE-007 - Date text lacks an explicit accessible label
- Cold-start next action: Add the accessible date-label rendering assertion.
- Final identity: `.tova/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

### F5 - mature versioned ToVA repository

- Result: passed
- Initial classification: `installed-upgrade`
- Preserved layout: `.project` and `Docs`
- Original files preserved: 12
- Retired files archived with exact bytes: 1
- Health mode: declared-commands
- First-run questions: 5/5 from `Docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `Docs/PROJECT_GOALS.md`
- Cold-start current task: Workflow Upgrade
- Cold-start parallel-work answer: This file is retained during the generation 2 migration because existing installations and tools may still name it as an owner.
- Cold-start health answer: npm run test, npm run build
- Cold-start known-bug answer: No open product defect is confirmed in this sanitized fixture. Workflow migration questions must not be recorded as application defects unless they reproduce against the product source.
- Cold-start next action: Reconcile the older ToVA workflow into the current canonical baseline while preserving the project-specific release gate and avoiding feature work during migration.
- Final identity: `.project/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

### F6 - mature established non-ToVA repository

- Result: passed
- Initial classification: `existing-non-tova`
- Preserved layout: `.project` and `Docs`
- Original files preserved: 9
- Retired files archived with exact bytes: 0
- Health mode: declared-commands
- First-run questions: 5/5 from `Docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `Docs/PROJECT_GOALS.md`
- Cold-start current task: Workflow Initialization Review
- Cold-start parallel-work answer: This file is retained during the generation 2 migration because existing installations and tools may still name it as an owner.
- Cold-start health answer: npm run test, npm run build
- Cold-start known-bug answer: Record reproducible defects that should survive beyond the current task. States are `open`, `investigating`, `blocked`, `deferred`, and `fixed`.
- Cold-start next action: Run the five-question protocol in `Docs/PROJECT_DISCOVERY.md`; confirm answers or preserve unknowns as labeled assumptions/open questions.
- Final identity: `.project/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

### F7 - parent repository with nested independent ToVA project

- Result: passed
- Initial classification: `existing-non-tova`
- Preserved layout: `.project` and `Docs`
- Original files preserved: 8
- Retired files archived with exact bytes: 0
- Health mode: declared-commands
- First-run questions: 5/5 from `Docs/PROJECT_DISCOVERY.md`
- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.
- Cold-start product answer owner: `Docs/PROJECT_GOALS.md`
- Cold-start current task: Parent Adoption
- Cold-start parallel-work answer: This file is retained during the generation 2 migration because existing installations and tools may still name it as an owner.
- Cold-start health answer: npm run test, npm run build
- Cold-start known-bug answer: Record reproducible defects that should survive beyond the current task. States are `open`, `investigating`, `blocked`, `deferred`, and `fixed`.
- Cold-start next action: Adopt the current ToVA workflow at the explicit parent project root while excluding the nested tooling installation from discovery and mutation.
- Final identity: `.project/TOVA_INSTALLATION.json`; repeat apply/finalize writes: 0/0

## Failure Boundaries

- stale-plan: PLAN_HASH_MISMATCH; zero writes and target unchanged.
- owner-collision: ROLE_OWNER_COLLISION; zero writes and target unchanged.
- unavailable-command: DECLARED_COMMAND_UNAVAILABLE; zero writes and target unchanged.
- occupied-archive: LEGACY_ARCHIVE_TARGET_EXISTS; zero writes and target unchanged.
- newer-version: TARGET_VERSION_NEWER; zero writes and target unchanged.
- case-only-paths: CASE_COLLISION; zero writes and target unchanged.

## Claim Boundary

- All seven installations and their acceptance manifests existed only in disposable temporary targets.
- The committed fixture tree remained unchanged.
- This is deterministic installed-file comprehension evidence, not a claim that a separate human or model session has approved release quality.
- No ToVA installation manifest, portable baseline, Git commit, publication, or release was created.
