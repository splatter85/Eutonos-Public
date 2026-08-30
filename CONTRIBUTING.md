# Contributing

Thanks for considering a contribution to the ToVA Universal Development Starter Kit.

Please keep changes focused, preserve the distinction between workflow guidance and a target project's product truth, and avoid adding project-specific rules to the universal package. Do not commit credentials, local machine details, generated build output, caches, or user data.

For a proposed change, explain the problem, affected package owners, compatibility impact, and the checks run. Before opening a pull request, run:

```powershell
npm.cmd run workflow:check
npm.cmd run workflow:collaboration-check
npm.cmd run workflow:fixtures
npm.cmd test
```

Release, publication, and baseline-promotion decisions remain with the repository owner.
