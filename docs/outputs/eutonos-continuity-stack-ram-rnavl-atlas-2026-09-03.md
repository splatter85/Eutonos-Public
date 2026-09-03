# EUTONOS Continuity Stack: Working RAM, RNAVL, ATLAS, and Traceable Agent Memory

**Status:** working design synthesis; not current implemented architecture or acceptance truth.

**Created:** 2026-09-03

**Source revision:** `9b75ade6475969291ec04cb4877ac59bfe8fe35f`

**Purpose:** Capture an emerging architecture for agent continuity in which active working memory, navigation, semantic understanding, provenance, source freshness, and canonical evidence form one coherent stack. This document is intentionally broader than repository coding. The same primitives may support repositories, long-running conversations, memory systems, procedures, skills, business knowledge, research, and multi-agent work.

---

## 1. Core Realization

Several mechanisms that can appear to solve separate problems are actually complementary layers of one continuity system.

```text
WORKING RAM
"What matters right now?"

        ↓

RNAVL
"Where is the real thing?"

        ↓

ATLAS
"What is this thing, how does it relate,
and what could changing it affect?"

        ↓

CANONICAL SOURCE
"What is actually true at revision X?"

        ↑

HARNESS
"Is everything above this line still valid?"
```

The model itself does not need to remember the full history, the whole repository, or every source document. The harness should provide a compact, verified working model and preserve a route back to the exact evidence whenever more detail is needed.

The system therefore separates five different questions:

1. **Working RAM:** What should the model care about for this task now?
2. **RNAVL:** Where can the relevant source, skill, memory, procedure, or entity be found?
3. **ATLAS:** What does that thing mean, how is it connected, and what are the consequences of acting on it?
4. **Canonical Source:** What is the authoritative underlying evidence?
5. **Harness:** Is the derived state still trustworthy, and what should be injected into the model context at this moment?

This is more powerful than treating memory as chat history, summaries, embeddings, or a vector database alone.

---

## 2. Product Thesis

A useful agent does not need to remember everything.

It needs a system that:

- remembers what currently matters;
- knows where that information came from;
- knows how to retrieve the original source;
- knows whether the source or derived claim has changed;
- distinguishes current truth from historical evidence;
- can recover additional context only when necessary;
- can survive model replacement, context resets, process restarts, and worker replacement;
- avoids paying the token cost of reconstructing the same working model every turn.

A compact statement of the thesis is:

> **Agents should not have to remember everything. They need a continuity system that remembers what matters, knows where it came from, knows whether it is still valid, and can restore the exact source when needed.**

---

## 3. The Continuity Stack

### 3.1 Working RAM

**Question:** What matters right now?

Working RAM is the model-facing active state of the task. It should be compact, frequently updated, and optimized for continuity rather than archival completeness.

Possible contents:

- current objective;
- active subtask or Slice;
- active screen, component, file, record, or entity;
- recent decisions;
- unresolved questions;
- open loops;
- constraints;
- relevant source pointers;
- recently used skills;
- task-specific facts;
- active referents such as "that screen", "the previous button", or "the issue we just discussed";
- verification status;
- handoff state.

Working RAM should not become a copy of the repository or a giant transcript. It is the **attention state** of the task.

Conceptually:

```yaml
working_ram:
  task_id: TASK-1842
  objective: Repair overflow behavior on Sheet 4

  active_referents:
    screen.current:
      entity: ui.sheet4
      source_ref: rnavl:source:sheet4-view
      confidence: 0.98

    component.last_discussed:
      entity: ui.shared.sheet-header

    issue.active:
      entity: issue.sheet4.overflow

  constraints:
    - preserve shared template behavior
    - do not change persistence

  unresolved:
    - local overflow acceptance is still open
```

The model should receive this state directly instead of repeatedly reconstructing it from chat history and repository searches.

---

### 3.2 RNAVL

**Question:** Where is the real thing?

RNAVL should be treated as more than a repository file finder.

Its deeper role is **navigation across a source-backed knowledge space**.

The first obvious use is repository navigation:

```text
semantic thing
    ↓
file / symbol / route / test / owner
```

But the same navigation primitive can generalize to:

```text
memory concept
    ↓
RAM object / original conversation / note / decision

skill intent
    ↓
skill / procedure / tools / prerequisites / verification

project concept
    ↓
canonical document / section / current task / evidence

business entity
    ↓
record / source system / owner / relationship

research claim
    ↓
source document / passage / revision / evidence object
```

This suggests RNAVL is not merely "ATLAS-lite for repositories." It can become the **routing and address layer for EUTONOS knowledge**.

A generalized RNAVL answer should be able to say:

```yaml
entity: ui.sheet4
locations:
  implementation:
    uri: repo://FormulatorOS/Sources/Sheet4View.swift
    symbol: Sheet4View
  test:
    uri: repo://FormulatorOS/Tests/Sheet4Tests.swift
  design:
    uri: doc://guided-mode/design-language#sheet-header
  working_memory:
    uri: wram://TASK-1842/referents/screen.current
```

Or for a skill:

```yaml
intent: "review a repository change for blast radius"
route:
  skill: skill.review-code-blast-radius
  procedure: procedure://code/review-blast-radius
  required_sources:
    - atlas://repo/change-graph
    - rnavl://repo/tests
  verification:
    - test impact
    - dependency impact
```

The key idea is that **RNAVL answers where, not why**.

It should be cheap, deterministic where possible, and optimized for fast resolution.

---

### 3.3 ATLAS

**Question:** What is this thing, how does it relate, and what could changing it affect?

ATLAS is the deeper semantic layer.

Where RNAVL resolves location, ATLAS should resolve meaning and relationships.

Possible ATLAS responsibilities:

- canonical semantic identities;
- code and document relationships;
- ownership;
- dependencies;
- writers and readers;
- tests;
- call paths;
- UI journeys;
- business relationships;
- decision relationships;
- impact and blast radius;
- source-backed explanations;
- cross-repository mounts;
- confidence and provenance;
- historical relationship changes;
- semantic aliases.

Conceptually:

```text
RNAVL:
"Sheet 4 header is implemented here."

ATLAS:
"Sheet 4 header reuses SharedSheetHeader, which is also used by Sheets 1-5;
changing its spacing affects all five screens, three snapshots, and one layout test."
```

ATLAS therefore allows the model to reason about consequences without scanning and rebuilding the same relationship graph every time.

---

### 3.4 Canonical Source

**Question:** What is actually true?

Canonical sources remain authoritative.

Examples include:

- exact source code at a Git revision;
- a versioned design document;
- a database record;
- an immutable user message;
- an accepted decision record;
- a signed or versioned procedure;
- a source document or research paper;
- a task state owner;
- a verified external system response.

Neither Working RAM, RNAVL, nor ATLAS should silently become a competing source of truth.

They are derived systems that make truth economical to locate, understand, and use.

---

### 3.5 Harness

**Question:** Is the derived state still valid, and what should the model see now?

The harness is the trust and context-control layer around all other components.

Possible responsibilities:

- freshness checks;
- provenance validation;
- staleness detection;
- supersession handling;
- context budgeting;
- selective expansion;
- context compaction;
- model routing;
- worker replacement;
- source paging;
- reference resolution;
- task state lifecycle;
- privilege boundaries;
- verification requirements;
- handoffs;
- observability and token accounting.

The harness should not merely hand the model retrieved text. It should determine **what kind of thing each retrieved object is and how much trust it deserves**.

---

## 4. Traceable Compaction

Model-native context compaction preserves enough information for a model to continue, but a stronger harness can preserve both a compact representation and a stable route back to the original source.

Instead of only:

```text
Summary:
The user wants Sheet 4's header slightly smaller.
```

store:

```yaml
id: WRAM-UI-184
kind: working_memory
summary: The owner wants the Sheet 4 header slightly smaller.

evidence:
  - uri: conversation://session-892/message-8392
  - uri: image://session-892/image-293

referents:
  - atlas://ui/sheet4
  - rnavl://repo/FormulatorOS/Sheet4View.swift#Sheet4View

source_state:
  conversation_message: immutable
  code_revision: abc123
```

The compact object is cheap to inject.

When more nuance is needed:

```text
expand WRAM-UI-184
```

The harness can return the original exchange, image metadata, source passage, or canonical source.

This is **provenance-aware compaction**.

A useful distinction is:

> **Compaction remembers enough to continue. Traceable RAM remembers what matters, where it came from, and how to recover the original evidence.**

---

## 5. Stable IDs and Durable Referents

Stable IDs allow continuity to survive paraphrasing, model replacement, and changing file locations.

Recommended identity classes could include:

```text
wram://TASK-1842/referent/screen.current
ram://decision/database-platform
rnavl://repo/FormulatorOS/ui.sheet4
atlas://entity/ui.shared.sheet-header
conversation://session-892/message-8392
source://repo/FormulatorOS/blob/<git-blob-sha>
skill://review-code-blast-radius
procedure://code/review-blast-radius
experience://TASK-1271/scheduler-double-run
```

The human-readable label may change. The stable identity should not.

For example:

```text
"Create Formula"
"Formula Builder"
"Builder screen"
```

may all resolve to:

```text
atlas://ui/formula-builder
```

RNAVL can then resolve the current physical implementation of that semantic identity.

---

## 6. Referent Continuity

Long-running work contains many vague but perfectly natural references:

- "that screen";
- "the last thing";
- "the header";
- "the issue from before";
- "this card";
- "the import flow";
- "the file we changed earlier".

Humans maintain these references almost automatically. Models frequently reconstruct them from recent context and source searches.

Working RAM should explicitly maintain **active referents**.

Example:

```yaml
active_referents:
  screen.current:
    target: atlas://ui/formula-builder
    last_confirmed_by: conversation://session-892/message-8392
    confidence: 0.99

  component.current:
    target: atlas://ui/formula-builder/header
    source: rnavl://repo/FormulatorOS/FormulaBuilderView.swift#Header

  issue.current:
    target: ram://issue/header-spacing
```

This can eliminate repeated inference and search.

If a screenshot is supplied, the harness or model can use visual anchors to update those referents, while RNAVL verifies the implementation location.

---

## 7. Truth Hierarchy

The harness should enforce a clear truth hierarchy.

A proposed hierarchy is:

```text
Canonical source
    >
verified ATLAS assertion
    >
verified RNAVL mapping
    >
source-backed RAM entry
    >
unverified RAM inference
    >
model recollection
```

When two layers disagree, the more authoritative layer wins.

Example:

```text
RAM says A.
Canonical source now says B.

Result:
B wins.
RAM is invalidated, refreshed, or superseded.
```

This should be a harness rule, not merely a prompt suggestion.

---

## 8. Core Invariants

Two invariants should govern durable agent memory.

### Invariant 1: Durable belief requires provenance

> **No important agent belief should become durable unless it is either canonical itself or traceable to canonical evidence.**

A derived belief may be stored, but its provenance must be retained.

### Invariant 2: Current injection requires freshness

> **No durable derived belief should be injected as current without a freshness check appropriate to its source type.**

These two rules convert memory from a loose retrieval mechanism into maintained knowledge state.

---

## 9. Freshness Is Source-Type Specific

Not every source becomes stale in the same way.

### 9.1 Mutable technical sources

Examples:

- code;
- configuration;
- docs;
- schemas;
- generated indexes;
- APIs;
- database records.

These may become stale because the source itself changed.

Possible freshness markers:

- Git commit SHA;
- Git blob SHA;
- file hash;
- symbol hash;
- document revision;
- database row version;
- ETag;
- updated timestamp;
- source-system cursor.

Example:

```yaml
ram_id: RAM-441
summary: Save toolbar is owned by CreateFormulaView.
source:
  uri: repo://FormulatorOS/CreateFormulaView.swift
  symbol: CreateFormulaView
  revision: 8d793d
  source_hash: a81f...
freshness: verified
```

If the source hash changes, the harness does not have to assume the RAM entry is wrong, but it does have to mark it **unverified against current source** until refreshed.

### 9.2 Immutable historical evidence

Conversation messages are different.

A prior message usually does not become stale. It remains true as evidence that something was said at that time.

What changes is the **current interpretation or decision**.

Example:

```text
Message 142:
"We're going with SQLite."

Message 193:
"Actually, use Postgres."
```

Message 142 is not invalid historical evidence.

Instead:

```yaml
ram://decision/database-platform:
  current_value: Postgres
  supported_by: conversation://message-193
  supersedes:
    - conversation://message-142
```

The system must distinguish:

- stale source;
- stale derived assertion;
- superseded decision;
- historical evidence;
- unresolved conflict.

---

## 10. Suggested RAM Object Contract

A generic RAM object could contain:

| Field | Purpose |
| --- | --- |
| `ram_id` | Stable identity |
| `kind` | decision, referent, observation, procedure index, task state, etc. |
| `summary` | Compact model-facing representation |
| `source_ids` | Stable provenance links |
| `source_anchors` | Symbols, sections, messages, rows, passages |
| `source_revisions` | Git SHA, doc revision, row version, timestamp |
| `source_hashes` | Fingerprints of exact supporting material |
| `verified_at` | Last successful validation |
| `freshness` | verified, stale, unknown, orphaned, superseded |
| `superseded_by` | Newer object or evidence |
| `confidence` | Optional confidence for derived/inferred material |
| `scope` | task, project, workspace, user, global |
| `expires_at` | Optional TTL for transient Working RAM |
| `related_entities` | ATLAS identities |
| `routes` | RNAVL locations |

The RAM object should remain small. The source may remain arbitrarily large.

---

## 11. Harness Freshness Loop

A retrieval should not end when a semantic match is found.

It should pass through a trust check.

```text
User asks question
      ↓
RAM retrieval finds RAM-441
      ↓
Harness checks provenance
      ↓
Is source state still compatible?
      │
   YES│                 NO / UNKNOWN
      ▼                         ▼
use RAM                mark unverified
      │                         │
      │                  reload source
      │                         │
      │                  refresh/revalidate
      └──────────────┬──────────┘
                     ▼
               context packet
```

The expensive path should be paid only when necessary.

This makes RAM analogous to a verified cache rather than a competing truth store.

---

## 12. RNAVL as a General Knowledge Router

The most important extension in this design is to treat RNAVL as a reusable navigation primitive rather than only a repository map.

### Repository navigation

```text
"Where is the ingredient picker?"
    ↓
RNAVL
    ↓
file + symbol + owner + test
```

### Memory navigation

```text
"What did we decide about database selection?"
    ↓
RNAVL
    ↓
current RAM decision + original message + decision note
```

### Skill navigation

```text
"How do we review blast radius?"
    ↓
RNAVL
    ↓
skill + procedure + tools + verification + relevant experience
```

### Project navigation

```text
"What's currently blocking release?"
    ↓
RNAVL
    ↓
current task owner + relevant acceptance evidence + unresolved decision
```

### Cross-system navigation

```text
"Where does this customer requirement live?"
    ↓
RNAVL
    ↓
CRM record + contract passage + implementation issue + owner
```

This creates a common address space that higher layers can use without understanding every storage backend.

RNAVL becomes the answer to:

> **Given a semantic target, where should the system look?**

ATLAS then answers:

> **Given that target, what does it mean and what is connected to it?**

---

## 13. Context Compilation

The harness should compile context instead of allowing every worker to rediscover it.

Conventional flow:

```text
Task
  ↓
model interprets objective
  ↓
searches repo
  ↓
searches memory
  ↓
finds procedures
  ↓
reconstructs current state
  ↓
finally begins work
```

Continuity-stack flow:

```text
Task
  ↓
Working RAM identifies current state
  ↓
RNAVL resolves exact locations
  ↓
ATLAS supplies relationships and impact
  ↓
Harness validates freshness
  ↓
Context compiler creates packet
  ↓
Fresh worker begins near productive execution
```

Possible packet:

```yaml
task:
  id: TASK-1842
  objective: Repair Sheet 4 overflow behavior

working_state:
  current_screen: atlas://ui/sheet4
  active_issue: ram://issue/sheet4-overflow

routes:
  implementation: rnavl://repo/Sheet4View.swift#Sheet4View
  shared_template: rnavl://repo/SheetTemplate.swift
  test: rnavl://repo/Sheet4LayoutTests.swift

atlas:
  affected_screens:
    - atlas://ui/sheet1
    - atlas://ui/sheet2
    - atlas://ui/sheet3
    - atlas://ui/sheet4
    - atlas://ui/sheet5

provenance:
  source_revision: abc123
  freshness: verified

constraints:
  - preserve shared template behavior
  - do not change persistence

verification:
  - local overflow behavior
  - shared template regression
```

The worker receives the useful result of prior reasoning without inheriting all exploratory noise.

---

## 14. Agent Cognition as Memoization

Fast repository search still costs model tokens.

A coding agent may be able to browse files extremely quickly, yet repeated rediscovery still consumes:

- tool calls;
- source tokens;
- inference tokens;
- context space;
- reasoning time;
- opportunities for wrong turns.

Without continuity:

```text
"that header"
  ↓
search screens
search strings
open files
inspect navigation
find header
remember shared component
```

Later:

```text
"that header again"
  ↓
repeat much of the same reconstruction
```

With Working RAM + RNAVL:

```yaml
current_component:
  entity: atlas://ui/shared-sheet-header
  source: rnavl://repo/SheetTemplate.swift#Header
  verified_revision: abc123
```

The model starts close to the answer.

Full rediscovery occurs only when the freshness check fails or ambiguity is detected.

This is effectively **memoization for agent cognition**.

---

## 15. Separation of Responsibilities

The layers should remain distinct to avoid architectural collapse.

### Working RAM should not

- store the whole repository;
- replace canonical documents;
- become permanent semantic truth by default;
- attempt deep dependency analysis itself.

### RNAVL should not

- become the source of business or architectural truth;
- perform expensive semantic reasoning when a deterministic route is enough;
- replace ATLAS relationship analysis.

### ATLAS should not

- become the active task scratchpad;
- replace source files;
- assume derived assertions remain fresh forever.

### Harness should not

- invent facts;
- treat retrieval confidence as source authority;
- silently merge conflicting current state;
- inject stale derived claims as current.

### Canonical sources should not

- have to be fully injected every turn merely because they are authoritative.

The architecture gains efficiency precisely because each layer answers a different question.

---

## 16. Persistence Beyond One Model Instance

A central benefit is that continuity belongs to the system, not the model instance.

```text
Model A
  ↓
creates/updates source-backed Working RAM
  ↓
context ends

Model B
  ↓
loads verified Working RAM
  ↓
RNAVL resolves current locations
  ↓
ATLAS restores semantic relationships
  ↓
continues work
```

The new model does not need hidden access to Model A's internal state.

It needs a traceable externalized representation of the useful state Model A established.

This allows continuity across:

- context compaction;
- context resets;
- model upgrades;
- model-provider changes;
- fresh-agent verification;
- worker replacement;
- process restarts;
- long-running workflows;
- multi-agent handoffs.

---

## 17. Relationship to Memory and Skills

The same continuity stack can support persistent organizational learning.

### Memory

```text
conversation / source event
      ↓
RAM entry
      ↓
RNAVL address
      ↓
ATLAS relationships
      ↓
future retrieval
      ↓
source expansion if needed
```

### Skills

```text
validated procedure
      ↓
skill identity
      ↓
RNAVL route to procedure/tools/tests
      ↓
ATLAS links prerequisites and related experiences
      ↓
Working RAM records current use and task state
      ↓
harness compiles worker packet
```

### Experiences

```text
execution result
      ↓
experience object
      ↓
linked to skill + task + source revision
      ↓
retrievable in future similar work
```

An experience should remain evidence, not automatically become policy or procedure.

---

## 18. A Unified Address Space

Long term, EUTONOS may benefit from treating all relevant knowledge objects as addressable resources.

Illustrative schemes:

```text
repo://
doc://
conversation://
ram://
wram://
rnavl://
atlas://
skill://
procedure://
experience://
task://
entity://
source://
```

These do not need to be literal public URI schemes. The point is architectural: every durable object should have a stable identity and a resolvable provenance chain.

A model should be able to move from compact abstraction to source evidence without fuzzy rediscovery.

---

## 19. Example: UI Work Across a Long Session

A user works on several screens, shows screenshots, and later says:

> "Move that header up a little on the last screen."

Possible resolution:

```text
User message + screenshot
        ↓
Working RAM
  last_screen = atlas://ui/sheet4
  last_component = atlas://ui/shared-sheet-header
        ↓
RNAVL
  implementation = SheetTemplate.swift#Header
        ↓
ATLAS
  shared by Sheets 1-5
  layout tests affected
        ↓
Harness
  source hash unchanged since verification
        ↓
Model receives:
  exact file
  exact symbol
  shared-use warning
  relevant test
        ↓
Edit
```

The model does not have to rediscover what "that header" means or search the whole app again.

---

## 20. Example: Long-Running Conversation Memory

A user says:

```text
"Use Postgres instead of SQLite for the scheduler state."
```

The system stores:

```yaml
conversation_evidence:
  id: conversation://msg-193
  immutable: true

ram_decision:
  id: ram://decision/scheduler-database
  current_value: Postgres
  supported_by:
    - conversation://msg-193
  supersedes:
    - conversation://msg-142
```

Months later a fresh model asks for context.

It receives:

```text
Scheduler database: Postgres.
Source: ram://decision/scheduler-database
```

If it needs the original wording or surrounding nuance, the harness can resolve the supporting conversation message.

---

## 21. Example: Skill Navigation

User objective:

```text
"Review this change for migration risk."
```

RNAVL can resolve intent to:

```yaml
skill: skill://review-migration-risk
procedure: procedure://code/migration-risk-review
required_tools:
  - repository-read
  - test-runner
required_sources:
  - atlas://migration-boundaries
  - rnavl://repo/migrations
  - rnavl://repo/tests
relevant_experiences:
  - experience://TASK-1271
```

The worker does not need to search an entire skill library or infer organizational procedure from scratch.

---

## 22. Suggested Implementation Order

A practical sequence could be:

### Phase 1: Stable identities and provenance

- define stable IDs;
- define source reference format;
- attach revisions and hashes;
- define verified/stale/unknown/superseded states.

### Phase 2: Working RAM

- current objective;
- active referents;
- decisions;
- open loops;
- recent source routes;
- bounded task state;
- expiration and handoff behavior.

### Phase 3: Generalized RNAVL

- resolve semantic identity to repository locations;
- resolve RAM IDs to original evidence;
- resolve skill IDs to procedures/tools;
- expose a common resolver contract.

### Phase 4: Freshness engine

- Git-aware source checks;
- document revision checks;
- immutable evidence handling;
- supersession tracking;
- stale-route invalidation.

### Phase 5: Context compiler

- select Working RAM;
- resolve RNAVL routes;
- fetch bounded ATLAS relationships;
- validate freshness;
- compile model-specific packet.

### Phase 6: ATLAS deep integration

- richer semantic identities;
- dependency and blast-radius relationships;
- cross-source relationships;
- historical semantic changes;
- confidence and evidence propagation.

### Phase 7: Measurement

Measure whether the stack reduces:

- tokens before productive work;
- repeated file reads;
- repeated source searches;
- time to first correct target;
- wrong-file edits;
- stale-memory errors;
- context resets;
- agent handoff loss;
- unsupported claims.

Also measure whether it improves:

- task size completed per context;
- reproducibility;
- source traceability;
- fresh-agent continuation;
- verification coverage;
- cross-model portability.

---

## 23. Design Risks

This architecture can fail if the derived layers become more trusted than the evidence beneath them.

Key risks include:

- stale RAM presented as current;
- stale RNAVL routes pointing to moved or replaced sources;
- ATLAS relationships lagging behind code;
- duplicate semantic identities;
- inferred relationships promoted as facts;
- excessive freshness checking erasing performance gains;
- over-large Working RAM becoming another context dump;
- automatic memory promotion creating false organizational truth;
- weak supersession semantics;
- source deletion creating orphaned references;
- model behavior that ignores authority boundaries.

The harness must make these states explicit rather than hiding uncertainty.

---

## 24. Open Design Questions

Questions worth resolving during implementation:

1. What identities are globally stable versus project- or workspace-scoped?
2. Should RNAVL maintain one resolver namespace across repositories, memory, skills, and docs, or expose domain adapters behind one contract?
3. Which freshness checks are synchronous, asynchronous, or lazy?
4. When does a source change invalidate an entire RAM assertion versus merely require re-verification?
5. How should partial source movement be handled when semantic identity survives but file paths change?
6. How should screenshots and other multimodal evidence be anchored and re-expanded?
7. What Working RAM state should be generated automatically versus explicitly promoted by the model?
8. What confidence threshold permits a referent to be treated as active without user clarification?
9. How does ATLAS express contradictory evidence or multiple valid interpretations?
10. What is the minimum packet needed for a fresh worker to continue without reconstructing context?
11. How should the harness measure token savings from avoided reconstruction?
12. When should Working RAM expire, collapse into persistent RAM, or be discarded?

---

## 25. Architectural Summary

The emerging system can be summarized as:

```text
                         ┌────────────────────┐
                         │   CANONICAL WORLD  │
                         │ code/docs/chat/db  │
                         └─────────┬──────────┘
                                   │
                             provenance
                                   │
                         ┌─────────▼──────────┐
                         │       ATLAS        │
                         │ semantic knowledge │
                         │ relations / impact │
                         └─────────┬──────────┘
                                   │
                            navigation map
                                   │
                         ┌─────────▼──────────┐
                         │       RNAVL        │
                         │ source resolution  │
                         │ exact locations    │
                         └─────────┬──────────┘
                                   │
                           task relevance
                                   │
                         ┌─────────▼──────────┐
                         │    WORKING RAM     │
                         │ active attention   │
                         │ decisions / state  │
                         └─────────┬──────────┘
                                   │
                           context compile
                                   │
                         ┌─────────▼──────────┐
                         │      HARNESS       │
                         │ freshness / trust  │
                         │ paging / budgets   │
                         │ provenance checks  │
                         └─────────┬──────────┘
                                   │
                         ┌─────────▼──────────┐
                         │       MODEL        │
                         │ bounded context    │
                         └────────────────────┘
```

The critical insight is that these components should not compete to be "the memory system."

They form a chain:

```text
Working RAM says what matters.
RNAVL says where it is.
ATLAS says what it means and what it touches.
Canonical sources say what is true.
The harness decides whether the derived state is still safe to trust.
```

Together, they can provide **traceable memory that persists beyond one model instance without requiring the model to carry the entire history in context**.

That is the continuity layer EUTONOS should explore.
