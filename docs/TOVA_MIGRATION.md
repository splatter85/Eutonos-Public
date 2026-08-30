# ToVA Established-Repository Migration

Document status: LIVING CONDITIONAL OWNER

Use this document only while adopting ToVA into an established repository or upgrading an older ToVA installation. `docs/TOVA_SETUP.md` remains the operational entry point; this document owns the migration doctrine, reconciliation decisions, retirement safety, extension admission, nested-project boundaries, and migration acceptance.

After an accepted migration, routine boot returns to the normal project owners. This document does not become a second task board, project-history system, or product-truth owner.

## The Rule That Controls Everything

> Existing repositories are migration sources, not alternate ToVA standards.

For an older ToVA installation, the current supported Starter Kit defines the target ToVA workflow contract. Automation is preservation-first so it cannot destroy project information or user work. Semantic reconciliation still moves the repository to the current baseline.

Preserve project facts, commands, constraints, useful local improvements, current work, history, and evidence. Merge compatible enhancements into current canonical owners. Supersede conflicting older ToVA workflow rules. Retain additional documents only when they have a distinct declared ownership role. Never retire a document until its unique current content has an accepted destination.

For an established repository that has never used ToVA, map existing documents and practices to logical roles before creating files. Reuse a native owner when it fulfills the role cleanly; otherwise create the missing baseline owner and deliberately merge or split relevant content. Do not duplicate project truth merely to match a filename.

Canonical ToVA owns workflow architecture. The project owns project truth.

## Choose One Operation

- **Blank/new repository:** use Setup plus Project Discovery; this migration contract is not needed.
- **Established non-ToVA repository:** inspect native owners, map logical roles, then reuse, merge, split, or create without assuming old ToVA semantics.
- **Unversioned or legacy ToVA:** treat the target as untrusted discovery; inventory current facts and customizations before applying generation-specific retirement.
- **Versioned older ToVA:** validate installation identity and follow the release-specific upgrade chain before mutation.

Select one exact project root. Git root and project root may differ.

## Precedence Decision Hierarchy

Apply these questions in order:

1. **Is this an older ToVA workflow rule?** The current supported baseline wins.
2. **Is this a project/product fact?** Preserve it.
3. **Is this a stronger compatible project-specific rule?** Merge it into the relevant canonical owner as a project-specific extension.
4. **Does this artifact have a genuinely distinct role?** Retain it under the extension contract.
5. **Is it historical evidence rather than living truth?** Preserve it under the appropriate history or acceptance owner.
6. **Is it duplicate or obsolete?** Retire it only after content accounting.

Preservation-first is a write-safety policy, not a precedence rule.

## Migration Dispositions

Every source artifact, or section-level content unit when one document mixes roles, receives one reviewed disposition:

| Disposition | Meaning |
| --- | --- |
| `CREATE` | Required baseline role does not exist. |
| `REUSE` | Existing owner already satisfies the current role. |
| `MERGE` | Source and target overlap; combine unique compatible content. |
| `SPLIT` | One source contains responsibilities for several owners. |
| `RENAME_MOVE` | Role is correct but accepted path/name changes. |
| `RETAIN_EXTENSION` | Artifact has a justified distinct role beyond baseline ToVA. |
| `DISTILL_ARCHIVE` | Current truth moves elsewhere; remainder becomes history. |
| `RETIRE_AFTER_MERGE` | Container becomes obsolete after useful content is resolved. |
| `SUPERSEDED` | Old workflow rule conflicts with the current canonical contract. |
| `CONFLICT` | Owner judgment is required before migration can continue. |
| `DEFER` | Decision can wait without weakening baseline integrity or current truth. |

Do not use ambiguous `RETAIN` merely because a file exists.

## Role Before Filename

Discovery distinguishes:

- `exact_owner_candidate`;
- `semantic_role_candidate`;
- `unclassified_existing_document`.

A similar filename is evidence, not authority. `PRODUCT_VISION.md`, `KNOWN_ISSUES.md`, or `CURRENT_TASKS.md` may overlap Project Goals, Known Bugs, or Current Task, but content review confirms the mapping.

Established non-ToVA repositories may keep clear native owner paths. Canonical filenames are preferred for newly created owners. Versioned ToVA upgrades reconcile older baseline owners toward the current supported contract.

## Migration Ledger

Use the reviewed migration ledger for every material source artifact. Record:

- source path and fingerprint;
- proposed/current role, target role, and target path;
- same, overlapping, partial, distinct, historical, or obsolete relationship;
- unique, duplicated, and conflicting content;
- stronger compatible project rules;
- baseline rules that supersede older workflow;
- destination owner or owners;
- disposition and transformation;
- required verification;
- unresolved questions, stop conditions, review status, and owner decision.

Use child entries for sections that require different destinations.

Every retirement candidate records `content_reconciled`, `references_updated`, `historical_copy_required`, and `safe_to_retire`. Customized material cannot retire while `safe_to_retire` is false.

The Markdown ledger is for human/agent review. Its JSON companion is the machine-checkable finalization input. Neither becomes a second active-work owner.

## Five Migration Stages

1. **Discover — zero writes.** Confirm root, Git/work state, version, owner candidates, nested projects, current work, real verification, extensions, retirement candidates, and conflicts.
2. **Plan — zero writes.** Produce the structural plan/hash, release-specific requirements, migration ledger, and unresolved semantic decisions.
3. **Bootstrap and reconcile.** Create missing baseline owners, then deliberately reuse, merge, split, normalize, redirect, retain extensions, update references, and convert live state.
4. **Retire.** Archive/remove superseded live containers only after accepted ledger review; preserve history and eliminate duplicate authority.
5. **Accept and finalize.** Run workflow, collaboration, migration, reference, Project Health, cold-start, and project-specific checks; finalize identity only after they pass.

A completed migration must rerun with zero unexpected writes.

## Versioned Older-ToVA Upgrade

1. Select one exact project root and detect nested projects.
2. Read and validate `TOVA_INSTALLATION.json`.
3. Record branch, HEAD, dirty paths, writer, paused work, Slice, and handoff state.
4. Load the target release's `UPGRADE.json` and supported version chain.
5. Run a zero-write structural dry-run.
6. Build and review the migration ledger.
7. Resolve required conflicts before mutation.
8. Bootstrap only missing current owners.
9. Reconcile old owners and compatible local enhancements.
10. Convert execution state from current evidence, never historical guesswork.
11. Retire accepted containers and update references.
12. Run migration, workflow, collaboration, and real project gates.
13. Pass fresh-agent comprehension.
14. Finalize with the migration-evidence hash.
15. Prove a zero-write rerun.

Do not mix unrelated product feature work into a workflow migration.

## Established Non-ToVA Adoption

Inspect README, documentation, architecture, issues, roadmap/backlog, scripts, CI, release practices, current work, and source before asking questions. Then map each required ToVA role through `REUSE`, `MERGE`, `SPLIT`, or `CREATE`.

Classify major remaining documents as baseline owner, declared extension, evidence/history, or unrelated project documentation. Populate only evidence-backed facts and explicit unknowns. Project Health must use real commands; a missing gate is a blocker, not permission for a placeholder.

## Extension Contract

Every retained extra owner declares:

- Purpose;
- Owns;
- Does Not Own;
- Read When;
- Update When;
- Referenced By;
- Extends/Complements;
- Why this role is not already owned by the named baseline owner.

A strong local enhancement is migration input, not automatically a conflict. Reject it only when it violates a current canonical invariant.

## Nested Independent Projects

Each installer/checker command operates on one explicit project root. When a parent contains a nested valid ToVA root, report and exclude it from parent discovery by default. Never classify, retire, or mutate nested owners during parent migration.

When operating on the nested project, state/task ownership remains independent even if Git history is shared.

## Retirement Routing Examples

- `SESSION_RESUME.*` -> Current State, Current Task, Execution State, Notes, and Git/history.
- `TASK_STATE.*` -> Current Task, Execution State, active Slice, and historical evidence.
- `BUG_WORKFLOW.md` -> bug workflow/schema into Known Bugs; actual bugs remain in Known Bugs.
- `NEXT_TASK_CANDIDATES.md` -> section-level Current Task, Future Capabilities, Future Features, conditional Roadmap, or history.
- `CHANGE_WORKFLOW_CHECKLIST.md` -> AGENTS, Work Model, Project Health, docs map, and Current Task closeout rules.
- `DEVELOPMENT_INSTRUCTIONS.md` -> split project-specific rules into AGENTS, Architecture, and Project Health; supersede obsolete generic workflow.
- custom `TOVA_HELP.md` -> merge useful project-specific request patterns into the current Help role.

## Acceptance Boundary

Migration cannot finalize while:

- a required `CONFLICT` remains unresolved;
- a retired owner contains unresolved unique current content;
- two live documents claim the same canonical role;
- an extension lacks a distinct-role declaration;
- live references point to retired owners;
- required baseline roles or release-specific requirements are absent;
- migration evidence or required project checks have not passed.

Fresh-agent review must identify project purpose, current task, next action, state owner, verification owner, future work, extensions, nested boundaries, and historical material without outside coaching.

Installation, migration acceptance, Git commit, release approval, publication, external transport, and portable-baseline promotion remain separate decisions.
