const fs = require('fs');
const path = require('path');

const WORK_MODES = new Set(['plan_only', 'review_only', 'implement', 'verify', 'operate', 'handoff', 'paused']);
const ACTION_STATUSES = new Set(['planned', 'started', 'in_progress', 'completed', 'failed', 'blocked', 'resumed', 'cancelled']);
const WRITER_CLASSES = new Set(['online_repository_agent', 'local_agent']);
const WRITER_LEASES = new Set(['active', 'handed_off', 'verification_only', 'paused']);
const NOTE_STATUSES = new Set(['open', 'investigating', 'promoted', 'resolved', 'dismissed', 'superseded']);
const SHA_RE = /^[0-9a-f]{40}$/;
const VERIFY_ID_RE = /^- \[[ xX]\] `([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3})`/gm;
const VERIFICATION_ID_RE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{3}$/;
const EXCHANGE_ID_RE = /^XCH-[A-Z0-9][A-Z0-9.-]*-\d{3}$/;
const SAFE_LABEL_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const BRANCH_RE = /^(?![./])(?!.*\.\.)(?!.*[~^:?*\[\\\s])(?!.*(?:^|\/)\.)(?!.*\.lock(?:\/|$))(?!.*\/$).+$/;
const EXCHANGE_LIFECYCLES = new Set(['ready', 'in_progress', 'returned', 'integrated', 'cancelled', 'superseded']);
const TERMINAL_EXCHANGE_LIFECYCLES = new Set(['integrated', 'cancelled', 'superseded']);
const WORKSPACE_MODES = new Set(['serial_shared_branch', 'parallel_isolated_branch']);
const VERIFICATION_RESULT_STATUSES = new Set(['passed', 'failed', 'blocked', 'not_run']);
const AUTHORITY_KEYS = [
  'source_changes', 'test_changes', 'documentation_changes', 'adjacent_defect_fixes',
  'new_slice_work', 'architecture_changes', 'destructive_authority_expansion',
  'external_write_authority_expansion', 'public_exposure_authority_expansion'
];
const FORBIDDEN_NODE_KEYS = new Set([
  'password', 'secret', 'token', 'credential', 'credentials', 'username', 'user_name',
  'hostname', 'host_name', 'ip', 'ip_address', 'repository_path', 'repo_path',
  'absolute_path', 'device_serial', 'private_endpoint'
]);

function normalize(value) {
  return String(value || '').split(path.sep).join('/');
}

function resolveStateRoot(rootDir) {
  for (const candidate of ['.tova', '.project']) {
    if (fs.existsSync(path.join(rootDir, candidate, 'EXECUTION_STATE.json'))) return candidate;
  }
  for (const candidate of ['.tova', '.project']) {
    if (fs.existsSync(path.join(rootDir, candidate))) return candidate;
  }
  return '.project';
}

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function readJson(rootDir, relativePath) {
  return JSON.parse(readText(rootDir, relativePath));
}

function add(findings, level, code, message, details = {}) {
  findings.push({ level, code, message, ...details });
}

function walk(rootDir, relative = '') {
  const absolute = path.join(rootDir, relative);
  if (!fs.existsSync(absolute)) return [];
  const output = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) output.push(...walk(rootDir, child));
    else output.push(normalize(child));
  }
  return output;
}

function validateRequired(rootDir, stateRoot, findings) {
  const required = [
    'AGENTS.md',
    `${stateRoot}/PROJECT_BOOT_PROTOCOL.md`,
    `${stateRoot}/EXECUTION_STATE.json`,
    `${stateRoot}/DEVELOPMENT_NODES.json`,
    `${stateRoot}/ACTIVE_AGENT_WORK.md`,
    'docs/CURRENT_TASK.md',
    'docs/COLLABORATION_PROTOCOL.md',
    'docs/REPOSITORY_INDEX.md',
    'docs/REPOSITORY_INDEX.json',
    'docs/agent-notes/README.md',
    'docs/templates/README.md',
    'docs/templates/CAMPAIGN_CONTEXT_CAPSULE_TEMPLATE.md',
    'docs/templates/SLICE_EXECUTION_PACKET_TEMPLATE.md',
    'docs/templates/AGENT_NOTE_TEMPLATE.md',
    'docs/templates/EXCHANGE_README_TEMPLATE.md',
    'docs/templates/EXCHANGE_TEMPLATE.json',
    'docs/templates/EXECUTION_RECEIPT_TEMPLATE.json'
  ];
  for (const relativePath of required) {
    if (!fs.existsSync(path.join(rootDir, relativePath))) {
      add(findings, 'error', 'COLLABORATION_OWNER_MISSING', `Required collaboration owner is missing: ${relativePath}`, { path: relativePath });
    }
  }
}

function validateSizes(rootDir, stateRoot, findings) {
  const limits = new Map([
    ['AGENTS.md', 16000],
    [`${stateRoot}/EXECUTION_STATE.json`, 4096],
    [`${stateRoot}/CURRENT_STATE.md`, 12000],
    ['docs/CURRENT_TASK.md', 20000]
  ]);
  for (const [relativePath, maximum] of limits) {
    const absolute = path.join(rootDir, relativePath);
    if (fs.existsSync(absolute) && fs.statSync(absolute).size > maximum) {
      add(findings, 'error', 'LIVE_CONTEXT_BUDGET_EXCEEDED', `Live context owner exceeds ${maximum} bytes: ${relativePath}`, { path: relativePath, bytes: fs.statSync(absolute).size, maximum });
    }
  }
}

function isSafeRelativePattern(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const normalized = normalize(value);
  return !path.isAbsolute(value) && !/^[A-Za-z]:\//.test(normalized) && !normalized.split('/').includes('..');
}

function parseActionRegistry(text) {
  const normalized = String(text || '').replace(/\r\n?/g, '\n');
  const heading = /^## Action Registry\s*$/m.exec(normalized);
  if (!heading) return { present: false, actions: [] };
  const tail = normalized.slice(heading.index + heading[0].length);
  const block = /^\s*```json\s*\n([\s\S]*?)\n```/i.exec(tail);
  if (!block) return { present: true, actions: [], error: 'ACTION_REGISTRY_BLOCK_MISSING' };
  let data;
  try { data = JSON.parse(block[1]); }
  catch (error) { return { present: true, actions: [], error: 'ACTION_REGISTRY_INVALID_JSON', detail: error.message }; }
  if (!data || data.schema_version !== 1 || !Array.isArray(data.actions) || data.actions.length > 50) {
    return { present: true, actions: [], error: 'ACTION_REGISTRY_SCHEMA_INVALID' };
  }
  const ids = new Set();
  for (const [index, action] of data.actions.entries()) {
    if (!action || typeof action !== 'object' || Array.isArray(action)
      || typeof action.id !== 'string' || !action.id.trim()
      || !ACTION_STATUSES.has(action.status)
      || typeof action.summary !== 'string' || !action.summary.trim()) {
      return { present: true, actions: data.actions, error: 'ACTION_REGISTRY_ENTRY_INVALID', detail: `actions[${index}]` };
    }
    if (ids.has(action.id)) return { present: true, actions: data.actions, error: 'ACTION_REGISTRY_ID_DUPLICATE', detail: action.id };
    ids.add(action.id);
  }
  return { present: true, actions: data.actions };
}

function validateExecutionState(rootDir, stateRoot, findings) {
  const relativePath = `${stateRoot}/EXECUTION_STATE.json`;
  let state;
  try {
    state = readJson(rootDir, relativePath);
  } catch (error) {
    add(findings, 'error', 'EXECUTION_STATE_INVALID_JSON', `Execution State is not valid JSON: ${error.message}`, { path: relativePath });
    return {};
  }
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    add(findings, 'error', 'EXECUTION_STATE_INVALID', 'Execution State must be a JSON object.', { path: relativePath });
    return {};
  }
  if (state.schema_version !== 1) add(findings, 'error', 'EXECUTION_STATE_SCHEMA_INVALID', 'Execution State schema_version must be 1.');
  if (!WORK_MODES.has(state.work_mode)) add(findings, 'error', 'EXECUTION_STATE_MODE_INVALID', `Invalid work_mode: ${JSON.stringify(state.work_mode)}`);
  for (const volatileKey of ['head_sha', 'current_action']) {
    if (Object.hasOwn(state, volatileKey)) add(findings, 'error', 'EXECUTION_STATE_VOLATILE_FIELD', `Tracked Execution State must not contain volatile ${volatileKey}; use PR/local checkpoints.`);
  }
  for (const field of ['assignment_base_sha', 'source_baseline_sha']) {
    if (state[field] !== null && state[field] !== undefined && !SHA_RE.test(state[field])) {
      add(findings, 'error', 'EXECUTION_STATE_BASELINE_SHA_INVALID', `${field} must be null or a 40-character lowercase Git SHA.`);
    }
  }
  if (state.assignment_base_sha && state.source_baseline_sha && state.assignment_base_sha !== state.source_baseline_sha) {
    add(findings, 'error', 'EXECUTION_STATE_BASELINE_SHA_CONFLICT', 'assignment_base_sha and compatibility source_baseline_sha must match when both are present.');
  }

  const active = state.work_mode !== 'paused' || Boolean(state.slice);
  if (active) {
    if (typeof state.slice !== 'string' || !state.slice.trim()) add(findings, 'error', 'EXECUTION_STATE_SLICE_REQUIRED', 'Active Execution State requires a non-empty slice.');
    if (typeof state.active_slice_document !== 'string' || !state.active_slice_document.trim()) {
      add(findings, 'error', 'EXECUTION_STATE_SLICE_DOCUMENT_REQUIRED', 'Active Execution State requires active_slice_document.');
    } else if (!fs.existsSync(path.join(rootDir, state.active_slice_document))) {
      add(findings, 'error', 'EXECUTION_STATE_SLICE_DOCUMENT_MISSING', `Active Slice document does not exist: ${state.active_slice_document}`);
    }
  }

  const writer = state.writer;
  if (!writer || typeof writer !== 'object' || Array.isArray(writer)) {
    add(findings, 'error', 'EXECUTION_STATE_WRITER_INVALID', 'Execution State writer must be an object.');
  } else {
    if (active && !WRITER_CLASSES.has(writer.class)) add(findings, 'error', 'EXECUTION_STATE_WRITER_CLASS_INVALID', `Invalid active writer class: ${JSON.stringify(writer.class)}`);
    if (!active && writer.class !== null && !WRITER_CLASSES.has(writer.class)) add(findings, 'error', 'EXECUTION_STATE_WRITER_CLASS_INVALID', `Invalid writer class: ${JSON.stringify(writer.class)}`);
    if (!WRITER_LEASES.has(writer.lease)) add(findings, 'error', 'EXECUTION_STATE_WRITER_LEASE_INVALID', `Invalid writer lease: ${JSON.stringify(writer.lease)}`);
    if (active && (typeof writer.integration_branch !== 'string' || !writer.integration_branch.trim())) add(findings, 'error', 'EXECUTION_STATE_BRANCH_REQUIRED', 'Active writer requires integration_branch.');
  }

  if (!Array.isArray(state.owned_paths) || !state.owned_paths.every(isSafeRelativePattern)) {
    add(findings, 'error', 'EXECUTION_STATE_OWNED_PATHS_INVALID', 'owned_paths must be repository-relative patterns without traversal.');
  }
  if (!Array.isArray(state.relevant_notes)) add(findings, 'error', 'EXECUTION_STATE_RELEVANT_NOTES_INVALID', 'relevant_notes must be a list.');
  else {
    const notes = new Set(walk(rootDir, 'docs/agent-notes').filter(item => /\/NOTE-[^/]+\.md$/.test(`/${item}`)).map(item => path.basename(item, '.md')));
    for (const noteId of state.relevant_notes) {
      if (typeof noteId !== 'string' || !notes.has(noteId)) add(findings, 'error', 'EXECUTION_STATE_NOTE_MISSING', `Execution State references missing Agent Note: ${JSON.stringify(noteId)}`);
    }
  }
  if (state.active_exchange !== null && state.active_exchange !== undefined) {
    if (!isSafeRelativePattern(state.active_exchange) || !fs.existsSync(path.join(rootDir, state.active_exchange))) add(findings, 'error', 'EXECUTION_STATE_EXCHANGE_MISSING', `active_exchange is missing or invalid: ${JSON.stringify(state.active_exchange)}`);
  }
  const checkpoint = state.last_durable_checkpoint;
  if (active && checkpoint && typeof checkpoint === 'object' && checkpoint.action_id && typeof state.active_slice_document === 'string' && fs.existsSync(path.join(rootDir, state.active_slice_document))) {
    const sliceText = readText(rootDir, state.active_slice_document);
    const registry = parseActionRegistry(sliceText);
    if (registry.error) add(findings, 'error', registry.error, `${state.active_slice_document} has an invalid Action Registry${registry.detail ? `: ${registry.detail}` : '.'}`);
    else if (registry.present && !registry.actions.some(action => action.id === checkpoint.action_id)) add(findings, 'error', 'EXECUTION_STATE_ACTION_UNDECLARED', `Durable Action ${checkpoint.action_id} is not declared by the Action Registry in ${state.active_slice_document}.`);
    else if (!registry.present && !sliceText.includes(checkpoint.action_id)) add(findings, 'error', 'EXECUTION_STATE_ACTION_UNDECLARED', `Durable Action ${checkpoint.action_id} is not declared by legacy text in ${state.active_slice_document}.`);
  }
  return state;
}

function flatten(value, prefix = '') {
  const output = [];
  if (Array.isArray(value)) value.forEach((child, index) => output.push(...flatten(child, `${prefix}[${index}]`)));
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const childPath = prefix ? `${prefix}.${key}` : key;
      output.push([childPath, key, child]);
      output.push(...flatten(child, childPath));
    }
  }
  return output;
}

function validateDevelopmentNodes(rootDir, stateRoot, findings) {
  const relativePath = `${stateRoot}/DEVELOPMENT_NODES.json`;
  let data;
  try { data = readJson(rootDir, relativePath); }
  catch (error) { add(findings, 'error', 'DEVELOPMENT_NODES_INVALID_JSON', `Development Nodes is not valid JSON: ${error.message}`); return; }
  if (!data || data.schema_version !== 1 || !Array.isArray(data.nodes)) {
    add(findings, 'error', 'DEVELOPMENT_NODES_SCHEMA_INVALID', 'Development Nodes must be a schema_version 1 object with a nodes list.');
    return;
  }
  const ids = new Set();
  for (const [index, node] of data.nodes.entries()) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) { add(findings, 'error', 'DEVELOPMENT_NODE_INVALID', `Development node ${index} must be an object.`); continue; }
    if (typeof node.id !== 'string' || !node.id.trim()) add(findings, 'error', 'DEVELOPMENT_NODE_ID_INVALID', `Development node ${index} has invalid id.`);
    else if (ids.has(node.id)) add(findings, 'error', 'DEVELOPMENT_NODE_ID_DUPLICATE', `Duplicate development node id: ${node.id}`);
    else ids.add(node.id);
    if (!Array.isArray(node.capabilities) || !node.capabilities.every(item => typeof item === 'string' && item.trim())) add(findings, 'error', 'DEVELOPMENT_NODE_CAPABILITIES_INVALID', `Development node ${JSON.stringify(node.id)} has invalid capabilities.`);
    else if (new Set(node.capabilities).size !== node.capabilities.length) add(findings, 'error', 'DEVELOPMENT_NODE_CAPABILITIES_DUPLICATE', `Development node ${JSON.stringify(node.id)} has duplicate capabilities.`);
  }
  for (const [keyPath, key, value] of flatten(data)) {
    if (FORBIDDEN_NODE_KEYS.has(String(key).toLowerCase())) add(findings, 'error', 'DEVELOPMENT_NODE_SENSITIVE_KEY', `Development Nodes contains forbidden key: ${keyPath}`);
    if (typeof value === 'string' && (/@/.test(value) || /^[A-Za-z]:[\\/]/.test(value) || /^\/(Users|home)\//.test(value))) add(findings, 'error', 'DEVELOPMENT_NODE_SENSITIVE_VALUE', `Development Nodes contains unsafe value at ${keyPath}`);
  }
}

function validateRepositoryIndex(rootDir, findings) {
  const relativePath = 'docs/REPOSITORY_INDEX.json';
  let data;
  try { data = readJson(rootDir, relativePath); }
  catch (error) { add(findings, 'error', 'REPOSITORY_INDEX_INVALID_JSON', `${relativePath}: ${error.message}`); return; }
  if (!data || data.schema_version !== 1 || data.kind !== 'tova.repositoryNavigationIndex'
    || data.authority !== 'navigation_only' || !Array.isArray(data.review_triggers)
    || !data.review_triggers.every(isNonEmptyString) || !Array.isArray(data.routes)
    || data.routes.length === 0 || data.routes.length > 30) {
    add(findings, 'error', 'REPOSITORY_INDEX_SCHEMA_INVALID', `${relativePath} must be a bounded schema-version 1 navigation-only route index.`);
    return;
  }
  const ids = new Set();
  const pathFields = ['primary_owners', 'inspect_first', 'likely_change_surfaces', 'verification_surfaces', 'conditional_references'];
  for (const [index, route] of data.routes.entries()) {
    if (!route || typeof route !== 'object' || Array.isArray(route)
      || !/^route:\/\/[a-z0-9][a-z0-9./-]*$/.test(route.id || '') || !isNonEmptyString(route.purpose)) {
      add(findings, 'error', 'REPOSITORY_ROUTE_INVALID', `${relativePath} routes[${index}] needs a stable route:// id and purpose.`);
      continue;
    }
    if (ids.has(route.id)) add(findings, 'error', 'REPOSITORY_ROUTE_ID_DUPLICATE', `${relativePath} repeats route ${route.id}.`);
    ids.add(route.id);
    for (const field of pathFields) {
      if (!Array.isArray(route[field]) || (field === 'primary_owners' && route[field].length === 0)) {
        add(findings, 'error', 'REPOSITORY_ROUTE_PATHS_INVALID', `${route.id} ${field} must be a list${field === 'primary_owners' ? ' with at least one path' : ''}.`);
        continue;
      }
      for (const item of route[field]) {
        if (!isSafeRelativePattern(item)) add(findings, 'error', 'REPOSITORY_ROUTE_PATH_UNSAFE', `${route.id} has unsafe ${field} path ${JSON.stringify(item)}.`);
        else if (!fs.existsSync(path.join(rootDir, item))) add(findings, 'error', 'REPOSITORY_ROUTE_PATH_MISSING', `${route.id} references missing ${field} path ${item}.`);
      }
    }
  }
}

function parseFrontMatter(text) {
  const normalized = String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) return { metadata: {}, error: 'AGENT_NOTE_FRONT_MATTER_MISSING' };
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) return { metadata: {}, error: 'AGENT_NOTE_FRONT_MATTER_UNTERMINATED' };
  const metadata = {};
  for (const line of normalized.slice(4, end).split('\n')) {
    const colon = line.indexOf(':');
    if (colon >= 0) metadata[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { metadata, body: normalized.slice(end + 5) };
}

function validateNotes(rootDir, findings) {
  const statuses = new Map();
  for (const relativePath of walk(rootDir, 'docs/agent-notes').filter(item => /\/NOTE-[^/]+\.md$/.test(`/${item}`))) {
    const parsed = parseFrontMatter(readText(rootDir, relativePath));
    if (parsed.error) { add(findings, 'error', parsed.error, `${relativePath} has invalid YAML front matter.`); continue; }
    const noteId = parsed.metadata.id;
    const expected = path.basename(relativePath, '.md');
    if (!noteId) { add(findings, 'error', 'AGENT_NOTE_ID_MISSING', `${relativePath} front matter must contain id: ${expected}`); continue; }
    if (noteId !== expected) { add(findings, 'error', 'AGENT_NOTE_ID_FILENAME_MISMATCH', `${relativePath} has id ${JSON.stringify(noteId)}; expected ${JSON.stringify(expected)}.`); continue; }
    if (!NOTE_STATUSES.has(parsed.metadata.status)) add(findings, 'error', 'AGENT_NOTE_STATUS_INVALID', `${noteId} has invalid status ${JSON.stringify(parsed.metadata.status)}.`);
    statuses.set(noteId, parsed.metadata.status);
    if (String(parsed.body || '').trim().split(/\s+/).filter(Boolean).length > 600) add(findings, 'error', 'AGENT_NOTE_BODY_TOO_LONG', `${noteId} exceeds the 600-word hard maximum.`);
  }
  for (const relativePath of walk(rootDir, 'docs/agent-notes').filter(item => item.endsWith('/INDEX.json'))) {
    let index;
    try { index = readJson(rootDir, relativePath); }
    catch (error) { add(findings, 'error', 'AGENT_NOTE_INDEX_INVALID_JSON', `${relativePath}: ${error.message}`); continue; }
    if (!index || !Array.isArray(index.open)) { add(findings, 'error', 'AGENT_NOTE_INDEX_OPEN_NOT_LIST', `${relativePath} field open must be a list.`); continue; }
    if (index.open.length > 5) add(findings, 'warning', 'AGENT_NOTE_INDEX_LARGE', `${relativePath} has more than five open Notes.`);
    for (const [itemIndex, item] of index.open.entries()) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string') { add(findings, 'error', 'AGENT_NOTE_INDEX_ENTRY_INVALID', `${relativePath} open[${itemIndex}] must be an object with string id.`); continue; }
      if (!statuses.has(item.id)) add(findings, 'error', 'AGENT_NOTE_INDEX_NOTE_MISSING', `${relativePath} references missing Note ${item.id}.`);
      else if (!['open', 'investigating'].includes(statuses.get(item.id))) add(findings, 'error', 'AGENT_NOTE_INDEX_STATUS_MISMATCH', `${relativePath} lists ${item.id} but its status is ${statuses.get(item.id)}.`);
    }
  }
}

function verificationIds(rootDir, findings) {
  const relativePath = 'docs/CURRENT_TASK.md';
  if (!fs.existsSync(path.join(rootDir, relativePath))) return new Set();
  const ids = [...readText(rootDir, relativePath).matchAll(VERIFY_ID_RE)].map(match => match[1]);
  for (const id of new Set(ids)) if (ids.filter(item => item === id).length > 1) add(findings, 'error', 'VERIFICATION_ID_DUPLICATE', `Duplicate local/external verification ID: ${id}`);
  return new Set(ids);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

function containsDemoValue(value) {
  if (typeof value === 'string') return value.startsWith('EXAMPLE-') || value === '0'.repeat(40);
  if (Array.isArray(value)) return value.some(containsDemoValue);
  if (value && typeof value === 'object') return Object.values(value).some(containsDemoValue);
  return false;
}

function ownerDeclaresId(rootDir, ownerPath, id) {
  if (!rootDir || !isSafeRelativePattern(ownerPath) || !fs.existsSync(path.join(rootDir, ownerPath))) return false;
  const escaped = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Z0-9.-])${escaped}([^A-Z0-9.-]|$)`, 'm').test(readText(rootDir, ownerPath));
}

function repositoryRouteIds(rootDir) {
  if (!rootDir || !fs.existsSync(path.join(rootDir, 'docs/REPOSITORY_INDEX.json'))) return new Set();
  try { return new Set((readJson(rootDir, 'docs/REPOSITORY_INDEX.json').routes || []).map(route => route.id)); }
  catch { return new Set(); }
}

function validateContextPacket(packet, lifecycle, label, findings, template, rootDir) {
  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) { add(findings, 'error', 'EXCHANGE_CONTEXT_PACKET_INVALID', `${label} context_packet must be an object.`); return; }
  const profiles = new Set(['auto', 'compact', 'expanded']);
  const selected = new Set(['compact', 'expanded']);
  if (!profiles.has(packet.profile_requested)) add(findings, 'error', 'EXCHANGE_CONTEXT_PROFILE_INVALID', `${label} profile_requested must be auto, compact, or expanded.`);
  if (packet.profile_selected !== null && packet.profile_selected !== undefined && !selected.has(packet.profile_selected)) add(findings, 'error', 'EXCHANGE_CONTEXT_PROFILE_INVALID', `${label} profile_selected must be null, compact, or expanded.`);
  if (selected.has(packet.profile_selected) && !isNonEmptyString(packet.selection_reason)) add(findings, 'error', 'EXCHANGE_CONTEXT_SELECTION_REASON_REQUIRED', `${label} selected profile requires selection_reason.`);
  if (packet.profile_requested !== 'auto' && selected.has(packet.profile_selected) && packet.profile_selected !== packet.profile_requested) add(findings, 'error', 'EXCHANGE_CONTEXT_PROFILE_MISMATCH', `${label} selected profile must honor the explicit requested profile.`);
  if (!template && lifecycle !== 'ready' && !selected.has(packet.profile_selected)) add(findings, 'error', 'EXCHANGE_CONTEXT_PROFILE_UNSELECTED', `${label} must record compact or expanded selection before leaving ready.`);
  for (const field of ['campaign_capsule_path', 'slice_packet_path']) {
    const value = packet[field];
    if (value !== null && value !== undefined) {
      if (!isSafeRelativePattern(value)) add(findings, 'error', 'EXCHANGE_CONTEXT_PATH_UNSAFE', `${label} ${field} must be null or a safe repository-relative path.`);
      else if (!template && rootDir && ['ready', 'in_progress'].includes(lifecycle) && !fs.existsSync(path.join(rootDir, value))) add(findings, 'error', 'EXCHANGE_CONTEXT_PATH_MISSING', `${label} cannot resolve ${field} ${value}.`);
    }
  }
  if (!Array.isArray(packet.route_ids) || packet.route_ids.length === 0 || !packet.route_ids.every(id => /^route:\/\/[a-z0-9][a-z0-9./-]*$/.test(id))) add(findings, 'error', 'EXCHANGE_CONTEXT_ROUTES_INVALID', `${label} route_ids must be a non-empty list of stable route IDs.`);
  else if (!template && rootDir && ['ready', 'in_progress'].includes(lifecycle)) {
    const known = repositoryRouteIds(rootDir);
    for (const id of packet.route_ids) if (!known.has(id)) add(findings, 'error', 'EXCHANGE_CONTEXT_ROUTE_UNKNOWN', `${label} cannot resolve context route ${id}.`);
  }
}

function validateAuthorityEnvelope(envelope, label, findings) {
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) { add(findings, 'error', 'EXCHANGE_AUTHORITY_INVALID', `${label} authority_envelope must be an object.`); return; }
  if (!isNonEmptyString(envelope.mission)) add(findings, 'error', 'EXCHANGE_MISSION_INVALID', `${label} mission must be non-empty.`);
  for (const field of ['non_goals', 'stop_conditions']) if (!Array.isArray(envelope[field]) || !envelope[field].every(isNonEmptyString)) add(findings, 'error', 'EXCHANGE_AUTHORITY_LIST_INVALID', `${label} ${field} must be a list of non-empty strings.`);
  const permissions = envelope.permissions;
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) add(findings, 'error', 'EXCHANGE_PERMISSIONS_INVALID', `${label} permissions must be an object.`);
  else {
    for (const key of AUTHORITY_KEYS) if (typeof permissions[key] !== 'boolean') add(findings, 'error', 'EXCHANGE_PERMISSION_MISSING', `${label} permission ${key} must be boolean.`);
    const highRiskEnabled = ['new_slice_work', 'architecture_changes', 'destructive_authority_expansion', 'external_write_authority_expansion', 'public_exposure_authority_expansion'].filter(key => permissions[key] === true);
    const authorization = envelope.human_authorization;
    if (highRiskEnabled.length && (!authorization || typeof authorization !== 'object' || Array.isArray(authorization)
      || !isNonEmptyString(authorization.source) || !isNonEmptyString(authorization.summary))) {
      add(findings, 'error', 'EXCHANGE_HIGH_RISK_AUTHORITY_UNAUTHORIZED', `${label} enables ${highRiskEnabled.join(', ')} without an explicit human_authorization source and summary.`);
    }
    if (!highRiskEnabled.length && authorization !== null && authorization !== undefined
      && (!authorization || typeof authorization !== 'object' || Array.isArray(authorization)
        || !isNonEmptyString(authorization.source) || !isNonEmptyString(authorization.summary))) {
      add(findings, 'error', 'EXCHANGE_HUMAN_AUTHORIZATION_INVALID', `${label} human_authorization must be null or an object with source and summary.`);
    }
  }
  if (envelope.path_guidance !== undefined) {
    const guidance = envelope.path_guidance;
    if (!guidance || typeof guidance !== 'object' || Array.isArray(guidance)) add(findings, 'error', 'EXCHANGE_PATH_GUIDANCE_INVALID', `${label} path_guidance must be an object.`);
    else for (const field of ['likely_tracked_changes', 'forbidden_content']) if (!Array.isArray(guidance[field]) || !guidance[field].every(isSafeRelativePattern)) add(findings, 'error', 'EXCHANGE_PATH_GUIDANCE_INVALID', `${label} ${field} must contain safe repository-relative patterns.`);
  }
}

function validateExchangeV1(data, label, knownIds, findings, template) {
  if (!template) {
    if (!SHA_RE.test(data.request.required_head_sha || '')) add(findings, 'error', 'EXCHANGE_REQUIRED_SHA_INVALID', `${label} required_head_sha must be an exact 40-character lowercase Git SHA.`);
    if (!Array.isArray(data.request.required_checks)) add(findings, 'error', 'EXCHANGE_REQUIRED_CHECKS_INVALID', `${label} required_checks must be a list.`);
    else for (const id of data.request.required_checks) if (!knownIds.has(id)) add(findings, 'error', 'EXCHANGE_VERIFICATION_ID_UNKNOWN', `${label} references unknown verification ID: ${JSON.stringify(id)}`);
  }
  if (template || data.response === null) return;
  if (!data.response || typeof data.response !== 'object') { add(findings, 'error', 'EXCHANGE_RESPONSE_INVALID', `${label} response must be an object or null.`); return; }
  if (!SHA_RE.test(data.response.tested_sha || '')) add(findings, 'error', 'EXCHANGE_TESTED_SHA_INVALID', `${label} tested_sha must be an exact Git SHA.`);
  if (!SHA_RE.test(data.response.returned_head_sha || '')) add(findings, 'error', 'EXCHANGE_RETURNED_SHA_INVALID', `${label} returned_head_sha must be an exact Git SHA.`);
  if (data.response.tested_sha && data.response.returned_head_sha && data.response.tested_sha !== data.response.returned_head_sha) add(findings, 'error', 'EXCHANGE_SOURCE_CHANGED_AFTER_TEST', `${label} tested_sha must equal returned_head_sha; metadata response commits occur afterward.`);
}

function validateExchangeV2(data, label, findings, template, rootDir) {
  if (!EXCHANGE_ID_RE.test(data.exchange_id || '')) add(findings, 'error', 'EXCHANGE_ID_INVALID', `${label} exchange_id must match XCH-<WORK-UNIT>-<NNN>.`);
  if (!isSafeRelativePattern(data.template_reference) || (!template && rootDir && !fs.existsSync(path.join(rootDir, data.template_reference)))) add(findings, 'error', 'EXCHANGE_TEMPLATE_REFERENCE_INVALID', `${label} template_reference must resolve to a safe repository-relative template.`);
  if (!EXCHANGE_LIFECYCLES.has(data.lifecycle)) add(findings, 'error', 'EXCHANGE_LIFECYCLE_INVALID', `${label} has invalid lifecycle ${JSON.stringify(data.lifecycle)}.`);
  if (!template && label.endsWith('/EXCHANGE.json')) {
    const expected = path.basename(path.dirname(label));
    if (data.exchange_id !== expected) add(findings, 'error', 'EXCHANGE_ID_FOLDER_MISMATCH', `${label} exchange_id must match folder ${expected}.`);
  }
  if (!template && containsDemoValue(data)) add(findings, 'error', 'EXCHANGE_DEMO_VALUE_LIVE', `${label} contains EXAMPLE- or all-zero template-only values.`);
  if (data.previous_exchange_id !== null && data.previous_exchange_id !== undefined && !EXCHANGE_ID_RE.test(data.previous_exchange_id)) add(findings, 'error', 'EXCHANGE_PREVIOUS_ID_INVALID', `${label} previous_exchange_id must be null or a valid Exchange ID.`);
  if (!Array.isArray(data.amendments)) add(findings, 'error', 'EXCHANGE_AMENDMENTS_INVALID', `${label} amendments must be a list.`);
  else for (const [index, amendment] of data.amendments.entries()) {
    if (!amendment || typeof amendment !== 'object' || Array.isArray(amendment)
      || !SAFE_LABEL_RE.test(amendment.source || '') || !isNonEmptyString(amendment.summary)
      || !amendment.scope_effect || typeof amendment.scope_effect !== 'object' || Array.isArray(amendment.scope_effect)
      || Object.keys(amendment.scope_effect).length === 0
      || Object.entries(amendment.scope_effect).some(([key, value]) => !AUTHORITY_KEYS.includes(key) || typeof value !== 'boolean')) {
      add(findings, 'error', 'EXCHANGE_AMENDMENT_INVALID', `${label} amendments[${index}] must have safe source/summary and boolean authority scope_effect entries.`);
    }
  }

  const request = data.request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) { add(findings, 'error', 'EXCHANGE_REQUEST_INVALID', `${label} request must be an object.`); return; }
  if (!isNonEmptyString(request.work_unit_id) || !WORK_MODES.has(request.work_mode) || request.work_mode === 'paused') add(findings, 'error', 'EXCHANGE_WORK_UNIT_INVALID', `${label} request requires work_unit_id and an executable work_mode.`);
  if (!template && !SHA_RE.test(request.source_revision || '')) add(findings, 'error', 'EXCHANGE_SOURCE_REVISION_INVALID', `${label} source_revision must be an exact Git SHA.`);
  const target = request.target;
  if (!target || typeof target !== 'object' || !WRITER_CLASSES.has(target.agent_class)
    || !Array.isArray(target.required_capabilities) || !target.required_capabilities.every(item => SAFE_LABEL_RE.test(item))
    || (target.assigned_owner !== null && target.assigned_owner !== undefined && !SAFE_LABEL_RE.test(target.assigned_owner))
    || (target.preferred_node_id !== null && target.preferred_node_id !== undefined && !SAFE_LABEL_RE.test(target.preferred_node_id))) {
    add(findings, 'error', 'EXCHANGE_TARGET_INVALID', `${label} target metadata is invalid.`);
  }
  const workspace = request.workspace_strategy;
  if (!workspace || typeof workspace !== 'object' || !WORKSPACE_MODES.has(workspace.mode)
    || !isNonEmptyString(workspace.integration_branch) || !isNonEmptyString(workspace.work_branch)
    || !BRANCH_RE.test(workspace.integration_branch) || !BRANCH_RE.test(workspace.work_branch)) {
    add(findings, 'error', 'EXCHANGE_WORKSPACE_INVALID', `${label} workspace_strategy must declare safe integration and work branches.`);
  } else if (workspace.mode === 'serial_shared_branch' && workspace.work_branch !== workspace.integration_branch) {
    add(findings, 'error', 'EXCHANGE_SERIAL_BRANCH_MISMATCH', `${label} serial_shared_branch requires the same work and integration branch.`);
  } else if (workspace.mode === 'parallel_isolated_branch' && workspace.work_branch === workspace.integration_branch) {
    add(findings, 'error', 'EXCHANGE_PARALLEL_BRANCH_NOT_ISOLATED', `${label} parallel_isolated_branch requires a distinct work branch.`);
  }
  validateContextPacket(request.context_packet, data.lifecycle, label, findings, template, rootDir);
  validateAuthorityEnvelope(request.authority_envelope, label, findings);
  if (!Array.isArray(request.procedure_owners) || !request.procedure_owners.every(isSafeRelativePattern)) add(findings, 'error', 'EXCHANGE_PROCEDURE_OWNERS_INVALID', `${label} procedure_owners must be safe repository-relative paths.`);

  const required = request.required_verification;
  const requiredIds = new Set();
  if (!Array.isArray(required)) add(findings, 'error', 'EXCHANGE_REQUIRED_VERIFICATION_INVALID', `${label} required_verification must be a list.`);
  else for (const [index, entry] of required.entries()) {
    if (!entry || typeof entry !== 'object' || !VERIFICATION_ID_RE.test(entry.id || '') || !isSafeRelativePattern(entry.owner_path)) add(findings, 'error', 'EXCHANGE_REQUIRED_VERIFICATION_INVALID', `${label} required_verification[${index}] is invalid.`);
    else if (requiredIds.has(entry.id)) add(findings, 'error', 'EXCHANGE_VERIFICATION_ID_DUPLICATE', `${label} repeats verification ID ${entry.id}.`);
    else {
      requiredIds.add(entry.id);
      if (!template && ['ready', 'in_progress'].includes(data.lifecycle) && !ownerDeclaresId(rootDir, entry.owner_path, entry.id)) add(findings, 'error', 'EXCHANGE_VERIFICATION_ID_UNKNOWN', `${label} cannot resolve ${entry.id} from ${entry.owner_path}.`);
    }
  }

  const responseRequired = ['returned', 'integrated'].includes(data.lifecycle);
  if (responseRequired && (!data.response || typeof data.response !== 'object' || Array.isArray(data.response))) add(findings, 'error', 'EXCHANGE_RESPONSE_REQUIRED', `${label} lifecycle ${data.lifecycle} requires response evidence.`);
  if (['ready', 'in_progress'].includes(data.lifecycle) && data.response !== null) add(findings, 'error', 'EXCHANGE_RESPONSE_EARLY', `${label} response must remain null while lifecycle is ${data.lifecycle}.`);
  if (data.response !== null && data.response !== undefined && typeof data.response === 'object' && !Array.isArray(data.response)) {
    if (!template && !SHA_RE.test(data.response.tested_source_revision || '')) add(findings, 'error', 'EXCHANGE_TESTED_SHA_INVALID', `${label} tested_source_revision must be an exact Git SHA.`);
    if (!Array.isArray(data.response.source_commits_added) || (!template && data.response.source_commits_added.some(sha => !SHA_RE.test(sha)))) add(findings, 'error', 'EXCHANGE_SOURCE_COMMITS_INVALID', `${label} source_commits_added must contain exact Git SHAs.`);
    else if (!template && data.response.source_commits_added.length && data.response.source_commits_added.at(-1) !== data.response.tested_source_revision) add(findings, 'error', 'EXCHANGE_SOURCE_CHANGED_AFTER_TEST', `${label} last source commit added must equal tested_source_revision; metadata response commits occur afterward.`);
    const results = data.response.verification_results;
    const resultIds = new Set();
    if (!Array.isArray(results)) add(findings, 'error', 'EXCHANGE_VERIFICATION_RESULTS_INVALID', `${label} verification_results must be a list.`);
    else for (const [index, result] of results.entries()) {
      if (!result || typeof result !== 'object' || !isNonEmptyString(result.id) || !VERIFICATION_RESULT_STATUSES.has(result.status)) add(findings, 'error', 'EXCHANGE_VERIFICATION_RESULT_INVALID', `${label} verification_results[${index}] is invalid.`);
      else if (resultIds.has(result.id)) add(findings, 'error', 'EXCHANGE_VERIFICATION_RESULT_DUPLICATE', `${label} repeats result ${result.id}.`);
      else { resultIds.add(result.id); if (!requiredIds.has(result.id)) add(findings, 'error', 'EXCHANGE_VERIFICATION_RESULT_UNKNOWN', `${label} reports unrequested verification ${result.id}.`); }
    }
    if (responseRequired) for (const id of requiredIds) if (!resultIds.has(id)) add(findings, 'error', 'EXCHANGE_VERIFICATION_RESULT_MISSING', `${label} omits verification result ${id}.`);
    if (!isNonEmptyString(data.response.scope_outcome) || !Array.isArray(data.response.material_additional_work) || !data.response.material_additional_work.every(isNonEmptyString)
      || !Array.isArray(data.response.notes_created) || !data.response.notes_created.every(item => /^NOTE-[A-Z0-9][A-Z0-9.-]*-\d{3}$/.test(item))
      || !data.response.sensitive_data || typeof data.response.sensitive_data !== 'object'
      || typeof data.response.sensitive_data.included !== 'boolean' || !isNonEmptyString(data.response.sensitive_data.declaration)) {
      add(findings, 'error', 'EXCHANGE_RESPONSE_FIELDS_INVALID', `${label} response scope, notes, additional work, or sensitive-data declaration is invalid.`);
    }
    if (data.response.sensitive_data?.included === true) add(findings, 'error', 'EXCHANGE_SENSITIVE_DATA_INCLUDED', `${label} must not include sensitive or local-only material.`);
  }
  if (data.lifecycle === 'integrated') {
    if (!data.integration_review || typeof data.integration_review !== 'object' || Array.isArray(data.integration_review)) add(findings, 'error', 'EXCHANGE_INTEGRATION_REVIEW_REQUIRED', `${label} integrated lifecycle requires integration_review.`);
    else {
      if (!template && !SHA_RE.test(data.integration_review.integrated_revision || '')) add(findings, 'error', 'EXCHANGE_INTEGRATED_SHA_INVALID', `${label} integrated_revision must be an exact Git SHA.`);
      if (data.integration_review.disposition !== 'integrated' || !SAFE_LABEL_RE.test(data.integration_review.reviewer_owner || '')
        || !Array.isArray(data.integration_review.verification_results)
        || data.integration_review.verification_results.some(result => !result || !VERIFICATION_ID_RE.test(result.id || '') || !VERIFICATION_RESULT_STATUSES.has(result.status))
        || !Array.isArray(data.integration_review.notes_reconciled) || !data.integration_review.notes_reconciled.every(item => /^NOTE-[A-Z0-9][A-Z0-9.-]*-\d{3}$/.test(item))) {
        add(findings, 'error', 'EXCHANGE_INTEGRATION_REVIEW_INVALID', `${label} integration_review requires integrated disposition, safe reviewer owner, verification results, and reconciled Note IDs.`);
      }
    }
  }
  if (['cancelled', 'superseded'].includes(data.lifecycle) && !isNonEmptyString(data.terminal_reason)) add(findings, 'error', 'EXCHANGE_TERMINAL_REASON_REQUIRED', `${label} lifecycle ${data.lifecycle} requires terminal_reason.`);
}

function validateExchange(data, label, knownIds, findings, template = false, rootDir = null) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data.request || typeof data.request !== 'object') { add(findings, 'error', 'EXCHANGE_SCHEMA_INVALID', `${label} must contain an Exchange object and request object.`); return; }
  if (data.schema_version === 1) validateExchangeV1(data, label, knownIds, findings, template);
  else if (data.schema_version === 2) validateExchangeV2(data, label, findings, template, rootDir);
  else add(findings, 'error', 'EXCHANGE_SCHEMA_INVALID', `${label} schema_version must be 1 or 2.`);
}

function validateExchanges(rootDir, knownIds, findings, activeExchange = null) {
  const templatePath = 'docs/templates/EXCHANGE_TEMPLATE.json';
  try { validateExchange(readJson(rootDir, templatePath), templatePath, knownIds, findings, true, rootDir); }
  catch (error) { add(findings, 'error', 'EXCHANGE_TEMPLATE_INVALID_JSON', `${templatePath}: ${error.message}`); }
  for (const relativePath of walk(rootDir, 'docs/handoffs').filter(item => item.endsWith('/EXCHANGE.json'))) {
    try {
      const exchange = readJson(rootDir, relativePath);
      validateExchange(exchange, relativePath, knownIds, findings, false, rootDir);
      if (exchange.schema_version === 2 && !fs.existsSync(path.join(rootDir, path.dirname(relativePath), 'README.md'))) add(findings, 'error', 'EXCHANGE_README_MISSING', `${relativePath} requires a neighboring README.md.`);
      if (activeExchange === relativePath && exchange.schema_version === 2 && TERMINAL_EXCHANGE_LIFECYCLES.has(exchange.lifecycle)) add(findings, 'error', 'EXCHANGE_TERMINAL_ACTIVE', `${relativePath} is terminal and cannot remain active.`);
    }
    catch (error) { add(findings, 'error', 'EXCHANGE_INVALID_JSON', `${relativePath}: ${error.message}`); }
  }
}

function validateStaticBoundaries(rootDir, stateRoot, findings) {
  if (readText(rootDir, 'AGENTS.md').includes('## Current Priority')) add(findings, 'error', 'AGENTS_DYNAMIC_PRIORITY', 'AGENTS.md must remain static and may not contain Current Priority.');
  const activePath = `${stateRoot}/ACTIVE_AGENT_WORK.md`;
  const activeText = readText(rootDir, activePath);
  if (!activeText.includes('EXECUTION_STATE.json') || !activeText.includes('Do not record new live execution')) add(findings, 'error', 'ACTIVE_AGENT_WORK_NOT_COMPATIBILITY', `${activePath} must remain a compatibility pointer to Execution State.`);
  if (!fs.existsSync(path.join(rootDir, '.gitignore')) || !readText(rootDir, '.gitignore').includes('.tova-runtime/')) add(findings, 'error', 'LOCAL_RUNTIME_NOT_IGNORED', '.tova-runtime/ must be ignored.');
}

function buildCollaborationReport({ rootDir = path.resolve(__dirname, '..') } = {}) {
  const root = path.resolve(rootDir);
  const findings = [];
  const stateRoot = resolveStateRoot(root);
  validateRequired(root, stateRoot, findings);
  if (!findings.some(item => item.code === 'COLLABORATION_OWNER_MISSING')) {
    validateSizes(root, stateRoot, findings);
    const state = validateExecutionState(root, stateRoot, findings);
    validateDevelopmentNodes(root, stateRoot, findings);
    validateRepositoryIndex(root, findings);
    validateNotes(root, findings);
    const ids = verificationIds(root, findings);
    validateExchanges(root, ids, findings, state.active_exchange || null);
    validateStaticBoundaries(root, stateRoot, findings);
  }
  const errors = findings.filter(item => item.level === 'error');
  const warnings = findings.filter(item => item.level === 'warning');
  return {
    ok: errors.length === 0,
    kind: 'tova.crossEnvironmentContinuityCheck',
    schemaVersion: 1,
    root: normalize(root),
    stateRoot,
    summary: { errors: errors.length, warnings: warnings.length },
    findings,
    nextAction: errors.length ? 'Repair only the reported collaboration owner or evidence boundary, then rerun this check.' : 'Use the active Slice Project Health gate; this result is structural workflow evidence only.'
  };
}

function parseArgs(argv) {
  const args = { rootDir: path.resolve(__dirname, '..') };
  for (let index = 0; index < argv.length; index += 1) if (argv[index] === '--root') args.rootDir = path.resolve(argv[++index]);
  return args;
}

if (require.main === module) {
  const report = buildCollaborationReport(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

module.exports = { buildCollaborationReport, parseActionRegistry, parseFrontMatter, validateExecutionState, validateExchange, validateRepositoryIndex };
