# Design Language

Document status: LIVING

## Purpose

This document is the durable owner for the project's visual language and user-facing language. It tells contributors what to reuse, where reusable surfaces live, how the interface should look and behave, and how the product should speak to users.

It owns:

- the current visual character and design principles;
- canonical paths for themes, tokens, styles, components, controls, templates, layouts, icons, and other reusable surfaces;
- typography families, semantic sizes, weights, and line heights;
- spacing, shape, elevation, motion, responsive, and accessibility defaults;
- control hierarchy and interaction-copy conventions;
- voice, tone, terminology, capitalization, labels, help, status, empty-state, confirmation, and error-message style;
- the review checklist for visual or user-facing copy changes.

It does not own product behavior, architecture, implementation status, active work, or acceptance evidence. Those remain in `docs/ARCHITECTURE.md`, the Capability/Feature owners, `docs/CURRENT_TASK.md`, and `docs/PROJECT_HEALTH.md`.

Read this document before creating or changing a user-visible surface, visual token, component, template, interaction label, help message, error, onboarding step, or public/product copy. Update it when a reusable source moves or an accepted design/copy rule changes, not for one-off experiments.

## Authority And Evidence Rules

1. Existing project-native design and voice owners take precedence during adoption. Reconcile and link them here; do not erase a stronger established system.
2. Record actual source paths. A screenshot, mockup, generated file, or prose description is evidence or guidance, not automatically the reusable source.
3. Mark every unconfirmed value `Unconfirmed` rather than inventing branding, fonts, colors, or tone during workflow installation.
4. Prefer semantic roles such as `surface`, `text-muted`, `danger`, `body`, or `primary action` over isolated hex values, arbitrary sizes, or page-specific class names.
5. A design or copy rule is current only when its source and applicable scope are named. Planned redesigns belong in future or planned-work owners.

## Current Project Contract

Complete this table from repository evidence and owner decisions.

| Area | Current rule | Canonical source or owner | Status / scope |
| --- | --- | --- | --- |
| Visual character | Unconfirmed | This document after owner confirmation | Open |
| Browser UI font | Use the existing project stack; otherwise the portable fallback below | Record exact token/style path | Unconfirmed |
| Native/desktop UI font | Use the platform UI font unless the project bundles another family | Record exact adapter/style path | Unconfirmed |
| Monospace font | Use the existing project stack or platform monospace | Record exact token/style path | Unconfirmed |
| Type scale | Use the existing project scale or the portable fallback below | Record exact token/style path | Unconfirmed |
| Color and themes | Unconfirmed | Record exact token/theme path | Open |
| Spacing, radii, elevation | Unconfirmed | Record exact token/theme path | Open |
| Motion | Respect reduced-motion preferences; otherwise unconfirmed | Record exact motion source | Open |
| Voice and tone | Direct, clear, factual fallback; replace with confirmed project voice | This document | Provisional fallback |

## Reusable Surface Registry

Replace `None confirmed` with exact repository paths as reusable sources are found or created. Link to stronger specialist owners instead of copying their contents.

| Surface | Canonical source paths | Reuse rule | Status |
| --- | --- | --- | --- |
| Design tokens / theme variables | None confirmed | Reuse semantic tokens before adding values | Open |
| Typography roles and scale | None confirmed | Reuse named text roles before one-off sizes | Open |
| Buttons and action controls | None confirmed | Reuse the shared control and its variants | Open |
| Inputs, forms, validation | None confirmed | Reuse field, label, hint, and error patterns together | Open |
| Cards, panels, dialogs, navigation | None confirmed | Reuse an existing surface when its semantics match | Open |
| Page/window/layout templates | None confirmed | Start from the closest maintained template | Open |
| Icons, illustrations, media assets | None confirmed | Reuse the owned asset system and preserve provenance/licensing | Open |
| User-facing strings / terminology | None confirmed | Reuse the glossary and product terms below | Open |
| Visual/copy proof | None confirmed | Record screenshot, UI, accessibility, or human-review owners | Open |

Before creating a new primitive, search the registry above and the repository. Prefer, in order: reuse; add a documented variant; compose existing primitives; then create a new primitive with a named gap, source owner, and verification path.

## Portable Visual Fallback

Use this only when the repository has no stronger confirmed design system. It is a neutral starting point, not invented brand identity.

### Typography

- Browser UI: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Windows/native UI: `Segoe UI`; other platforms use their system UI family.
- Code, IDs, logs, and machine values: the project's monospace stack or platform monospace.
- Use no more than three weights on one surface: regular `400`, medium `500`, and bold `700`.

| Role | Size | Line height | Typical weight |
| --- | ---: | ---: | ---: |
| Caption / metadata | 12 | 16 | 400-500 |
| Label / secondary text | 14 | 20 | 400-500 |
| Body / control text | 16 | 24 | 400-500 |
| Section heading | 20 | 28 | 600-700 |
| Page/window title | 24 | 32 | 600-700 |
| Display / major metric | 32 | 40 | 600-700 |

Sizes are CSS-pixel equivalents. Native targets may map them to target units while preserving hierarchy, legibility, and user scaling. Do not disable browser zoom or operating-system text scaling.

### Layout And Interaction

- Use a small named spacing scale rather than arbitrary gaps. A neutral fallback is `4, 8, 12, 16, 24, 32, 48`.
- Keep one obvious primary action per local decision area. Secondary actions should be quieter; destructive actions must be visually and verbally explicit.
- Maintain visible hover, focus, active, selected, disabled, loading, success, warning, and error states where applicable.
- Do not use color alone to communicate meaning. Preserve keyboard operation, focus order, labels, contrast, target size, zoom/reflow, and reduced-motion behavior.
- Prefer calm, short motion that explains state change. Decorative motion must not delay work or hide status.

## Language And Copy Style

### Default Voice

Write like a capable collaborator helping the user complete a real task:

- lead with the outcome or required action;
- use direct, concrete, factual language;
- prefer active voice and ordinary words;
- name the actual object, action, state, and consequence;
- distinguish current, experimental, planned, unavailable, and failed states;
- preserve uncertainty instead of filling gaps with confident language;
- avoid hype, vague reassurance, internal implementation jargon, and blaming the user.

Use sentence case for headings, labels, menu items, buttons, and messages unless a proper name requires otherwise. Keep abbreviations and product names consistent with the glossary.

### Interaction Copy

| Surface | Pattern | Example |
| --- | --- | --- |
| Button | Verb or verb + object | `Save`, `Retry upload`, `Delete checkpoint` |
| Field label | Name the requested value | `Output folder` |
| Hint | Explain format or consequence, not the label again | `Used for generated reports.` |
| Loading | Name the work in progress | `Checking 24 files...` |
| Success | State what completed and what is now true | `Report saved to Downloads.` |
| Empty state | Explain what is absent and the next useful action | `No runs yet. Start a run to create the first checkpoint.` |
| Warning | Name the risk before the action | `This source changed after the checkpoint.` |
| Error | What happened, impact, next action; technical detail second | `The report could not be saved. Choose another folder and try again.` |
| Confirmation | Name the object, scope, consequence, and recovery | `Delete this local checkpoint? The source file will not be deleted.` |

Do not use `OK`, `Submit`, `Yes`, or `No` when a specific action label would make the result clearer. Never call an operation successful before its owning check completes.

### Project Glossary

Record approved terms, capitalization, terms to avoid, and short user-facing definitions.

| Use | Meaning / context | Avoid |
| --- | --- | --- |
| Unconfirmed | Add approved project term | Add rejected or ambiguous synonym |

## Change Workflow

For a visual or copy change:

1. Read this owner and inspect the registry paths above.
2. Identify the durable source: token/theme, component, template, asset, or source string.
3. Reuse before extending; extend before creating a new primitive.
4. Check all relevant states and nearby consumers, not only the happy-path screenshot.
5. Run the gate in `docs/PROJECT_HEALTH.md` and any visual, accessibility, content, claims, localization, or human-review gate named by the project.
6. Update this document only when the reusable rule, canonical path, or accepted language changes.

## Review Checklist

- [ ] The change uses or deliberately updates a canonical reusable source.
- [ ] Font, size, spacing, color, state, and responsive behavior follow the current contract.
- [ ] Labels and messages use approved terms and state the real action or outcome.
- [ ] Loading, empty, error, retry, disabled, destructive, and recovery states were considered.
- [ ] Keyboard, focus, contrast, zoom/reflow, target size, and reduced motion were considered where applicable.
- [ ] Generated output was not made the permanent fix owner.
- [ ] Verification and remaining human/visual acceptance are reported separately.
