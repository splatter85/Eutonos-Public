# Website Quality Gates

Purpose: website-specific checks to run before calling a website change complete.

Use the relevant gates for the slice being changed. Do not turn this into a broad redesign checklist when the work is narrow.

## Layout And Interaction

- Page renders without console errors.
- Layout works at mobile and desktop widths.
- Text does not overlap, overflow, or shift unexpectedly.
- Navigation links and calls to action work.
- Forms show loading, success, and failure states where relevant.
- Empty and error states are handled where relevant.

## Accessibility

- Heading structure is logical.
- Interactive controls are keyboard reachable.
- Focus states are visible.
- Form controls have labels.
- Images have appropriate alt text or intentional decorative handling.
- State is not conveyed by color alone.

## Content, Metadata, And Media

- Page title and description match the page purpose.
- SEO or social metadata is updated when page identity changes.
- Dates, prices, legal claims, and product claims are current or clearly marked as placeholders.
- Media is sized and compressed for the page context.
- Third-party scripts are documented in `docs/WEBSITE_CONNECTORS.md`.

## Verification

- Run the repo's lint/test/build or combined verify command when available.
- Use browser verification for visible layout or interaction changes when practical.
- Record any unavailable checks and why they were not run.
