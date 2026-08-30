# Architecture

`content/events.json` is durable event source, `src/site.js` renders static cards, and `overlays/website/` owns website-specific workflow guidance. Connector notes describe a read-only boundary; generated site output is disposable.
