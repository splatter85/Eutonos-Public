# TOVA7.8 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.2`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 9; files compared: 86; exact parity: true.
- Starter workflow owners: 19; errors/warnings: 0/0.
- Starter payload checksums: 111 files; aggregate SHA-256: `f4a9133de77b86fe04049d1ad39353523c58690fb670d83b92468b97ca7640b5`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
