const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Focused documentation-contract checks, not installer, delivery, or agent-behavior proof.
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const template = name => read(`project-workflow/core/templates/${name}.tmpl`);
const guide = read('docs/TOVA_HELP.md');
const portableGuide = template('TOVA_HELP.md');
const owners = {
  agents: 'AGENTS.md', goals: 'docs/PROJECT_GOALS.md',
  architecture: 'docs/ARCHITECTURE.md', designLanguage: 'docs/DESIGN_LANGUAGE.md',
  currentTask: 'docs/CURRENT_TASK.md', currentState: '.project/CURRENT_STATE.md',
  currentFeatures: 'docs/CURRENT_FEATURES.md', futureFeatures: 'docs/FUTURE_FEATURES.md',
  currentCapabilities: 'docs/CURRENT_CAPABILITIES.md', futureCapabilities: 'docs/FUTURE_CAPABILITIES.md',
  projectHealth: 'docs/PROJECT_HEALTH.md', workModel: 'docs/WORK_MODEL.md',
  tovaHelp: 'docs/TOVA_HELP.md', tovaSetup: 'docs/TOVA_SETUP.md',
  tovaMigration: 'docs/TOVA_MIGRATION.md', projectDiscovery: 'docs/PROJECT_DISCOVERY.md',
  docChangeLog: 'docs/DOC_CHANGE_LOG.md', docsMap: 'docs/README.md',
  collaborationProtocol: 'docs/COLLABORATION_PROTOCOL.md',
  agentNotes: 'docs/agent-notes/README.md', handoffs: 'docs/handoffs/README.md',
  outputs: 'docs/outputs/README.md'
};
const expand = (text, mapping) => text.replace(/\{\{OWNER_(\w+)\}\}/g, (match, key) => {
  assert(Object.hasOwn(mapping, key), `Unknown owner token: ${match}`);
  return mapping[key];
});
const introduction = text => {
  const matches = [...text.matchAll(/^## User Introduction\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  assert.equal(matches.length, 1, 'Keep exactly one presentation-marker section');
  return matches[0][1];
};

test('distributed state and portable state start unshown, without user identity', () => {
  for (const text of [read('.project/CURRENT_STATE.md'), template('CURRENT_STATE.md')]) {
    const section = introduction(text);
    assert.match(section, /^- Status: not_shown$/m);
    assert.doesNotMatch(section, /^- Status: (shown|skipped)$/m);
    assert.match(section, /Presentation preference only, not work or acceptance state/);
    assert.doesNotMatch(section, /email|user_id|account_id|transcript/i);
  }
});

test('portable and public guide agree, with configurable target paths', () => {
  assert.equal(expand(portableGuide, owners), guide);
  const custom = { ...owners, currentState: '.tova/STATE.md', tovaHelp: 'Docs/HELP.md', currentTask: 'Docs/WORK.md' };
  const adapted = expand(portableGuide, custom);
  assert(adapted.includes('`User Introduction` section in `.tova/STATE.md`'));
  assert(adapted.includes('`Docs/WORK.md`'));
  assert.doesNotMatch(adapted, /\.project\/CURRENT_STATE\.md|docs\/CURRENT_TASK\.md|\{\{OWNER_/);
  assert(expand(template('CURRENT_STATE.md').split('## Confirmed')[0], custom).includes('`Docs/HELP.md`'));
});

test('guide retains existing installed-help contracts and explains the main owners', () => {
  for (const phrase of [
    'Architecture, Capabilities, And Features', 'Future Capabilities or Future Features',
    'Current Capabilities when the supported outcome changed',
    'Campaigns, Slices, And Sub-slices', 'Design And User-Facing Language'
  ]) assert(portableGuide.includes(phrase), phrase);
  for (const key of ['goals', 'futureCapabilities', 'futureFeatures', 'currentTask', 'currentCapabilities', 'currentFeatures', 'architecture', 'designLanguage', 'workModel', 'projectHealth']) {
    assert(portableGuide.includes(`{{OWNER_${key}}}`), key);
  }
  assert.match(guide, /Saving an idea does not authorize implementation/);
  assert.match(guide, /small self-contained task can be an independent Slice/i);
  assert.match(guide, /no ready Slice/);
  assert.match(guide, /same up-to-date repository/);
});

test('first-use introduction is bounded and shown or skipped never triggers automatic repetition', () => {
  assert.match(guide, /roughly 400 words or less/);
  assert.match(guide, /\| `shown` \| Do not repeat the introduction automatically/);
  assert.match(guide, /\| `skipped` \|[^\n]*Do not repeat it automatically/);
  assert.match(guide, /Any status plus a user request for help/);
  assert.match(guide, /A marker never blocks requested help/);
});

test('recording requires actual delivery or explicit user confirmation, not installation', () => {
  assert.match(guide, /Write `shown` only after the introduction was actually delivered in a user-visible message/);
  assert.match(guide, /user explicitly confirms it was already delivered for this project/);
  assert.match(guide, /sending a link alone does not count/);
  assert.match(guide, /send the introduction first and persist the marker at the next permitted write/);
  assert.match(guide, /Record `skipped` only for an explicit user choice/);
  assert.match(guide, /partial answer[^\n]*does not by itself mark the full introduction as shown/i);
});

test('preferences survive normal continuity without becoming personal data or acceptance', () => {
  assert.match(guide, /Preserve `shown` and `skipped` across agents, sessions, same-project clones/);
  assert.match(guide, /tutorial revision must not reset the marker/);
  assert.match(guide, /invalid or conflicting marker/);
  assert.match(guide, /read-only work must not mutate the marker/);
  assert.match(guide, /distributed starter and portable templates must ship `not_shown`/);
  assert.match(guide, /genuinely new project[^\n]*initialize its own marker to `not_shown`/);
  assert.match(guide, /not an automated delivery tracker/);
  assert.match(guide, /does not add testing or approval requirements/);
});

test('agent and boot entry points check the tiny marker, not the whole orientation every time', () => {
  for (const text of [read('AGENTS.md'), template('AGENTS.md'), read('.project/PROJECT_BOOT_PROTOCOL.md'), template('PROJECT_BOOT_PROTOCOL.md')]) {
    assert.match(text, /User Introduction/);
    assert.match(text, /shown/);
    assert.match(text, /skipped/);
    assert.match(text, /agent introduction protocol/);
  }
  assert.match(read('AGENTS.md'), /not a maintainer receipt/);
  assert.match(template('AGENTS.md'), /Always answer requested help/);
  assert.match(template('PROJECT_BOOT_PROTOCOL.md'), /Read the rest of Current State only when broader project truth is needed/);
});

test('README leads to help, while the tutorial keeps verification and approval proportional', () => {
  for (const text of [read('README.md'), template('README.md')]) {
    assert.match(text, /Do the next slice/);
    assert.match(text, /Explain the workflow/);
    assert.match(text, /User Introduction section/);
    assert.match(text, /No quiz or extra approval is needed/);
  }
  assert.match(guide, /Each Slice uses minimum focused proof/);
  assert.match(guide, /Regular checkpoints are not miniature release reviews/);
  assert.match(guide, /Planning is not permission to implement/);
  assert.doesNotMatch(guide, /npm\.cmd run tova:help|npm\.cmd run agent:start/);
});
