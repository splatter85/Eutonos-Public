# ToVA Project Workflow 2.0.0-rc.2 Decision Packet

Status: ready for owner release decision; not approved or published.

## Candidate Outcome

Generation 2 is implemented and proven first in the actual ToVA repository, then mirrored into `ToVA universal development starter kit/`. The candidate includes the portable owner manifest and templates, schema-backed module and installation contracts, zero-write planning, exact-plan apply, acceptance-gated finalize, F1-F4 migration fixtures, installed-only cold-start evidence, optional overlays, package-owned generation 2 reference docs, and a create-only `docs/handoffs/` owner for bounded AI-to-AI and cross-machine transfers.

## Automated Evidence

- `project-workflow/evidence/TOVA7.6_ACCEPTANCE.json` records four disposable installation shapes, six zero-write failure boundaries, preservation, idempotency, and cold-start answers.
- `TOVA7.8_RELEASE_CHECK.json` records exact source-to-starter mirror parity, starter owner validation, preservation hashes, retired live paths, required scripts, and the full starter payload checksum result.
- `SHA256SUMS` covers every starter-package file except `project-workflow/releases/`; excluding the release directory avoids a self-referential digest.
- The Generation 1 bootstrap/evaluation tree, starter continuity owners, operations guidance, and website overlay are hash-locked in `RELEASE_CANDIDATE.json`.
- The source repository's normal-Windows-SDK `npm.cmd run verify` gate passed 45 app validations/builds, 242/242 tests, and Doctor with only expected unaccepted portable snapshot drift; exact timestamps and the source report pointer are recorded in `RELEASE_CANDIDATE.json`.

## Deliberate Boundaries

- The workflow supports a target project's product and architecture; it does not redefine ToVA or a target project as a repository operating system.
- The installer creates only missing minimal owners and preserves richer project-authored content, commands, paths, casing, and bytes.
- Connector, logging, general development, and website guidance remain optional overlays rather than universal boot owners.
- Handoff packages point to current project owners and carry bounded snapshots; they do not replace project truth, active work, Git history, acceptance evidence, or release authority.
- An external copy is a transport replica only and passes integrity review only when its SHA-256 matches the in-repository package.
- Automated installed-file comprehension is not separate human or fresh-model approval.
- TOVA7.4 iOS/SwiftData remains deferred.

## Decisions Still Owned By The User

- Review this manifest, evidence, checksums, limitations, and final tree diff.
- Decide whether to commit the current ToVA working tree.
- Decide whether to publish `2.0.0-rc.2` or request another revision.
- Decide separately whether to install the workflow into any target repository.
- Decide separately whether to promote ToVA's portable accepted baseline with `npm.cmd run accept`.

Until those decisions are explicit, owner approval, Git commit, publication, target installation identity, and baseline acceptance remain false.
