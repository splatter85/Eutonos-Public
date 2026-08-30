# TOVA10.1 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.6`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 14; files compared: 125; exact parity: true.
- Starter workflow owners: 22; errors/warnings: 0/0.
- Starter payload checksums: 129 files; aggregate SHA-256: `67232cfcf463ad1015f9ca0a5c7377618318cceb7c99b509039aa52096a71913`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
