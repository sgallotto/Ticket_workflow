/**
 * PURPOSE:
 * Generate a Verification Report
 * from verification test records.
 */

const fs = require("fs");
const path = require("path");

const RECORDS_DIR = "qms/records";
const OUTPUT_FILE = "docs/Verification-Report.md";

function loadRecords() {
  return fs.readdirSync(RECORDS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, f))));
}

function main() {
  const records = loadRecords();

  const tests = records.filter(r =>
    r.meta.labels.includes("artifact:test")
  );

  let md = `# Verification Report\n\n`;
  md += `_Generated automatically. Do not edit manually._\n\n`;

  for (const t of tests) {
    const id = t.data.test_id;
    if (!id) continue;

    md += `## ${id}\n\n`;
    md += `**Traces to Requirement(s)**\n\n`;
    md += `${t.data.traces || t.data.traces_to_srs_id_s}\n\n`;

    md += `**Test Procedure**\n\n`;
    md += `${t.data.procedure}\n\n`;

    md += `**Expected Result**\n\n`;
    md += `${t.data.expected}\n\n`;
    md += `---\n\n`;
  }

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md);

  console.log(`Verification Report generated at ${OUTPUT_FILE}`);
}

main();
``
