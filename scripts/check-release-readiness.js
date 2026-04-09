/**
 * PURPOSE:
 * Block releases if traceability is incomplete.
 */

const fs = require("fs");

const TRACE_FILE = "qms/traceability.csv";

function main() {
  const csv = fs.readFileSync(TRACE_FILE, "utf-8").trim().split("\n");
  const rows = csv.slice(1); // skip header

  let errors = [];

  for (const row of rows) {
    const [req, risks, tests] = row.split(",");

    if (!risks || risks.trim() === "") {
      errors.push(`Requirement ${req} has no linked risk`);
    }
    if (!tests || tests.trim() === "") {
      errors.push(`Requirement ${req} has no linked test`);
    }
  }

  if (errors.length) {
    console.error("❌ Release blocked due to traceability gaps:");
    errors.forEach(e => console.error(" - " + e));
    process.exit(1);
  }

  console.log("✅ Release readiness check passed");
}

main();
