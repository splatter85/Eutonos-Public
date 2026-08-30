const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { buildWorkflowCheckReport } = require('./project-workflow-check');
const {
  INSTALLER_VERSION,
  applyPlan,
  buildInstallPlan,
  finalizeInstallation,
  findCaseCollisions,
  retirePlan,
  targetFingerprint
} = require('./project-workflow-install');

const ROOT_DIR = path.resolve(__dirname, '..');
const FIXTURE_ROOT = path.join(ROOT_DIR, 'test-fixtures', 'tova-workflow', 'install');
const FIXTURE_MANIFEST_PATH = path.join(FIXTURE_ROOT, 'FIXTURES.json');
const CORE_MANIFEST_PATH = path.join(ROOT_DIR, 'project-workflow', 'core', 'CORE.json');
const EVIDENCE_JSON_PATH = path.join(ROOT_DIR, 'project-workflow', 'evidence', 'TOVA12.9_MATURE_REPOSITORY_FIXTURE_ACCEPTANCE.json');
const EVIDENCE_MARKDOWN_PATH = path.join(ROOT_DIR, 'project-workflow', 'evidence', 'TOVA12.9_MATURE_REPOSITORY_FIXTURE_ACCEPTANCE.md');
const ACCEPTED_AT = '2026-07-18T12:00:00.000Z';
const PLACEHOLDER_PATTERN = /\{\{[^}]+\}\}|\[(?:PROJECT_NAME|INSTALL_COMMAND|LINT_COMMAND|TEST_COMMAND|BUILD_COMMAND|VERIFY_COMMAND(?:_IF_ANY)?|TODO_COMMAND)\]/;

function normalizePath(value) {
  return String(value || '').split(path.sep).join('/');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function walkFiles(rootDir, relativeDir = '') {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = normalizePath(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) files.push(...walkFiles(rootDir, relativePath));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function treeFingerprint(rootDir) {
  if (!fs.existsSync(rootDir)) return sha256('');
  const entries = walkFiles(rootDir).map(relativePath => {
    const bytes = fs.readFileSync(path.join(rootDir, relativePath));
    return `${relativePath}\0${sha256(bytes)}`;
  });
  return sha256(entries.join('\n'));
}

function writeFile(rootDir, relativePath, content) {
  const absolutePath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function materializeFixture(sourceRoot, targetRoot) {
  if (!sourceRoot) return [];
  const files = walkFiles(sourceRoot);
  for (const relativePath of files) {
    writeFile(targetRoot, relativePath, fs.readFileSync(path.join(sourceRoot, relativePath)));
  }
  return files;
}

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function captureHashes(rootDir, files) {
  return Object.fromEntries(files.map(relativePath => [
    relativePath,
    sha256(fs.readFileSync(path.join(rootDir, relativePath)))
  ]));
}

function runHealthCommands(rootDir, commands) {
  const derivedNpmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const npmCli = process.env.npm_execpath || (fs.existsSync(derivedNpmCli) ? derivedNpmCli : null);
  const results = [];
  for (const command of commands) {
    const match = command.match(/^npm(?:\.cmd)?\s+run\s+([^\s]+)$/i);
    invariant(match, `Unsupported fixture health command: ${command}`);
    const commandName = npmCli ? process.execPath : (process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm');
    const commandArgs = npmCli
      ? [npmCli, 'run', match[1]]
      : (process.platform === 'win32' ? ['/d', '/s', '/c', `npm.cmd run ${match[1]}`] : ['run', match[1]]);
    const result = spawnSync(commandName, commandArgs, {
      cwd: rootDir,
      encoding: 'utf8',
      shell: false,
      timeout: 15000
    });
    results.push({
      command,
      script: match[1],
      ok: !result.error && result.status === 0,
      exitCode: result.status,
      launchError: result.error ? result.error.message : null,
      outputConfirmed: Boolean(String(result.stdout || '').trim())
    });
  }
  return {
    ok: results.every(item => item.ok),
    mode: results.length ? 'declared-commands' : 'manual-project-health',
    commands: results
  };
}

function firstBodyLine(content) {
  return content.split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line && !line.startsWith('#') && !line.startsWith('-')) || null;
}

function firstSectionHeading(content) {
  const headings = [...content.matchAll(/^##+\s+(.+)$/gm)].map(match => match[1].trim());
  return headings[0] || null;
}

function firstUncheckedAction(content) {
  const match = content.match(/^- \[ \]\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function npmScriptsFromHealth(content) {
  return [...new Set([...content.matchAll(/npm(?:\.cmd)?\s+run\s+([a-zA-Z0-9:_-]+)/g)].map(match => match[1]))];
}

function firstRunQuestions(content) {
  return [...content.matchAll(/^###\s+([1-5])\.\s+(.+)$/gm)].map(match => ({
    number: Number(match[1]),
    question: match[2].trim()
  }));
}

function discoverySuggestionPolicy(content) {
  const lower = content.toLowerCase();
  return {
    repositoryEvidenceFirst: lower.includes('inspect repository evidence'),
    offersTwoOrThreeOptions: lower.includes('two or three plausible options'),
    identifiesConservativeDefault: lower.includes('one conservative default'),
    labelsUncertainty: ['confirmed', 'assumption awaiting confirmation', 'open question'].every(label => lower.includes(label)),
    forbidsSilentConfirmation: lower.includes('never silently turn an ai suggestion into a confirmed project decision')
  };
}

function auditInstalledColdStart(rootDir) {
  const workflow = buildWorkflowCheckReport({ rootDir });
  const requiredRoles = ['tovaSetup', 'projectDiscovery', 'goals', 'architecture', 'currentCapabilities', 'futureCapabilities', 'currentState', 'currentTask', 'activeAgentWork', 'projectHealth', 'knownBugs', 'outputs'];
  const files = walkFiles(rootDir);
  const actualByLower = new Map(files.map(relativePath => [relativePath.toLowerCase(), relativePath]));
  const contents = {};
  const findings = [];

  if (!workflow.ok) findings.push({ code: 'WORKFLOW_CHECK_FAILED' });
  for (const role of requiredRoles) {
    const ownerPath = workflow.resolvedOwners[role];
    if (!ownerPath) {
      findings.push({ code: 'COLD_START_OWNER_MISSING', role });
      continue;
    }
    const actualPath = actualByLower.get(ownerPath.toLowerCase());
    if (!actualPath) {
      findings.push({ code: 'COLD_START_OWNER_NOT_ACTUAL', role, path: ownerPath });
      continue;
    }
    const content = fs.readFileSync(path.join(rootDir, actualPath), 'utf8');
    contents[role] = { path: actualPath, content };
    if (content.trim().length < 80) findings.push({ code: 'COLD_START_OWNER_TOO_EMPTY', role, path: actualPath });
    if (PLACEHOLDER_PATTERN.test(content)) findings.push({ code: 'COLD_START_PLACEHOLDER', role, path: actualPath });
  }

  const packagePath = path.join(rootDir, 'package.json');
  const packageScripts = fs.existsSync(packagePath) ? (readJson(packagePath).scripts || {}) : {};
  const healthScripts = contents.projectHealth ? npmScriptsFromHealth(contents.projectHealth.content) : [];
  for (const script of healthScripts) {
    if (!packageScripts[script]) findings.push({ code: 'COLD_START_COMMAND_INVENTED', script });
  }

  const questions = contents.projectDiscovery ? firstRunQuestions(contents.projectDiscovery.content) : [];
  if (questions.length !== 5 || questions.some((item, index) => item.number !== index + 1)) {
    findings.push({ code: 'FIRST_RUN_QUESTION_CONTRACT_INVALID', expected: [1, 2, 3, 4, 5], actual: questions.map(item => item.number) });
  }
  const suggestionPolicy = contents.projectDiscovery
    ? discoverySuggestionPolicy(contents.projectDiscovery.content)
    : {
        repositoryEvidenceFirst: false,
        offersTwoOrThreeOptions: false,
        identifiesConservativeDefault: false,
        labelsUncertainty: false,
        forbidsSilentConfirmation: false
      };
  if (Object.values(suggestionPolicy).some(value => value !== true)) {
    findings.push({ code: 'FIRST_RUN_SUGGESTION_POLICY_INVALID', policy: suggestionPolicy });
  }
  for (const role of ['goals', 'architecture', 'currentState', 'currentTask', 'projectHealth']) {
    const ownerPath = contents[role]?.path;
    if (ownerPath && !contents.projectDiscovery?.content.includes(ownerPath)) {
      findings.push({ code: 'FIRST_RUN_WRITEBACK_OWNER_MISSING', role, path: ownerPath });
    }
  }

  const agentStartPath = ['.tova/AGENT_START.json', '.project/AGENT_START.json']
    .map(candidate => actualByLower.get(candidate.toLowerCase()))
    .find(Boolean) || null;
  let firstRunRouting = null;
  let firstRunSetup = null;
  if (!agentStartPath) {
    findings.push({ code: 'FIRST_RUN_AGENT_START_MISSING' });
  } else {
    try {
      const agentStart = readJson(path.join(rootDir, agentStartPath));
      firstRunSetup = agentStart.firstRunSetup || null;
      firstRunRouting = agentStart.firstRunDiscovery || null;
      const expectedAnswerOwners = {
        goals: contents.goals?.path,
        architecture: contents.architecture?.path,
        currentState: contents.currentState?.path,
        currentTask: contents.currentTask?.path,
        projectHealth: contents.projectHealth?.path
      };
      const routingValid = firstRunRouting?.path === contents.projectDiscovery?.path
        && firstRunRouting?.questionCount === 5
        && Object.entries(expectedAnswerOwners).every(([role, ownerPath]) => firstRunRouting?.answerOwners?.[role] === ownerPath)
        && /two or three/i.test(firstRunRouting?.unknownAnswerPolicy || '')
        && /conservative default/i.test(firstRunRouting?.unknownAnswerPolicy || '')
        && /assumption awaiting confirmation/i.test(firstRunRouting?.unknownAnswerPolicy || '');
      if (!routingValid) findings.push({ code: 'FIRST_RUN_AGENT_ROUTING_INVALID', path: agentStartPath });
      const setupRoutingValid = firstRunSetup?.path === contents.tovaSetup?.path
        && /every core owner/i.test(firstRunSetup?.completion || '')
        && /optional overlays and modules remain conditional/i.test(firstRunSetup?.completion || '');
      if (!setupRoutingValid) findings.push({ code: 'FIRST_RUN_SETUP_ROUTING_INVALID', path: agentStartPath });
    } catch (error) {
      findings.push({ code: 'FIRST_RUN_AGENT_START_INVALID_JSON', path: agentStartPath, message: error.message });
    }
  }

  const responses = {
    setupRouting: {
      owner: agentStartPath,
      answer: firstRunSetup
    },
    setupGuide: {
      owner: contents.tovaSetup?.path || null,
      answer: contents.tovaSetup ? firstSectionHeading(contents.tovaSetup.content) : null
    },
    firstRunQuestions: {
      owner: contents.projectDiscovery?.path || null,
      answer: questions.map(item => item.question)
    },
    uncertainAnswers: {
      owner: contents.projectDiscovery?.path || null,
      answer: suggestionPolicy
    },
    discoveryRouting: {
      owner: agentStartPath,
      answer: firstRunRouting
    },
    product: {
      owner: contents.goals?.path || null,
      answer: contents.goals ? firstBodyLine(contents.goals.content) : null
    },
    currentTask: {
      owner: contents.currentTask?.path || null,
      answer: contents.currentTask ? firstSectionHeading(contents.currentTask.content) : null
    },
    parallelWork: {
      owner: contents.activeAgentWork?.path || null,
      answer: contents.activeAgentWork
        ? (contents.activeAgentWork.content.match(/^- Owner:\s*(.+)$/m)?.[1]?.trim() || firstBodyLine(contents.activeAgentWork.content))
        : null
    },
    healthCommands: {
      owner: contents.projectHealth?.path || null,
      answer: healthScripts.length ? healthScripts.map(script => `npm run ${script}`) : ['manual project-health checks']
    },
    knownBugs: {
      owner: contents.knownBugs?.path || null,
      answer: contents.knownBugs
        ? (firstSectionHeading(contents.knownBugs.content) || firstBodyLine(contents.knownBugs.content))
        : null
    },
    retainedOutputs: {
      owner: contents.outputs?.path || null,
      answer: contents.outputs ? firstBodyLine(contents.outputs.content) : null
    },
    nextAction: {
      owner: contents.currentTask?.path || null,
      answer: contents.currentTask ? firstUncheckedAction(contents.currentTask.content) : null
    }
  };

  for (const [question, response] of Object.entries(responses)) {
    if (!response.owner || !response.answer || (Array.isArray(response.answer) && response.answer.length === 0)) {
      findings.push({ code: 'COLD_START_ANSWER_MISSING', question });
    }
  }

  return {
    ok: findings.length === 0,
    kind: 'tova.projectWorkflowColdStartAudit',
    readsOnlyInstalledFiles: true,
    owners: {
      ...Object.fromEntries(requiredRoles.map(role => [role, contents[role]?.path || null])),
      agentStart: agentStartPath
    },
    responses,
    findings
  };
}

function assertOriginalPreservation({ rootDir, originalFiles, originalHashes, core }) {
  const retired = new Set(core.retired_paths.map(relativePath => relativePath.toLowerCase()));
  const preserved = [];
  const archived = [];
  for (const relativePath of originalFiles) {
    const originalHash = originalHashes[relativePath];
    if (retired.has(relativePath.toLowerCase())) {
      invariant(!fs.existsSync(path.join(rootDir, relativePath)), `Retired source remains live: ${relativePath}`);
      const archivePath = normalizePath(path.join(core.archive_root, relativePath));
      invariant(fs.existsSync(path.join(rootDir, archivePath)), `Retired source was not archived: ${relativePath}`);
      invariant(sha256(fs.readFileSync(path.join(rootDir, archivePath))) === originalHash, `Archived bytes changed: ${relativePath}`);
      archived.push(relativePath);
    } else {
      invariant(fs.existsSync(path.join(rootDir, relativePath)), `Original file was removed: ${relativePath}`);
      invariant(sha256(fs.readFileSync(path.join(rootDir, relativePath))) === originalHash, `Original bytes changed: ${relativePath}`);
      preserved.push(relativePath);
    }
  }
  return { preserved: preserved.sort(), archived: archived.sort() };
}

function runFixture(fixture, core) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), `tova-workflow-${fixture.id.toLowerCase()}-`));
  const sourceRoot = fixture.source ? path.join(FIXTURE_ROOT, fixture.source) : null;
  const sourceBefore = sourceRoot ? treeFingerprint(sourceRoot) : sha256('');
  try {
    const originalFiles = materializeFixture(sourceRoot, rootDir);
    const originalHashes = captureHashes(rootDir, originalFiles);
    const beforeDryRun = targetFingerprint(rootDir);
    const firstPlan = buildInstallPlan({ rootDir });
    const secondPlan = buildInstallPlan({ rootDir });

    invariant(firstPlan.ok, `${fixture.id} dry-run conflicts: ${JSON.stringify(firstPlan.conflicts)}`);
    invariant(firstPlan.classification === fixture.expected_classification, `${fixture.id} classification mismatch`);
    invariant(firstPlan.stateRoot === fixture.expected_state_root, `${fixture.id} state-root mismatch`);
    invariant(firstPlan.docsRoot === fixture.expected_docs_root, `${fixture.id} docs-root mismatch`);
    invariant(firstPlan.planHash === secondPlan.planHash, `${fixture.id} dry-run was not deterministic`);
    invariant(firstPlan.writesPerformed === 0 && targetFingerprint(rootDir) === beforeDryRun, `${fixture.id} dry-run wrote to target`);
    if (fixture.expected_semantic_candidates) {
      const actualCandidates = new Set(firstPlan.semanticReconciliation.semanticRoleCandidates.map(item => item.path));
      for (const candidate of fixture.expected_semantic_candidates) {
        invariant(actualCandidates.has(candidate), `${fixture.id} semantic candidate missing: ${candidate}`);
      }
    }
    if (fixture.expected_nested_roots) {
      const actualNestedRoots = firstPlan.nestedProjects.map(item => item.projectRoot).sort();
      invariant(JSON.stringify(actualNestedRoots) === JSON.stringify([...fixture.expected_nested_roots].sort()), `${fixture.id} nested-root discovery mismatch`);
    }

    const applied = applyPlan({ rootDir, planHash: firstPlan.planHash });
    invariant(applied.ok, `${fixture.id} apply failed: ${JSON.stringify(applied.postApply?.conflicts || applied.conflicts)}`);
    invariant(applied.installationManifestWritten === false, `${fixture.id} apply wrote installation identity early`);
    const migrationRequired = ['existing-non-tova', 'legacy', 'installed-upgrade'].includes(firstPlan.classification);
    let migrationLedgerRelative = null;
    let retirement = { ok: true, writesPerformed: 0, archived: [] };
    if (migrationRequired) {
      const markerPath = path.join(rootDir, firstPlan.stateRoot, 'TOVA_MIGRATION_PENDING.json');
      const marker = readJson(markerPath);
      migrationLedgerRelative = `${firstPlan.stateRoot}/TOVA12.9_MIGRATION_LEDGER.json`;
      const migrationLedger = {
        schema_version: 1,
        kind: 'tova.projectWorkflowMigrationLedger',
        source_workflow_version: marker.source_workflow_version,
        source_classification: firstPlan.classification === 'legacy'
          ? 'legacy-untrusted'
          : (firstPlan.classification === 'installed-upgrade' ? 'versioned-upgrade' : 'established-non-tova'),
        target_workflow_version: INSTALLER_VERSION,
        target_root: rootDir,
        status: 'accepted',
        plan_hash: marker.plan_hash,
        created_at: ACCEPTED_AT,
        artifacts: firstPlan.semanticReconciliation.retirementCandidates.map(item => ({
          source_path: item.source,
          source_fingerprint: originalHashes[item.source] || sha256(fs.readFileSync(path.join(rootDir, item.source))),
          relationship: 'obsolete-workflow',
          disposition: 'RETIRE_AFTER_MERGE',
          review_status: 'accepted',
          target_role: null,
          target_path: null,
          unresolved_questions: [],
          stop_conditions: [],
          retirement: { content_reconciled: true, references_updated: true, historical_copy_required: true, safe_to_retire: true }
        })),
        review: { status: 'accepted', reviewer: 'fixture-owner', decision: 'fixture reconciliation accepted', accepted_at: ACCEPTED_AT }
      };
      writeFile(rootDir, migrationLedgerRelative, `${JSON.stringify(migrationLedger, null, 2)}\n`);
      retirement = retirePlan({ rootDir, migrationLedger: migrationLedgerRelative });
      invariant(retirement.ok, `${fixture.id} retirement failed: ${JSON.stringify(retirement.conflicts)}`);
    }
    const preservation = assertOriginalPreservation({ rootDir, originalFiles, originalHashes, core });
    invariant(JSON.stringify(preservation.archived) === JSON.stringify([...fixture.expected_archived].sort()), `${fixture.id} archive set mismatch`);
    for (const relativePath of fixture.required_preserved) {
      invariant(preservation.preserved.includes(relativePath), `${fixture.id} required preservation missing: ${relativePath}`);
    }
    invariant(fs.readdirSync(rootDir).includes(fixture.expected_docs_root), `${fixture.id} docs casing was not preserved`);
    invariant(fs.readdirSync(rootDir).includes(fixture.expected_state_root), `${fixture.id} state-root casing was not preserved`);

    const workflow = buildWorkflowCheckReport({ rootDir });
    invariant(workflow.ok, `${fixture.id} workflow check failed: ${JSON.stringify(workflow.findings)}`);
    const health = runHealthCommands(rootDir, firstPlan.healthCommands.standard);
    invariant(health.ok, `${fixture.id} declared health command failed`);
    const coldStart = auditInstalledColdStart(rootDir);
    invariant(coldStart.ok, `${fixture.id} cold-start audit failed: ${JSON.stringify(coldStart.findings)}`);

    const evidenceRelative = `${fixture.expected_state_root}/TOVA12.9_ACCEPTANCE.json`;
    const evidence = {
      ok: true,
      workflow_version: INSTALLER_VERSION,
      accepted_at: ACCEPTED_AT,
      root: rootDir,
      checks: [
        'disposable fixture dry-run and preservation checks passed',
        'fresh workflow check passed',
        health.mode === 'declared-commands' ? 'declared fixture health commands passed' : 'manual project-health boundary confirmed',
        'installed-only cold-start audit passed'
      ]
    };
    writeFile(rootDir, evidenceRelative, `${JSON.stringify(evidence, null, 2)}\n`);
    const finalized = finalizeInstallation({ rootDir, acceptanceEvidence: evidenceRelative, migrationLedger: migrationLedgerRelative });
    invariant(finalized.ok, `${fixture.id} finalize failed: ${JSON.stringify(finalized.conflicts)}`);
    invariant(finalized.manifest.workflow_version === INSTALLER_VERSION, `${fixture.id} manifest version mismatch`);

    const repeatPlan = buildInstallPlan({ rootDir });
    const repeatedApply = applyPlan({ rootDir, planHash: repeatPlan.planHash });
    const repeatedFinalize = finalizeInstallation({ rootDir, acceptanceEvidence: evidenceRelative, migrationLedger: migrationLedgerRelative });
    invariant(repeatedApply.ok && repeatedApply.writesPerformed === 0, `${fixture.id} repeated apply was not idempotent`);
    invariant(repeatedFinalize.ok && repeatedFinalize.writesPerformed === 0 && repeatedFinalize.idempotent, `${fixture.id} repeated finalize was not idempotent`);
    invariant(buildInstallPlan({ rootDir }).classification === 'installed-current', `${fixture.id} did not finish installed-current`);

    const sourceAfter = sourceRoot ? treeFingerprint(sourceRoot) : sha256('');
    invariant(sourceBefore === sourceAfter, `${fixture.id} committed fixture source changed`);

    return {
      id: fixture.id,
      name: fixture.name,
      ok: true,
      initialClassification: firstPlan.classification,
      layout: { stateRoot: firstPlan.stateRoot, docsRoot: firstPlan.docsRoot },
      dryRun: { deterministic: true, writesPerformed: 0, targetUnchanged: true },
      apply: {
        writesPerformed: applied.writesPerformed,
        installationManifestWritten: false,
        preservedOriginalFiles: preservation.preserved.length,
        archivedOriginalFiles: preservation.archived.length,
        archivedPaths: preservation.archived,
        retirementWrites: retirement.writesPerformed
      },
      workflowCheck: workflow.summary,
      health,
      coldStart,
      finalize: {
        workflowVersion: finalized.manifest.workflow_version,
        architectureGeneration: finalized.manifest.architecture_generation,
        manifestPath: finalized.manifestPath,
        acceptedEvidenceInsideTarget: true
      },
      idempotency: { repeatedApplyWrites: 0, repeatedFinalizeWrites: 0 },
      committedFixtureSourceUnchanged: true
    };
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
}

function stoppedBoundary(id, expectedCode, setupBeforePlan, mutateAfterPlan = null) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), `tova-workflow-stop-${id}-`));
  try {
    setupBeforePlan(rootDir);
    const plan = buildInstallPlan({ rootDir });
    if (mutateAfterPlan) mutateAfterPlan(rootDir);
    const before = targetFingerprint(rootDir);
    const result = applyPlan({ rootDir, planHash: plan.planHash });
    const conflictCodes = [...new Set((result.conflicts || []).map(item => item.code))].sort();
    invariant(!result.ok, `${id} boundary unexpectedly applied`);
    invariant(result.writesPerformed === 0, `${id} boundary wrote before stopping`);
    invariant(targetFingerprint(rootDir) === before, `${id} boundary changed target bytes`);
    invariant(conflictCodes.includes(expectedCode), `${id} boundary missed ${expectedCode}`);
    return { id, ok: true, expectedCode, conflictCodes, writesPerformed: 0, targetUnchanged: true };
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
}

function runFailureBoundaries(core) {
  const meaningful = label => `# ${label}\n\nThis deliberately competing owner contains enough project-specific content to require an explicit decision before installation.\n`;
  const boundaries = [
    stoppedBoundary('stale-plan', 'PLAN_HASH_MISMATCH', () => {}, rootDir => {
      writeFile(rootDir, 'README.md', meaningful('Late Readme'));
    }),
    stoppedBoundary('owner-collision', 'ROLE_OWNER_COLLISION', rootDir => {
      writeFile(rootDir, 'docs/PROJECT_GOALS.md', meaningful('Project Goals'));
      writeFile(rootDir, 'docs/PRODUCT_GOAL.md', meaningful('Product Goal'));
    }),
    stoppedBoundary('unavailable-command', 'DECLARED_COMMAND_UNAVAILABLE', rootDir => {
      writeFile(rootDir, 'package.json', `${JSON.stringify({ scripts: { test: 'node --test' } }, null, 2)}\n`);
      writeFile(rootDir, 'docs/PROJECT_HEALTH.md', '# Project Health\n\nRun `npm run absent-check`; this deliberate fixture command is not declared and must stop installation without writes.\n');
    }),
    stoppedBoundary('occupied-archive', 'LEGACY_ARCHIVE_TARGET_EXISTS', rootDir => {
      writeFile(rootDir, '.project/SESSION_RESUME.md', meaningful('Legacy Resume'));
      writeFile(rootDir, `${core.archive_root}/.project/SESSION_RESUME.md`, meaningful('Existing Archive'));
    }),
    stoppedBoundary('newer-version', 'TARGET_VERSION_NEWER', rootDir => {
      writeFile(rootDir, '.project/TOVA_INSTALLATION.json', `${JSON.stringify({ workflow_version: '99.0.0' }, null, 2)}\n`);
    })
  ];
  const caseFindings = findCaseCollisions(['Docs/README.md', 'docs/README.md']);
  invariant(caseFindings.length === 1 && caseFindings[0].code === 'CASE_COLLISION', 'case-only collision boundary was not detected');
  boundaries.push({
    id: 'case-only-paths',
    ok: true,
    expectedCode: 'CASE_COLLISION',
    conflictCodes: ['CASE_COLLISION'],
    writesPerformed: 0,
    targetUnchanged: true,
    pureCrossPlatformProbe: true
  });
  return boundaries;
}

function runFixtureCampaign() {
  const manifest = readJson(FIXTURE_MANIFEST_PATH);
  const core = readJson(CORE_MANIFEST_PATH);
  invariant(manifest.schema_version === 1, 'Unsupported fixture manifest schema');
  invariant(manifest.workflow_version === INSTALLER_VERSION, 'Fixture and installer versions differ');
  const committedBefore = treeFingerprint(FIXTURE_ROOT);
  const fixtures = manifest.fixtures.map(fixture => runFixture(fixture, core));
  const failureBoundaries = runFailureBoundaries(core);
  const committedAfter = treeFingerprint(FIXTURE_ROOT);
  invariant(committedBefore === committedAfter, 'Committed fixture tree changed during disposable campaign');

  return {
    ok: fixtures.every(fixture => fixture.ok) && failureBoundaries.every(boundary => boundary.ok),
    kind: 'tova.projectWorkflowFixtureCampaign',
    slice: 'TOVA12.9',
    workflowVersion: INSTALLER_VERSION,
    fixtureManifest: normalizePath(path.relative(ROOT_DIR, FIXTURE_MANIFEST_PATH)),
    mutationBoundary: 'temporary copies under the operating-system temp directory only',
    committedFixtureTreeUnchanged: true,
    fixtures,
    failureBoundaries,
    summary: {
      fixturesPassed: fixtures.filter(fixture => fixture.ok).length,
      fixturesTotal: fixtures.length,
      failureBoundariesPassed: failureBoundaries.filter(boundary => boundary.ok).length,
      failureBoundariesTotal: failureBoundaries.length,
      installationManifestsFinalizedInDisposableTargets: fixtures.length,
      repositoryInstallationManifestWritten: false
    }
  };
}

function formatFixtureReport(report) {
  const lines = [
    '# TOVA12.9 Mature Repository Fixture Acceptance',
    '',
    `Status: ${report.ok ? 'passed' : 'failed'}`,
    `Workflow version: \`${report.workflowVersion}\``,
    `Mutation boundary: ${report.mutationBoundary}.`,
    '',
    '## Fixture Matrix',
    ''
  ];
  for (const fixture of report.fixtures) {
    lines.push(
      `### ${fixture.id} - ${fixture.name}`,
      '',
      `- Result: ${fixture.ok ? 'passed' : 'failed'}`,
      `- Initial classification: \`${fixture.initialClassification}\``,
      `- Preserved layout: \`${fixture.layout.stateRoot}\` and \`${fixture.layout.docsRoot}\``,
      `- Original files preserved: ${fixture.apply.preservedOriginalFiles}`,
      `- Retired files archived with exact bytes: ${fixture.apply.archivedOriginalFiles}`,
      `- Health mode: ${fixture.health.mode}`,
      `- First-run questions: ${fixture.coldStart.responses.firstRunQuestions.answer.length}/5 from \`${fixture.coldStart.responses.firstRunQuestions.owner}\``,
      `- Unknown-answer policy: evidence first, two or three options, conservative default, and explicit uncertainty labels confirmed.`,
      `- Cold-start product answer owner: \`${fixture.coldStart.responses.product.owner}\``,
      `- Cold-start current task: ${fixture.coldStart.responses.currentTask.answer}`,
      `- Cold-start parallel-work answer: ${fixture.coldStart.responses.parallelWork.answer}`,
      `- Cold-start health answer: ${fixture.coldStart.responses.healthCommands.answer.join(', ')}`,
      `- Cold-start known-bug answer: ${fixture.coldStart.responses.knownBugs.answer}`,
      `- Cold-start next action: ${fixture.coldStart.responses.nextAction.answer}`,
      `- Final identity: \`${fixture.finalize.manifestPath}\`; repeat apply/finalize writes: 0/0`,
      ''
    );
  }
  lines.push('## Failure Boundaries', '');
  for (const boundary of report.failureBoundaries) {
    lines.push(`- ${boundary.id}: ${boundary.expectedCode}; zero writes and target unchanged.`);
  }
  lines.push(
    '',
    '## Claim Boundary',
    '',
    '- All seven installations and their acceptance manifests existed only in disposable temporary targets.',
    '- The committed fixture tree remained unchanged.',
    '- This is deterministic installed-file comprehension evidence, not a claim that a separate human or model session has approved release quality.',
    '- No ToVA installation manifest, portable baseline, Git commit, publication, or release was created.',
    ''
  );
  return lines.join('\n');
}

if (require.main === module) {
  try {
    const report = runFixtureCampaign();
    if (process.argv.includes('--write-evidence')) {
      fs.mkdirSync(path.dirname(EVIDENCE_JSON_PATH), { recursive: true });
      fs.writeFileSync(EVIDENCE_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      fs.writeFileSync(EVIDENCE_MARKDOWN_PATH, formatFixtureReport(report), 'utf8');
    }
    const markdown = process.argv.includes('--markdown');
    console.log(markdown ? formatFixtureReport(report) : JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ ok: false, kind: 'tova.projectWorkflowFixtureCampaignError', message: error.message }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = {
  FIXTURE_MANIFEST_PATH,
  FIXTURE_ROOT,
  EVIDENCE_JSON_PATH,
  EVIDENCE_MARKDOWN_PATH,
  auditInstalledColdStart,
  formatFixtureReport,
  runFailureBoundaries,
  runFixtureCampaign,
  treeFingerprint
};
