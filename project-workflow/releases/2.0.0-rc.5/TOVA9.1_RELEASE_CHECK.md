# TOVA9.1 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.5`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 12; files compared: 117; exact parity: true.
- Starter workflow owners: 21; errors/warnings: 0/0.
- Starter payload checksums: 128 files; aggregate SHA-256: `b6fd32d4392f6128341ad29d435e323cd348726c74b2ae812e2111436e125652`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
