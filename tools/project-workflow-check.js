const fs = require('fs');
const path = require('path');

const RETIRED_PATHS = [
  '.tova/SESSION_RESUME.md',
  '.tova/SESSION_RESUME.json',
  '.project/SESSION_RESUME.md',
  '.project/SESSION_RESUME.json',
  '.tova/TASK_STATE.md',
  '.tova/TASK_STATE.json',
  '.project/TASK_STATE.md',
  '.project/TASK_STATE.json',
  'docs/NEXT_TASK_CANDIDATES.md',
  'docs/BUG_WORKFLOW.md'
];

const ROLE_CANDIDATES = {
  agents: ['AGENTS.md'],
  readme: ['README.md'],
  bootProtocol: ['.tova/PROJECT_BOOT_PROTOCOL.md', '.project/PROJECT_BOOT_PROTOCOL.md'],
  currentState: ['.tova/CURRENT_STATE.md', '.project/CURRENT_STATE.md'],
  executionState: ['.tova/EXECUTION_STATE.json', '.project/EXECUTION_STATE.json'],
  developmentNodes: ['.tova/DEVELOPMENT_NODES.json', '.project/DEVELOPMENT_NODES.json'],
  activeAgentWork: ['.tova/ACTIVE_AGENT_WORK.md', '.project/ACTIVE_AGENT_WORK.md'],
  docsMap: ['docs/README.md', 'Docs/README.md'],
  repositoryIndexGuide: ['docs/REPOSITORY_INDEX.md', 'Docs/REPOSITORY_INDEX.md'],
  repositoryIndex: ['docs/REPOSITORY_INDEX.json', 'Docs/REPOSITORY_INDEX.json'],
  tovaSetup: ['docs/TOVA_SETUP.md', 'Docs/TOVA_SETUP.md'],
  tovaHelp: ['docs/TOVA_HELP.md', 'Docs/TOVA_HELP.md'],
  collaborationProtocol: ['docs/COLLABORATION_PROTOCOL.md', 'Docs/COLLABORATION_PROTOCOL.md'],
  agentNotes: ['docs/agent-notes/README.md', 'Docs/agent-notes/README.md'],
  handoffs: ['docs/handoffs/README.md', 'Docs/handoffs/README.md'],
  outputs: ['docs/outputs/README.md', 'Docs/outputs/README.md'],
  projectDiscovery: ['docs/PROJECT_DISCOVERY.md', 'Docs/PROJECT_DISCOVERY.md'],
  goals: ['docs/PRODUCT_GOAL.md', 'docs/PROJECT_GOALS.md', 'Docs/PROJECT_GOALS.md'],
  architecture: ['docs/ARCHITECTURE.md', 'Docs/ARCHITECTURE.md', 'docs/IMPLEMENTATION_STATUS.md'],
  designLanguage: ['docs/DESIGN_LANGUAGE.md', 'Docs/DESIGN_LANGUAGE.md', 'docs/DESIGN_SYSTEM.md', 'Docs/DESIGN_SYSTEM.md', 'docs/VOICE_AND_COPY_STANDARDS.md', 'Docs/VOICE_AND_COPY_STANDARDS.md'],
  workModel: ['docs/WORK_MODEL.md', 'Docs/WORK_MODEL.md'],
  currentTask: ['docs/CURRENT_TASK.md', 'Docs/CURRENT_TASK.md'],
  currentCapabilities: ['docs/CURRENT_CAPABILITIES.md', 'Docs/CURRENT_CAPABILITIES.md'],
  currentFeatures: ['docs/CURRENT_FEATURES.md', 'Docs/CURRENT_FEATURES.md'],
  futureCapabilities: ['docs/FUTURE_CAPABILITIES.md', 'Docs/FUTURE_CAPABILITIES.md'],
  futureFeatures: ['docs/FUTURE_FEATURES.md', 'Docs/FUTURE_FEATURES.md'],
  projectHealth: ['docs/PROJECT_HEALTH.md', 'Docs/PROJECT_HEALTH.md'],
  knownBugs: ['docs/KNOWN_BUGS.md', 'Docs/KNOWN_BUGS.md'],
  lessons: ['docs/lessons/README.md', 'docs/LESSONS_LEARNED.md', 'Docs/LESSONS_LEARNED.md'],
  docChangeLog: ['docs/DOC_CHANGE_LOG.md', 'Docs/DOC_CHANGE_LOG.md'],
  campaignTemplate: ['docs/templates/CAMPAIGN_PLAN_TEMPLATE.md', 'templates/CAMPAIGN_PLAN_TEMPLATE.md'],
  sliceTemplate: ['docs/templates/SLICE_PLAN_TEMPLATE.md', 'templates/SLICE_PLAN_TEMPLATE.md'],
  campaignContextTemplate: ['docs/templates/CAMPAIGN_CONTEXT_CAPSULE_TEMPLATE.md', 'templates/CAMPAIGN_CONTEXT_CAPSULE_TEMPLATE.md'],
  sliceExecutionPacketTemplate: ['docs/templates/SLICE_EXECUTION_PACKET_TEMPLATE.md', 'templates/SLICE_EXECUTION_PACKET_TEMPLATE.md'],
  templatesIndex: ['docs/templates/README.md', 'templates/README.md'],
  agentNoteTemplate: ['docs/templates/AGENT_NOTE_TEMPLATE.md', 'templates/AGENT_NOTE_TEMPLATE.md'],
  exchangeReadmeTemplate: ['docs/templates/EXCHANGE_README_TEMPLATE.md', 'templates/EXCHANGE_README_TEMPLATE.md'],
  exchangeTemplate: ['docs/templates/EXCHANGE_TEMPLATE.json', 'templates/EXCHANGE_TEMPLATE.json'],
  executionReceiptTemplate: ['docs/templates/EXECUTION_RECEIPT_TEMPLATE.json', 'templates/EXECUTION_RECEIPT_TEMPLATE.json'],
  executionReceipts: ['.tova/execution/receipts/README.md', '.project/execution/receipts/README.md']
};

const PLACEHOLDER_PATTERN = /\[(?:PROJECT_NAME|INSTALL_COMMAND|LINT_COMMAND|TEST_COMMAND|BUILD_COMMAND|VERIFY_COMMAND(?:_IF_ANY)?|TODO_COMMAND)\]/;
const IGNORED_DIRS = new Set(['.git', 'node_modules']);

function normalizePath(value) {
  return String(value || '').split(path.sep).join('/');
}

function exists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function walkFiles(rootDir, relativeDir = '') {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;
    const relativePath = normalizePath(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) files.push(...walkFiles(rootDir, relativePath));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

function indexFiles(files) {
  const byLower = new Map();
  for (const relativePath of files) {
    const key = relativePath.toLowerCase();
    if (!byLower.has(key)) byLower.set(key, []);
    byLower.get(key).push(relativePath);
  }
  return byLower;
}

function actualMatches(byLower, candidates) {
  return [...new Set(candidates.flatMap(candidate => byLower.get(normalizePath(candidate).toLowerCase()) || []))];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function addFinding(findings, level, code, message, details = {}) {
  findings.push({ level, code, message, ...details });
}

function npmScriptFromCommand(command) {
  const match = String(command || '').match(/^npm(?:\.cmd)?\s+run\s+([^\s]+)/i);
  return match ? match[1] : null;
}

function nodeScriptFromCommand(command) {
  const match = String(command || '').match(/^node\s+([^\s]+)/i);
  return match ? normalizePath(match[1].replace(/^['"]|['"]$/g, '')) : null;
}

function validateModuleManifest({ rootDir, manifestPath }) {
  const findings = [];
  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    addFinding(findings, 'error', 'MODULE_MANIFEST_INVALID_JSON', error.message, { manifestPath: normalizePath(manifestPath) });
    return { ok: false, manifest: null, findings };
  }

  const required = ['schema_version', 'id', 'version', 'purpose', 'admission', 'non_goals', 'installs', 'extends', 'health', 'retirement', 'examples'];
  for (const field of required) {
    if (manifest[field] === undefined || manifest[field] === null) {
      addFinding(findings, 'error', 'MODULE_FIELD_MISSING', `Module manifest is missing ${field}.`, { field });
    }
  }
  if (manifest.schema_version !== 1) addFinding(findings, 'error', 'MODULE_SCHEMA_UNSUPPORTED', 'Module schema_version must be 1.');
  if (!/^[a-z][a-z0-9-]*$/.test(String(manifest.id || ''))) addFinding(findings, 'error', 'MODULE_ID_INVALID', 'Module id must be lowercase kebab-case.');
  if (!Array.isArray(manifest.admission?.criteria) || manifest.admission.criteria.length === 0) addFinding(findings, 'error', 'MODULE_ADMISSION_MISSING', 'Module admission criteria must be non-empty.');
  if (!Array.isArray(manifest.admission?.evidence) || manifest.admission.evidence.length === 0 || manifest.admission.evidence.some(item => /^(TODO|TBD)$/i.test(String(item).trim()))) addFinding(findings, 'error', 'MODULE_ADMISSION_EVIDENCE_INVALID', 'Module admission evidence must be real and non-placeholder.');
  if (!Array.isArray(manifest.non_goals) || manifest.non_goals.length === 0) addFinding(findings, 'error', 'MODULE_NON_GOALS_MISSING', 'Module non_goals must be non-empty.');
  if (!Array.isArray(manifest.installs?.files) || manifest.installs.files.length === 0) addFinding(findings, 'error', 'MODULE_FILES_MISSING', 'Module installed files must be declared.');
  if (!Array.isArray(manifest.extends) || manifest.extends.length === 0) addFinding(findings, 'error', 'MODULE_EXTENDS_MISSING', 'Module must name the core owner it extends.');
  if (!Array.isArray(manifest.health?.checks) || manifest.health.checks.length === 0) addFinding(findings, 'error', 'MODULE_HEALTH_MISSING', 'Module must register at least one real health check.');
  if (!Array.isArray(manifest.retirement?.remove) || manifest.retirement.remove.length === 0) addFinding(findings, 'error', 'MODULE_RETIREMENT_MISSING', 'Module retirement.remove must identify removable module-owned paths.');
  if (!Array.isArray(manifest.examples) || manifest.examples.length === 0 || manifest.examples.some(item => /^(TODO|TBD)$/i.test(String(item).trim()))) addFinding(findings, 'error', 'MODULE_EXAMPLES_INVALID', 'Module examples must be real and non-placeholder.');

  const packagePath = path.join(rootDir, 'package.json');
  const scripts = exists(rootDir, 'package.json') ? (readJson(packagePath).scripts || {}) : {};
  const sourcePayloadRoot = path.join(path.dirname(manifestPath), 'payload');
  const hasSourcePayload = fs.existsSync(sourcePayloadRoot) && fs.statSync(sourcePayloadRoot).isDirectory();
  const declaredFileExists = relativePath => exists(rootDir, relativePath)
    || (hasSourcePayload && fs.existsSync(path.join(sourcePayloadRoot, relativePath)));
  for (const relativePath of manifest.installs?.files || []) {
    if (!declaredFileExists(relativePath)) addFinding(findings, 'error', 'MODULE_FILE_MISSING', `Declared module file does not exist in the installed root or source payload: ${relativePath}`, { path: relativePath });
  }
  for (const check of manifest.health?.checks || []) {
    if (!check.id || !check.command || typeof check.required !== 'boolean') {
      addFinding(findings, 'error', 'MODULE_HEALTH_CHECK_INVALID', 'Every module health check needs id, command, and required.');
      continue;
    }
    const script = npmScriptFromCommand(check.command);
    if (script && !scripts[script]) addFinding(findings, 'error', 'MODULE_COMMAND_UNAVAILABLE', `Module health command references missing npm script: ${script}`, { command: check.command });
    const nodeScript = nodeScriptFromCommand(check.command);
    if (nodeScript && !declaredFileExists(nodeScript)) addFinding(findings, 'error', 'MODULE_COMMAND_UNAVAILABLE', `Module health command references missing Node script: ${nodeScript}`, { command: check.command });
  }

  return { ok: !findings.some(item => item.level === 'error'), manifest, findings };
}

function discoverInstallationManifest(rootDir, byLower, findings) {
  const matches = actualMatches(byLower, ['.tova/TOVA_INSTALLATION.json', '.project/TOVA_INSTALLATION.json']);
  if (matches.length > 1) {
    addFinding(findings, 'error', 'INSTALLATION_MANIFEST_COLLISION', 'More than one installation manifest exists.', { paths: matches });
    return null;
  }
  if (matches.length === 0) return null;
  try {
    return { path: matches[0], value: readJson(path.join(rootDir, matches[0])) };
  } catch (error) {
    addFinding(findings, 'error', 'INSTALLATION_MANIFEST_INVALID_JSON', error.message, { path: matches[0] });
    return null;
  }
}

function checkCoreOwners(rootDir, byLower, findings) {
  const resolved = {};
  for (const [role, candidates] of Object.entries(ROLE_CANDIDATES)) {
    const matches = actualMatches(byLower, candidates);
    if (matches.length === 0) addFinding(findings, 'error', 'CORE_OWNER_MISSING', `No installed owner found for ${role}.`, { role, candidates });
    else if (matches.length > 1) addFinding(findings, 'error', 'CORE_OWNER_COLLISION', `Multiple installed files could own ${role}.`, { role, paths: matches });
    else resolved[role] = matches[0];
  }
  return resolved;
}

function checkRetiredOwners(rootDir, byLower, resolved, findings) {
  for (const retiredPath of RETIRED_PATHS) {
    for (const actualPath of actualMatches(byLower, [retiredPath])) {
      addFinding(findings, 'error', 'RETIRED_OWNER_PRESENT', `Retired owner is still installed: ${actualPath}`, { path: actualPath });
    }
  }
  const historyRoles = new Set(['docChangeLog', 'campaignTemplate', 'sliceTemplate', 'campaignContextTemplate', 'sliceExecutionPacketTemplate', 'templatesIndex', 'agentNoteTemplate', 'exchangeReadmeTemplate', 'exchangeTemplate', 'executionReceiptTemplate', 'executionReceipts']);
  const livingPaths = Object.entries(resolved)
    .filter(([role]) => !historyRoles.has(role))
    .map(([, relativePath]) => relativePath);
  for (const relativePath of livingPaths) {
    const content = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    for (const retiredPath of RETIRED_PATHS) {
      if (content.includes(retiredPath) || content.includes(path.basename(retiredPath))) {
        addFinding(findings, 'error', 'RETIRED_OWNER_REFERENCED', `Living owner ${relativePath} references retired ${retiredPath}.`, { path: relativePath, retiredPath });
      }
    }
  }
}

function checkMeaningfulContent(rootDir, resolved, findings) {
  for (const [role, relativePath] of Object.entries(resolved)) {
    if (role.endsWith('Template')) continue;
    const content = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    if (content.trim().length < 80) addFinding(findings, 'error', 'CORE_OWNER_TOO_EMPTY', `Core owner ${relativePath} does not explain enough to be meaningful.`, { path: relativePath });
    if (PLACEHOLDER_PATTERN.test(content)) addFinding(findings, 'error', 'CORE_PLACEHOLDER_PRESENT', `Installed core owner ${relativePath} still contains a command or project placeholder.`, { path: relativePath });
  }
}

function checkProjectHealthCommands(rootDir, resolved, findings) {
  if (!resolved.projectHealth || !exists(rootDir, 'package.json')) return;
  const scripts = readJson(path.join(rootDir, 'package.json')).scripts || {};
  const content = fs.readFileSync(path.join(rootDir, resolved.projectHealth), 'utf8');
  const commands = [...content.matchAll(/npm(?:\.cmd)?\s+run\s+([a-zA-Z0-9:_-]+)/g)].map(match => match[1]);
  for (const script of new Set(commands)) {
    if (!scripts[script]) addFinding(findings, 'error', 'PROJECT_HEALTH_COMMAND_UNAVAILABLE', `Project Health references missing npm script: ${script}`, { script });
  }
}

function checkEnabledModules(rootDir, installation, findings) {
  const enabled = installation?.value?.enabled_modules || [];
  for (const moduleId of enabled) {
    const manifestPath = path.join(rootDir, 'modules', moduleId, 'MODULE.json');
    if (!fs.existsSync(manifestPath)) {
      addFinding(findings, 'error', 'ENABLED_MODULE_MISSING', `Enabled module ${moduleId} has no MODULE.json.`, { moduleId });
      continue;
    }
    findings.push(...validateModuleManifest({ rootDir, manifestPath }).findings);
  }
}

function buildWorkflowCheckReport({ rootDir = path.resolve(__dirname, '..'), moduleManifest = null } = {}) {
  const absoluteRoot = path.resolve(rootDir);
  if (moduleManifest) {
    const manifestPath = path.resolve(absoluteRoot, moduleManifest);
    const result = validateModuleManifest({ rootDir: absoluteRoot, manifestPath });
    return {
      ok: result.ok,
      kind: 'tova.projectWorkflowModuleCheck',
      root: normalizePath(absoluteRoot),
      moduleManifest: normalizePath(path.relative(absoluteRoot, manifestPath)),
      summary: { errors: result.findings.filter(item => item.level === 'error').length, warnings: result.findings.filter(item => item.level === 'warning').length },
      findings: result.findings
    };
  }

  const findings = [];
  const files = walkFiles(absoluteRoot);
  const byLower = indexFiles(files);
  for (const paths of byLower.values()) {
    if (paths.length > 1) addFinding(findings, 'error', 'CASE_COLLISION', 'Installed paths differ only by case.', { paths });
  }
  const resolvedOwners = checkCoreOwners(absoluteRoot, byLower, findings);
  checkRetiredOwners(absoluteRoot, byLower, resolvedOwners, findings);
  checkMeaningfulContent(absoluteRoot, resolvedOwners, findings);
  checkProjectHealthCommands(absoluteRoot, resolvedOwners, findings);
  const installation = discoverInstallationManifest(absoluteRoot, byLower, findings);
  checkEnabledModules(absoluteRoot, installation, findings);
  const errors = findings.filter(item => item.level === 'error');
  const warnings = findings.filter(item => item.level === 'warning');
  return {
    ok: errors.length === 0,
    kind: 'tova.projectWorkflowCheck',
    workflowGeneration: 2,
    root: normalizePath(absoluteRoot),
    resolvedOwners,
    installationManifest: installation?.path || null,
    summary: { errors: errors.length, warnings: warnings.length, ownersChecked: Object.keys(resolvedOwners).length },
    findings,
    nextAction: errors.length ? 'Resolve workflow owner, reference, command, or module findings.' : 'Use the required Project Health gate for the active Slice.'
  };
}

function parseArgs(argv) {
  const args = { rootDir: path.resolve(__dirname, '..'), moduleManifest: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--root') args.rootDir = path.resolve(argv[++index]);
    else if (argv[index] === '--module-manifest') args.moduleManifest = argv[++index];
  }
  return args;
}

if (require.main === module) {
  const report = buildWorkflowCheckReport(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

module.exports = {
  RETIRED_PATHS,
  ROLE_CANDIDATES,
  buildWorkflowCheckReport,
  validateModuleManifest
};
