/**
 * PURPOSE:
 * Generate a Design History File (DHF) index.
 */

const fs = require("fs");

const OUTPUT_FILE = "docs/DHF-Index.md";

function main() {
  let md = `# Design History File (DHF)\n\n`;
  md += `_Generated automatically. Contents listed below._\n\n`;

  md += `## Core Documents\n\n`;
  md += `- [Software Requirements Specification](SRS.md)\n`;
  md += `- [Risk Management Log](Risk-Management-Log.md)\n`;
  md += `- [Verification Report](Verification-Report.md)\n`;
  md += `- [Traceability Matrix](../qms/traceability.csv)\n\n`;

  md += `## Notes\n\n`;
  md += `All documents are generated from controlled GitHub Issues and records.\n`;
  md += `Manual edits are not permitted.\n`;

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md);

  console.log(`DHF Index generated at ${OUTPUT_FILE}`);
}

main();
