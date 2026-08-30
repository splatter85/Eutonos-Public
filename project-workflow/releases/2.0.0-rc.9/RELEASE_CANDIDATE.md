# ToVA Project Workflow 2.0.0-rc.9

Status: ready for owner release decision after automated candidate checks  
Slice: `TOVA11 - Cross-Environment Development Continuity`  
Assembled: 2026-08-20

## What Changed

This candidate promotes the repository-owned cross-environment continuity contract into the portable generation 2 core:

- compact tracked Execution State for mode, active Slice, writer/lease, integration branch, owned paths, relevant Notes, active Exchange, and durable checkpoint;
- safe Development Node capability routing without credentials or machine-identifying secrets;
- one active writer per integration branch, child branches for parallel source writers, and exact-revision read-only verification;
- volatile Action state in a pull-request checkpoint or ignored `.tova-runtime/`, never in durable execution truth;
- sparse Agent Notes, exact-SHA Exchanges, optional execution receipts, progressive context loading, and compatibility routing from Active Agent Work;
- a structural collaboration checker plus installer, fixture, owner, and regression coverage.
- portable Agent Note parsing across LF, Windows CRLF, classic CR, and an optional UTF-8 BOM, with the AI Enablement Platform example used as a regression proof.
- an explicit preservation-first checklist for upgrading older ToVA-enabled repositories one target at a time without reusing plan hashes, manifests, acceptance evidence, classifications, or proof.
- impact-based verification semantics: Current HEAD, Assignment Base, and Evidence SHA are distinct; historical evidence is claim-scoped and may carry forward across non-impacting work, while affected domains receive the smallest required focused or integration gate.

The retained design record is `docs/outputs/TOVA_CROSS_ENVIRONMENT_WORKFLOW_ARCHITECTURE_AND_CONTROLLER_DESIGN_2026-08-19.md`. It corrects the original identity boundary: ToVA remains the architecture/ecosystem, TokenLang remains its first language layer, and ToVA Project Workflow is the supporting documentation, planning, verification, and continuity subsystem.

## Explicitly Shelved

The deterministic Workflow Controller is not implemented in rc.9. Scheduler loops, autonomous branch orchestration, shared coordination services, remote-agent session management, GitHub coordination storage, ATLAS providers, and an automated impact/verification-ledger engine remain future work requiring separate authorization and proof.

## Empirical And Automated Evidence

The existing AI Enablement Platform deployment informed the durable/volatile split, one-writer model, Note/Exchange contracts, and exact tested-revision rules. It is an empirical example, not a substitute for portable proof.

The rc.9 manifest, checksum set, and `TOVA11_RELEASE_CHECK.*` record exact source/starter parity, owner validation, package identity, preserved history, required scripts, line-ending and upgrade-guide regression proof, and the final full-project gate. A live ToVA-to-second-machine round trip remains separate operational acceptance.

## Preserved Boundaries

- rc.1 through rc.8 evidence remains immutable.
- Existing project owners, bytes, path casing, commands, overlays, and in-repository history remain preservation-first.
- The installer remains create-only before acceptance-gated finalization.
- Optional modules and overlays remain disabled unless explicitly admitted.
- No publication, Git commit, target installation identity, package/export, or portable-baseline acceptance is implied.

## Owner Decision

Automated readiness can support review, but the owner still decides separately whether to approve, commit, publish, export/package, install into any target repository, or run `npm.cmd run accept`.
