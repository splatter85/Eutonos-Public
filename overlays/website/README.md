# Website Overlay

Purpose: website-specific guidance to add on top of the universal development starter kit.

Use this overlay when the repo is a marketing site, documentation site, ecommerce storefront, CMS-driven content site, web app shell, or other browser-delivered experience.

## Included Files

- `docs/WEBSITE_DEVELOPMENT_INSTRUCTIONS.md`: website implementation rules for UX, accessibility, performance, SEO, and verification.
- `docs/WEBSITE_CONNECTORS.md`: website-specific connector template for APIs, CMS, analytics, auth, payments, forms, deployment, media, and third-party scripts.
- `docs/WEBSITE_QUALITY_GATES.md`: completion gates for layout, interaction, accessibility, metadata, media, forms, and verification.

## How To Apply

1. Start with the universal kit at the repo root.
2. Copy this overlay's `docs/` files into the target repo's `docs/` folder.
3. Add the website docs to the target repo's `docs/README.md` start-here list if they apply to active work.
4. Fill in real framework, package manager, dev, lint, test, build, preview, and deploy commands.
5. Document real integrations in `docs/WEBSITE_CONNECTORS.md`.

Keep universal workflow rules in the root kit. Add website-specific guidance here only when it would be noise in a non-website repo.
