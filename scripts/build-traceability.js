/**
 * PURPOSE:
 * Build a traceability matrix (SRS ↔ Risk ↔ Test)
 * from extracted QMS JSON records.
 */

const fs = require("fs");
const path = require("path");

const RECORDS_DIR = "qms/records";
const OUTPUT_FILE = "qms/traceability.csv";

function loadRecords() {
  return fs.readdirSync(RECORDS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, f))));
}

function main() {
  const records = loadRecords();

  const requirements = {};
  const risks = {};
  const tests = {};

  for (const r of records) {
    const labels = r.meta.labels || [];

    if (labels.includes("artifact:requirement")) {
      const id = r.data.requirement_id;
      requirements[id] = { risks: [], tests: [] };
    }

    if (labels.includes("artifact:risk")) {
      risks[r.data.risk_id] = r.data;
    }

    if (labels.includes("artifact:test")) {
      tests[r.data.test_id] = r.data;
    }
  }

  // Link tests → requirements
  for (const [testId, test] of Object.entries(tests)) {
    const traced = test.traces_to_srs_id_s || test.traces;
    if (!traced) continue;

    traced.split(/[;,]/).map(s => s.trim()).forEach(reqId => {
      if (requirements[reqId]) {
        requirements[reqId].tests.push(testId);
      }
    });
  }

  // Link risks → requirements (simple text scan)
  for (const [riskId, risk] of Object.entries(risks)) {
    const text = JSON.stringify(risk).toLowerCase();
    for (const reqId of Object.keys(requirements)) {
      if (text.includes(reqId.toLowerCase())) {
        requirements[reqId].risks.push(riskId);
      }
    }
  }

  // Write CSV
  let csv = "Requirement ID,Risk IDs,Test IDs\n";

  for (const [reqId, links] of Object.entries(requirements)) {
    csv += `"${reqId}","${links.risks.join(" ")}","${links.tests.join(" ")}"\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, csv);
  console.log(`Traceability matrix written to ${OUTPUT_FILE}`);
}

main();
``
