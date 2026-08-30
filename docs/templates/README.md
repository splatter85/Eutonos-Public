# Workflow Template Index

## Purpose

Route agents and maintainers to the canonical reusable workflow template for the artifact they are creating.

## Write Here When

Add or change an entry only when the portable workflow adds, retires, or renames a template role.

## Do Not Use For

Do not record live work, project status, acceptance evidence, or template instructions that belong inside the named template.

## Format

Keep one row per reusable artifact type. The installed path is the canonical template owner in an initialized repository.

| Artifact | Template | Use |
| --- | --- | --- |
| Campaign plan | `docs/templates/CAMPAIGN_PLAN_TEMPLATE.md` | Multi-Slice goal, sequence, boundaries, and campaign-level proof |
| Slice plan | `docs/templates/SLICE_PLAN_TEMPLATE.md` | One bounded implementation/review unit and optional Action Registry |
| Campaign Context Capsule | `docs/templates/CAMPAIGN_CONTEXT_CAPSULE_TEMPLATE.md` | Compact or expanded campaign-level navigation context for a cold receiver |
| Slice Execution Packet | `docs/templates/SLICE_EXECUTION_PACKET_TEMPLATE.md` | Compact or expanded bounded executor instructions for one Slice |
| Agent Note | `docs/templates/AGENT_NOTE_TEMPLATE.md` | Sparse non-authoritative observation that may cross a session boundary |
| Exchange README | `docs/templates/EXCHANGE_README_TEMPLATE.md` | Human entry point for one execution Exchange |
| Exchange JSON | `docs/templates/EXCHANGE_TEMPLATE.json` | Machine-readable Exchange identity, lifecycle, authority, revisions, and evidence |
| Execution Receipt | `docs/templates/EXECUTION_RECEIPT_TEMPLATE.json` | Append-only local execution receipt under the receipt owner |
