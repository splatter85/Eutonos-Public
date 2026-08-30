const fs = require('node:fs');
const path = require('node:path');

function normalizePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\.\/+/, ''); }
function isInside(rootDir, targetPath) {
  const relative = path.relative(path.resolve(rootDir), path.resolve(targetPath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}
function addFinding(findings, code, message, details = {}) { findings.push({ level: 'error', code, message, ...details }); }
function hasExtensionContract(value) {
  const required = ['purpose', 'owns', 'does_not_own', 'read_when', 'update_when', 'referenced_by', 'extends_complements', 'distinct_role_reason'];
  return value && typeof value === 'object' && required.every(field => {
    const current = value[field];
    return Array.isArray(current) ? current.length > 0 : typeof current === 'string' && current.trim().length > 0;
  });
}
function finish(rootDir, ledgerPath, ledger, findings, artifactCount = 0, liveRoleCount = 0) {
  return {
    ok: findings.length === 0,
    kind: 'tova.projectWorkflowMigrationCheck',
    root: normalizePath(path.resolve(rootDir)),
    ledgerPath: ledgerPath || null,
    targetWorkflowVersion: ledger?.target_workflow_version || null,
    status: ledger?.status || null,
    summary: { errors: findings.length, artifacts: artifactCount, liveRoles: liveRoleCount },
    findings,
    nextAction: findings.length
      ? 'Resolve the smallest listed ledger/reconciliation issue; do not retire or finalize.'
      : 'Run the remaining workflow, collaboration, Project Health, cold-start, and release-specific gates before finalization.'
  };
}
function buildMigrationCheckReport({ rootDir = '.', ledgerPath, expectedVersion = null } = {}) {
  const absoluteRoot = path.resolve(rootDir);
  const findings = [];
  if (!ledgerPath) {
    addFinding(findings, 'MIGRATION_LEDGER_REQUIRED', 'Pass --ledger with a repository-local JSON migration ledger.');
    return finish(absoluteRoot, null, null, findings);
  }
  const absoluteLedger = path.resolve(absoluteRoot, ledgerPath);
  const relativeLedger = normalizePath(path.relative(absoluteRoot, absoluteLedger));
  if (!isInside(absoluteRoot, absoluteLedger)) {
    addFinding(findings, 'EXTERNAL_MIGRATION_LEDGER_FORBIDDEN', 'Migration ledger must be inside the selected project root.', { path: normalizePath(absoluteLedger) });
    return finish(absoluteRoot, relativeLedger, null, findings);
  }
  if (!fs.existsSync(absoluteLedger)) {
    addFinding(findings, 'MIGRATION_LEDGER_MISSING', 'Migration ledger file does not exist.', { path: relativeLedger });
    return finish(absoluteRoot, relativeLedger, null, findings);
  }
  let ledger;
  try { ledger = JSON.parse(fs.readFileSync(absoluteLedger, 'utf8')); }
  catch (error) {
    addFinding(findings, 'MIGRATION_LEDGER_INVALID_JSON', 'Migration ledger is invalid JSON.', { message: error.message });
    return finish(absoluteRoot, relativeLedger, null, findings);
  }
  if (ledger.schema_version !== 1 || ledger.kind !== 'tova.projectWorkflowMigrationLedger') addFinding(findings, 'MIGRATION_LEDGER_IDENTITY_INVALID', 'Migration ledger identity does not match the v1 contract.');
  if (expectedVersion && ledger.target_workflow_version !== expectedVersion) addFinding(findings, 'MIGRATION_LEDGER_VERSION_MISMATCH', 'Migration ledger targets a different workflow version.', { expected: expectedVersion, actual: ledger.target_workflow_version || null });
  if (ledger.status !== 'accepted' || ledger.review?.status !== 'accepted' || !ledger.review?.reviewer || !ledger.review?.decision || !ledger.review?.accepted_at || Number.isNaN(Date.parse(ledger.review.accepted_at))) addFinding(findings, 'MIGRATION_LEDGER_NOT_ACCEPTED', 'Migration ledger and review must be accepted with reviewer, decision, and timestamp.');
  if (!/^[a-f0-9]{64}$/.test(String(ledger.plan_hash || ''))) addFinding(findings, 'MIGRATION_LEDGER_PLAN_HASH_INVALID', 'Migration ledger plan_hash must be a lowercase SHA-256.');
  if (!Array.isArray(ledger.artifacts)) addFinding(findings, 'MIGRATION_LEDGER_ARTIFACTS_INVALID', 'Migration ledger artifacts must be an array.');
  const liveRolePaths = new Map();
  const artifacts = Array.isArray(ledger.artifacts) ? ledger.artifacts : [];
  for (const [index, artifact] of artifacts.entries()) {
    const source = artifact?.source_path || 'artifact[' + index + ']';
    if (!artifact || typeof artifact !== 'object') {
      addFinding(findings, 'MIGRATION_ARTIFACT_INVALID', 'Migration artifact must be an object.', { index });
      continue;
    }
    if (!artifact.source_path || !artifact.source_fingerprint || !artifact.relationship || !artifact.disposition || !artifact.review_status || !artifact.retirement) addFinding(findings, 'MIGRATION_ARTIFACT_FIELDS_MISSING', 'Migration artifact is missing required identity, relationship, disposition, review, or retirement fields.', { source });
    if (artifact.disposition === 'CONFLICT') addFinding(findings, 'MIGRATION_CONFLICT_UNRESOLVED', 'Accepted migration ledger cannot retain a CONFLICT disposition.', { source });
    if (!['accepted', 'deferred'].includes(artifact.review_status)) addFinding(findings, 'MIGRATION_ARTIFACT_NOT_REVIEWED', 'Every artifact in an accepted ledger must be accepted or explicitly deferred.', { source });
    if (artifact.disposition !== 'DEFER' && ((artifact.unresolved_questions || []).length || (artifact.stop_conditions || []).length)) addFinding(findings, 'MIGRATION_ARTIFACT_BLOCKER_UNRESOLVED', 'Accepted non-deferred artifact still contains unresolved questions or stop conditions.', { source });
    if (artifact.disposition === 'RETAIN_EXTENSION' && !hasExtensionContract(artifact.extension_contract)) addFinding(findings, 'MIGRATION_EXTENSION_CONTRACT_INCOMPLETE', 'Retained extension lacks the complete distinct-role contract.', { source });
    const retirement = artifact.retirement || {};
    if (retirement.safe_to_retire === true && (retirement.content_reconciled !== true || retirement.references_updated !== true)) addFinding(findings, 'MIGRATION_RETIREMENT_PRECONDITION_FAILED', 'safe_to_retire requires content_reconciled and references_updated.', { source });
    if (['DISTILL_ARCHIVE', 'RETIRE_AFTER_MERGE', 'SUPERSEDED'].includes(artifact.disposition) && retirement.safe_to_retire !== true) addFinding(findings, 'MIGRATION_RETIREMENT_NOT_SAFE', 'A retirement disposition is not marked safe_to_retire.', { source });
    const remainsLive = !['DISTILL_ARCHIVE', 'RETIRE_AFTER_MERGE', 'SUPERSEDED'].includes(artifact.disposition);
    if (remainsLive && artifact.target_role && artifact.target_path) {
      if (!liveRolePaths.has(artifact.target_role)) liveRolePaths.set(artifact.target_role, new Set());
      liveRolePaths.get(artifact.target_role).add(normalizePath(artifact.target_path).toLowerCase());
    }
  }
  for (const [role, paths] of liveRolePaths.entries()) {
    if (paths.size > 1) addFinding(findings, 'MIGRATION_DUPLICATE_CANONICAL_ROLE', 'Accepted ledger leaves more than one live path for a canonical role.', { role, paths: [...paths] });
  }
  return finish(absoluteRoot, relativeLedger, ledger, findings, artifacts.length, liveRolePaths.size);
}
function parseArgs(argv) {
  const args = { rootDir: '.', ledgerPath: null, expectedVersion: null, markdown: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') args.rootDir = argv[++index] || '.';
    else if (arg === '--ledger') args.ledgerPath = argv[++index] || null;
    else if (arg === '--expected-version') args.expectedVersion = argv[++index] || null;
    else if (arg === '--markdown') args.markdown = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}
function formatMigrationCheckReport(report) {
  const lines = ['# ToVA Migration Check', '', 'Status: ' + (report.ok ? 'passed' : 'failed'), 'Artifacts: ' + (report.summary?.artifacts || 0), 'Errors: ' + (report.summary?.errors || 0), ''];
  for (const finding of report.findings || []) lines.push('- ' + finding.code + ': ' + finding.message);
  return lines.join('\n') + '\n';
}
function formatHelp() {
  return ['ToVA Project Workflow migration checker', '', 'Usage:', '  npm.cmd run workflow:migration-check -- --root <project> --ledger <repository-local-json> [--expected-version <version>]', '', 'The checker is read-only and validates accepted reconciliation, extension, retirement, and duplicate-authority boundaries.'].join('\n');
}
if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) console.log(formatHelp());
  else {
    const report = buildMigrationCheckReport(args);
    console.log(args.markdown ? formatMigrationCheckReport(report) : JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  }
}
module.exports = { buildMigrationCheckReport, formatMigrationCheckReport, parseArgs };
