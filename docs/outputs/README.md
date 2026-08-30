# Outputs

## Purpose

This directory is the repository-owned workspace for intentionally retained work products that are useful to the project but are not handoff packages and do not belong in a more authoritative document owner.

Typical outputs include bounded analysis reports, audits, comparisons, generated summaries, design or review exports, and other deliverables that a human or agent may need to find again. An output may support a decision or document what was produced, but its presence does not make its claims accepted project truth.

Use `docs/handoffs/` instead when an artifact is being prepared for a specific AI, Codex session, machine, or human receiver and needs transfer instructions, a manifest, or archive-integrity checks.

## Truth Boundary

- `docs/CURRENT_TASK.md` remains the sole live checklist owner.
- Product, architecture, capability, bug, lesson, verification, and acceptance truth remain in their existing owners.
- Generated application and build artifacts remain governed by the project's architecture owner; copying them here does not make them durable source.
- The project's workflow state root owns compact machine-readable state and generated workflow reports.
- Git owns exact history and rollback.
- An output must point to authoritative owners when it summarizes or derives from them; it must not silently replace them.

## What Belongs Here

- A report, analysis, comparison, audit, or summary intentionally retained for later reference.
- A bounded visual, data, or document export that is part of project work but is not durable source code or a transfer package.
- A user-requested deliverable that should remain with the repository and has no specific external receiver.
- A clearly labeled snapshot whose source revision and limitations are recorded.

Do not store secrets, credentials, personal or production data, signing material, dependencies, caches, routine build output, large disposable artifacts, or files already owned elsewhere.

## Recommended Shape

Use either one clearly named file or a topic directory:

```text
docs/outputs/
  README.md
  <topic>-<date>.<ext>
  <output-id>/
    README.md
    ...bounded output files...
```

For a non-trivial output, record:

- purpose and status (`draft`, `final`, or `superseded`);
- creation date and producing command, tool, or agent when useful;
- source revision or an explicit dirty-tree caveat;
- authoritative source and decision-owner links;
- checks performed and known limitations;
- whether the output is safe to commit or contains local-only material.

Prefer stable, filesystem-safe names. When an output is already referenced, create a new dated or versioned file instead of overwriting it in place.

## Lifecycle

1. Create the output only when retaining it has practical value.
2. Keep it bounded and place temporary intermediates outside the repository or in an ignored workspace.
3. Run the proportional check for the claims or format involved.
4. If the output changes project truth, update the actual owning document or source file.
5. If it becomes a transfer package, follow `docs/handoffs/README.md`; do not assume the output workspace satisfies handoff requirements.
6. If it becomes a canonical document, move the durable content into the proper owner and retire or clearly mark the old output.

Outputs are convenient retained artifacts, not automatic evidence, acceptance, publication, or release records.
