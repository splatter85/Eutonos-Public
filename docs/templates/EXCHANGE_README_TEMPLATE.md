# Exchange README Template

## Purpose

Use this file as the human entry point for one bounded execution Exchange at `docs/handoffs/XCH-.../README.md`.

## Write Here When

Create it with the neighboring `EXCHANGE.json` when an integration owner transfers one named Campaign or Slice to a receiver. Keep summaries aligned with the JSON, which remains authoritative for identity, lifecycle, authority, revisions, amendments, response, and integration review.

## Do Not Use For

Do not use this as a second task board, acceptance record, generic portable handoff receipt, or substitute for `EXCHANGE.json`. Do not make a historical Exchange active merely because its directory still exists.

## Format

Replace every `EXAMPLE-` value. Delete explanatory comments that do not apply. At terminal closeout, say explicitly that the Exchange is historical and non-executable.

---

# EXAMPLE Exchange: XCH-EXAMPLE-SL12-001

Lifecycle: `ready`

Authoritative contract: `EXCHANGE.json`

Template reference: `docs/templates/EXCHANGE_README_TEMPLATE.md`

## Mission

EXAMPLE-Implement only Slice SL12 from the pinned source revision and return the required evidence.

## Start Here

1. Read `EXCHANGE.json` completely.
2. Confirm its source revision, branch strategy, target capabilities, authority envelope, and required verification owners.
3. Read the exact procedure owners and source routes named by the request.
4. Resolve `context_packet`: honor an explicit compact/expanded request, or record the selected profile and reason when `auto`. Open only the named Capsule/Packet and route sources.
5. Stop if the branch, revision, authority, context packet, or repository state contradicts the request.

## Workspace

- Mode: `serial_shared_branch`
- Integration branch: `EXAMPLE-main`
- Work branch: `EXAMPLE-main`
- Writer rule: one active source writer; transfer the lease only after the outgoing writer stops.

For `parallel_isolated_branch`, use a distinct work branch and isolated checkout. Separate branches do not isolate shared databases, services, devices, or credentials.

## Authority Summary

EXAMPLE-Source, tests, and bounded documentation may change inside the mission. New Slice work, architecture changes, destructive authority expansion, external writes, and public exposure remain forbidden unless a durable human amendment explicitly changes the relevant structured permission.

## Return Contract

For `returned`, set `response` with:

- `tested_source_revision`: exact source revision actually tested;
- `source_commits_added`: source commits added by the receiver, excluding a later metadata-only response commit;
- `verification_results`: every requested verification ID exactly once with `passed`, `failed`, `blocked`, or `not_run`;
- `scope_outcome`: concise result inside the assigned mission;
- `material_additional_work`: necessary adjacent work performed inside authority;
- `notes_created`: durable Agent Note IDs, if any; and
- `sensitive_data`: `{ "included": false, "declaration": "No sensitive or local-only material included." }` unless the safe declaration needs different wording.

Do not claim the later metadata-response commit was tested. Git identifies that commit.

## Integration Closeout

For `integrated`, the integration owner records:

```json
{
  "integrated_revision": "0000000000000000000000000000000000000000",
  "disposition": "integrated",
  "reviewer_owner": "EXAMPLE-integration-owner",
  "verification_results": [
    { "id": "EXAMPLE-INTEGRATION-001", "status": "passed" }
  ],
  "notes_reconciled": []
}
```

Replace every demonstration value. Verification results here describe proportional integration review, especially after an authorized integration fix; they do not rewrite receiver results. The integrated revision may equal the tested source revision in serial mode.

For `cancelled` or `superseded`, record `terminal_reason`. Clear the active Exchange pointer for every terminal lifecycle.
