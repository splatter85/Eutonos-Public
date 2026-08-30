# TOVA12 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.10`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 24; files compared: 205; exact parity: true.
- Starter workflow owners: 33; errors/warnings: 0/0.
- Starter payload checksums: 196 files; aggregate SHA-256: `17a7c26185e4d51f675386abced7160c78bfb3872aeba26669c4c16e4efd2a75`; manifest current: true.
- Preserved archive/overlay files: 22; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 6; exact commands: true.
- Starter identity: package/core/README all identify `2.0.0-rc.10`: true.
- Release upgrade contract: required true; present true; valid true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
