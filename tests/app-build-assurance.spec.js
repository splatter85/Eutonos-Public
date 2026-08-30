const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const {
  REQUIRED_REVIEW_LENSES,
  buildAssuranceReport,
  validateContract
} = require('../tools/app-build-assurance');
const { buildWorkflowCheckReport } = require('../tools/project-workflow-check');

const rootDir = path.resolve(__dirname, '..');
const moduleRoot = path.join(rootDir, 'project-workflow', 'modules', 'app-build-assurance');
const operationsContractPath = 'apps/tokenapps/operations-command-center/app.build.json';
const examplePayloadRoot = path.join(moduleRoot, 'payload');
const exampleContractPath = 'docs/app-building/examples/founder-friendly-app.build.json';
const hasOperationsContract = fs.existsSync(path.join(rootDir, operationsContractPath));
const proofRootDir = hasOperationsContract ? rootDir : examplePayloadRoot;
const contractPath = hasOperationsContract ? operationsContractPath : exampleContractPath;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function copyTree(source, target) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyTree(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

test('maintained or portable proof contract passes structural app assurance while retaining explicit prototype work', () => {
  const report = buildAssuranceReport({ rootDir: proofRootDir, contracts: [contractPath] });

  assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
  assert.equal(report.summary.contractsChecked, 1);
  assert.equal(report.summary.errors, 0);
  assert(report.summary.warnings >= 1);
  assert(['operations-command-center', 'founder-friendly-task-board'].includes(report.contracts[0].appId));
  assert.equal(report.contracts[0].stage, 'prototype');
  assert(report.contracts[0].findings.every(item => item.code === 'TEST_WORK_OPEN'));
});

test('release and durable-data claims fail closed when manual data and review evidence remain open', () => {
  const contract = readJson(path.join(proofRootDir, contractPath));
  contract.app.stage = 'release';
  contract.data.persistence = 'local';
  contract.data.migrationRisk = 'high';
  contract.data.backupRecovery = 'Not applicable because the app has not decided how recovery works.';
  contract.quality.testPlan.migration.status = 'not-applicable';
  contract.quality.testPlan.manualQa.status = 'planned';
  contract.review.healthGate = 'Standard';
  contract.review.requiredLenses = REQUIRED_REVIEW_LENSES.filter(item => item !== 'security-privacy');
  contract.review.unresolvedAcceptance = ['Release approval remains open.'];

  const result = validateContract(contract, { rootDir: proofRootDir, contractPath });
  const codes = new Set(result.findings.map(item => item.code));

  assert.equal(result.ok, false);
  assert(codes.has('BACKUP_RECOVERY_REQUIRED'));
  assert(codes.has('MIGRATION_TEST_REQUIRED'));
  assert(codes.has('MANUAL_QA_REQUIRED'));
  assert(codes.has('RELEASE_TEST_WORK_OPEN'));
  assert(codes.has('REVIEW_LENS_MISSING'));
  assert(codes.has('FULL_GATE_REQUIRED'));
  assert(codes.has('RELEASE_ACCEPTANCE_OPEN'));
});

test('app assurance rejects missing and external evidence references', () => {
  const contract = readJson(path.join(proofRootDir, contractPath));
  contract.workflows[0].acceptanceRefs = ['../../outside-acceptance.json', 'apps/missing/acceptance.json'];

  const result = validateContract(contract, { rootDir: proofRootDir, contractPath });
  const codes = new Set(result.findings.map(item => item.code));

  assert.equal(result.ok, false);
  assert(codes.has('REFERENCE_OUTSIDE_ROOT'));
  assert(codes.has('REFERENCE_MISSING'));
});

test('portable app-build module validates from source payload and as a disposable installed module', () => {
  const sourceReport = buildWorkflowCheckReport({
    rootDir,
    moduleManifest: 'project-workflow/modules/app-build-assurance/MODULE.json'
  });
  assert.equal(sourceReport.ok, true, JSON.stringify(sourceReport.findings, null, 2));

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tova-app-assurance-module-'));
  try {
    copyTree(path.join(moduleRoot, 'payload'), fixtureRoot);
    const installedManifest = path.join(fixtureRoot, 'modules', 'app-build-assurance', 'MODULE.json');
    fs.mkdirSync(path.dirname(installedManifest), { recursive: true });
    fs.copyFileSync(path.join(moduleRoot, 'MODULE.json'), installedManifest);

    const installedReport = buildWorkflowCheckReport({
      rootDir: fixtureRoot,
      moduleManifest: 'modules/app-build-assurance/MODULE.json'
    });
    assert.equal(installedReport.ok, true, JSON.stringify(installedReport.findings, null, 2));

    const command = spawnSync(process.execPath, [
      path.join(fixtureRoot, 'tools', 'app-build-assurance.js'),
      '--root',
      fixtureRoot,
      '--contract',
      'docs/app-building/examples/founder-friendly-app.build.json'
    ], { cwd: fixtureRoot, encoding: 'utf8', shell: false });

    assert.equal(command.status, 0, `${command.stdout}\n${command.stderr}`);
    const commandReport = JSON.parse(command.stdout);
    assert.equal(commandReport.ok, true);
    assert.equal(commandReport.summary.contractsChecked, 1);
    assert.equal(commandReport.contracts[0].appId, 'founder-friendly-task-board');
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('portable schema and checker agree on the six required review lenses', () => {
  const schema = readJson(path.join(
    moduleRoot,
    'payload',
    'docs',
    'app-building',
    'APP_BUILD_CONTRACT.schema.json'
  ));
  const schemaLenses = schema.properties.review.properties.requiredLenses.items.enum;
  assert.deepEqual(schemaLenses, [...REQUIRED_REVIEW_LENSES]);
});
