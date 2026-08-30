# Error Handling And Logging

Purpose: make failure handling and operational visibility part of the architecture contract.

## Baseline Questions

Every project should answer:

1. What does the user or operator see when something fails?
2. Where are errors recorded?
3. What events are logged on purpose?
4. What data must never be logged?
5. How can a future developer verify the failure path?

## Error Handling Template

### `[ERROR_SURFACE_OR_WORKFLOW]`

- Failure source:
  - `[WHAT_CAN_FAIL]`
- User or operator behavior:
  - `[VISIBLE_MESSAGE_OR_RECOVERY]`
- Internal handling:
  - `[RETRY_FALLBACK_ABORT_ETC]`
- Verification:
  - `[HOW_TO_TRIGGER_OR_TEST_IT]`

## Logging Template

### `[LOG_STREAM_OR_EVENT_GROUP]`

- Purpose:
  - `[WHY_THIS_IS_LOGGED]`
- Destination:
  - `[CONSOLE_FILE_SERVICE_DATABASE_ETC]`
- Trigger:
  - `[WHEN_IT_EMITS]`
- Fields:
  - `[IMPORTANT_FIELDS]`
- Sensitive data rule:
  - `[WHAT_MUST_BE_REDACTED_OR_OMITTED]`
- Verification:
  - `[HOW_TO_CONFIRM_IT_WORKS]`

## Rules

- Do not log secrets, tokens, passwords, raw personal data, or private keys.
- Prefer structured logs when the project is operationally complex.
- Remove throwaway debug logging once it is no longer useful.
- When error handling or logging changes, update this file and `docs/CURRENT_FEATURES.md` if user-visible behavior changed.
