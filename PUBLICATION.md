# Public Release Staging

This folder is a local staging copy of the ToVA Universal Development Starter Kit. It is intended to become the clean public GitHub distribution, separate from the ToVA language/research repository.

## Before publishing

1. Choose and add a `LICENSE` file. No license has been selected in this staging copy.
2. Review Git history before the first push. This folder was created without repository history; do not import the broader ToVA history by accident.
3. Run the package checks from a clean checkout:

   ```powershell
   npm.cmd run workflow:check
   npm.cmd run workflow:collaboration-check
   npm.cmd run workflow:fixtures
   npm.cmd test
   ```

4. Publish a deliberate immutable version or tag. The copied package currently identifies itself as `2.0.0-rc.11-dev`; it must not be presented as a completed release until the release-assembly work is authorized and verified.
5. Enable GitHub security reporting and use `SECURITY.md` for responsible disclosure.

## Scope

This public repository should distribute the reusable workflow only. It should not include ToVA research history, unrelated applications, private machine data, credentials, runtime caches, generated application output, or user data.
