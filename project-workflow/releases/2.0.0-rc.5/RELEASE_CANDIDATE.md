# ToVA Project Workflow 2.0.0-rc.5 Decision Packet

Status: ready for owner release decision; not approved or published.

## Candidate Outcome

Generation 2 remains proven first in the actual ToVA repository and mirrored into `ToVA universal development starter kit/`. This revision adds a build-artifact retention safeguard while preserving the existing discovery, app assurance, task, product, architecture, state, evidence, history, output, and handoff authorities.

## Automated Evidence

- Focused source tests prove that the portable core teaches shared/reused, Slice-ephemeral, and intentionally retained classes; denies gitignore-based deletion; and installs the safeguard into a blank disposable target.
- `project-workflow/evidence/TOVA8.2_FIRST_RUN_DISCOVERY_ACCEPTANCE.json` remains the current four-shape discovery and preservation evidence.
- `TOVA9.1_RELEASE_CHECK.json` records exact source-to-starter mirror parity, starter owner validation, preservation hashes, retired live paths, required scripts, and the full starter payload checksum result.
- `SHA256SUMS` covers every starter-package file except `project-workflow/releases/`; excluding the release directory avoids a self-referential digest.
- Generation 1 archives and optional overlays remain hash-locked in `RELEASE_CANDIDATE.json`.
- The final normal-Windows-SDK `npm.cmd run verify` validated and built all 45 apps and passed 248/248 tests. Doctor reported zero errors and one expected warning for unaccepted portable snapshot drift.
- Structural and integration success never substitutes for the explicitly open human/release boundaries below.

## Deliberate Boundaries

- First-run discovery is a temporary interview protocol. It routes confirmed or labeled answers into existing owners and leaves conditional boot when initialization closes.
- AI suggestions remain assumptions until the user selects or confirms them.
- App build assurance is optional and proportional. A contract pass does not prove runtime, device, human, privacy, migration, beta, or release acceptance.
- Build output is classified before a Slice creates or redirects it. Stable roots are reused by default; uniquely named Slice-ephemeral roots are cleaned only after their final evidence; intentionally retained history follows its own owner.
- Gitignore is not a storage or deletion policy. This candidate adds no background cleanup, delete command, retention-policy change, or new ignore rule.
- Outputs remain retained convenience artifacts, and handoffs remain the separate receiver-oriented transfer surface.
- The installer creates only missing minimal owners and preserves project-authored content, commands, paths, casing, and bytes.
- Existing `2.0.0-rc.1` through `2.0.0-rc.4` evidence and the rc.2 ZIP remain immutable history.
- No new ZIP or external copy is part of this revision.
- TOVA7.4 iOS/SwiftData remains deferred.

## Decisions Still Owned By The User

- Review this manifest, evidence, checksums, limitations, and final tree diff.
- Decide whether to commit the current ToVA working tree.
- Decide whether to publish `2.0.0-rc.5` or request another revision.
- Decide separately whether to install the workflow into a target repository.
- Decide separately whether to promote ToVA's portable accepted baseline with `npm.cmd run accept`.

Until those decisions are explicit, owner approval, Git commit, publication, target installation identity, and baseline acceptance remain false.
