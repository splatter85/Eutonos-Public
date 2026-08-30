const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const { buildWorkflowCheckReport } = require('../tools/project-workflow-check');
const { buildMigrationCheckReport } = require('../tools/project-workflow-migration-check');
const { buildCollaborationReport, parseActionRegistry, parseFrontMatter, validateExecutionState, validateExchange, validateRepositoryIndex } = require('../tools/collaboration-workflow-check');
const { formatFixtureReport, runFixtureCampaign } = require('../tools/project-workflow-fixtures');
const {
  INSTALLER_VERSION,
  applyPlan,
  buildInstallPlan,
  findCaseCollisions,
  finalizeInstallation,
  formatHelp,
  retirePlan,
  targetFingerprint
} = require('../tools/project-workflow-install');

const rootDir = path.resolve(__dirname, '..');

function withFixture(name, callback) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `tova-workflow-${name}-`));
  try {
    return callback(fixtureRoot);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function writeFixture(root, relativePath, content) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');
}

function acceptanceEvidence(root, relativePath = '.project/workflow-acceptance.json') {
  const value = {
    ok: true,
    workflow_version: INSTALLER_VERSION,
    accepted_at: '2026-07-18T12:00:00.000Z',
    root,
    checks: ['fixture workflow check passed', 'fixture cold-start questions passed']
  };
  writeFixture(root, relativePath, `${JSON.stringify(value, null, 2)}\n`);
  return relativePath;
}

function acceptedMigrationLedger(root, relativePath = '.project/migration-ledger.json', overrides = {}) {
  const value = {
    schema_version: 1,
    kind: 'tova.projectWorkflowMigrationLedger',
    source_workflow_version: '2.0.0-rc.9',
    source_classification: 'versioned-upgrade',
    target_workflow_version: INSTALLER_VERSION,
    target_root: root,
    status: 'accepted',
    plan_hash: 'a'.repeat(64),
    created_at: '2026-07-18T11:00:00.000Z',
    artifacts: [],
    review: {
      status: 'accepted',
      reviewer: 'project-owner',
      decision: 'accepted for fixture migration',
      accepted_at: '2026-07-18T12:00:00.000Z'
    },
    ...overrides
  };
  writeFixture(root, relativePath, `${JSON.stringify(value, null, 2)}\n`);
  return relativePath;
}

test('cross-environment continuity checker passes the current repository owners', () => {
  const report = buildCollaborationReport({ rootDir });
  assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
  assert.deepEqual(report.summary, { errors: 0, warnings: 0 });
  const expectedStateRoot = fs.existsSync(path.join(rootDir, '.tova')) ? '.tova' : '.project';
  assert.equal(report.stateRoot, expectedStateRoot);
});

test('Agent Note front matter accepts portable line endings and preserves diagnostics', () => {
  const crlf = parseFrontMatter('---\r\nid: NOTE-TOVA11-001\r\nstatus: open\r\n---\r\nBody\r\n');
  assert.equal(crlf.error, undefined);
  assert.deepEqual(crlf.metadata, { id: 'NOTE-TOVA11-001', status: 'open' });
  assert.equal(crlf.body, 'Body\n');

  const bom = parseFrontMatter('\uFEFF---\r\nid: NOTE-TOVA11-001\r\nstatus: open\r\n---\r\nBody\r\n');
  assert.equal(bom.error, undefined);
  assert.deepEqual(bom.metadata, { id: 'NOTE-TOVA11-001', status: 'open' });
  assert.equal(bom.body, 'Body\n');

  assert.equal(parseFrontMatter('id: NOTE-TOVA11-001\n').error, 'AGENT_NOTE_FRONT_MATTER_MISSING');
  assert.equal(parseFrontMatter('---\nid: NOTE-TOVA11-001\n').error, 'AGENT_NOTE_FRONT_MATTER_UNTERMINATED');
  assert.equal(parseFrontMatter('---\r\nid: NOTE-TOVA11-001\r\n').error, 'AGENT_NOTE_FRONT_MATTER_UNTERMINATED');
});

test('Exchange validation rejects a source revision changed after test', () => {
  const findings = [];
  validateExchange({
    schema_version: 1,
    request: { required_head_sha: 'a'.repeat(40), required_checks: [] },
    response: { tested_sha: 'a'.repeat(40), returned_head_sha: 'b'.repeat(40) }
  }, 'fixture exchange', new Set(), findings, false);
  assert(findings.some(item => item.code === 'EXCHANGE_SOURCE_CHANGED_AFTER_TEST'));
});

function exchangeV2(overrides = {}) {
  const value = {
    schema_version: 2,
    template_reference: 'docs/templates/EXCHANGE_TEMPLATE.json',
    exchange_id: 'XCH-SL12-001',
    lifecycle: 'ready',
    previous_exchange_id: null,
    terminal_reason: null,
    request: {
      work_unit_id: 'TOVA12.12',
      work_mode: 'implement',
      source_revision: 'a'.repeat(40),
      target: { agent_class: 'local_agent', required_capabilities: [], assigned_owner: null, preferred_node_id: null },
      workspace_strategy: { mode: 'serial_shared_branch', integration_branch: 'main', work_branch: 'main' },
      context_packet: {
        profile_requested: 'compact',
        profile_selected: 'compact',
        selection_reason: 'The fixture is narrow and self-contained.',
        campaign_capsule_path: null,
        slice_packet_path: null,
        route_ids: ['route://workflow/collaboration']
      },
      authority_envelope: {
        mission: 'Implement the assigned Slice.',
        non_goals: ['Do not begin another Slice.'],
        stop_conditions: ['Stop on a contract contradiction.'],
        permissions: {
          source_changes: true,
          test_changes: true,
          documentation_changes: true,
          adjacent_defect_fixes: false,
          new_slice_work: false,
          architecture_changes: false,
          destructive_authority_expansion: false,
          external_write_authority_expansion: false,
          public_exposure_authority_expansion: false
        },
        human_authorization: null,
        path_guidance: { likely_tracked_changes: ['src/**'], forbidden_content: ['.env'] }
      },
      required_verification: [],
      procedure_owners: ['docs/PROJECT_HEALTH.md']
    },
    amendments: [],
    response: null,
    integration_review: null
  };
  return { ...value, ...overrides, request: { ...value.request, ...(overrides.request || {}) } };
}

test('Exchange v2 accepts serial same-branch work and preserves v1 compatibility', () => {
  const findings = [];
  validateExchange(exchangeV2(), 'fixture exchange', new Set(), findings, false);
  validateExchange({ schema_version: 1, request: { required_head_sha: 'a'.repeat(40), required_checks: [] }, response: null }, 'legacy exchange', new Set(), findings, false);
  assert.deepEqual(findings, []);
});

test('Exchange v2 requires isolated parallel branches and complete returned verification accounting', () => {
  const required = [{ id: 'CHECK-001', owner_path: 'docs/CURRENT_TASK.md' }];
  const response = {
    tested_source_revision: 'b'.repeat(40),
    source_commits_added: ['b'.repeat(40)],
    verification_results: [],
    scope_outcome: 'Implemented the assigned boundary.',
    material_additional_work: [],
    notes_created: [],
    sensitive_data: { included: false, declaration: 'No sensitive material included.' }
  };
  const invalid = exchangeV2({
    lifecycle: 'returned',
    request: {
      required_verification: required,
      workspace_strategy: { mode: 'parallel_isolated_branch', integration_branch: 'main', work_branch: 'main' }
    },
    response
  });
  const findings = [];
  validateExchange(invalid, 'fixture exchange', new Set(), findings, false);
  const codes = new Set(findings.map(item => item.code));
  assert(codes.has('EXCHANGE_PARALLEL_BRANCH_NOT_ISOLATED'));
  assert(codes.has('EXCHANGE_VERIFICATION_RESULT_MISSING'));
});

test('Exchange v2 requires explicit human authorization for high-risk request authority', () => {
  const base = exchangeV2();
  const permissions = { ...base.request.authority_envelope.permissions, architecture_changes: true };
  const request = { ...base.request, authority_envelope: { ...base.request.authority_envelope, permissions } };
  const findings = [];
  validateExchange(exchangeV2({ request }), 'fixture exchange', new Set(), findings, false);
  assert(findings.some(item => item.code === 'EXCHANGE_HIGH_RISK_AUTHORITY_UNAUTHORIZED'));
});

test('Exchange v2 auto context profile must be selected before work leaves ready', () => {
  const base = exchangeV2();
  const contextPacket = { ...base.request.context_packet, profile_requested: 'auto', profile_selected: null, selection_reason: null };
  const request = { ...base.request, context_packet: contextPacket };
  const findings = [];
  validateExchange(exchangeV2({ lifecycle: 'in_progress', request }), 'fixture exchange', new Set(), findings, false);
  assert(findings.some(item => item.code === 'EXCHANGE_CONTEXT_PROFILE_UNSELECTED'));
});

test('repository navigation index rejects stale route paths', () => withFixture('repository-index', fixtureRoot => {
  writeFixture(fixtureRoot, 'docs/OWNER.md', '# Owner\n\nAuthoritative content.\n');
  writeFixture(fixtureRoot, 'docs/REPOSITORY_INDEX.json', JSON.stringify({
    schema_version: 1,
    kind: 'tova.repositoryNavigationIndex',
    authority: 'navigation_only',
    review_triggers: ['An owner moves.'],
    routes: [{
      id: 'route://fixture/change',
      purpose: 'Locate fixture work.',
      primary_owners: ['docs/OWNER.md'],
      inspect_first: ['docs/MISSING.md'],
      likely_change_surfaces: [],
      verification_surfaces: [],
      conditional_references: []
    }]
  }));
  const findings = [];
  validateRepositoryIndex(fixtureRoot, findings);
  assert(findings.some(item => item.code === 'REPOSITORY_ROUTE_PATH_MISSING'));
}));

function executionStateFixture(activeSliceDocument, actionId) {
  return {
    schema_version: 1,
    work_mode: 'implement',
    campaign: null,
    slice: 'SLICE-EXAMPLE',
    active_slice_document: activeSliceDocument,
    phase: 'implementation',
    writer: { class: 'local_agent', development_node: 'fixture', integration_branch: 'main', lease: 'active' },
    assignment_base_sha: 'a'.repeat(40),
    source_baseline_sha: null,
    owned_paths: ['docs/**'],
    relevant_notes: [],
    active_exchange: null,
    last_durable_checkpoint: { action_id: actionId }
  };
}

test('Action Registry resolves durable checkpoints by exact structured ID', () => withFixture('action-registry', fixtureRoot => {
  const slicePath = 'docs/tasks/SLICE.md';
  writeFixture(fixtureRoot, slicePath, '# Slice\n\n## Action Registry\n\n```json\n{"schema_version":1,"actions":[{"id":"SLICE-ACTION-001","status":"completed","summary":"Bounded action."}]}\n```\n');
  writeFixture(fixtureRoot, '.project/EXECUTION_STATE.json', JSON.stringify(executionStateFixture(slicePath, 'SLICE-ACTION-001')));
  const findings = [];
  validateExecutionState(fixtureRoot, '.project', findings);
  assert.equal(findings.some(item => item.code === 'EXECUTION_STATE_ACTION_UNDECLARED'), false, JSON.stringify(findings, null, 2));
  assert.equal(parseActionRegistry(fs.readFileSync(path.join(fixtureRoot, slicePath), 'utf8')).actions.length, 1);
}));

test('Action Registry rejects a checkpoint found only in prose when a registry exists', () => withFixture('action-prose', fixtureRoot => {
  const slicePath = 'docs/tasks/SLICE.md';
  writeFixture(fixtureRoot, slicePath, '# Slice\n\nProse mentions SLICE-ACTION-999.\n\n## Action Registry\n\n```json\n{"schema_version":1,"actions":[{"id":"SLICE-ACTION-001","status":"completed","summary":"Bounded action."}]}\n```\n');
  writeFixture(fixtureRoot, '.project/EXECUTION_STATE.json', JSON.stringify(executionStateFixture(slicePath, 'SLICE-ACTION-999')));
  const findings = [];
  validateExecutionState(fixtureRoot, '.project', findings);
  assert(findings.some(item => item.code === 'EXECUTION_STATE_ACTION_UNDECLARED'));
}));

test('legacy Slice plans retain text-based durable Action compatibility', () => withFixture('action-legacy', fixtureRoot => {
  const slicePath = 'docs/tasks/SLICE.md';
  writeFixture(fixtureRoot, slicePath, '# Legacy Slice\n\n- `SLICE-ACTION-001` completed.\n');
  writeFixture(fixtureRoot, '.project/EXECUTION_STATE.json', JSON.stringify(executionStateFixture(slicePath, 'SLICE-ACTION-001')));
  const findings = [];
  validateExecutionState(fixtureRoot, '.project', findings);
  assert.equal(findings.some(item => item.code === 'EXECUTION_STATE_ACTION_UNDECLARED'), false, JSON.stringify(findings, null, 2));
}));

test('Execution State distinguishes assignment base from legacy baseline compatibility', () => {
  const template = JSON.parse(fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'EXECUTION_STATE.json.tmpl'), 'utf8'));
  assert.equal(template.assignment_base_sha, null);
  assert.equal(template.source_baseline_sha, null);
  withFixture('assignment-base', fixtureRoot => {
    writeFixture(fixtureRoot, '.project/EXECUTION_STATE.json', JSON.stringify({
      schema_version: 1,
      work_mode: 'paused',
      writer: { class: null, development_node: null, integration_branch: null, lease: 'paused' },
      assignment_base_sha: 'a'.repeat(40),
      source_baseline_sha: 'b'.repeat(40),
      owned_paths: [],
      relevant_notes: [],
      active_exchange: null,
      last_durable_checkpoint: null
    }));
    const findings = [];
    validateExecutionState(fixtureRoot, '.project', findings);
    assert(findings.some(item => item.code === 'EXECUTION_STATE_BASELINE_SHA_CONFLICT'));
  });
});

test('portable core classifies build artifacts and never equates gitignore with safe deletion', () => {
  const workModel = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'WORK_MODEL.md.tmpl'), 'utf8');
  const health = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'PROJECT_HEALTH.md.tmpl'), 'utf8');
  const agents = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'AGENTS.md.tmpl'), 'utf8');
  const boot = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'PROJECT_BOOT_PROTOCOL.md.tmpl'), 'utf8');
  const slice = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'SLICE_PLAN_TEMPLATE.md.tmpl'), 'utf8');
  const campaign = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'CAMPAIGN_PLAN_TEMPLATE.md.tmpl'), 'utf8');

  for (const content of [workModel, health, agents, slice, campaign]) {
    assert(content.includes('shared/reused'));
    assert(content.includes('Slice-ephemeral'));
    assert(content.includes('intentionally retained'));
  }
  assert(workModel.includes('does not reclaim disk'));
  assert(workModel.includes('never proves that a path is safe to delete'));
  assert(workModel.includes('Do not run background or mid-build cleanup'));
  assert(health.includes('remove only exact Slice-owned ephemeral paths'));
  assert(agents.includes('Gitignored never means safe to delete'));
  assert(boot.includes('Remove only exact Slice-owned ephemeral paths after evidence capture'));
});

test('portable agent contract keeps Current Task agent-centered and moves completed detail out of live context', () => {
  const agents = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'AGENTS.md.tmpl'), 'utf8');
  assert(agents.includes('sole live agent work board'));
  assert(agents.includes('not a task list for the human to perform'));
  assert(agents.includes('{{OWNER_currentState}}` provides compact orientation and pointers, never a second task board'));
  assert(agents.includes('{{OWNER_docsMap}}` maps durable document ownership'));
  assert(agents.includes('{{OWNER_repositoryIndexGuide}}` and `{{OWNER_repositoryIndex}}` provide navigation-only routes'));
  assert(agents.includes('ChatGPT, Claude, a GitHub agent, a local model, another Codex session'));
  assert(agents.includes('treat it as an explicit cold-agent handoff request'));
  assert(agents.includes('Follow `{{OWNER_handoffs}}`'));
  assert(agents.includes('Campaign Context Capsule from `{{OWNER_campaignContextTemplate}}`'));
  assert(agents.includes('one bounded Slice Execution Packet per assigned Slice from `{{OWNER_sliceExecutionPacketTemplate}}`'));
  assert(agents.includes('if unspecified, prefer `expanded` for a cold agent'));
  assert(agents.includes('when it completes, remove or collapse it'));
  assert(agents.includes('Do not update broad status, feature/capability, architecture, handoff, or change-log documents for every small step'));
});

test('fresh-agent migration contract makes baseline precedence and preservation unambiguous', () => {
  const migration = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'TOVA_MIGRATION.md.tmpl'), 'utf8');
  assert(migration.includes('Existing repositories are migration sources, not alternate ToVA standards.'));
  assert(migration.includes('current supported Starter Kit defines the target ToVA workflow contract'));
  assert(migration.includes('Canonical ToVA owns workflow architecture. The project owns project truth.'));
  assert(migration.includes('Merge compatible enhancements into current canonical owners.'));
  assert(migration.includes('Supersede conflicting older ToVA workflow rules.'));
  assert(migration.includes('Retain additional documents only when they have a distinct declared ownership role.'));
  assert(migration.includes('Never retire a document until its unique current content has an accepted destination.'));
  assert(migration.includes('Preservation-first is a write-safety policy, not a precedence rule.'));
});

test('migration ledger contract supports section-level reconciliation and retirement safety', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(rootDir, 'project-workflow', 'schemas', 'migration-ledger.schema.json'), 'utf8'));
  const template = fs.readFileSync(path.join(rootDir, 'project-workflow', 'core', 'templates', 'MIGRATION_LEDGER_TEMPLATE.md.tmpl'), 'utf8');
  assert(schema.required.includes('artifacts'));
  assert(schema.$defs.artifact.required.includes('content_units'));
  assert(schema.$defs.artifact.required.includes('retirement'));
  assert(schema.$defs.disposition.enum.includes('RETAIN_EXTENSION'));
  assert(schema.$defs.disposition.enum.includes('RETIRE_AFTER_MERGE'));
  assert(template.includes('Unique current content'));
  assert(template.includes('Child Content Units'));
  assert(template.includes('safe_to_retire'));
  assert(template.includes('Every blocking `CONFLICT` is resolved'));
});

test('mature repository extensions remain conditional and declare distinct ownership boundaries', () => {
  const roadmap = fs.readFileSync(path.join(rootDir, 'docs', 'templates', 'ROADMAP_TEMPLATE.md'), 'utf8');
  const acceptance = fs.readFileSync(path.join(rootDir, 'docs', 'templates', 'ACCEPTANCE_WORKSPACE_README_TEMPLATE.md'), 'utf8');
  const maturity = fs.readFileSync(path.join(rootDir, 'docs', 'templates', 'CAPABILITY_MATURITY_MODEL_TEMPLATE.md'), 'utf8');
  const release = fs.readFileSync(path.join(rootDir, 'project-workflow', 'modules', 'app-build-assurance', 'payload', 'docs', 'app-building', 'RELEASE_ACCEPTANCE_TEMPLATE.md'), 'utf8');
  const module = JSON.parse(fs.readFileSync(path.join(rootDir, 'project-workflow', 'modules', 'app-build-assurance', 'MODULE.json'), 'utf8'));
  assert(roadmap.includes('not an active implementation campaign'));
  assert(roadmap.includes('Does Not Own'));
  assert(acceptance.includes('Project Health owns what must be proven'));
  assert(maturity.includes('Externally Accepted'));
  assert(release.includes('fresh acceptance of one named release candidate'));
  assert(module.installs.files.includes('docs/app-building/RELEASE_ACCEPTANCE_TEMPLATE.md'));
  assert.equal(module.version, '1.1.0');
});

test('migration checker blocks conflicts unsafe retirement incomplete extensions and duplicate authorities', () => withFixture('migration-check', fixtureRoot => {
  const ledgerPath = acceptedMigrationLedger(fixtureRoot);
  const passing = buildMigrationCheckReport({ rootDir: fixtureRoot, ledgerPath, expectedVersion: INSTALLER_VERSION });
  assert.equal(passing.ok, true, JSON.stringify(passing.findings, null, 2));

  const retirement = { content_reconciled: false, references_updated: false, historical_copy_required: true, safe_to_retire: true };
  acceptedMigrationLedger(fixtureRoot, ledgerPath, {
    artifacts: [
      { source_path: 'docs/OLD.md', source_fingerprint: 'a'.repeat(64), relationship: 'obsolete-workflow', disposition: 'CONFLICT', review_status: 'accepted', target_role: 'currentTask', target_path: 'docs/ONE.md', unresolved_questions: [], stop_conditions: [], retirement },
      { source_path: 'docs/EXT.md', source_fingerprint: 'b'.repeat(64), relationship: 'distinct-extension', disposition: 'RETAIN_EXTENSION', review_status: 'accepted', target_role: 'currentTask', target_path: 'docs/TWO.md', unresolved_questions: [], stop_conditions: [], retirement: { content_reconciled: true, references_updated: true, historical_copy_required: false, safe_to_retire: false } }
    ]
  });
  const blocked = buildMigrationCheckReport({ rootDir: fixtureRoot, ledgerPath, expectedVersion: INSTALLER_VERSION });
  const codes = new Set(blocked.findings.map(item => item.code));
  assert.equal(blocked.ok, false);
  assert(codes.has('MIGRATION_CONFLICT_UNRESOLVED'));
  assert(codes.has('MIGRATION_RETIREMENT_PRECONDITION_FAILED'));
  assert(codes.has('MIGRATION_EXTENSION_CONTRACT_INCOMPLETE'));
  assert(codes.has('MIGRATION_DUPLICATE_CANONICAL_ROLE'));
}));

test('optional module contract accepts a complete removable module', () => {
  const fixtureRoot = path.join(rootDir, 'test-fixtures', 'tova-workflow', 'modules', 'valid');
  const report = buildWorkflowCheckReport({
    rootDir: fixtureRoot,
    moduleManifest: 'modules/documentation-health/MODULE.json'
  });
  assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
  assert.equal(report.summary.errors, 0);
});

test('optional module contract rejects placeholders unavailable commands and missing retirement', () => {
  const fixtureRoot = path.join(rootDir, 'test-fixtures', 'tova-workflow', 'modules', 'invalid');
  const report = buildWorkflowCheckReport({
    rootDir: fixtureRoot,
    moduleManifest: 'modules/placeholder-module/MODULE.json'
  });
  assert.equal(report.ok, false);
  const codes = new Set(report.findings.map(item => item.code));
  assert(codes.has('MODULE_ADMISSION_EVIDENCE_INVALID'));
  assert(codes.has('MODULE_FILE_MISSING'));
  assert(codes.has('MODULE_COMMAND_UNAVAILABLE'));
  assert(codes.has('MODULE_RETIREMENT_MISSING'));
  assert(codes.has('MODULE_EXAMPLES_INVALID'));
});

test('installer dry-run is deterministic and never writes to a blank target', () => withFixture('blank-plan', fixtureRoot => {
  const before = targetFingerprint(fixtureRoot);
  const first = buildInstallPlan({ rootDir: fixtureRoot });
  const second = buildInstallPlan({ rootDir: fixtureRoot });

  assert.equal(first.ok, true, JSON.stringify(first.conflicts, null, 2));
  assert.equal(first.classification, 'blank');
  assert.equal(first.owners.handoffs, 'docs/handoffs/README.md');
  assert.equal(first.owners.outputs, 'docs/outputs/README.md');
  assert.equal(first.owners.executionState, '.project/EXECUTION_STATE.json');
  assert.equal(first.owners.developmentNodes, '.project/DEVELOPMENT_NODES.json');
  assert.equal(first.owners.collaborationProtocol, 'docs/COLLABORATION_PROTOCOL.md');
  assert.equal(first.owners.agentNotes, 'docs/agent-notes/README.md');
  assert.equal(first.owners.projectDiscovery, 'docs/PROJECT_DISCOVERY.md');
  assert.equal(first.owners.tovaSetup, 'docs/TOVA_SETUP.md');
  assert.equal(first.owners.tovaMigration, 'docs/TOVA_MIGRATION.md');
  assert.equal(first.owners.migrationLedgerTemplate, 'docs/templates/MIGRATION_LEDGER_TEMPLATE.md');
  assert.equal(first.owners.tovaHelp, 'docs/TOVA_HELP.md');
  assert.equal(first.owners.architecture, 'docs/ARCHITECTURE.md');
  assert.equal(first.owners.designLanguage, 'docs/DESIGN_LANGUAGE.md');
  assert.equal(first.owners.currentCapabilities, 'docs/CURRENT_CAPABILITIES.md');
  assert.equal(first.owners.currentFeatures, 'docs/CURRENT_FEATURES.md');
  assert.equal(first.owners.futureCapabilities, 'docs/FUTURE_CAPABILITIES.md');
  assert.equal(first.owners.futureFeatures, 'docs/FUTURE_FEATURES.md');
  assert.equal(first.writesPerformed, 0);
  assert.equal(first.planHash, second.planHash);
  assert.deepEqual(first.actions, second.actions);
  assert.equal(targetFingerprint(fixtureRoot), before);
  assert.deepEqual(fs.readdirSync(fixtureRoot), []);

  const refused = applyPlan({ rootDir: fixtureRoot });
  assert.equal(refused.ok, false);
  assert(refused.conflicts.some(item => item.code === 'PLAN_HASH_REQUIRED'));
  assert.equal(refused.writesPerformed, 0);
  assert.equal(targetFingerprint(fixtureRoot), before);
}));

test('installer help explains the safe phase sequence without inspecting a target', () => withFixture('help', fixtureRoot => {
  const before = targetFingerprint(fixtureRoot);
  const direct = formatHelp();
  assert(direct.includes('--phase dry-run'));
  assert(direct.includes('--phase apply --plan-hash'));
  assert(direct.includes('--phase finalize --acceptance-evidence'));
  assert(direct.includes('docs/TOVA_SETUP.md'));

  const result = spawnSync(process.execPath, [path.join(rootDir, 'tools', 'project-workflow-install.js'), '--help'], {
    cwd: fixtureRoot,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert(result.stdout.includes('ToVA Project Workflow installer'));
  assert.equal(result.stdout.includes('"kind": "tova.projectWorkflowInstallPlan"'), false);
  assert.equal(targetFingerprint(fixtureRoot), before);
  assert.deepEqual(fs.readdirSync(fixtureRoot), []);
}));

test('installer rejects a stale dry-run plan and detects case-only path collisions', () => withFixture('stale-plan', fixtureRoot => {
  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  const preserved = '# Existing Readme\n\nThis file appeared after planning and must not be overwritten by a stale apply request.\n';
  writeFixture(fixtureRoot, 'README.md', preserved);
  const before = targetFingerprint(fixtureRoot);

  const result = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
  assert.equal(result.ok, false);
  assert(result.conflicts.some(item => item.code === 'PLAN_HASH_MISMATCH'));
  assert.equal(result.writesPerformed, 0);
  assert.equal(targetFingerprint(fixtureRoot), before);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'README.md'), 'utf8'), preserved);

  const caseConflicts = findCaseCollisions(['Docs/README.md', 'docs/README.md']);
  assert.equal(caseConflicts.length, 1);
  assert.equal(caseConflicts[0].code, 'CASE_COLLISION');
}));

test('installer applies create-only core and finalizes only after internal acceptance evidence', () => withFixture('blank-apply', fixtureRoot => {
  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  const applied = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });

  assert.equal(applied.ok, true, JSON.stringify(applied.postApply?.conflicts, null, 2));
  assert(applied.writesPerformed > 0);
  assert.equal(applied.installationManifestWritten, false);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'handoffs', 'README.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'outputs', 'README.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, '.project', 'EXECUTION_STATE.json')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, '.project', 'DEVELOPMENT_NODES.json')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'COLLABORATION_PROTOCOL.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'agent-notes', 'README.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'templates', 'EXCHANGE_TEMPLATE.json')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'PROJECT_DISCOVERY.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'TOVA_SETUP.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'TOVA_MIGRATION.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'templates', 'MIGRATION_LEDGER_TEMPLATE.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'TOVA_HELP.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'DESIGN_LANGUAGE.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'CURRENT_CAPABILITIES.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'FUTURE_CAPABILITIES.md')), true);
  const installedHelp = fs.readFileSync(path.join(fixtureRoot, 'docs', 'TOVA_HELP.md'), 'utf8');
  assert(installedHelp.includes('Architecture, Capabilities, And Features'));
  assert(installedHelp.includes('Future Capabilities or Future Features'));
  assert(installedHelp.includes('Current Capabilities when the supported outcome changed'));
  assert(installedHelp.includes('Campaigns, Slices, And Sub-slices'));
  assert(installedHelp.includes('Design And User-Facing Language'));
  const installedDesignLanguage = fs.readFileSync(path.join(fixtureRoot, 'docs', 'DESIGN_LANGUAGE.md'), 'utf8');
  assert(installedDesignLanguage.includes('Reusable Surface Registry'));
  assert(installedDesignLanguage.includes('Language And Copy Style'));
  assert(installedDesignLanguage.includes('Unconfirmed'));
  assert(installedDesignLanguage.includes('| Caption / metadata | 12 |'));
  assert(installedDesignLanguage.includes('| Display / major metric | 32 |'));
  const installedSetup = fs.readFileSync(path.join(fixtureRoot, 'docs', 'TOVA_SETUP.md'), 'utf8');
  assert(installedSetup.includes('Blank/new repository'));
  assert(installedSetup.includes('Established repository'));
  assert(installedSetup.includes('Legacy ToVA layout'));
  assert(installedSetup.includes('Accepted older installation'));
  assert(installedSetup.includes('Upgrade An Older ToVA-Enabled Repository'));
  assert(installedSetup.includes('apply is create-only'));
  assert(installedSetup.includes('never reuse a `planHash`'));
  assert(installedSetup.includes('workflow:collaboration-check -- --root'));
  assert(installedSetup.includes('assignment_base_sha'));
  assert(installedSetup.includes('carry-forward rationale'));
  assert(installedSetup.includes('workflow-acceptance.json'));
  assert(installedSetup.includes('every core owner is evaluated'));
  const discovery = fs.readFileSync(path.join(fixtureRoot, 'docs', 'PROJECT_DISCOVERY.md'), 'utf8');
  assert.equal([...discovery.matchAll(/^###\s+([1-5])\.\s+/gm)].length, 5);
  assert(discovery.includes('two or three plausible options'));
  assert(discovery.includes('one conservative default'));
  assert(discovery.includes('Assumption awaiting confirmation'));
  const installedWorkModel = fs.readFileSync(path.join(fixtureRoot, 'docs', 'WORK_MODEL.md'), 'utf8');
  const installedHealth = fs.readFileSync(path.join(fixtureRoot, 'docs', 'PROJECT_HEALTH.md'), 'utf8');
  assert(installedWorkModel.includes('shared/reused'));
  assert(installedWorkModel.includes('never proves that a path is safe to delete'));
  assert(installedHealth.includes('remove only exact Slice-owned ephemeral paths'));
  const agentStart = JSON.parse(fs.readFileSync(path.join(fixtureRoot, '.project', 'AGENT_START.json'), 'utf8'));
  assert.equal(agentStart.firstRunSetup.path, 'docs/TOVA_SETUP.md');
  assert.equal(agentStart.firstRunDiscovery.path, 'docs/PROJECT_DISCOVERY.md');
  assert.equal(agentStart.firstRunDiscovery.questionCount, 5);
  assert.equal(agentStart.owners.architecture, 'docs/ARCHITECTURE.md');
  assert.equal(agentStart.owners.designLanguage, 'docs/DESIGN_LANGUAGE.md');
  assert.equal(agentStart.owners.tovaSetup, 'docs/TOVA_SETUP.md');
  assert.equal(agentStart.mustRead.includes('docs/DESIGN_LANGUAGE.md'), false);
  assert.equal(agentStart.owners.tovaMigration, 'docs/TOVA_MIGRATION.md');
  assert.equal(agentStart.owners.currentCapabilities, 'docs/CURRENT_CAPABILITIES.md');
  assert.equal(agentStart.owners.currentFeatures, 'docs/CURRENT_FEATURES.md');
  assert.equal(agentStart.owners.futureCapabilities, 'docs/FUTURE_CAPABILITIES.md');
  assert.equal(agentStart.owners.futureFeatures, 'docs/FUTURE_FEATURES.md');
  assert.equal(agentStart.mustRead.includes('docs/CURRENT_CAPABILITIES.md'), false);
  assert.equal(agentStart.mustRead.includes('docs/FUTURE_CAPABILITIES.md'), false);
  assert.equal(agentStart.mustRead.includes('docs/TOVA_SETUP.md'), false);
  assert.equal(fs.existsSync(path.join(fixtureRoot, '.project', 'TOVA_INSTALLATION.json')), false);
  assert.equal(applied.postApply.classification, 'pending-finalize');

  const repeatPlan = buildInstallPlan({ rootDir: fixtureRoot });
  const repeatedApply = applyPlan({ rootDir: fixtureRoot, planHash: repeatPlan.planHash });
  assert.equal(repeatedApply.ok, true);
  assert.equal(repeatedApply.writesPerformed, 0);

  const refused = finalizeInstallation({ rootDir: fixtureRoot });
  assert.equal(refused.ok, false);
  assert(refused.conflicts.some(item => item.code === 'ACCEPTANCE_EVIDENCE_REQUIRED'));
  assert.equal(refused.writesPerformed, 0);

  const evidencePath = acceptanceEvidence(fixtureRoot);
  const finalized = finalizeInstallation({ rootDir: fixtureRoot, acceptanceEvidence: evidencePath });
  assert.equal(finalized.ok, true, JSON.stringify(finalized.conflicts, null, 2));
  assert.equal(finalized.manifest.workflow_version, INSTALLER_VERSION);
  assert.equal(finalized.manifest.architecture_generation, 2);
  assert.equal(finalized.manifest.owners.tovaSetup, 'docs/TOVA_SETUP.md');
  assert.equal(finalized.manifest.owners.tovaMigration, 'docs/TOVA_MIGRATION.md');
  assert.equal(finalized.manifest.owners.currentCapabilities, 'docs/CURRENT_CAPABILITIES.md');
  assert.equal(finalized.manifest.owners.futureCapabilities, 'docs/FUTURE_CAPABILITIES.md');
  assert.equal(finalized.workflowCheck.ok, true);
  assert.equal(finalized.writesPerformed, 1);

  const installedPlan = buildInstallPlan({ rootDir: fixtureRoot });
  assert.equal(installedPlan.classification, 'installed-current');
  const repeatedFinalize = finalizeInstallation({ rootDir: fixtureRoot, acceptanceEvidence: evidencePath });
  assert.equal(repeatedFinalize.ok, true);
  assert.equal(repeatedFinalize.idempotent, true);
  assert.equal(repeatedFinalize.writesPerformed, 0);
}));

test('installer preserves existing owner bytes and Docs path casing', () => withFixture('existing-case', fixtureRoot => {
  const original = '# Existing Project Goals\n\nThis purpose statement is project-owned and must remain byte-for-byte unchanged during workflow adoption.\n';
  const architecture = '# Existing Architecture\n\nThis source and runtime boundary is project-owned and must remain byte-for-byte unchanged during workflow adoption.\n';
  const designLanguage = '# Existing Design Language\n\nThis project-owned visual and copy contract must remain byte-for-byte unchanged during workflow adoption.\n';
  const currentCapabilities = '# Existing Current Capabilities\n\nThis supported workflow is project-owned and must remain byte-for-byte unchanged during workflow adoption.\n';
  const futureCapabilities = '# Existing Future Capabilities\n\nThis desired outcome is project-owned and must remain byte-for-byte unchanged during workflow adoption.\n';
  const setup = '# Existing ToVA Setup\n\nThis project-owned setup guide must remain byte-for-byte unchanged during workflow adoption.\n';
  writeFixture(fixtureRoot, 'Docs/PROJECT_GOALS.md', original);
  writeFixture(fixtureRoot, 'Docs/ARCHITECTURE.md', architecture);
  writeFixture(fixtureRoot, 'Docs/DESIGN_LANGUAGE.md', designLanguage);
  writeFixture(fixtureRoot, 'Docs/CURRENT_CAPABILITIES.md', currentCapabilities);
  writeFixture(fixtureRoot, 'Docs/FUTURE_CAPABILITIES.md', futureCapabilities);
  writeFixture(fixtureRoot, 'Docs/TOVA_SETUP.md', setup);
  writeFixture(fixtureRoot, 'package.json', `${JSON.stringify({
    name: 'existing-case-project',
    scripts: { test: 'node --test', build: 'node build.js' }
  }, null, 2)}\n`);

  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  assert.equal(plan.ok, true, JSON.stringify(plan.conflicts, null, 2));
  assert.equal(plan.classification, 'existing-non-tova');
  assert.equal(plan.docsRoot, 'Docs');
  assert.equal(plan.owners.handoffs, 'Docs/handoffs/README.md');
  assert.equal(plan.owners.outputs, 'Docs/outputs/README.md');
  assert.equal(plan.owners.projectDiscovery, 'Docs/PROJECT_DISCOVERY.md');
  assert.equal(plan.owners.tovaSetup, 'Docs/TOVA_SETUP.md');
  assert.equal(plan.owners.goals, 'Docs/PROJECT_GOALS.md');
  assert.equal(plan.owners.architecture, 'Docs/ARCHITECTURE.md');
  assert.equal(plan.owners.designLanguage, 'Docs/DESIGN_LANGUAGE.md');
  assert.equal(plan.owners.currentCapabilities, 'Docs/CURRENT_CAPABILITIES.md');
  assert.equal(plan.owners.futureCapabilities, 'Docs/FUTURE_CAPABILITIES.md');
  assert(plan.preservation.reused.includes('Docs/PROJECT_GOALS.md'));
  assert(plan.preservation.reused.includes('Docs/ARCHITECTURE.md'));
  assert(plan.preservation.reused.includes('Docs/DESIGN_LANGUAGE.md'));
  assert(plan.preservation.reused.includes('Docs/CURRENT_CAPABILITIES.md'));
  assert(plan.preservation.reused.includes('Docs/FUTURE_CAPABILITIES.md'));
  assert(plan.preservation.reused.includes('Docs/TOVA_SETUP.md'));
  assert.deepEqual(plan.healthCommands.standard, ['npm run test', 'npm run build']);

  const applied = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
  assert.equal(applied.ok, true, JSON.stringify(applied.postApply?.conflicts, null, 2));
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Docs', 'PROJECT_GOALS.md'), 'utf8'), original);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Docs', 'DESIGN_LANGUAGE.md'), 'utf8'), designLanguage);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Docs', 'ARCHITECTURE.md'), 'utf8'), architecture);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Docs', 'CURRENT_CAPABILITIES.md'), 'utf8'), currentCapabilities);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Docs', 'FUTURE_CAPABILITIES.md'), 'utf8'), futureCapabilities);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Docs', 'TOVA_SETUP.md'), 'utf8'), setup);
  const rootEntries = fs.readdirSync(fixtureRoot);
  assert(rootEntries.includes('Docs'));
  assert.equal(rootEntries.includes('docs'), false);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'Docs', 'handoffs', 'README.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'Docs', 'outputs', 'README.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'Docs', 'PROJECT_DISCOVERY.md')), true);
  assert.equal(applied.installationManifestWritten, false);
}));

test('established non-ToVA discovery proposes semantic roles without making them authoritative', () => withFixture('semantic-roles', fixtureRoot => {
  writeFixture(fixtureRoot, 'docs/PRODUCT_VISION.md', '# Product Vision\n\nProject purpose evidence lives here.\n');
  writeFixture(fixtureRoot, 'docs/KNOWN_ISSUES.md', '# Known Issues\n\nProject defect evidence lives here.\n');
  writeFixture(fixtureRoot, 'docs/ROADMAP.md', '# Roadmap\n\nStrategic sequence evidence lives here.\n');
  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  assert.equal(plan.ok, true, JSON.stringify(plan.conflicts, null, 2));
  assert.equal(plan.classification, 'existing-non-tova');
  const candidates = new Map(plan.semanticReconciliation.semanticRoleCandidates.map(item => [item.path, item]));
  assert(candidates.get('docs/PRODUCT_VISION.md').proposedRoles.includes('goals'));
  assert(candidates.get('docs/KNOWN_ISSUES.md').proposedRoles.includes('knownBugs'));
  assert(candidates.get('docs/ROADMAP.md').proposedRoles.includes('conditionalRoadmap'));
  assert([...candidates.values()].every(item => item.authoritative === false && item.requiresContentReview === true));
}));

test('parent installer reports and excludes nested independent ToVA project roots', () => withFixture('nested-project', fixtureRoot => {
  const nestedManifest = `${JSON.stringify({ workflow_version: INSTALLER_VERSION }, null, 2)}\n`;
  const nestedTask = '# Nested Current Task\n\n- [ ] Preserve this nested owner unchanged.\n';
  writeFixture(fixtureRoot, 'Tools/ATLAS/.project/TOVA_INSTALLATION.json', nestedManifest);
  writeFixture(fixtureRoot, 'Tools/ATLAS/docs/CURRENT_TASK.md', nestedTask);
  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  assert.equal(plan.ok, true, JSON.stringify(plan.conflicts, null, 2));
  assert.equal(plan.classification, 'blank');
  assert.deepEqual(plan.nestedProjects.map(item => item.projectRoot), ['Tools/ATLAS']);
  assert.equal(plan.owners.currentTask, 'docs/CURRENT_TASK.md');
  const applied = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
  assert.equal(applied.ok, true, JSON.stringify(applied.postApply?.conflicts, null, 2));
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Tools', 'ATLAS', '.project', 'TOVA_INSTALLATION.json'), 'utf8'), nestedManifest);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'Tools', 'ATLAS', 'docs', 'CURRENT_TASK.md'), 'utf8'), nestedTask);
}));

test('installer retires legacy owners only after accepted content and reference accounting', () => withFixture('legacy', fixtureRoot => {
  const resume = Buffer.from('# Legacy Session Resume\n\nExact historical bytes must survive migration.\n', 'utf8');
  const queue = Buffer.from('# Legacy Queue\n\nThis competing queue is retired after its useful facts are reviewed.\n', 'utf8');
  writeFixture(fixtureRoot, '.project/SESSION_RESUME.md', resume);
  writeFixture(fixtureRoot, 'docs/NEXT_TASK_CANDIDATES.md', queue);

  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  assert.equal(plan.ok, true, JSON.stringify(plan.conflicts, null, 2));
  assert.equal(plan.classification, 'legacy');
  assert.equal(plan.preservation.archiveExactBytes.length, 2);

  const applied = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
  assert.equal(applied.ok, true, JSON.stringify(applied.postApply?.conflicts, null, 2));
  assert.equal(fs.existsSync(path.join(fixtureRoot, '.project', 'SESSION_RESUME.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'NEXT_TASK_CANDIDATES.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'archive', 'old-projects', 'project-workflow-generation-1', '.project', 'SESSION_RESUME.md')), false);
  const refused = retirePlan({ rootDir: fixtureRoot });
  assert.equal(refused.ok, false);
  assert.equal(refused.writesPerformed, 0);

  const marker = JSON.parse(fs.readFileSync(path.join(fixtureRoot, '.project', 'TOVA_MIGRATION_PENDING.json'), 'utf8'));
  const retirement = { content_reconciled: true, references_updated: true, historical_copy_required: true, safe_to_retire: true };
  const ledgerPath = acceptedMigrationLedger(fixtureRoot, '.project/migration-ledger.json', {
    source_classification: 'legacy-untrusted',
    source_workflow_version: null,
    plan_hash: marker.plan_hash,
    artifacts: [
      { source_path: '.project/SESSION_RESUME.md', source_fingerprint: 'a'.repeat(64), relationship: 'obsolete-workflow', disposition: 'RETIRE_AFTER_MERGE', review_status: 'accepted', target_role: null, target_path: null, unresolved_questions: [], stop_conditions: [], retirement },
      { source_path: 'docs/NEXT_TASK_CANDIDATES.md', source_fingerprint: 'b'.repeat(64), relationship: 'overlapping-role', disposition: 'RETIRE_AFTER_MERGE', review_status: 'accepted', target_role: null, target_path: null, unresolved_questions: [], stop_conditions: [], retirement }
    ]
  });
  const retired = retirePlan({ rootDir: fixtureRoot, migrationLedger: ledgerPath });
  assert.equal(retired.ok, true, JSON.stringify(retired.conflicts, null, 2));
  assert.equal(fs.existsSync(path.join(fixtureRoot, '.project', 'SESSION_RESUME.md')), false);
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'docs', 'NEXT_TASK_CANDIDATES.md')), false);
  assert.deepEqual(
    fs.readFileSync(path.join(fixtureRoot, 'archive', 'old-projects', 'project-workflow-generation-1', '.project', 'SESSION_RESUME.md')),
    resume
  );
  assert.deepEqual(
    fs.readFileSync(path.join(fixtureRoot, 'archive', 'old-projects', 'project-workflow-generation-1', 'docs', 'NEXT_TASK_CANDIDATES.md')),
    queue
  );
  assert.equal(fs.existsSync(path.join(fixtureRoot, 'archive', 'old-projects', 'project-workflow-generation-1', 'MIGRATION.md')), true);
  assert.equal(fs.existsSync(path.join(fixtureRoot, '.project', 'TOVA_INSTALLATION.json')), false);
}));

test('retirement preserves all source bytes when an accepted ledger targets a different reviewed plan', () => withFixture('retirement-plan-drift', fixtureRoot => {
  const source = '# Customized Legacy Queue\n\nUnique project facts remain here until the exact reviewed plan is accepted.\n';
  writeFixture(fixtureRoot, 'docs/NEXT_TASK_CANDIDATES.md', source);
  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  const applied = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
  assert.equal(applied.ok, true, JSON.stringify(applied.postApply?.conflicts, null, 2));
  const retirement = { content_reconciled: true, references_updated: true, historical_copy_required: true, safe_to_retire: true };
  const ledgerPath = acceptedMigrationLedger(fixtureRoot, '.project/drifted-migration-ledger.json', {
    source_classification: 'legacy-untrusted',
    source_workflow_version: null,
    plan_hash: 'c'.repeat(64),
    artifacts: [
      { source_path: 'docs/NEXT_TASK_CANDIDATES.md', source_fingerprint: 'd'.repeat(64), relationship: 'overlapping-role', disposition: 'RETIRE_AFTER_MERGE', review_status: 'accepted', target_role: null, target_path: null, unresolved_questions: [], stop_conditions: [], retirement }
    ]
  });
  const before = targetFingerprint(fixtureRoot);
  const result = retirePlan({ rootDir: fixtureRoot, migrationLedger: ledgerPath });
  assert.equal(result.ok, false);
  assert(result.conflicts.some(item => item.code === 'MIGRATION_LEDGER_PLAN_HASH_MISMATCH'));
  assert.equal(result.writesPerformed, 0);
  assert.equal(targetFingerprint(fixtureRoot), before);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'docs', 'NEXT_TASK_CANDIDATES.md'), 'utf8'), source);
}));

test('installer stops without writes on competing owners and unavailable declared commands', () => {
  withFixture('owner-collision', fixtureRoot => {
    writeFixture(fixtureRoot, 'docs/PROJECT_GOALS.md', '# Goals\n\nOne possible owner with enough project-specific content to be meaningful.\n');
    writeFixture(fixtureRoot, 'docs/PRODUCT_GOAL.md', '# Product Goal\n\nA competing owner that requires a human choice before installation.\n');
    const plan = buildInstallPlan({ rootDir: fixtureRoot });
    const before = targetFingerprint(fixtureRoot);
    assert.equal(plan.ok, false);
    assert(plan.conflicts.some(item => item.code === 'ROLE_OWNER_COLLISION'));
    const result = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
    assert.equal(result.ok, false);
    assert.equal(result.writesPerformed, 0);
    assert.equal(targetFingerprint(fixtureRoot), before);
  });

  withFixture('health-conflict', fixtureRoot => {
    writeFixture(fixtureRoot, 'package.json', `${JSON.stringify({ scripts: { test: 'node --test' } }, null, 2)}\n`);
    writeFixture(fixtureRoot, 'docs/PROJECT_HEALTH.md', '# Project Health\n\nThe current project says to run `npm run missing-check`, but that command is not declared and installation must stop.\n');
    const plan = buildInstallPlan({ rootDir: fixtureRoot });
    const before = targetFingerprint(fixtureRoot);
    assert.equal(plan.ok, false);
    assert(plan.conflicts.some(item => item.code === 'DECLARED_COMMAND_UNAVAILABLE'));
    const result = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
    assert.equal(result.ok, false);
    assert.equal(result.writesPerformed, 0);
    assert.equal(targetFingerprint(fixtureRoot), before);
  });

  withFixture('archive-conflict', fixtureRoot => {
    const legacy = '# Legacy Resume\n\nThis source cannot move over an existing archive target.\n';
    writeFixture(fixtureRoot, '.project/SESSION_RESUME.md', legacy);
    writeFixture(
      fixtureRoot,
      'archive/old-projects/project-workflow-generation-1/.project/SESSION_RESUME.md',
      '# Existing Archive\n\nThis conflicting target must be reconciled first.\n'
    );
    const plan = buildInstallPlan({ rootDir: fixtureRoot });
    const before = targetFingerprint(fixtureRoot);
    assert.equal(plan.ok, false);
    assert(plan.conflicts.some(item => item.code === 'LEGACY_ARCHIVE_TARGET_EXISTS'));
    const result = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
    assert.equal(result.ok, false);
    assert.equal(result.writesPerformed, 0);
    assert.equal(targetFingerprint(fixtureRoot), before);
    assert.equal(fs.readFileSync(path.join(fixtureRoot, '.project', 'SESSION_RESUME.md'), 'utf8'), legacy);
  });
});

test('installer refuses a newer target version without writing', () => withFixture('newer', fixtureRoot => {
  writeFixture(fixtureRoot, '.project/TOVA_INSTALLATION.json', `${JSON.stringify({ workflow_version: '99.0.0' }, null, 2)}\n`);
  const plan = buildInstallPlan({ rootDir: fixtureRoot });
  const before = targetFingerprint(fixtureRoot);
  assert.equal(plan.classification, 'installed-newer');
  assert(plan.conflicts.some(item => item.code === 'TARGET_VERSION_NEWER'));
  const result = applyPlan({ rootDir: fixtureRoot, planHash: plan.planHash });
  assert.equal(result.ok, false);
  assert.equal(result.writesPerformed, 0);
  assert.equal(targetFingerprint(fixtureRoot), before);
}));

test('installer upgrades accepted older installations and preserves installation choices', () => withFixture('upgrade', fixtureRoot => {
  const initial = buildInstallPlan({ rootDir: fixtureRoot });
  const applied = applyPlan({ rootDir: fixtureRoot, planHash: initial.planHash });
  assert.equal(applied.ok, true, JSON.stringify(applied.postApply?.conflicts, null, 2));

  const oldManifest = {
    schema_version: 1,
    workflow_id: 'tova-project-workflow',
    workflow_version: '2.0.0-rc.9',
    architecture_generation: 1,
    installed_at: '2026-07-01T00:00:00.000Z',
    installer_version: '2.0.0-rc.9',
    layout: { state_root: '.project', docs_root: 'docs' },
    owners: {},
    enabled_modules: [],
    variant: 'custom-project-overlay',
    acceptance_evidence: {}
  };
  writeFixture(fixtureRoot, '.project/TOVA_INSTALLATION.json', `${JSON.stringify(oldManifest, null, 2)}\n`);
  const upgradePlan = buildInstallPlan({ rootDir: fixtureRoot });
  assert.equal(upgradePlan.ok, true, JSON.stringify(upgradePlan.conflicts, null, 2));
  assert.equal(upgradePlan.classification, 'installed-upgrade');

  const evidencePath = acceptanceEvidence(fixtureRoot);
  const blocked = finalizeInstallation({ rootDir: fixtureRoot, acceptanceEvidence: evidencePath });
  assert.equal(blocked.ok, false);
  assert(blocked.conflicts.some(item => item.code === 'MIGRATION_LEDGER_REQUIRED'));
  const ledgerPath = acceptedMigrationLedger(fixtureRoot);
  const finalized = finalizeInstallation({ rootDir: fixtureRoot, acceptanceEvidence: evidencePath, migrationLedger: ledgerPath });
  assert.equal(finalized.ok, true, JSON.stringify(finalized.conflicts, null, 2));
  assert.equal(finalized.manifest.workflow_version, INSTALLER_VERSION);
  assert.equal(finalized.manifest.variant, 'custom-project-overlay');
  assert.equal(finalized.manifest.migration_evidence.path, ledgerPath);
  assert.equal(finalized.manifest.migration_evidence.check, 'workflow:migration-check');
  assert.equal(fs.existsSync(path.join(
    fixtureRoot,
    'archive',
    'old-projects',
    'project-workflow-generation-1',
    'installation-manifests',
    'TOVA_INSTALLATION.2.0.0-rc.9.json'
  )), true);
}));

test('TOVA12.9 fixture campaign proves mature migration, nested-root, preservation, cold-start, and stop boundaries deterministically', () => {
  const first = runFixtureCampaign();
  const second = runFixtureCampaign();

  assert.equal(first.ok, true);
  assert.equal(first.summary.fixturesPassed, 7);
  assert.equal(first.summary.fixturesTotal, 7);
  assert.equal(first.summary.failureBoundariesPassed, 6);
  assert.equal(first.summary.repositoryInstallationManifestWritten, false);
  assert.equal(first.committedFixtureTreeUnchanged, true);
  assert.deepEqual(first, second);
  for (const fixture of first.fixtures) {
    assert.equal(fixture.coldStart.ok, true, fixture.id);
    assert.equal(fixture.coldStart.readsOnlyInstalledFiles, true, fixture.id);
    assert.equal(fixture.coldStart.responses.firstRunQuestions.answer.length, 5, fixture.id);
    assert(Object.values(fixture.coldStart.responses.uncertainAnswers.answer).every(Boolean), fixture.id);
    assert.equal(fixture.coldStart.responses.discoveryRouting.answer.questionCount, 5, fixture.id);
    assert.equal(fixture.idempotency.repeatedApplyWrites, 0, fixture.id);
    assert.equal(fixture.idempotency.repeatedFinalizeWrites, 0, fixture.id);
  }
  const markdown = formatFixtureReport(first);
  assert(markdown.includes('F4 - customized generation 1 repository'));
  assert(markdown.includes('F5 - mature versioned ToVA repository'));
  assert(markdown.includes('F6 - mature established non-ToVA repository'));
  assert(markdown.includes('F7 - parent repository with nested independent ToVA project'));
  assert(markdown.includes('not a claim that a separate human or model session has approved release quality'));
});
