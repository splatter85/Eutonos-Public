# ToVA Project Workflow 2.0.0-rc.3 Decision Packet

Status: ready for owner release decision; not approved or published.

## Candidate Outcome

Generation 2 remains proven first in the actual ToVA repository and mirrored into `ToVA universal development starter kit/`. This revision adds a create-only `docs/outputs/` owner for useful retained reports, analyses, comparisons, exports, and other non-handoff work products while preserving all existing task, truth, evidence, history, and handoff authorities.

## Automated Evidence

- `project-workflow/evidence/TOVA7.9_OUTPUTS_ACCEPTANCE.json` records four disposable installation shapes, six zero-write failure boundaries, 20-owner workflow checks, output-owner discovery, preservation, idempotency, and installed-only cold-start answers.
- `TOVA7.9_RELEASE_CHECK.json` records exact source-to-starter mirror parity, starter owner validation, preservation hashes, retired live paths, required scripts, and the full starter payload checksum result.
- `SHA256SUMS` covers every starter-package file except `project-workflow/releases/`; excluding the release directory avoids a self-referential digest.
- Generation 1 archives and optional overlays remain hash-locked in `RELEASE_CANDIDATE.json`.
- The source repository's normal-Windows-SDK `npm.cmd run verify` gate passed 45 app validations/builds, 242/242 tests, and Doctor with only expected unaccepted snapshot drift; the exact timestamps and report pointer are recorded in `RELEASE_CANDIDATE.json`.

## Deliberate Boundaries

- Outputs are retained convenience artifacts. They point to authoritative owners and do not imply truth, acceptance, publication, release, or transfer readiness.
- Handoffs remain the separate receiver-oriented transfer surface.
- The installer creates only missing minimal owners and preserves project-authored content, commands, paths, casing, and bytes.
- Existing `2.0.0-rc.1` and `2.0.0-rc.2` evidence and the rc.2 ZIP remain immutable history.
- No new ZIP or external copy is part of this revision.
- TOVA7.4 iOS/SwiftData remains deferred.

## Decisions Still Owned By The User

- Review this manifest, evidence, checksums, limitations, and final tree diff.
- Decide whether to commit the current ToVA working tree.
- Decide whether to publish `2.0.0-rc.3` or request another revision.
- Decide separately whether to install the workflow into a target repository.
- Decide separately whether to promote ToVA's portable accepted baseline with `npm.cmd run accept`.

Until those decisions are explicit, owner approval, Git commit, publication, target installation identity, and baseline acceptance remain false.
