# TOVA7.7 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.1`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 9; files compared: 80; exact parity: true.
- Starter workflow owners: 18; errors/warnings: 0/0.
- Starter payload checksums: 109 files; aggregate SHA-256: `7b194488ae76ab62ff69b142fd9eaa573514f9ef2cc8c9ecd02a84ed9ea8eecb`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
