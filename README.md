# Ticket_workflow
A lightweight design-controls system for medical device software, run entirely on GitHub.
Requirements, risks and verification tests are entered as GitHub Issues through structured
forms. A GitHub Actions workflow turns each issue into a QMS record and regenerates the
Design History File (DHF) documents: SRS, Risk Management Log, Verification Report,
traceability matrix, and PDF/Word exports.
It targets the documentation expected by IEC 62304 (software lifecycle), ISO 14971
(risk management) and FDA 21 CFR 820.30 (design controls).
How it works
GitHub Issue (form)  ──►  qms-export workflow  ──►  qms/records/issue-<n>.json
                                                       │
                                                       ▼
                         docs/SRS.md, docs/Risk-Management-Log.md,
                         docs/Verification-Report.md, docs/DHF-Index.md,
                         qms/traceability.csv, docs/DHF.pdf, docs/DHF.docx
                                                       │
                                                       ▼
                                   committed back to the repo by qms-bot
​
A user opens an issue with one of the three issue forms. Each form adds a label
(artifact:requirement, artifact:risk or artifact:test).
When an issue with one of those labels is opened or edited, the
QMS Export workflow runs.
extract-qms-record.js parses the issue form fields and saves them as a JSON record.
The build scripts regenerate every document from all records, so the outputs are
always rebuilt from scratch.
The workflow commits the records and documents back to the repository as
QMS export issue #<n>.
The generated documents must not be edited by hand. To change a document, edit the issue
it comes from.
Issue forms
Form
Label
Title format
Fields (* = required)
Software Requirement (SRS)
artifact:requirement
SRS: <short title>
Requirement ID*, Requirement text*, IEC 62304 safety class (A/B/C), Acceptance criteria
Risk Item (ISO 14971)
artifact:risk
Risk: <short description>
Risk ID*, Hazard / hazardous situation*, Potential harm*, Risk controls, Risk status (open / mitigated / closed)
Verification Test
artifact:test
TEST: <SRS-ID> - <short description>
Test ID*, Traces to SRS ID(s), Test procedure, Expected result*
ID conventions
Requirements: SRS-001, SRS-002, …
Risks: R-001, R-002, …
Tests: T-001, T-002, …
How traceability links are made
Test → requirement: the test's Traces to SRS ID(s) field. Separate several IDs with
commas or semicolons (SRS-001, SRS-004).
Risk → requirement: there is no dedicated field. A risk is linked to every
requirement whose ID appears anywhere in the risk's text, for example in Risk controls
("Mitigated by SRS-001"). Always name the requirement IDs a risk relates to.
Generated outputs
File
Built by
Contents
qms/records/issue-<n>.json
extract-qms-record.js
Issue metadata (number, title, labels, URL, extraction time) plus the form fields
qms/traceability.csv
build-traceability.js
One row per requirement, with its linked risk IDs and test IDs
docs/SRS.md
build-srs.js
Software Requirements Specification
docs/Risk-Management-Log.md
build-risk-log.js
Risk Management Log (ISO 14971)
docs/Verification-Report.md
build-verification-report.js
Verification test cases and the requirements they trace to
docs/DHF-Index.md
build-dhf-index.js
Index linking the DHF documents
docs/Design-Review-Minutes.md
build-design-reviews.js
Placeholder minutes pointing to pull-request reviews
docs/DHF.pdf
pandoc
DHF index, SRS, risk log, verification report and traceability matrix in one PDF
docs/DHF.docx
pandoc
DHF index in Word format
If a required field is missing, the build scripts stop with an error naming the field and
the issue, and nothing is committed.
Design reviews
Pull requests use the design review template
(FDA 820.30(e)): purpose of change, affected requirement and risk IDs, verification impact
and the review decision. The PR discussion and approvals are the review record.
Release readiness
check-release-readiness.js reads qms/traceability.csv and blocks a release, exiting
with an error, if any requirement has no linked risk or no linked test. The workflow
runs it only when the triggering ref is a tag (refs/tags/...).
Repository layout
.github/
  ISSUE_TEMPLATE/        issue forms for requirements, risks and tests
  pull_request_template.md
  workflows/qms-export.yml
scripts/                 record extraction and document builders (Node.js, no dependencies)
qms/
  records/               one JSON record per issue
  traceability.csv
docs/                    generated DHF documents; docs/docs/SOP-GitHub-QMS.md is the SOP draft
​
Setup in a new repository
Copy .github/, scripts/ and an empty qms/records/ folder into the repository.
Create the labels artifact:requirement, artifact:risk and artifact:test.
In Settings → Actions → General → Workflow permissions, choose Read and write
permissions so the workflow can push its commit.
Open a requirement issue to check that a record and the documents are generated.
Running the scripts locally
Requires Node.js 18 or later. pandoc and LaTeX are needed only for the PDF/Word export.

# Extract one issue (normally done by the workflow)
ISSUE_NUMBER=2 ISSUE_TITLE="SRS: example" ISSUE_LABELS="artifact:requirement" \
ISSUE_URL="<https://github.com/><owner>/<repo>/issues/2" \
ISSUE_BODY=$'### Requirement ID\n\nSRS-002\n\n### Requirement text\n\nThe system shall log user authentication failures\n\n### IEC 62304 Safety Class\n\nB\n\n### Acceptance criteria\n\nFailures appear in the audit log within 1 s' \
node scripts/extract-qms-record.js

# Rebuild all documents from the records
node scripts/build-traceability.js
node scripts/build-srs.js
node scripts/build-risk-log.js
node scripts/build-verification-report.js
node scripts/build-dhf-index.js
node scripts/check-release-readiness.js
​
# Known limitations
The release-readiness check doesn't run. The workflow is triggered only by issue
events, so the refs/tags/ condition is never true. Add a push: tags trigger, or a
separate release workflow, to enforce it.
The release-readiness check never fails. It splits the CSV on commas without removing
the quotes, so an empty link reads as "", which isn't empty. For example, SRS-002 and
SRS-100 currently have no linked risk, but the check passes.
Closing or deleting an issue doesn't remove its record. Records are created and
updated only when an issue is opened or edited. Labels added after creation also trigger
nothing until the issue is edited.
Risk links rely on a text search for requirement IDs (see above). An ID mentioned by
mistake creates a link.
DHF.docx contains only the DHF index, not the full DHF that is in the PDF.
Design Review Minutes are a placeholder. The script doesn't yet collect pull-request
reviews.
The SOP (docs/docs/SOP-GitHub-QMS.md) is only an outline (Purpose, Scope, Procedure,
Records, Version) and still needs to be written and approved.
Concurrent workflow runs can conflict when pushing. If a run fails at the commit step,
edit the issue again to rerun it.
