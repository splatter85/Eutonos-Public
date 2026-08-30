# TOVA8.3 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.4`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 12; files compared: 112; exact parity: true.
- Starter workflow owners: 21; errors/warnings: 0/0.
- Starter payload checksums: 128 files; aggregate SHA-256: `3c4d9fa1492f1e9a2d813a4cf16f31545a3ef0273eb027266ae1204d4cb3a115`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
