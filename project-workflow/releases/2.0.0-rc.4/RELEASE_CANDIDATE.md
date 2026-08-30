# ToVA Project Workflow 2.0.0-rc.4 Decision Packet

Status: ready for owner release decision; not approved or published.

## Candidate Outcome

Generation 2 remains proven first in the actual ToVA repository and mirrored into `ToVA universal development starter kit/`. This revision adds one conditional five-question first-run project-discovery owner and a disabled-by-default app-build-assurance module while preserving existing task, product, architecture, state, evidence, history, output, and handoff authorities.

## Automated Evidence

- `project-workflow/evidence/TOVA8.2_FIRST_RUN_DISCOVERY_ACCEPTANCE.json` records four disposable installation shapes, six zero-write failure boundaries, 21-owner workflow checks, exactly five first-run questions, evidence-informed option/default behavior, machine routing, project-owned goal/architecture preservation, idempotency, and installed-only cold-start answers.
- `TOVA8.3_RELEASE_CHECK.json` records exact source-to-starter mirror parity, optional-module source/tool/test parity, starter owner validation, preservation hashes, retired live paths, required scripts, and the full starter payload checksum result.
- `SHA256SUMS` covers every starter-package file except `project-workflow/releases/`; excluding the release directory avoids a self-referential digest.
- Generation 1 archives and optional overlays remain hash-locked in `RELEASE_CANDIDATE.json`.
- The final normal-Windows-SDK `npm.cmd run verify` validated and built 45 apps and passed 247/247 tests. Doctor reported zero errors and one expected warning for unaccepted portable snapshot drift; the exact timestamps and boundary are recorded in `RELEASE_CANDIDATE.json`.
- Structural and integration success never substitutes for the explicitly open human/release boundaries below.

## Deliberate Boundaries

- First-run discovery is a temporary interview protocol. It routes confirmed or labeled answers into existing owners and leaves conditional boot when initialization closes.
- AI suggestions remain assumptions until the user selects or confirms them.
- App build assurance is optional and proportional. A contract pass does not prove runtime, device, human, privacy, migration, beta, or release acceptance.
- Outputs remain retained convenience artifacts, and handoffs remain the separate receiver-oriented transfer surface.
- The installer creates only missing minimal owners and preserves project-authored content, commands, paths, casing, and bytes.
- Existing `2.0.0-rc.1` through `2.0.0-rc.3` evidence and the rc.2 ZIP remain immutable history.
- No new ZIP or external copy is part of this revision.
- TOVA7.4 iOS/SwiftData remains deferred.

## Decisions Still Owned By The User

- Review this manifest, evidence, checksums, limitations, and final tree diff.
- Decide whether to commit the current ToVA working tree.
- Decide whether to publish `2.0.0-rc.4` or request another revision.
- Decide separately whether to install the workflow into a target repository.
- Decide separately whether to promote ToVA's portable accepted baseline with `npm.cmd run accept`.

Until those decisions are explicit, owner approval, Git commit, publication, target installation identity, and baseline acceptance remain false.
