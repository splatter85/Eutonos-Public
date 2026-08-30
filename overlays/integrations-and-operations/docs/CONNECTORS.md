# Connectors

Purpose: document external services and integration contracts so project behavior does not depend on chat memory.

## Connector Template

### `[CONNECTOR_NAME]`

- Type: API / database / queue / auth / storage / analytics / payment / deploy / other
- Status: planned / mocked / local / staging / production / deprecated
- Owner: `[TEAM_OR_PERSON]`
- Used by:
  - `[AREA]`
- Source files:
  - `[PATH]`
- Environment variables:
  - `[ENV_VAR_NAME]`: purpose, never commit secret values
- Local fallback:
  - `[MOCK_OR_FIXTURE]`
- Failure behavior:
  - `[WHAT_HAPPENS_IF_UNAVAILABLE]`
- Verification:
  - `[COMMAND_OR_CHECK]`
- Notes:
  - `[AUTH_RATE_LIMIT_DEPLOY_OR_DATA_NOTES]`

## Rules

- Do not commit secrets.
- Do not add connectors without documenting them.
- Keep production claims separate from local proof.
