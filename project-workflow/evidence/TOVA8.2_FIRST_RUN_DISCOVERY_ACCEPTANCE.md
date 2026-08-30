# TOVA8.2 First-Run Discovery And Fixture Acceptance

Status: passed
Workflow version: `2.0.0-rc.4`
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
- Cold-start parallel-work answer: Purpose: prevent overlapping edits and unsafe baseline promotion.
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
- Cold-start parallel-work answer: Purpose: prevent overlapping edits and unsafe baseline promotion.
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
- Cold-start parallel-work answer: Purpose: prevent overlapping edits and unsafe baseline promotion.
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

## Failure Boundaries

- stale-plan: PLAN_HASH_MISMATCH; zero writes and target unchanged.
- owner-collision: ROLE_OWNER_COLLISION; zero writes and target unchanged.
- unavailable-command: DECLARED_COMMAND_UNAVAILABLE; zero writes and target unchanged.
- occupied-archive: LEGACY_ARCHIVE_TARGET_EXISTS; zero writes and target unchanged.
- newer-version: TARGET_VERSION_NEWER; zero writes and target unchanged.
- case-only-paths: CASE_COLLISION; zero writes and target unchanged.

## Claim Boundary

- All four installations and their acceptance manifests existed only in disposable temporary targets.
- The committed fixture tree remained unchanged.
- This is deterministic installed-file comprehension evidence, not a claim that a separate human or model session has approved release quality.
- No ToVA installation manifest, portable baseline, Git commit, publication, or release was created.
