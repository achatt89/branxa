# Human Start Guide

Version: 1.1  
Date: 2026-02-19

## 0) Objective
Use this guide to start controlled execution of the Branxa parity manifests without losing scope.

You are implementing against these contracts:
- product/business requirements,
- technical architecture,
- canonical interface inventory,
- backlog + acceptance tests,
- parity release gate.

## 1) Read in This Exact Order (Do Not Skip)
1. `BRD_MANIFEST.md`
2. `PRD_MANIFEST.md`
3. `TECHNICAL_MANIFEST.json`
4. `CANONICAL_INTERFACE_MANIFEST.md`
5. `IMPLEMENTATION_BACKLOG_MANIFEST.md`
6. `FR_TRACEABILITY_MATRIX.md`
7. `PARITY_AUDIT_CHECKLIST.md`
8. `AGENTS.md`
9. `ONE_SHOT_AGENT_PROMPT_PACK.md`
10. `ONE_SHOT_AGENT_WORKFLOW.json`

## 2) Preflight Setup
From project root (`branxa`):

1. Install dependencies:
	- `npm install`
2. Build baseline:
	- `npm run build`
3. Run tests baseline:
	- `npm test`

If any baseline step fails, log it immediately in `EXECUTION_LOG.md` and `PARITY_AUDIT_RESULT.md` before continuing.

## 3) Runtime Artifacts You Must Keep Updated
- `EXECUTION_LOG.md` → chronological execution record.
- `TEST_EVIDENCE.md` → every test run command + outcome.
- `PARITY_AUDIT_RESULT.md` → parity checklist pass/fail/blocked ledger.
- `FINAL_SIGNOFF.json` → final GO/NO-GO decision artifact.

Do not leave these for the end; update continuously.

## 4) Execution Cadence (Phase by Phase)
Follow `ONE_SHOT_AGENT_WORKFLOW.json` phase order and map each change to backlog tasks:

1. Implement one task from `IMPLEMENTATION_BACKLOG_MANIFEST.md`.
2. Run the task’s acceptance tests.
3. Record output in `TEST_EVIDENCE.md`.
4. Update `EXECUTION_LOG.md` with result and files changed.
5. Update `PARITY_AUDIT_RESULT.md` for impacted checklist rows.
6. Move to next task only after pass (or BLOCKED with evidence).

## 5) Core Commands You Will Use During Execution
Project scripts:
- Build: `npm run build`
- Test: `npm test`
- Run CLI locally (dev mode): `npm run dev -- <command>`
- Run built CLI: `node dist/index.js <command>`
- Run MCP server: `npm run mcp`

Typical CLI parity checks:
- `node dist/index.js init`
- `node dist/index.js save "test context"`
- `node dist/index.js resume --stdout`
- `node dist/index.js log --count 5`
- `node dist/index.js diff`

## 6) Interface Parity Verification Checklist
Before signoff, confirm all interfaces in `CANONICAL_INTERFACE_MANIFEST.md` are represented and tested:
- CLI command surface
- MCP tools/resources
- VS Code extension commands

Any interface drift must be resolved by updating implementation and/or manifests consistently.

## 7) Failure and Blocker Policy
For each failure:
1. Diagnose root cause.
2. Apply focused fix.
3. Re-run failing tests.
4. Retry up to 3 times.
5. If still failing, mark BLOCKED with evidence and proceed with independent tasks.

Never hide blockers; document them explicitly.

## 8) Final GO/NO-GO Decision Rule
Mark `GO` only when all are true:
- critical rows in `PARITY_AUDIT_CHECKLIST.md` are PASS,
- FR coverage in `FR_TRACEABILITY_MATRIX.md` has test evidence,
- no unresolved critical blockers remain.

Otherwise mark `NO-GO` and list remediation items in `FINAL_SIGNOFF.json`.

## 9) Suggested Commit Discipline
Use small commits per epic/task group with message pattern:
- `feat(epic-x): <summary>`
- `test(epic-x): <summary>`
- `docs(parity): update evidence and signoff`

This keeps traceability clean during parity audit.
