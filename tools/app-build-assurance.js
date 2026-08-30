const assurance = require('../project-workflow/modules/app-build-assurance/payload/tools/app-build-assurance');

if (require.main === module) process.exitCode = assurance.runCli(process.argv.slice(2));

module.exports = assurance;
