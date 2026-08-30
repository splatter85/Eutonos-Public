# Website Development Instructions

Purpose: practical implementation rules for AI agents and developers working on a website.

## Source Layers

Prefer changes in this order:

1. existing page/route source,
2. existing component,
3. existing design token/theme/style utility,
4. existing content model or fixture,
5. shared helper or API client,
6. new component or abstraction only when it removes real duplication.

## Frontend UX Rules

- Build the usable page or feature, not a marketing placeholder.
- Match the existing design system before adding new visual ideas.
- Keep components responsive by construction, not by afterthought.
- Avoid text overlap, horizontal overflow, and unstable layout shifts.
- Include loading, empty, error, and success states where the workflow needs them.
- Use semantic HTML before custom interaction code.
- Use buttons for actions and links for navigation.
- Keep focus states visible.

## Accessibility Rules

- Use one logical `h1` per page.
- Preserve heading order.
- Label form controls.
- Provide alt text for informative images.
- Mark decorative images as decorative according to the framework pattern.
- Ensure keyboard access for menus, dialogs, tabs, and custom controls.
- Do not rely on color alone to convey state.

## Performance Rules

- Use optimized image formats and sizes.
- Avoid shipping large client-side libraries for simple UI.
- Keep animation subtle and disable or reduce motion where appropriate.
- Do not add third-party scripts without documenting them in `docs/WEBSITE_CONNECTORS.md`.

## SEO And Metadata

When page identity changes, update:

- title,
- description,
- canonical URL if the repo uses one,
- Open Graph/Twitter metadata if the repo supports it,
- structured data only when it is accurate.

## Verification Notes

Record the actual commands available in this repo:

- Dev server: `[COMMAND]`
- Lint: `[COMMAND]`
- Test: `[COMMAND]`
- Build: `[COMMAND]`
- Preview: `[COMMAND]`
- Deploy: `[COMMAND_OR_PLATFORM]`

If a browser verification tool is available, use it for visible page changes.

## Error Handling And Logging

- Pages and forms should define visible error states.
- Connector-backed workflows should define loading, empty, success, and failure behavior.
- Client-side logging should be intentional and minimal in production.
- Server-side or deployment logging destinations should be recorded in `docs/WEBSITE_CONNECTORS.md`.
- Analytics events, if used, should document purpose and avoid sensitive payloads.
