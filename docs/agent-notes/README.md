# Agent Notes

Agent Notes are sparse repository-carried working memory for observations that may matter after a session or environment boundary but are not yet authoritative project truth.

Copy `docs/templates/AGENT_NOTE_TEMPLATE.md` and use:

```text
docs/agent-notes/<campaign-or-workstream>/NOTE-<campaign-or-workstream>-<NNN>.md
```

The front-matter `id` must equal the filename stem and opening/closing `---` delimiters are required. Valid states are `open`, `investigating`, `promoted`, `resolved`, `dismissed`, and `superseded`.

An optional `INDEX.json` lists only open/relevant Notes as objects containing `id`, `title`, `slice`, and `status`; do not use a string-only list.

A Note cannot establish a bug, Feature, Capability, architecture decision, passing check, or acceptance. Target under 300 words, hard maximum about 600, normally 3-5 relevant open Notes. Promote, resolve, dismiss, supersede, or explicitly carry them forward at Slice/Campaign closeout.

When an Exchange receiver creates a Note, list its ID in `EXCHANGE.json.response.notes_created`. That reference does not promote the Note into proof or accepted truth.
