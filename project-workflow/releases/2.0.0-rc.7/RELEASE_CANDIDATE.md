# ToVA Project Workflow 2.0.0-rc.7 Decision Packet

Status: automated candidate assembled for owner review; not approved, published, installed, or accepted as a portable baseline.

## Candidate Outcome

Generation 2 now installs separate documentation owners for:

- Architecture: how the current system is built and where responsibilities live.
- Current/Future Capabilities: supported and desired end-to-end product/application outcomes.
- Current/Future Features: implemented and proposed concrete mechanisms.

The split is carried through the owner manifest, create-only templates, checker, installer, discovery routing, Agent Start, boot/help/work-model surfaces, fixtures, tests, and the self-contained starter package. Existing project-authored owners and casing remain preservation-first.

## Automated Evidence

- Focused source tests prove blank creation, meaningful owner content, Agent Start routing, capitalized-`Docs` reuse with exact bytes, final installation owner identity, and idempotency.
- The F1-F4 disposable fixture campaign proves preservation, five-question discovery, installed-only cold start, real declared health commands, finalize identity, and six zero-write failure boundaries.
- `TOVA10.2_RELEASE_CHECK.json` records exact source/starter mirror parity, 24-owner starter validation, starter identity agreement, preservation hashes, retired live paths, required scripts, and starter payload checksums.
- `SHA256SUMS` covers every starter-package file except `project-workflow/releases/`; excluding release directories avoids a self-referential digest.
- The final `npm.cmd run verify` result is recorded in the manifest after the normal-access gate completes.

## Deliberate Boundaries

- A capability is not inferred from a structural feature, template, registry entry, target-map declaration, or generated artifact.
- Capability and feature owners are conditional reading, not additions to the compact mandatory boot set.
- The legacy `docs/IMPLEMENTATION_STATUS.md` filename remains only as an installer compatibility candidate for projects that already use it; new/current architecture ownership is `docs/ARCHITECTURE.md`.
- The installer creates only missing minimal owners and preserves project-authored content, commands, paths, casing, and bytes.
- Workflow help and the new owner split do not become a second task board or substitute for source inspection and verification.
- App assurance, handoffs, outputs, overlays, and discovery retain their existing conditional boundaries.
- `2.0.0-rc.1` through `2.0.0-rc.6`, the rc.2 ZIP, generation-1 archives, and hash-locked overlays remain immutable history.
- No new ZIP, external transport copy, target installation, publication, Git commit, or accepted baseline is part of this candidate assembly.

## Decisions Still Owned By The User

- Review this manifest, evidence, checksums, limitations, and final tree diff.
- Decide whether to approve or publish `2.0.0-rc.7` or request another revision.
- Decide separately whether to install the workflow into a target repository.
- Decide separately whether to promote ToVA's portable accepted baseline with `npm.cmd run accept`.

Until those decisions are explicit, owner approval, publication, target installation identity, Git commit for this candidate, and portable-baseline acceptance remain false.
