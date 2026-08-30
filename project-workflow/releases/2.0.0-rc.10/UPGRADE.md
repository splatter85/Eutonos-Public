# Upgrade Contract: ToVA Project Workflow 2.0.0-rc.10

Status: assembled in the unapproved TOVA12.11 release candidate; ready for reviewed use during TOVA12.12 reassessment.

This release supports a direct, reviewed upgrade from `2.0.0-rc.9`. Earlier or unversioned layouts use legacy/untrusted discovery and the full `docs/TOVA_MIGRATION.md` reconciliation path; they are not silently treated as rc.9.

## What Changes

- Migration becomes an explicit conditional baseline owner.
- Every material source artifact can be reconciled through a human-readable and machine-checkable migration ledger.
- Structural bootstrap and semantic retirement become separate decisions.
- Finalization checks accepted migration evidence and retirement prerequisites.
- Established non-ToVA repositories receive role-first candidate mapping without forced filename churn.
- Installer/checker operations identify and exclude nested independent ToVA project roots.
- Mature fixtures and fresh-agent/adversarial tests cover these boundaries.
- Optional Roadmap, acceptance evidence, capability maturity, and application release-acceptance contracts remain conditional rather than mandatory core.

## Direct Upgrade From rc.9

1. Select one exact project root and verify no nested project is being treated as part of it.
2. Validate the existing `TOVA_INSTALLATION.json` and record current Git/writer/work state.
3. Run dry-run and review this release's `UPGRADE.json` requirements.
4. Create and accept the migration ledger before any customized owner is retired.
5. Bootstrap missing current owners; reconcile project truth and compatible stronger rules into their accepted owners.
6. Retire only ledger entries marked safe after content and reference accounting.
7. Run migration, workflow, collaboration, proportional Project Health, cold-start, and zero-write rerun gates.
8. Finalize and retain the prior manifest plus accepted migration evidence hash.

## Rollback

Planning is zero-write. Bootstrap is create-only. Preserve the prior manifest, source fingerprints, exact archived bytes, accepted ledger, and Git history. Retirement and finalization require separate acceptance. Publication and destructive actions outside the repository are outside installer rollback.

`UPGRADE.json` is the machine authority for supported versions and required gates. This Markdown file explains the operator path without replacing it.
