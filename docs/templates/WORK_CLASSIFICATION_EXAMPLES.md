# Work Classification Examples

These fixtures help a fresh human or agent choose the lightest useful work type before planning. `docs/WORK_MODEL.md` owns the definitions. These examples test the boundary; they do not create an additional queue.

## Classification Fixtures

| Raw request or discovery | Expected classification | Reason |
| --- | --- | --- |
| Fix a typo in an internal paragraph. | Routine Polish | Local copy only; no shared behavior, navigation, accessibility, data, or material risk. |
| Change several button labels whose wording is part of an accessibility test and onboarding flow. | Slice | Copy now crosses shared interaction and acceptance boundaries; one coherent outcome can be verified together. |
| Repair one validator rule and add its regression test. | Standalone Slice | One source-owned behavior and one focused proof; no parent Campaign is required. |
| Replace a persistence model across schema, writes, reads, migration, recovery, and release acceptance. | Campaign | Several dependent outcomes, shared owners, durable data risk, and a composed acceptance gate are present. |
| While executing the planned persistence switch, inspection shows schema versioning and production read cutover can be verified independently. | Sub-slices of the planned Slice | Live evidence revealed separable owners and gates. These are outcomes, not merely implementation steps. |
| Rename a local variable while making an already planned source fix. | Implementation step inside the active Slice | It has no independent user, behavior, docs, state, or proof outcome. |
| "Improve the whole application." | Bounded discovery first; classification pending | The request does not yet expose coherent outcomes, owners, risks, or gates. Do not invent a giant Campaign before inspection. |
| Notice unrelated visual polish during a security Slice. | Routine Polish later or route to future work | It must not broaden the active security boundary; classify independently only if promotion criteria appear. |
| Build one documentation checker that validates owner links used by several workflow docs. | Slice, normally inside the workflow Campaign | One tool outcome crosses shared workflow owners and needs focused plus integration evidence. |
| Add three unrelated small features because they fit in one chat session. | Three Slices or a Campaign only if real dependencies exist | Session length is not a coherence boundary. Unrelated outcomes should not be bundled for convenience. |

## Fresh-Agent Planning Sample

Raw request:

> Add Campaign and Slice templates so another agent can plan work without asking us how the workflow works.

### 1. Classify

This is a **Campaign Slice** under `TOVA7`, not a new Campaign: it has one coherent documentation outcome, advances an existing Campaign, and can be verified independently. It is not Routine Polish because it changes the shared planning contract.

### 2. Name The Boundary

- **Work ID:** `TOVA7.2`
- **Name:** Work Model And Planning Templates
- **Parent type:** Campaign
- **Parent ID:** `TOVA7`
- **Goal:** A fresh user or agent can classify meaningful work and produce a bounded plan from repository docs without chat history.
- **Non-goals:** no continuity consolidation, documentation checker, optional modules, installer, starter-kit mirror, or accepted-baseline promotion.

### 3. Inspect Before Finalizing

- Read `docs/WORK_MODEL.md`, `docs/PROJECT_HEALTH.md`, `docs/CURRENT_TASK.md`, `README.md`, and `docs/README.md`.
- Inspect existing workflow bootstrap/evaluation templates to identify compatibility consumers and avoid duplicate planning owners.
- Confirm that one Slice template can represent standalone, Campaign, and Sub-slice work with explicit parent fields.

### 4. Plan The Change

- Add `docs/templates/CAMPAIGN_PLAN_TEMPLATE.md` with admission, outcomes, invariants, Slice dependencies, interruption, rollback, acceptance, and closeout.
- Add `docs/templates/SLICE_PLAN_TEMPLATE.md` with parent relationship, readiness, exact change, risks, gate, stop conditions, and final report.
- Add classification fixtures that include Routine Polish, standalone Slice, Campaign, Sub-slice, discovery, and "implementation step" boundaries.
- Link these surfaces from the Work Model, README, and docs map.
- Update only the live task board and milestone changelog at closeout.

### 5. Select Evidence

- **Required gate:** Standard Project Health because the Slice changes a shared workflow contract used by later Slices.
- **Focused evidence:** required-heading checks for both templates; inspection that each fixture has one expected classification; reference search for all new files; fresh-agent sample review against the Slice template.
- **Integration evidence:** `npm.cmd run architecture:check`, `npm.cmd run verify`, `git diff --check`, and final tree review.

### 6. Define Stop Conditions

Stop if the examples encourage formal plans for routine polish, require separate Slice templates for each parent type, conflict with Work Model statuses, create a second active queue, or require continuity/tooling changes assigned to a later Slice.

This sample is complete enough for execution because it identifies one outcome, existing owners, likely edits, non-goals, risks, checks, state updates, and stop conditions. It does not pretend implementation has passed before the stated evidence runs.
