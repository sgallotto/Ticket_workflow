/**
 * Extract fields from GitHub Issue Form markdown
 * and write an auditable QMS JSON record.
 */

const fs = require("fs");

function extractFields(markdown) {
  const out = {};
  const blocks = markdown.split("\n### ").slice(1);

  for (const block of blocks) {
    const [header, ...rest] = block.split("\n");
    const key = header
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    out[key] = rest.join("\n").trim();
  }
  return out;
}

function main() {
  if (!process.env.ISSUE_BODY) {
    console.error("Missing ISSUE_BODY");
    process.exit(1);
  }

  const record = {
    meta: {
      issue_number: process.env.ISSUE_NUMBER,
      title: process.env.ISSUE_TITLE,
      labels: (process.env.ISSUE_LABELS || "").split(","),
      url: process.env.ISSUE_URL,
      extracted_at: new Date().toISOString()
    },
    data: extractFields(process.env.ISSUE_BODY)
  };

  fs.mkdirSync("qms/records", { recursive: true });
  fs.writeFileSync(
    `qms/records/issue-${process.env.ISSUE_NUMBER}.json`,
    JSON.stringify(record, null, 2)
  );
}

main();
