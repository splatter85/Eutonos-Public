# TOVA11 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.9`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 18; files compared: 155; exact parity: true.
- Starter workflow owners: 33; errors/warnings: 0/0.
- Starter payload checksums: 153 files; aggregate SHA-256: `2a58e6c10e6e2172033c47fc7431856ad45b43b20b2138776ef519284514e99d`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 5; exact commands: true.
- Starter identity: package/core/README all identify `2.0.0-rc.9`: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
