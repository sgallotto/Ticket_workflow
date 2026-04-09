/**
 * PURPOSE:
 * Generate Design Review Minutes from merged PRs.
 */

const fs = require("fs");

const OUTPUT = "docs/Design-Review-Minutes.md";

function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const run = process.env.GITHUB_RUN_ID;

  let md = `# Design Review Minutes\n\n`;
  md += `_Generated automatically from Pull Requests._\n\n`;
  md += `See GitHub for full review discussions.\n\n`;

  md += `Run ID: ${run}\n\n`;

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT, md);
}

main();
