const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { buildWorkflowCheckReport } = require('./project-workflow-check');
const { buildMigrationCheckReport } = require('./project-workflow-migration-check');

const CORE_ROOT = path.resolve(__dirname, '..', 'project-workflow', 'core');
const CORE_MANIFEST_PATH = path.join(CORE_ROOT, 'CORE.json');
const INSTALLER_VERSION = '2.0.0-rc.11-dev';
const IGNORED_DIRS = new Set(['.git', 'node_modules']);

function normalizePath(value) {
  return String(value || '').split(path.sep).join('/');
}

function isInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function sha256Buffer(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadCore(coreRoot = CORE_ROOT) {
  const manifestPath = path.join(coreRoot, 'CORE.json');
  const manifest = readJson(manifestPath);
  if (manifest.schema_version !== 1 || manifest.architecture_generation !== 2) {
    throw new Error('Unsupported project-workflow core manifest.');
  }
  return { root: coreRoot, manifest, manifestPath };
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

function discoverNestedProjectRoots(files) {
  const roots = new Map();
  const pattern = /^(.+)\/(\.project|\.tova)\/(TOVA_INSTALLATION\.json|EXECUTION_STATE\.json)$/i;
  for (const relativePath of files) {
    const match = relativePath.match(pattern);
    if (!match) continue;
    const projectRoot = normalizePath(match[1]);
    if (!roots.has(projectRoot)) roots.set(projectRoot, { projectRoot, evidence: [] });
    roots.get(projectRoot).evidence.push(relativePath);
  }
  return [...roots.values()].sort((left, right) => left.projectRoot.localeCompare(right.projectRoot));
}

function excludeNestedProjectFiles(files, nestedProjects) {
  const prefixes = nestedProjects.map(item => item.projectRoot.toLowerCase() + '/');
  return files.filter(relativePath => !prefixes.some(prefix => relativePath.toLowerCase().startsWith(prefix)));
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

function targetFingerprint(rootDir, files = walkFiles(rootDir)) {
  const entries = files.map(relativePath => `${relativePath}\0${sha256File(path.join(rootDir, relativePath))}`);
  return sha256Buffer(entries.join('\n'));
}

function parseVersion(value) {
  const match = String(value || '').match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] || null
  };
}

function compareVersions(leftValue, rightValue) {
  const left = parseVersion(leftValue);
  const right = parseVersion(rightValue);
  if (!left || !right) return null;
  for (const field of ['major', 'minor', 'patch']) {
    if (left[field] !== right[field]) return left[field] < right[field] ? -1 : 1;
  }
  if (left.prerelease === right.prerelease) return 0;
  if (!left.prerelease) return 1;
  if (!right.prerelease) return -1;
  return left.prerelease.localeCompare(right.prerelease, undefined, { numeric: true });
}

function resolveActual(byLower, relativePath) {
  return byLower.get(normalizePath(relativePath).toLowerCase()) || [];
}

function discoverRoots(files, core) {
  const stateEntry = files.find(item => /^(\.tova|\.project)\//i.test(item));
  const docsEntry = files.find(item => /^docs\//i.test(item));
  return {
    stateRoot: stateEntry ? stateEntry.split('/')[0] : core.manifest.state_root,
    docsRoot: docsEntry ? docsEntry.split('/')[0] : 'docs'
  };
}

function adjustedTarget(role, roots) {
  const normalized = normalizePath(role.target);
  if (/^\.(project|tova)\//i.test(normalized)) return `${roots.stateRoot}/${normalized.split('/').slice(1).join('/')}`;
  if (/^docs\//i.test(normalized)) return `${roots.docsRoot}/${normalized.split('/').slice(1).join('/')}`;
  return normalized;
}

function discoverPackage(rootDir, conflicts) {
  const packagePath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packagePath)) return { path: null, name: null, scripts: {} };
  try {
    const value = readJson(packagePath);
    return {
      path: 'package.json',
      name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : null,
      scripts: value.scripts && typeof value.scripts === 'object' ? value.scripts : {}
    };
  } catch (error) {
    conflicts.push({ code: 'PACKAGE_JSON_INVALID', path: 'package.json', message: error.message });
    return { path: 'package.json', name: null, scripts: {} };
  }
}

function healthCommands(scripts) {
  const scriptNames = new Set(Object.keys(scripts || {}));
  const command = name => `npm run ${name}`;
  const quick = ['lint', 'typecheck', 'check'].filter(name => scriptNames.has(name)).map(command);
  if (quick.length === 0 && scriptNames.has('test')) quick.push(command('test'));
  const standard = ['test', 'build'].filter(name => scriptNames.has(name)).map(command);
  if (scriptNames.has('verify')) standard.push(command('verify'));
  const full = scriptNames.has('verify') ? [command('verify')] : [...new Set([...quick, ...standard])];
  return { quick, standard, full };
}

function healthSection(commands) {
  const lines = [];
  const addGate = (title, values, fallback) => {
    lines.push(`## ${title}`, '');
    if (values.length) values.forEach(value => lines.push(`- \`${value}\``));
    else lines.push(`- Manual check: ${fallback}`);
    lines.push('');
  };
  addGate('Quick Slice', commands.quick, 'inspect changed files, links, formatting, and the exact behavior or document contract touched.');
  addGate('Standard Project Health', commands.standard, 'run the project-specific test/build checks confirmed by the owner, then record the evidence here.');
  addGate('Full Acceptance', commands.full, 'run every confirmed project gate plus release, migration, or baseline evidence required by the active Campaign.');
  return lines.join('\n').trimEnd();
}

function discoverInstallation(byLower, rootDir, conflicts) {
  const candidates = ['.project/TOVA_INSTALLATION.json', '.tova/TOVA_INSTALLATION.json'];
  const matches = [...new Set(candidates.flatMap(candidate => resolveActual(byLower, candidate)))];
  if (matches.length > 1) {
    conflicts.push({ code: 'INSTALLATION_MANIFEST_COLLISION', paths: matches, message: 'More than one installation manifest exists.' });
    return null;
  }
  if (matches.length === 0) return null;
  try {
    return { path: matches[0], value: readJson(path.join(rootDir, matches[0])) };
  } catch (error) {
    conflicts.push({ code: 'INSTALLATION_MANIFEST_INVALID', path: matches[0], message: error.message });
    return null;
  }
}

function discoverOwners(core, roots, byLower, conflicts) {
  const owners = {};
  const actions = [];
  for (const role of core.manifest.roles) {
    const matches = [...new Set((role.candidates || []).flatMap(candidate => resolveActual(byLower, candidate)))];
    if (matches.length > 1) {
      conflicts.push({
        code: 'ROLE_OWNER_COLLISION',
        role: role.id,
        paths: matches,
        message: `Multiple existing files could own ${role.id}; choose one before applying.`
      });
      continue;
    }
    if (matches.length === 1) {
      owners[role.id] = matches[0];
      actions.push({ type: 'reuse', role: role.id, path: matches[0], preservesBytes: true });
      continue;
    }
    const target = adjustedTarget(role, roots);
    const targetMatches = resolveActual(byLower, target);
    if (targetMatches.length) {
      conflicts.push({ code: 'TARGET_PATH_COLLISION', role: role.id, paths: targetMatches, target });
      continue;
    }
    owners[role.id] = target;
    actions.push({ type: 'create', role: role.id, path: target, template: role.template });
  }
  return { owners, actions };
}

function discoverSemanticRoleCandidates(files, owners) {
  const ownerPaths = new Set(Object.values(owners).map(value => value.toLowerCase()));
  const roleNames = new Map([
    ['current_tasks.md', ['currentTask']],
    ['task_state.md', ['currentTask', 'executionState']],
    ['product_vision.md', ['goals']],
    ['project_goals.md', ['goals']],
    ['known_issues.md', ['knownBugs']],
    ['bug_workflow.md', ['knownBugs']],
    ['change_log.md', ['docChangeLog']],
    ['changelog.md', ['docChangeLog']],
    ['roadmap.md', ['futureCapabilities', 'futureFeatures', 'conditionalRoadmap']],
    ['next_task_candidates.md', ['currentTask', 'futureCapabilities', 'futureFeatures', 'conditionalRoadmap']],
    ['release_readiness.md', ['projectHealth', 'conditionalReleaseAcceptance']],
    ['pre_launch_qa.md', ['projectHealth', 'conditionalReleaseAcceptance']]
  ]);
  const semanticRoleCandidates = [];
  const unclassifiedExistingDocuments = [];
  for (const relativePath of files.filter(item => /\.(md|json)$/i.test(item))) {
    if (ownerPaths.has(relativePath.toLowerCase())) continue;
    const roles = roleNames.get(path.basename(relativePath).toLowerCase());
    if (roles) semanticRoleCandidates.push({ path: relativePath, proposedRoles: roles, authoritative: false, requiresContentReview: true });
    else if (/^(docs|Docs)\//.test(relativePath)) unclassifiedExistingDocuments.push(relativePath);
  }
  return { semanticRoleCandidates, unclassifiedExistingDocuments };
}

function loadUpgradeContract(coreRoot, sourceVersion, targetVersion, conflicts) {
  if (!sourceVersion || sourceVersion === targetVersion) return null;
  const contractPath = path.resolve(coreRoot, '..', 'releases', targetVersion, 'UPGRADE.json');
  if (!fs.existsSync(contractPath)) return null;
  try {
    const contract = readJson(contractPath);
    const direct = Array.isArray(contract.direct_upgrade_paths)
      && contract.direct_upgrade_paths.some(item => item.from === sourceVersion && item.to === targetVersion);
    if (contract.release_version !== targetVersion || !direct) conflicts.push({ code: 'UPGRADE_PATH_UNSUPPORTED', sourceVersion, targetVersion });
    return { path: normalizePath(contractPath), value: contract, direct };
  } catch (error) {
    conflicts.push({ code: 'UPGRADE_CONTRACT_INVALID', path: normalizePath(contractPath), message: error.message });
    return null;
  }
}

function discoverRetired(core, byLower, conflicts) {
  const retired = [];
  for (const retiredPath of core.manifest.retired_paths || []) {
    for (const actualPath of resolveActual(byLower, retiredPath)) {
      if (!retired.includes(actualPath)) retired.push(actualPath);
    }
  }
  const archived = [];
  for (const source of retired.sort()) {
    const target = normalizePath(path.join(core.manifest.archive_root, source));
    const existing = resolveActual(byLower, target);
    if (existing.length) {
      archived.push({ source, target: existing[0], existing: true });
    } else {
      archived.push({ source, target, existing: false });
    }
  }
  for (const item of archived.filter(entry => entry.existing)) {
    conflicts.push({
      code: 'LEGACY_ARCHIVE_TARGET_EXISTS',
      source: item.source,
      target: item.target,
      message: 'Legacy source cannot be archived until the existing archive target is reconciled.'
    });
  }
  if (archived.length) {
    const migrationPath = normalizePath(path.join(core.manifest.archive_root, 'MIGRATION.md'));
    const existingMigration = resolveActual(byLower, migrationPath);
    if (existingMigration.length) {
      conflicts.push({
        code: 'LEGACY_MIGRATION_NOTE_EXISTS',
        path: existingMigration[0],
        message: 'Legacy sources cannot be moved until the existing migration note is reconciled.'
      });
    }
  }
  return archived;
}

function checkCaseCollisions(byLower, conflicts) {
  for (const paths of byLower.values()) {
    if (paths.length > 1) conflicts.push({ code: 'CASE_COLLISION', paths, message: 'Paths differ only by case.' });
  }
}

function findCaseCollisions(files) {
  const conflicts = [];
  checkCaseCollisions(indexFiles(files), conflicts);
  return conflicts;
}

function checkExistingHealth(rootDir, owners, scripts, conflicts) {
  const healthPath = owners.projectHealth;
  if (!healthPath || !fs.existsSync(path.join(rootDir, healthPath))) return;
  const content = fs.readFileSync(path.join(rootDir, healthPath), 'utf8');
  const commands = [...content.matchAll(/npm(?:\.cmd)?\s+run\s+([a-zA-Z0-9:_-]+)/g)].map(match => match[1]);
  for (const script of new Set(commands)) {
    if (!scripts[script]) conflicts.push({
      code: 'DECLARED_COMMAND_UNAVAILABLE',
      path: healthPath,
      command: `npm run ${script}`,
      message: 'Existing Project Health declares an unavailable package script.'
    });
  }
}

function classifyProject({ files, installation, retired, ownerActions, core, conflicts }) {
  if (installation) {
    const comparison = compareVersions(installation.value.workflow_version, core.manifest.version);
    if (comparison === null) {
      conflicts.push({ code: 'INSTALLED_VERSION_INVALID', path: installation.path });
      return 'installed-invalid';
    }
    if (comparison > 0) {
      conflicts.push({
        code: 'TARGET_VERSION_NEWER',
        installedVersion: installation.value.workflow_version,
        packageVersion: core.manifest.version,
        message: 'The target workflow is newer than this installer.'
      });
      return 'installed-newer';
    }
    return comparison === 0 ? 'installed-current' : 'installed-upgrade';
  }
  if (retired.length) return 'legacy';
  if (ownerActions.length && ownerActions.every(action => action.type === 'reuse')) return 'pending-finalize';
  return files.length === 0 ? 'blank' : 'existing-non-tova';
}

function stablePlanShape(plan) {
  return {
    workflowVersion: plan.workflowVersion,
    architectureGeneration: plan.architectureGeneration,
    root: plan.root,
    classification: plan.classification,
    stateRoot: plan.stateRoot,
    docsRoot: plan.docsRoot,
    targetFingerprint: plan.targetFingerprint,
    owners: plan.owners,
    nestedProjects: plan.nestedProjects,
    upgradeContract: plan.upgradeContract,
    semanticReconciliation: plan.semanticReconciliation,
    actions: plan.actions,
    conflicts: plan.conflicts,
    healthCommands: plan.healthCommands,
    requiredAcceptance: plan.requiredAcceptance
  };
}

function buildInstallPlan({ rootDir, coreRoot = CORE_ROOT } = {}) {
  const absoluteRoot = path.resolve(rootDir || '.');
  if (!fs.existsSync(absoluteRoot) || !fs.statSync(absoluteRoot).isDirectory()) {
    return {
      ok: false,
      kind: 'tova.projectWorkflowInstallPlan',
      root: normalizePath(absoluteRoot),
      conflicts: [{ code: 'TARGET_ROOT_MISSING', message: 'Target root must be an existing directory.' }]
    };
  }

  const core = loadCore(coreRoot);
  const allFiles = walkFiles(absoluteRoot);
  const nestedProjects = discoverNestedProjectRoots(allFiles);
  const files = excludeNestedProjectFiles(allFiles, nestedProjects);
  const byLower = indexFiles(files);
  const conflicts = [];
  checkCaseCollisions(byLower, conflicts);
  const roots = discoverRoots(files, core);
  const packageInfo = discoverPackage(absoluteRoot, conflicts);
  const installation = discoverInstallation(byLower, absoluteRoot, conflicts);
  const ownerDiscovery = discoverOwners(core, roots, byLower, conflicts);
  const retired = discoverRetired(core, byLower, conflicts);
  const upgradeContract = loadUpgradeContract(coreRoot, installation?.value?.workflow_version, core.manifest.version, conflicts);
  const semanticDiscovery = discoverSemanticRoleCandidates(files, ownerDiscovery.owners);
  checkExistingHealth(absoluteRoot, ownerDiscovery.owners, packageInfo.scripts, conflicts);
  const commands = healthCommands(packageInfo.scripts);
  const actions = [
    ...ownerDiscovery.actions,
    ...retired.map(item => ({ type: 'retire-pending', path: item.source, target: item.target, preservesBytes: true, automatic: false })),
    { type: 'finalize-after-acceptance', path: `${roots.stateRoot}/TOVA_INSTALLATION.json`, deferred: true }
  ];
  const classification = classifyProject({
    files,
    installation,
    retired,
    ownerActions: ownerDiscovery.actions,
    core,
    conflicts
  });
  const projectName = packageInfo.name || path.basename(absoluteRoot);
  const requiredAcceptance = [
    'all required workflow owners resolve without competing paths',
    'retired live owners are absent only after accepted reconciliation and retire',
    ...(commands.standard.length ? commands.standard : ['manual project-specific health review']),
    'the installed five-question first-run discovery and evidence-based suggestion policy are readable from installed files',
    'cold-start owner and next-action questions are answerable from installed files'
  ];
  const plan = {
    ok: conflicts.length === 0,
    kind: 'tova.projectWorkflowInstallPlan',
    phase: 'dry-run',
    workflowId: core.manifest.id,
    workflowVersion: core.manifest.version,
    installerVersion: INSTALLER_VERSION,
    architectureGeneration: core.manifest.architecture_generation,
    root: normalizePath(absoluteRoot),
    projectName,
    classification,
    stateRoot: roots.stateRoot,
    docsRoot: roots.docsRoot,
    targetFingerprint: targetFingerprint(absoluteRoot, files),
    package: { path: packageInfo.path, scripts: Object.keys(packageInfo.scripts).sort() },
    owners: ownerDiscovery.owners,
    nestedProjects,
    upgradeContract: upgradeContract ? { path: upgradeContract.path, direct: upgradeContract.direct, releaseVersion: upgradeContract.value.release_version } : null,
    semanticReconciliation: {
      exactOwnerCandidates: ownerDiscovery.actions.filter(action => action.type === 'reuse').map(action => ({ role: action.role, path: action.path })),
      semanticRoleCandidates: semanticDiscovery.semanticRoleCandidates,
      unclassifiedExistingDocuments: semanticDiscovery.unclassifiedExistingDocuments,
      retirementCandidates: retired.map(item => ({ source: item.source, target: item.target, automaticRetirementPermitted: false }))
    },
    actions,
    preservation: {
      reused: actions.filter(action => action.type === 'reuse').map(action => action.path),
      createOnly: actions.filter(action => action.type === 'create').map(action => action.path),
      archiveExactBytes: retired.map(item => ({ source: item.source, target: item.target }))
    },
    healthCommands: commands,
    requiredAcceptance,
    conflicts,
    installation: installation ? { path: installation.path, workflowVersion: installation.value.workflow_version } : null,
    writesPerformed: 0
  };
  plan.planHash = sha256Buffer(JSON.stringify(stablePlanShape(plan)));
  return plan;
}

function renderTemplate({ template, plan, architectureSummary }) {
  const variables = {
    PROJECT_NAME: plan.projectName,
    PROJECT_NAME_JSON: JSON.stringify(plan.projectName).slice(1, -1),
    PROJECT_CLASSIFICATION: plan.classification,
    WORKFLOW_VERSION: INSTALLER_VERSION,
    DATE: new Date().toISOString().slice(0, 10),
    STATE_ROOT: plan.stateRoot,
    ARCHITECTURE_SUMMARY: architectureSummary,
    HEALTH_SECTION: healthSection(plan.healthCommands)
  };
  for (const [role, ownerPath] of Object.entries(plan.owners)) variables[`OWNER_${role}`] = ownerPath;
  const rendered = template.replace(/\{\{([A-Z_a-z]+)\}\}/g, (match, key) => {
    if (!(key in variables)) throw new Error(`Template variable ${key} is not defined.`);
    return variables[key];
  });
  if (/\{\{[^}]+\}\}/.test(rendered)) throw new Error('Template contains an unresolved variable.');
  return rendered.endsWith('\n') ? rendered : `${rendered}\n`;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeCreateOnly(filePath, content) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, content, { encoding: 'utf8', flag: 'wx' });
}

function migrationMarkerRelative(plan) { return `${plan.stateRoot}/TOVA_MIGRATION_PENDING.json`; }
function requiresMigrationPlan(classification) { return ['existing-non-tova', 'legacy', 'installed-upgrade'].includes(classification); }

function applyPlan({ rootDir, coreRoot = CORE_ROOT, planHash } = {}) {
  const plan = buildInstallPlan({ rootDir, coreRoot });
  const errors = [...(plan.conflicts || [])];
  if (!planHash) errors.push({ code: 'PLAN_HASH_REQUIRED', message: 'Run dry-run first and pass its planHash to apply.' });
  else if (planHash !== plan.planHash) errors.push({ code: 'PLAN_HASH_MISMATCH', expected: plan.planHash, received: planHash });
  if (!plan.ok || errors.length) return { ...plan, ok: false, phase: 'apply', conflicts: errors, writesPerformed: 0 };

  const absoluteRoot = path.resolve(rootDir);
  const core = loadCore(coreRoot);
  const packageScriptCount = plan.package.scripts.length;
  const architectureSummary = plan.package.path
    ? `package.json was discovered with ${packageScriptCount} declared script${packageScriptCount === 1 ? '' : 's'}; component semantics still require project review.`
    : 'No package command manifest was discovered; component semantics and verification commands require project review.';
  const writes = [];

  for (const action of plan.actions.filter(item => item.type === 'create')) {
    const role = core.manifest.roles.find(item => item.id === action.role);
    const template = fs.readFileSync(path.join(core.root, role.template), 'utf8');
    const content = renderTemplate({ template, plan, architectureSummary });
    writeCreateOnly(path.join(absoluteRoot, action.path), content);
    writes.push({ type: 'created', path: action.path, sha256: sha256Buffer(content) });
  }

  if (requiresMigrationPlan(plan.classification)) {
    const markerRelative = migrationMarkerRelative(plan);
    const markerPath = path.join(absoluteRoot, markerRelative);
    if (!fs.existsSync(markerPath)) {
      const marker = { schema_version: 1, kind: 'tova.projectWorkflowMigrationPending', source_classification: plan.classification, source_workflow_version: plan.installation?.workflowVersion || null, target_workflow_version: plan.workflowVersion, plan_hash: plan.planHash, retirement_candidates: plan.actions.filter(item => item.type === 'retire-pending').map(item => ({ source: item.path, target: item.target })), phase: 'reconcile' };
      writeCreateOnly(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
      writes.push({ type: 'created-migration-marker', path: markerRelative });
    }
  }

  const postApply = buildInstallPlan({ rootDir: absoluteRoot, coreRoot });
  return {
    ok: postApply.ok,
    kind: 'tova.projectWorkflowInstallApply',
    phase: 'apply',
    root: plan.root,
    appliedPlanHash: plan.planHash,
    writesPerformed: writes.length,
    writes,
    installationManifestWritten: false,
    postApply,
    nextAction: postApply.ok
      ? (requiresMigrationPlan(plan.classification) ? 'Reconcile and accept the migration ledger; run retire only for accepted retirement entries, then run acceptance and finalize.' : 'Run project acceptance and cold-start checks, save evidence inside the project, then run finalize with that evidence.')
      : 'Resolve post-apply workflow findings before finalization.'
  };
}

function retirePlan({ rootDir, coreRoot = CORE_ROOT, migrationLedger } = {}) {
  const absoluteRoot = path.resolve(rootDir || '.');
  const plan = buildInstallPlan({ rootDir: absoluteRoot, coreRoot });
  const markerRelative = migrationMarkerRelative(plan);
  const markerPath = path.join(absoluteRoot, markerRelative);
  const conflicts = [...(plan.conflicts || [])];
  if (!fs.existsSync(markerPath)) conflicts.push({ code: 'MIGRATION_MARKER_MISSING', path: markerRelative });
  const marker = fs.existsSync(markerPath) ? readJson(markerPath) : null;
  const report = migrationLedger ? buildMigrationCheckReport({ rootDir: absoluteRoot, ledgerPath: migrationLedger, expectedVersion: plan.workflowVersion }) : null;
  if (!migrationLedger) conflicts.push({ code: 'MIGRATION_LEDGER_REQUIRED' });
  if (report && !report.ok) conflicts.push({ code: 'MIGRATION_CHECK_FAILED', findings: report.findings });
  const ledger = migrationLedger && report?.ok ? readJson(path.resolve(absoluteRoot, migrationLedger)) : null;
  if (marker && ledger && marker.plan_hash !== ledger.plan_hash) conflicts.push({ code: 'MIGRATION_LEDGER_PLAN_HASH_MISMATCH', expected: marker.plan_hash, received: ledger.plan_hash });
  const retirementActions = plan.actions.filter(item => item.type === 'retire-pending');
  const bySource = new Map((ledger?.artifacts || []).map(item => [normalizePath(item.source_path).toLowerCase(), item]));
  for (const action of retirementActions) {
    const entry = bySource.get(action.path.toLowerCase());
    if (!entry || !['DISTILL_ARCHIVE', 'RETIRE_AFTER_MERGE', 'SUPERSEDED'].includes(entry.disposition) || entry.retirement?.safe_to_retire !== true) conflicts.push({ code: 'RETIREMENT_LEDGER_ENTRY_NOT_ACCEPTED', path: action.path });
  }
  if (conflicts.length) return { ok: false, kind: 'tova.projectWorkflowRetire', phase: 'retire', conflicts, migrationCheck: report, writesPerformed: 0 };
  const core = loadCore(coreRoot);
  const writes = [];
  const archived = [];
  for (const action of retirementActions) {
    const sourcePath = path.join(absoluteRoot, action.path);
    const targetPath = path.join(absoluteRoot, action.target);
    ensureParent(targetPath);
    const hash = sha256File(sourcePath);
    fs.renameSync(sourcePath, targetPath);
    archived.push({ source: action.path, target: action.target, sha256: hash });
    writes.push({ type: 'archived', path: action.path, target: action.target, sha256: hash });
  }
  if (archived.length) {
    const migrationPath = path.join(absoluteRoot, core.manifest.archive_root, 'MIGRATION.md');
    const lines = ['# Project Workflow Migration Retirement Evidence', '', 'The accepted migration ledger authorized these exact-byte container retirements. Project truth was reconciled before retirement.', '', ...archived.map(item => `- \`${item.source}\` -> \`${item.target}\` (sha256: \`${item.sha256}\`)`), ''];
    writeCreateOnly(migrationPath, lines.join('\n'));
    writes.push({ type: 'created-retirement-evidence', path: normalizePath(path.relative(absoluteRoot, migrationPath)) });
  }
  marker.phase = 'retired';
  marker.migration_ledger = normalizePath(migrationLedger);
  marker.retired = archived;
  fs.writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
  writes.push({ type: 'updated-migration-marker', path: markerRelative });
  return { ok: true, kind: 'tova.projectWorkflowRetire', phase: 'retire', migrationCheck: report, archived, writes, writesPerformed: writes.length, nextAction: 'Run migration/workflow/collaboration/Project Health/cold-start acceptance, then finalize with the same ledger.' };
}

function validateAcceptanceEvidence(rootDir, evidencePath, workflowVersion) {
  const conflicts = [];
  if (!evidencePath) return { ok: false, conflicts: [{ code: 'ACCEPTANCE_EVIDENCE_REQUIRED' }] };
  const absoluteEvidence = path.resolve(rootDir, evidencePath);
  if (!isInside(rootDir, absoluteEvidence)) {
    return { ok: false, conflicts: [{ code: 'EXTERNAL_ACCEPTANCE_EVIDENCE_FORBIDDEN', path: normalizePath(absoluteEvidence) }] };
  }
  if (!fs.existsSync(absoluteEvidence)) return { ok: false, conflicts: [{ code: 'ACCEPTANCE_EVIDENCE_MISSING', path: evidencePath }] };
  let value;
  try {
    value = readJson(absoluteEvidence);
  } catch (error) {
    return { ok: false, conflicts: [{ code: 'ACCEPTANCE_EVIDENCE_INVALID_JSON', message: error.message }] };
  }
  if (value.ok !== true) conflicts.push({ code: 'ACCEPTANCE_NOT_PASSED' });
  if (value.workflow_version !== workflowVersion) conflicts.push({ code: 'ACCEPTANCE_VERSION_MISMATCH', expected: workflowVersion, received: value.workflow_version });
  if (!Array.isArray(value.checks) || value.checks.length === 0) conflicts.push({ code: 'ACCEPTANCE_CHECKS_MISSING' });
  if (!value.accepted_at || Number.isNaN(Date.parse(value.accepted_at))) conflicts.push({ code: 'ACCEPTANCE_TIMESTAMP_INVALID' });
  if (value.root && path.resolve(value.root) !== path.resolve(rootDir)) conflicts.push({ code: 'ACCEPTANCE_ROOT_MISMATCH' });
  return {
    ok: conflicts.length === 0,
    conflicts,
    path: normalizePath(path.relative(rootDir, absoluteEvidence)),
    absolutePath: absoluteEvidence,
    sha256: sha256File(absoluteEvidence),
    value
  };
}

function finalizeInstallation({ rootDir, coreRoot = CORE_ROOT, acceptanceEvidence, migrationLedger } = {}) {
  const absoluteRoot = path.resolve(rootDir || '.');
  const plan = buildInstallPlan({ rootDir: absoluteRoot, coreRoot });
  const evidence = validateAcceptanceEvidence(absoluteRoot, acceptanceEvidence, plan.workflowVersion);
  const conflicts = [...(plan.conflicts || []), ...(evidence.conflicts || [])];
  const markerRelative = migrationMarkerRelative(plan);
  const markerPath = path.join(absoluteRoot, markerRelative);
  const migrationRequired = fs.existsSync(markerPath) || Boolean(plan.installation && plan.installation.workflowVersion !== plan.workflowVersion);
  const migrationReport = migrationLedger
    ? buildMigrationCheckReport({ rootDir: absoluteRoot, ledgerPath: migrationLedger, expectedVersion: plan.workflowVersion })
    : null;
  if (migrationRequired && !migrationLedger) conflicts.push({ code: 'MIGRATION_LEDGER_REQUIRED', message: 'A versioned upgrade requires an accepted repository-local migration ledger.' });
  if (migrationReport && !migrationReport.ok) conflicts.push({ code: 'MIGRATION_CHECK_FAILED', findings: migrationReport.findings });
  const unfinished = plan.actions.filter(action => action.type === 'create' || action.type === 'retire-pending');
  if (unfinished.length) conflicts.push({ code: 'APPLY_NOT_COMPLETE', actions: unfinished });

  const workflowCheck = buildWorkflowCheckReport({ rootDir: absoluteRoot });
  if (!workflowCheck.ok) conflicts.push({ code: 'FRESH_WORKFLOW_CHECK_FAILED', findings: workflowCheck.findings });
  if (conflicts.length) {
    return {
      ok: false,
      kind: 'tova.projectWorkflowInstallFinalize',
      phase: 'finalize',
      root: normalizePath(absoluteRoot),
      conflicts,
      workflowCheck,
      writesPerformed: 0
    };
  }

  const core = loadCore(coreRoot);
  const manifestRelative = `${plan.stateRoot}/TOVA_INSTALLATION.json`;
  const manifestPath = path.join(absoluteRoot, manifestRelative);
  const existing = fs.existsSync(manifestPath) ? readJson(manifestPath) : null;
  if (existing && existing.workflow_version === plan.workflowVersion
    && existing.acceptance_evidence?.sha256 === evidence.sha256
    && (!migrationLedger || existing.migration_evidence?.sha256 === sha256File(path.resolve(absoluteRoot, migrationLedger)))) {
    return {
      ok: true,
      kind: 'tova.projectWorkflowInstallFinalize',
      phase: 'finalize',
      root: normalizePath(absoluteRoot),
      manifestPath: manifestRelative,
      manifest: existing,
      workflowCheck,
      writesPerformed: 0,
      idempotent: true
    };
  }

  const manifest = {
    schema_version: 1,
    workflow_id: core.manifest.id,
    workflow_version: core.manifest.version,
    architecture_generation: core.manifest.architecture_generation,
    installed_at: evidence.value.accepted_at,
    installer_version: INSTALLER_VERSION,
    layout: { state_root: plan.stateRoot, docs_root: plan.docsRoot },
    owners: plan.owners,
    enabled_modules: Array.isArray(existing?.enabled_modules) ? existing.enabled_modules : [],
    variant: existing?.variant ?? null,
    acceptance_evidence: {
      path: evidence.path,
      sha256: evidence.sha256,
      accepted_at: evidence.value.accepted_at,
      checks: evidence.value.checks
    }
  };
  if (migrationLedger && migrationReport?.ok) {
    const absoluteLedger = path.resolve(absoluteRoot, migrationLedger);
    manifest.migration_evidence = {
      path: normalizePath(path.relative(absoluteRoot, absoluteLedger)),
      sha256: sha256File(absoluteLedger),
      accepted_at: readJson(absoluteLedger).review.accepted_at,
      check: 'workflow:migration-check'
    };
  }

  const writes = [];
  if (existing) {
    const archiveRelative = normalizePath(path.join(
      core.manifest.archive_root,
      'installation-manifests',
      `TOVA_INSTALLATION.${existing.workflow_version || 'unknown'}.json`
    ));
    const archivePath = path.join(absoluteRoot, archiveRelative);
    if (fs.existsSync(archivePath)) {
      conflicts.push({ code: 'INSTALLATION_ARCHIVE_TARGET_EXISTS', path: archiveRelative });
      return { ok: false, phase: 'finalize', conflicts, workflowCheck, writesPerformed: 0 };
    }
    ensureParent(archivePath);
    fs.renameSync(manifestPath, archivePath);
    writes.push({ type: 'archived-installation-manifest', path: archiveRelative });
  }
  writeCreateOnly(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writes.push({ type: 'created-installation-manifest', path: manifestRelative });
  if (fs.existsSync(markerPath)) {
    fs.rmSync(markerPath);
    writes.push({ type: 'removed-migration-marker', path: markerRelative });
  }

  return {
    ok: true,
    kind: 'tova.projectWorkflowInstallFinalize',
    phase: 'finalize',
    root: normalizePath(absoluteRoot),
    manifestPath: manifestRelative,
    manifest,
    workflowCheck,
    writesPerformed: writes.length,
    writes,
    idempotent: false
  };
}

function parseArgs(argv) {
  const args = { rootDir: null, phase: 'dry-run', planHash: null, acceptanceEvidence: null, migrationLedger: null, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--root') args.rootDir = argv[++index] || null;
    else if (arg === '--phase') args.phase = argv[++index] || 'dry-run';
    else if (arg === '--plan-hash') args.planHash = argv[++index] || null;
    else if (arg === '--acceptance-evidence') args.acceptanceEvidence = argv[++index] || null;
    else if (arg === '--migration-ledger') args.migrationLedger = argv[++index] || null;
  }
  return args;
}

function formatHelp() {
  return [
    'ToVA Project Workflow installer',
    '',
    'Usage:',
    '  npm.cmd run workflow:install -- --root <repository> --phase dry-run',
    '  npm.cmd run workflow:install -- --root <repository> --phase apply --plan-hash <reviewed-hash>',
    '  npm.cmd run workflow:install -- --root <repository> --phase retire --migration-ledger <accepted-in-target-json>',
    '  npm.cmd run workflow:install -- --root <repository> --phase finalize --acceptance-evidence <in-target-json> [--migration-ledger <in-target-json>]',
    '',
    'Phases:',
    '  discover   Read the target and emit the deterministic plan; zero writes.',
    '  dry-run    Same plan as discover; zero writes and the required first step.',
    '  apply      Require the exact reviewed plan hash and bootstrap only missing owners; retirement remains pending.',
    '  retire     Require an accepted ledger and archive only entries whose content/reference accounting is complete.',
    '  finalize   Recheck the target, validate target-local acceptance evidence, and write installation identity.',
    '',
    'Options:',
    '  --root <path>                  Exact target repository root.',
    '  --phase <phase>                discover, dry-run, apply, retire, or finalize.',
    '  --plan-hash <sha256>           Exact planHash from the reviewed dry-run.',
    '  --acceptance-evidence <path>   JSON evidence path inside the target repository.',
    '  --migration-ledger <path>      Accepted JSON ledger inside the target; required for a versioned upgrade.',
    '  --help, -h                     Show this help without inspecting or changing a target.',
    '',
    'Read docs/TOVA_SETUP.md in the starter package for the complete blank, established, legacy, and upgrade workflow.'
  ].join('\n');
}

function runInstaller(options = {}) {
  const phase = options.phase || 'dry-run';
  if (phase === 'discover' || phase === 'dry-run') return { ...buildInstallPlan(options), phase };
  if (phase === 'apply') return applyPlan(options);
  if (phase === 'retire') return retirePlan(options);
  if (phase === 'finalize') return finalizeInstallation(options);
  return {
    ok: false,
    kind: 'tova.projectWorkflowInstallerError',
    phase,
    conflicts: [{ code: 'PHASE_INVALID', allowed: ['discover', 'dry-run', 'apply', 'retire', 'finalize'] }]
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) console.log(formatHelp());
  else {
    const result = runInstaller(args);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  }
}

module.exports = {
  CORE_MANIFEST_PATH,
  CORE_ROOT,
  INSTALLER_VERSION,
  applyPlan,
  buildInstallPlan,
  compareVersions,
  findCaseCollisions,
  finalizeInstallation,
  formatHelp,
  parseArgs,
  retirePlan,
  runInstaller,
  targetFingerprint,
  validateAcceptanceEvidence
};
