# TOVA7.9 Release-Candidate Check

Status: passed
Workflow version: `2.0.0-rc.3`
Release status: `ready-for-owner-release-decision`

## Automated Evidence

- Source-to-starter mirror pairs: 10; files compared: 95; exact parity: true.
- Starter workflow owners: 20; errors/warnings: 0/0.
- Starter payload checksums: 115 files; aggregate SHA-256: `b1b53d7ecfe367cb0db7e9550cfaabd89ef3bb937e1407f15f86f634f137b670`; manifest current: true.
- Preserved archive/overlay files: 33; exact hashes: true.
- Retired live paths: 17; all absent: true.
- Required package scripts: 4; exact commands: true.

## Decision Boundary

- The assembled files are an automated release candidate ready for owner review.
- Owner approval, Git commit, publication, target installation, and portable-baseline acceptance remain false and separate.
- TOVA7.4 iOS/SwiftData work remains deferred.
