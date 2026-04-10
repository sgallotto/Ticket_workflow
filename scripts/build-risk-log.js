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
  return fs.readdirSync(RECORDS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f =>
      JSON.parse(
        fs.readFileSync(
          path.join(RECORDS_DIR, f),
          "utf-8"
        )
      )
    );
}

function main() {
  const records = loadRecords();

  const risks = records.filter(r =>
    r.meta.labels.includes("artifact:risk")
  );

  let md = `# Risk Management Log (ISO 14971)\n\n`;
  md += `_Generated automatically. Do not edit manually._\n\n`;

for (const r of risks) {
  // --- Validation (fail loudly) ---
  requireField(r.data,"risk_id",`Risk issue #${r.meta.issue_number}`);
  requireField(r.data,"hazard",`Risk ${r.data.risk_id}`);
  requireField(r.data,"harm",`Risk ${r.data.risk_id}`);

  // --- Data extraction ---
  const id = r.data.risk_id;
  const hazard = r.data.hazard;
  const harm = r.data.harm;
  const controls = r.data.controls || "Not yet defined";
  const status = r.data.status || "unspecified";

  // --- Document rendering ---
  md += `## ${id}\n\n`;

  md += `**Hazard / Hazardous Situation**\n\n`;
  md += `${hazard}\n\n`;

  md += `**Potential Harm**\n\n`;
  md += `${harm}\n\n`;

  md += `**Risk Controls**\n\n`;
  md += `${controls}\n\n`;

  md += `**Risk Status**\n\n`;
  md += `${status}\n\n`;

  md += `---\n\n`;
}

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md);

  console.log(`Risk Management Log generated at ${OUTPUT_FILE}`);
}

main();
