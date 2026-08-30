const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_REVIEW_LENSES = Object.freeze([
  'architecture',
  'data',
  'testing',
  'performance',
  'security-privacy',
  'product-workflow'
]);

const TEST_CATEGORIES = Object.freeze([
  'unit',
  'integration',
  'ui',
  'migration',
  'regression',
  'manualQa'
]);

const STAGES = new Set(['prototype', 'mvp', 'beta', 'release']);
const PERSISTENCE_KINDS = new Set(['none', 'in-memory', 'local', 'server', 'hybrid']);
const TEST_STATUSES = new Set(['not-applicable', 'planned', 'passed', 'blocked']);
const HEALTH_GATES = new Set(['Quick', 'Standard', 'Full']);
const PLACEHOLDER_PATTERN = /\b(?:TODO|TBD|FIXME)\b|\[[A-Z][A-Z0-9_ -]{2,}\]/i;
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'archive']);

function normalizePath(value) {
  return String(value || '').split(path.sep).join('/');
}

function isInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function addFinding(findings, level, code, message, details = {}) {
  findings.push({ level, code, message, ...details });
}

function requireObject(value, field, findings) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    addFinding(findings, 'error', 'FIELD_OBJECT_REQUIRED', `${field} must be an object.`, { field });
    return false;
  }
  return true;
}

function requireString(value, field, findings, minLength = 8) {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    addFinding(findings, 'error', 'FIELD_STRING_REQUIRED', `${field} must be a meaningful string.`, { field });
    return false;
  }
  return true;
}

function requireArray(value, field, findings, minItems = 1) {
  if (!Array.isArray(value) || value.length < minItems) {
    addFinding(findings, 'error', 'FIELD_ARRAY_REQUIRED', `${field} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}.`, { field });
    return false;
  }
  return true;
}

function collectPlaceholders(value, field, findings) {
  if (typeof value === 'string') {
    if (PLACEHOLDER_PATTERN.test(value)) {
      addFinding(findings, 'error', 'PLACEHOLDER_PRESENT', `${field} contains unresolved placeholder text.`, { field, value });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPlaceholders(item, `${field}[${index}]`, findings));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) collectPlaceholders(item, `${field}.${key}`, findings);
  }
}

function checkUniqueIds(items, field, findings) {
  if (!Array.isArray(items)) return;
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    const id = item?.id;
    if (!requireString(id, `${field}[${index}].id`, findings, 3)) continue;
    if (seen.has(id)) addFinding(findings, 'error', 'DUPLICATE_ID', `${field} contains duplicate id ${id}.`, { field, id });
    seen.add(id);
  }
}

function pathLikeReference(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || /^(?:https?:|urn:|token:)/i.test(trimmed)) return null;
  const withoutFragment = trimmed.split('#')[0];
  if (!withoutFragment || (!withoutFragment.includes('/') && !withoutFragment.includes('\\'))) return null;
  return withoutFragment;
}

function checkReferences(rootDir, values, field, findings) {
  if (!Array.isArray(values)) return;
  for (const [index, value] of values.entries()) {
    if (!requireString(value, `${field}[${index}]`, findings, 3)) continue;
    const relativePath = pathLikeReference(value);
    if (!relativePath) continue;
    const absolutePath = path.resolve(rootDir, relativePath);
    if (!isInside(rootDir, absolutePath)) {
      addFinding(findings, 'error', 'REFERENCE_OUTSIDE_ROOT', `${field}[${index}] points outside the project root.`, { field, reference: value });
    } else if (!fs.existsSync(absolutePath)) {
      addFinding(findings, 'error', 'REFERENCE_MISSING', `${field}[${index}] does not resolve to an existing project path.`, { field, reference: value });
    }
  }
}

function validateTestPlan(testPlan, stage, findings, rootDir) {
  if (!requireObject(testPlan, 'quality.testPlan', findings)) return;
  for (const category of TEST_CATEGORIES) {
    const field = `quality.testPlan.${category}`;
    const entry = testPlan[category];
    if (!requireObject(entry, field, findings)) continue;
    if (!TEST_STATUSES.has(entry.status)) {
      addFinding(findings, 'error', 'TEST_STATUS_INVALID', `${field}.status must be not-applicable, planned, passed, or blocked.`, { field, status: entry.status });
    }
    if (!Array.isArray(entry.evidenceRefs)) {
      addFinding(findings, 'error', 'TEST_EVIDENCE_ARRAY_REQUIRED', `${field}.evidenceRefs must be an array.`, { field });
    } else {
      checkReferences(rootDir, entry.evidenceRefs, `${field}.evidenceRefs`, findings);
    }
    if (entry.status === 'passed' && (!Array.isArray(entry.evidenceRefs) || entry.evidenceRefs.length === 0)) {
      addFinding(findings, 'error', 'PASSED_TEST_EVIDENCE_MISSING', `${field} is marked passed without evidence.`, { field });
    }
    if (entry.status === 'not-applicable' && !requireString(entry.reason, `${field}.reason`, findings, 12)) continue;
    if (entry.status === 'planned' || entry.status === 'blocked') {
      requireString(entry.reason, `${field}.reason`, findings, 12);
      addFinding(findings, 'warning', 'TEST_WORK_OPEN', `${field} remains ${entry.status}.`, { field, status: entry.status });
    }
  }

  if ((stage === 'beta' || stage === 'release') && testPlan.manualQa?.status !== 'passed') {
    addFinding(findings, 'error', 'MANUAL_QA_REQUIRED', `${stage} contracts require passed manual QA evidence.`, { stage });
  }
  if (stage === 'release') {
    for (const category of TEST_CATEGORIES) {
      if (['planned', 'blocked'].includes(testPlan[category]?.status)) {
        addFinding(findings, 'error', 'RELEASE_TEST_WORK_OPEN', `Release contracts cannot leave ${category} ${testPlan[category].status}.`, { category });
      }
    }
  }
}

function validateContract(contract, { rootDir = process.cwd(), contractPath = null } = {}) {
  const absoluteRoot = path.resolve(rootDir);
  const findings = [];
  if (!requireObject(contract, 'contract', findings)) return { ok: false, findings };

  if (contract.schemaVersion !== '1.0.0') addFinding(findings, 'error', 'SCHEMA_VERSION_UNSUPPORTED', 'schemaVersion must be 1.0.0.');
  if (contract.kind !== 'tova.appBuildContract') addFinding(findings, 'error', 'CONTRACT_KIND_INVALID', 'kind must be tova.appBuildContract.');
  collectPlaceholders(contract, 'contract', findings);

  const app = contract.app;
  if (requireObject(app, 'app', findings)) {
    requireString(app.id, 'app.id', findings, 3);
    requireString(app.name, 'app.name', findings, 3);
    requireString(app.purpose, 'app.purpose', findings, 20);
    requireArray(app.primaryUsers, 'app.primaryUsers', findings);
    requireArray(app.targets, 'app.targets', findings);
    if (!STAGES.has(app.stage)) addFinding(findings, 'error', 'APP_STAGE_INVALID', 'app.stage must be prototype, mvp, beta, or release.', { stage: app.stage });
  }

  if (requireArray(contract.workflows, 'workflows', findings)) {
    checkUniqueIds(contract.workflows, 'workflows', findings);
    for (const [index, workflow] of contract.workflows.entries()) {
      requireString(workflow?.actor, `workflows[${index}].actor`, findings, 3);
      requireString(workflow?.goal, `workflows[${index}].goal`, findings, 15);
      requireArray(workflow?.successCriteria, `workflows[${index}].successCriteria`, findings);
      requireArray(workflow?.acceptanceRefs, `workflows[${index}].acceptanceRefs`, findings);
      checkReferences(absoluteRoot, workflow?.acceptanceRefs, `workflows[${index}].acceptanceRefs`, findings);
    }
  }

  const architecture = contract.architecture;
  if (requireObject(architecture, 'architecture', findings)) {
    if (requireArray(architecture.sourceOfTruth, 'architecture.sourceOfTruth', findings)) {
      for (const [index, owner] of architecture.sourceOfTruth.entries()) {
        requireString(owner?.concern, `architecture.sourceOfTruth[${index}].concern`, findings, 5);
        requireString(owner?.ownerRef, `architecture.sourceOfTruth[${index}].ownerRef`, findings, 3);
        checkReferences(absoluteRoot, [owner?.ownerRef], `architecture.sourceOfTruth[${index}].ownerRef`, findings);
      }
    }
    if (requireArray(architecture.responsibilityBoundaries, 'architecture.responsibilityBoundaries', findings)) {
      checkUniqueIds(architecture.responsibilityBoundaries, 'architecture.responsibilityBoundaries', findings);
      for (const [index, boundary] of architecture.responsibilityBoundaries.entries()) {
        requireString(boundary?.responsibility, `architecture.responsibilityBoundaries[${index}].responsibility`, findings, 15);
        requireArray(boundary?.ownerRefs, `architecture.responsibilityBoundaries[${index}].ownerRefs`, findings);
        checkReferences(absoluteRoot, boundary?.ownerRefs, `architecture.responsibilityBoundaries[${index}].ownerRefs`, findings);
      }
    }
    if (!Array.isArray(architecture.generatedArtifacts)) addFinding(findings, 'error', 'GENERATED_ARTIFACT_ARRAY_REQUIRED', 'architecture.generatedArtifacts must be an array.');
    if (!Array.isArray(architecture.externalSystems)) addFinding(findings, 'error', 'EXTERNAL_SYSTEM_ARRAY_REQUIRED', 'architecture.externalSystems must be an array.');
  }

  const data = contract.data;
  if (requireObject(data, 'data', findings)) {
    if (!PERSISTENCE_KINDS.has(data.persistence)) addFinding(findings, 'error', 'PERSISTENCE_INVALID', 'data.persistence must be none, in-memory, local, server, or hybrid.', { persistence: data.persistence });
    if (!['none', 'low', 'medium', 'high'].includes(data.migrationRisk)) addFinding(findings, 'error', 'MIGRATION_RISK_INVALID', 'data.migrationRisk must be none, low, medium, or high.');
    if (!Array.isArray(data.models)) addFinding(findings, 'error', 'DATA_MODELS_ARRAY_REQUIRED', 'data.models must be an array.');
    if (!['none', 'in-memory'].includes(data.persistence) && (!Array.isArray(data.models) || data.models.length === 0)) {
      addFinding(findings, 'error', 'PERSISTENT_MODEL_REQUIRED', 'Persistent apps must identify at least one data model.');
    }
    requireString(data.backupRecovery, 'data.backupRecovery', findings, 15);
    requireString(data.syncConflictPolicy, 'data.syncConflictPolicy', findings, 15);
    if (!Array.isArray(data.destructiveOperations)) addFinding(findings, 'error', 'DESTRUCTIVE_OPERATION_ARRAY_REQUIRED', 'data.destructiveOperations must be an array.');
    if (['local', 'server', 'hybrid'].includes(data.persistence) && /^not[ -]applicable/i.test(String(data.backupRecovery || '').trim())) {
      addFinding(findings, 'error', 'BACKUP_RECOVERY_REQUIRED', 'Durable persistence requires a real backup or recovery position.');
    }
  }

  const quality = contract.quality;
  if (requireObject(quality, 'quality', findings)) {
    requireArray(quality.errorAndEmptyStates, 'quality.errorAndEmptyStates', findings);
    requireArray(quality.performanceRisks, 'quality.performanceRisks', findings);
    requireArray(quality.securityPrivacyRisks, 'quality.securityPrivacyRisks', findings);
    validateTestPlan(quality.testPlan, app?.stage, findings, absoluteRoot);
    if (data?.migrationRisk !== 'none' && quality.testPlan?.migration?.status === 'not-applicable') {
      addFinding(findings, 'error', 'MIGRATION_TEST_REQUIRED', 'A non-none migration risk cannot mark migration testing not applicable.');
    }
  }

  const review = contract.review;
  if (requireObject(review, 'review', findings)) {
    requireArray(review.requiredLenses, 'review.requiredLenses', findings, REQUIRED_REVIEW_LENSES.length);
    const lenses = new Set(review.requiredLenses || []);
    for (const lens of REQUIRED_REVIEW_LENSES) {
      if (!lenses.has(lens)) addFinding(findings, 'error', 'REVIEW_LENS_MISSING', `Required review lens is missing: ${lens}.`, { lens });
    }
    if (!HEALTH_GATES.has(review.healthGate)) addFinding(findings, 'error', 'HEALTH_GATE_INVALID', 'review.healthGate must be Quick, Standard, or Full.');
    if ((app?.stage === 'beta' || app?.stage === 'release') && review.healthGate !== 'Full') {
      addFinding(findings, 'error', 'FULL_GATE_REQUIRED', `${app.stage} contracts require the Full Project Health gate.`, { stage: app.stage });
    }
    requireArray(review.acceptanceRefs, 'review.acceptanceRefs', findings);
    checkReferences(absoluteRoot, review.acceptanceRefs, 'review.acceptanceRefs', findings);
    if (!Array.isArray(review.unresolvedAcceptance)) addFinding(findings, 'error', 'UNRESOLVED_ACCEPTANCE_ARRAY_REQUIRED', 'review.unresolvedAcceptance must be an array.');
    if (app?.stage === 'release' && review.unresolvedAcceptance?.length) {
      addFinding(findings, 'error', 'RELEASE_ACCEPTANCE_OPEN', 'Release contracts cannot contain unresolved acceptance.');
    }
  }

  requireArray(contract.constraints, 'constraints', findings);
  requireArray(contract.nonGoals, 'nonGoals', findings);
  if (!Array.isArray(contract.openQuestions)) addFinding(findings, 'error', 'OPEN_QUESTIONS_ARRAY_REQUIRED', 'openQuestions must be an array.');

  const errors = findings.filter(item => item.level === 'error');
  const warnings = findings.filter(item => item.level === 'warning');
  return {
    ok: errors.length === 0,
    kind: 'tova.appBuildContractCheck',
    contractPath: contractPath ? normalizePath(contractPath) : null,
    appId: app?.id || null,
    stage: app?.stage || null,
    summary: { errors: errors.length, warnings: warnings.length },
    findings
  };
}

function walkContracts(rootDir, relativeDir = '') {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;
    const relativePath = normalizePath(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) files.push(...walkContracts(rootDir, relativePath));
    else if (entry.isFile() && entry.name === 'app.build.json') files.push(relativePath);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function buildAssuranceReport({ rootDir = process.cwd(), contracts = [] } = {}) {
  const absoluteRoot = path.resolve(rootDir);
  const requested = contracts.length ? contracts : walkContracts(absoluteRoot, fs.existsSync(path.join(absoluteRoot, 'apps')) ? 'apps' : '');
  const findings = [];
  const results = [];

  if (requested.length === 0) addFinding(findings, 'error', 'NO_CONTRACTS_FOUND', 'No app.build.json contract was found.');
  for (const requestedPath of requested) {
    const absolutePath = path.resolve(absoluteRoot, requestedPath);
    const relativePath = normalizePath(path.relative(absoluteRoot, absolutePath));
    if (!isInside(absoluteRoot, absolutePath)) {
      addFinding(findings, 'error', 'CONTRACT_OUTSIDE_ROOT', 'Contract path must stay inside the project root.', { path: requestedPath });
      continue;
    }
    if (!fs.existsSync(absolutePath)) {
      addFinding(findings, 'error', 'CONTRACT_MISSING', 'Contract file does not exist.', { path: relativePath });
      continue;
    }
    try {
      results.push(validateContract(readJson(absolutePath), { rootDir: absoluteRoot, contractPath: relativePath }));
    } catch (error) {
      results.push({
        ok: false,
        kind: 'tova.appBuildContractCheck',
        contractPath: relativePath,
        appId: null,
        stage: null,
        summary: { errors: 1, warnings: 0 },
        findings: [{ level: 'error', code: 'CONTRACT_INVALID_JSON', message: error.message }]
      });
    }
  }

  for (const result of results) findings.push(...result.findings.map(item => ({ ...item, contractPath: result.contractPath })));
  const errors = findings.filter(item => item.level === 'error');
  const warnings = findings.filter(item => item.level === 'warning');
  return {
    ok: errors.length === 0 && results.every(result => result.ok),
    kind: 'tova.appBuildAssuranceReport',
    root: normalizePath(absoluteRoot),
    contracts: results,
    summary: { contractsChecked: results.length, errors: errors.length, warnings: warnings.length },
    findings,
    claimBoundary: 'Structural assurance does not replace required runtime, device, human, privacy, migration, or release acceptance.'
  };
}

function formatMarkdown(report) {
  const lines = [
    '# App Build Assurance Report',
    '',
    `Status: ${report.ok ? 'passed' : 'failed'}`,
    `Contracts checked: ${report.summary.contractsChecked}`,
    `Errors/warnings: ${report.summary.errors}/${report.summary.warnings}`,
    ''
  ];
  for (const contract of report.contracts) {
    lines.push(`## ${contract.appId || contract.contractPath}`, '', `- Path: \`${contract.contractPath}\``, `- Stage: \`${contract.stage || 'unknown'}\``, `- Result: ${contract.ok ? 'passed' : 'failed'}`, '');
    for (const finding of contract.findings) lines.push(`- ${finding.level.toUpperCase()} ${finding.code}: ${finding.message}`);
    if (contract.findings.length) lines.push('');
  }
  lines.push('## Claim Boundary', '', `- ${report.claimBoundary}`, '');
  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { rootDir: process.cwd(), contracts: [], markdown: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') args.rootDir = path.resolve(argv[++index] || '.');
    else if (arg === '--contract') args.contracts.push(argv[++index] || '');
    else if (arg === '--markdown') args.markdown = true;
  }
  return args;
}

function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = buildAssuranceReport(args);
  console.log(args.markdown ? formatMarkdown(report) : JSON.stringify(report, null, 2));
  return report.ok ? 0 : 1;
}

if (require.main === module) process.exitCode = runCli();

module.exports = {
  HEALTH_GATES,
  REQUIRED_REVIEW_LENSES,
  TEST_CATEGORIES,
  buildAssuranceReport,
  formatMarkdown,
  parseArgs,
  runCli,
  validateContract,
  walkContracts
};
