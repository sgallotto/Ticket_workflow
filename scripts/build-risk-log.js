/**
 * PURPOSE:
 * Generate a Risk Management Log (ISO 14971)
 * from extracted QMS records.
 */

const fs = require("fs");
const path = require("path");

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
    const id = r.data.risk_id;
    if (!id) continue;

    md += `## ${id}\n\n`;
    md += `**Hazard / Hazardous Situation**\n\n`;
    md += `${r.data.hazard}\n\n`;

    md += `**Potential Harm**\n\n`;
    md += `${r.data.harm}\n\n`;

    md += `**Risk Controls**\n\n`;
    md += `${r.data.controls || "Not yet defined"}\n\n`;

    md += `**Risk Status**\n\n`;
    md += `${r.data.status}\n\n`;
    md += `---\n\n`;
  }

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md);

  console.log(`Risk Management Log generated at ${OUTPUT_FILE}`);
}

main();
