# Optional Module Framework

Purpose: define the source-package boundary for optional ToVA Project Workflow capabilities without installing empty modules into projects that do not need them.

Owns: the module manifest contract, admission evidence, installed files and commands, Project Health registration, examples, and removal behavior.

Does not own: core project truth, product architecture, active work, enabled-module state, or Variant behavior. Enabled module identity belongs in the installed `TOVA_INSTALLATION.json` manifest.

Read when: proposing, reviewing, installing, checking, or retiring an optional workflow capability.

Update when: the universal module contract changes. Project-specific admission evidence changes in that project's module manifest or installation decision.

Referenced by: `docs/PROJECT_HEALTH.md`, `project-workflow/schemas/module-manifest.schema.json`, the workflow checker, installer, and acceptance fixtures.

Initialized state: no module is enabled. The framework existing in the source package does not admit any capability by itself.

## Admission Rule

A module is admitted only when all of these are true:

1. A current project need cannot be served cleanly by an existing core owner.
2. The module extends core owners without creating a second writable truth.
3. Every installed file and command is real and available in the target environment.
4. Its health checks run through Project Health and fail honestly when unavailable.
5. Its examples are executable or explicitly environment-gated.
6. Removal is defined and does not erase project-owned evidence.

Importance, possible future value, or an attractive blank template is not admission evidence.

## Package Shape

```text
modules/<module-id>/
  MODULE.json
  ...files declared by MODULE.json...
```

`MODULE.json` must conform to `project-workflow/schemas/module-manifest.schema.json`. The workflow checker additionally verifies that installed paths and declared npm commands exist.

## Health Registration

Every required module check names an exact command. When a command uses `npm run <name>` or `npm.cmd run <name>`, `<name>` must exist in the target `package.json`. A prose placeholder is a failed registration, not a deferred pass.

The core Quick, Standard, and Full gates remain owned by `docs/PROJECT_HEALTH.md`; modules add only claim-specific checks.

## Retirement

Removal deletes only module-owned paths listed in `retirement.remove`. Project evidence listed in `retirement.preserve` is distilled to its core owner or retained as readable history. The installation manifest is updated only after removal checks pass.
