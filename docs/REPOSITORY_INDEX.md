# Repository Navigation Index

## Purpose

Provide an ATLAS-light route map for a cold agent that knows the work intent but not the repository shape. The machine-readable companion is `docs/REPOSITORY_INDEX.json`.

## Authority Boundary

This index is navigation context only. It does not own architecture, goals, capability/feature truth, active work, decisions, proof status, acceptance, or history. Those facts remain in the canonical files named by each route. A route may identify where to inspect or likely edit; it cannot authorize an edit or prove a claim.

It complements rather than replaces `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_LANGUAGE.md`, `docs/CURRENT_TASK.md`, and `.project/EXECUTION_STATE.json`. The document map routes ownership, Architecture explains construction, Design Language owns visual/UI and copy conventions, and Current Task/Execution State own active work and coordination. This index only groups exact paths by common repository-change intent.

## How To Use It

1. Start from normal boot and the active Slice.
2. Choose the smallest matching `route://...` entry.
3. Read every `primary_owners` and `inspect_first` path.
4. Treat `likely_change_surfaces` as collision/navigation hints, never preauthorized scope.
5. Select proof from the Slice and `docs/PROJECT_HEALTH.md`; route verification paths do not imply a pass or universal requirement.
6. Load `conditional_references` only when the related question or failure arises.
7. If a path is missing or conflicts with a canonical owner, stop using the summary and inspect direct sources.

## Initialization And Freshness

The installed seed covers portable workflow routes. During project initialization or accepted migration, extend or replace its project/product/architecture route details with exact existing source, test, and proof paths. Review it when a canonical owner, entrypoint, source/test/proof route, or portable role changes, or when a handoff exposes a missing route. Do not update it for routine progress or evidence-status changes.
