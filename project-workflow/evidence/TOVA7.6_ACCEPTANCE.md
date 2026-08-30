# TOVA7.6 Fixture And Cold-Start Acceptance

Status: passed on 2026-07-18  
Workflow version: `2.0.0-rc.1`  
Command: `npm.cmd run workflow:fixtures`

The committed fixture sources were copied into operating-system temp directories. Discovery, dry-run, apply, health checks, cold-start audit, finalize, and idempotency checks mutated only those disposable copies. The committed fixture-tree fingerprint was identical before and after the campaign.

## Fixture Matrix

### F1 - Blank Repository

- Classified `blank`; installed `.project` plus `docs`.
- Dry-run was deterministic and performed zero writes.
- Workflow check and the manual Project Health boundary passed.
- Installed-only audit found the initialization task, no inferred product claim, no active parallel work, no inferred product bug, and the first review action.
- Finalized `.project/TOVA_INSTALLATION.json` only in the disposable target; repeat apply/finalize writes were `0/0`.

### F2 - Existing Non-ToVA Repository

- Classified `existing-non-tova`; preserved `.project` plus capitalized `Docs`.
- Preserved all seven original files byte-for-byte, including project purpose, active task, health commands, bug, source, README, and package metadata.
- Executed the declared `npm run test` and `npm run build` commands successfully.
- Installed-only audit recovered the Export Audit Slice, open duplicate-ID bug, real commands, and first unchecked action from actual-cased owner paths.
- Repeat apply/finalize writes were `0/0`.

### F3 - Generation 1 Legacy Repository

- Classified `legacy`; preserved seven current project files.
- Moved four retired live owners into `archive/old-projects/project-workflow-generation-1/` with identical hashes and removed their live copies.
- Workflow, declared health commands, installed-only cold start, finalize, and repeat-run checks passed.
- Repeat apply/finalize writes were `0/0`.

### F4 - Customized Generation 1 Repository

- Classified `legacy`; preserved `.tova` plus capitalized `Docs`.
- Preserved fourteen current files byte-for-byte, including project `AGENTS.md`, website overlay, connector and logging guidance, architecture, source, and active `content-review-agent` boundary.
- Archived four retired owners with identical bytes.
- Installed-only audit recovered the Event Card Accessibility Slice, active content agent, real test/build commands, accessibility bug, and first unchecked action.
- Finalized `.tova/TOVA_INSTALLATION.json` only in the disposable target; repeat apply/finalize writes were `0/0`.

## Zero-Write Failure Boundaries

- Stale plan: `PLAN_HASH_MISMATCH`
- Competing semantic owners: `ROLE_OWNER_COLLISION`
- Advertised unavailable command: `DECLARED_COMMAND_UNAVAILABLE`
- Occupied in-repository archive target: `LEGACY_ARCHIVE_TARGET_EXISTS`
- Target newer than installer: `TARGET_VERSION_NEWER`
- Case-only path collision: `CASE_COLLISION`

Every adversarial target fingerprint was unchanged and every stopped apply reported zero writes.

## Claim Boundary

This is deterministic installed-file comprehension evidence. It does not claim that a separate human or fresh model session approved release quality. All acceptance manifests existed only in temporary targets. No ToVA installation manifest, portable baseline, Git commit, publication, or release was created.

The full machine-readable result is in `TOVA7.6_ACCEPTANCE.json`.
