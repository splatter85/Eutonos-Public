# TOVA10.4 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.8`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 17; files compared: 141; exact parity: true.
- Starter workflow owners: 25; errors/warnings: 0/0.
- Starter payload checksums: 135 files; aggregate SHA-256: `9cd37be5f48e4ba2610412913d911364f0ed01cea11ab0ac782f8842b6473934`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.
- Starter identity: package/core/README all identify `2.0.0-rc.8`: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
