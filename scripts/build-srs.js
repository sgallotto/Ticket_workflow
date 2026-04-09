/**
 * PURPOSE:
 * Generate a human-readable Software Requirements Specification (SRS)
 * from extracted QMS records.
 */

const fs = require("fs");
const path = require("path");

const { requireField } = require("./validate-record");

const RECORDS_DIR = "qms/records";
const OUTPUT_FILE = "docs/SRS.md";

function loadRecords() {
  return fs.readdirSync(RECORDS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, f))));
}

function main() {
  const records = loadRecords();

  const requirements = records.filter(r =>
    r.meta.labels.includes("artifact:requirement")
  );

  let md = `# Software Requirements Specification (SRS)\n\n`;
  md += `_Generated automatically. Do not edit manually._\n\n`;

  for (const r of requirements) {
  requireField(r.data, "requirement_id", `Issue #${r.meta.issue_number}`);
  requireField(r.data, "requirement_text", r.data.requirement_id);
  requireField(r.data, "acceptance_criteria", r.data.requirement_id);

  const id = r.data.requirement_id;

  md += `## ${id}\n\n`;
  md += `**Requirement text**\n\n`;
  md += `${r.data.requirement_text}\n\n`;
  md += `**IEC 62304 Safety Class**\n\n`;
  md += `${r.data.iec_62304_safety_class}\n\n`;
  md += `**Acceptance criteria**\n\n`;
  md += `${r.data.acceptance_criteria}\n\n`;
  md += `---\n\n`;
}


  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md);

  console.log(`SRS generated at ${OUTPUT_FILE}`);
}

main();
