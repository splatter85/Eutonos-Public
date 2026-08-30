# TOVA10.2 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.7`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 16; files compared: 134; exact parity: true.
- Starter workflow owners: 24; errors/warnings: 0/0.
- Starter payload checksums: 133 files; aggregate SHA-256: `ccdf75516a3cc3d20ac242819bbff00622468472efbfb7f2b5b943f237146a89`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.
- Starter identity: package/core/README all identify `2.0.0-rc.7`: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
