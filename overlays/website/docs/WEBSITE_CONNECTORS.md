# Website Connectors

Purpose: document external services and integration contracts so website work does not depend on chat memory.

Use this file for APIs, CMS, analytics, auth, payments, email, forms, search, deployment, image/CDN providers, maps, embeds, and any third-party script.

## Connector Template

### `[CONNECTOR_NAME]`

- Type: API / CMS / analytics / auth / payment / form / deploy / media / search / other
- Status: planned / mocked / local / staging / production / deprecated
- Owner: `[TEAM_OR_PERSON]`
- Used by:
  - `[PAGE_OR_COMPONENT]`
- Source files:
  - `[PATH]`
- Environment variables:
  - `[ENV_VAR_NAME]`: purpose, never commit secret values
- Local fallback:
  - `[MOCK_OR_FIXTURE_PATH]`
- Failure behavior:
  - `[WHAT_USERS_SEE_WHEN_IT_FAILS]`
- Error logging:
  - `[WHERE_ERRORS_ARE_RECORDED]`
- Event/data logging:
  - `[WHAT_IS_LOGGED_AND_WHY]`
- Verification:
  - `[COMMAND_OR_MANUAL_CHECK]`
- Notes:
  - `[RATE_LIMITS_AUTH_ASSUMPTIONS_DEPLOY_NOTES]`

## Known Connectors

### Website Hosting

- Type: deploy
- Status: needs project update
- Owner: `[OWNER]`
- Used by:
  - production website
- Source files:
  - `[DEPLOY_CONFIG_PATH]`
- Environment variables:
  - `[ENV_VARS_OR_NONE]`
- Local fallback:
  - local build/preview command
- Failure behavior:
  - failed deploy should not be treated as a source-code success
- Verification:
  - `[BUILD_OR_DEPLOY_CHECK]`

## Rules

- Do not commit secrets.
- Do not add third-party scripts without documenting purpose, owner, and opt-out/privacy implications.
- For unavailable services, use mocks or fixtures and label them clearly.
- Keep production claims separate from local proof.
- Do not log secrets, raw form submissions, auth tokens, or personal data unless the project has an explicit reviewed need and redaction policy.
