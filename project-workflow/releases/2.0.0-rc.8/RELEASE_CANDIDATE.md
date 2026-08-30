# ToVA Project Workflow 2.0.0-rc.8 Decision Packet

Status: ready for owner release decision after the recorded automated checks.

Assembled: 2026-08-14

Latest local evidence refresh: 2026-08-16

## Candidate Outcome

This unapproved candidate adds one conditional `docs/TOVA_SETUP.md` owner to the generation 2 portable workflow. The ToVA repository holds the master deployment/adoption contract; the portable template and starter live guide provide conservative target-ready instructions.

The guide joins the existing safe installer, first-run discovery, boot, and everyday help surfaces into one path for:

- blank/new repositories;
- established repositories whose content and casing must be preserved;
- generation 1/legacy layouts whose retired owners are archived byte-for-byte;
- accepted older installations being upgraded;
- full-core evidence-based population, target-local acceptance, finalization, and normal use.

`workflow:install -- --help` now prints real phase and option guidance without inspecting or changing a target.

TOVA10.5 refresh: the candidate payload now also treats Git as startup readiness. Agent startup reports Git availability/worktree state and asks the owner before installing Git, running `git init`, or connecting a remote when setup is missing.

2026-08-16 refresh: the candidate payload now also carries the simpler Current Task cleanup guidance in the starter help/current-task surfaces and portable templates. Completed checklists should be removed or collapsed; durable history belongs in Git, changelog, archive, release evidence, or the appropriate feature/capability owner.

## Evidence

- `TOVA10.4_RELEASE_CHECK.json` records exact source/starter mirror parity, 25-owner starter validation, starter identity agreement, preservation hashes, retired live paths, required scripts, and starter payload checksums.
- The refreshed checksum set records 135 starter payload files with aggregate SHA-256 `9cd37be5f48e4ba2610412913d911364f0ed01cea11ab0ac782f8842b6473934`.
- Source and starter workflow tests cover real help output, blank creation, established `Docs/` preservation, legacy archival, upgrade identity, setup routing, full-core guidance, acceptance evidence, idempotency, and zero-write stops.
- `SHA256SUMS` covers the starter payload while excluding release directories to avoid self-reference.
- The full ToVA verification report is referenced from `RELEASE_CANDIDATE.json` after the final gate.

## Preserved Boundaries

- rc.1 through rc.7 release directories and the rc.2 ZIP remain immutable history.
- The installer is create-only for missing current owners and preserves compatible target bytes/casing.
- Existing project truth remains authoritative. The setup guide routes population but does not invent product claims.
- Optional overlays and modules remain disabled unless explicitly admitted.
- Setup, Project Discovery, capability/feature owners, handoffs, and outputs remain conditional rather than mandatory boot context.

## Not Authorized Or Claimed

- No owner approval or publication.
- No Git commit created by this Slice.
- No package/export or target-repository installation.
- No portable-baseline acceptance or `npm.cmd run accept`.
- No product, runtime, privacy, migration, human, beta, or release claim beyond the checks actually recorded.

## Owner Decision

- Review the manifest, checksum set, release check, limitations, and final tree diff.
- Decide whether to approve or publish `2.0.0-rc.8` or request another revision.
- Decide target installation and portable-baseline promotion separately.
