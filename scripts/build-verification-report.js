/**
 * PURPOSE:
 * Generate a Verification Report
 * from verification test records.
 */

const fs = require("fs");
const path = require("path");
const { requireField } = require("./validate-record");

const RECORDS_DIR = "qms/records";
const OUTPUT_FILE = "docs/Verification-Report.md";

function loadRecords() {
  return fs
    .readdirSync(RECORDS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) =>
      JSON.parse(
        fs.readFileSync(path.join(RECORDS_DIR, f), "utf-8")
      )
    );
}

function main() {
  const records = loadRecords();

  const tests = records.filter(
    (r) => r.meta.labels && r.meta.labels.includes("artifact:test")
  );

  let md = "# Verification Report\n\n";
  md += "_Generated automatically. Do not edit manually._\n\n";

  for (const t of tests) {
    /* ---------- VALIDATION ---------- */

    requireField(
      t.data,
      "test_id",
      `Test issue #${t.meta.issue_number}`
    );

    const traces =
      t.data.traces_to_srs_id_s ||
      t.data.traces ||
      t.data.traces_to_srs_id;

    if (!traces) {
      throw new Error(
        `Missing SRS traceability for test ${t.data.test_id}`
      );
    }

    const procedure =
      t.data.procedure ||
      t.data.test_procedure;

    if (!procedure) {
      throw new Error(
        `Missing required field 'procedure' in Test ${t.data.test_id}`
      );
    }

    const expected =
      t.data.expected ||
      t.data.expected_result;

    if (!expected) {
      throw new Error(
        `Missing required field 'expected result' in Test ${t.data.test_id}`
      );
    }

    /* ---------- DOCUMENT RENDERING ---------- */

    const id = t.data.test_id;

    md += `## ${id}\n\n`;

    md += "**Traces to Requirement(s)**\n\n";
    md += `${traces}\n\n`;

    md += "**Test Procedure**\n\n";
    md += `${procedure}\n\n`;

    md += "**Expected Result**\n\n";
    md += `${expected}\n\n`;

    md += "---\n\n";
  }

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md);

  console.log(`Verification Report generated at ${OUTPUT_FILE}`);
}

main();
