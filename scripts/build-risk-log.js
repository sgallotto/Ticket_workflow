/**
 * PURPOSE:
 * Generate a Risk Management Log (ISO 14971)
 * from extracted QMS records.
 */

const fs = require("fs");
const path = require("path");
const { requireField } = require("./validate-record");

const RECORDS_DIR = "qms/records";
const OUTPUT_FILE = "docs/Risk-Management-Log.md";

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

  const risks = records.filter(
    (r) => r.meta.labels && r.meta.labels.includes("artifact:risk")
  );

  let md = `# Risk Management Log (ISO 14971)\n\n`;
  md += `_Generated automatically. Do not edit manually._\n\n`;

  for (const r of risks) {
    /* ---------- VALIDATION ---------- */

    requireField(
      r.data,
      "risk_id",
      `Risk issue #${r.meta.issue_number}`
    );

    const hazard =
      r.data.hazard ||
      r.data.hazard_hazardous_situation;

    if (!hazard) {
      throw new Error(
        `Missing required field 'hazard' in Risk ${r.data.risk_id}`
      );
    }

