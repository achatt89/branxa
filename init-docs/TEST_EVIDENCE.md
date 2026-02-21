# Test Evidence

Version: 1.0  
Date: 2026-02-19

## Test Runs

| Timestamp (UTC) | Suite | Command | Result | Notes |
|---|---|---|---|---|
| 2026-02-21T07:40:38Z | Baseline dependency bootstrap | `npm install --verbose` | BLOCKED | Network resolution failed: `ENOTFOUND https://registry.npmjs.org/...` |
| 2026-02-21T07:49:00Z | E1-T1 / E1-T2 build validation | `npm run build` | FAIL | `tsc` not found because dependencies were not installed (`npm install` blocked by network). |
| 2026-02-21T07:49:00Z | E1-T1 / E1-T2 test validation | `npm test` | FAIL | `jest` not found because dependencies were not installed (`npm install` blocked by network). |
| 2026-02-21T08:26:00Z | Epic 2 compile check | `npm run build` | PASS | TypeScript compile completed with new core lifecycle command modules. |
| 2026-02-21T08:31:00Z | Epic 2 full suite (intermediate) | `npm test` | FAIL | One failing assertion in `tests/log-diff-command.test.ts` identified git status parsing bug in `getChangedFiles`. |
| 2026-02-21T08:32:34Z | Epic 2 full suite (post-fix) | `npm test` | PASS | 5 suites passed, 14 tests passed after fixing status parsing in `src/lib/git.ts`. |
| 2026-02-21T08:34:04Z | Epic 2 regression rerun | `npm run build && npm test` | PASS | Validation remained green after final cleanup and doc updates. |
| 2026-02-21T08:40:47Z | Epic 3 compile check | `npm run build` | PASS | TypeScript compile succeeded after adding handoff/share/watch/hook commands. |
| 2026-02-21T08:40:47Z | Epic 3 full suite | `npm test` | PASS | 7 suites passed, 20 tests passed, including collaboration automation acceptance tests. |
| 2026-02-21T08:46:00Z | Epic 4 compile check | `npm run build` | PASS | TypeScript compile succeeded after adding AI feature commands and AI provider layer. |
| 2026-02-21T08:47:00Z | Epic 4 full suite (intermediate) | `npm test` | FAIL | Suggest no-context path incorrectly treated `.gitignore` init noise as actionable change. |
| 2026-02-21T08:47:38Z | Epic 4 full suite (post-fix) | `npm test` | PASS | 8 suites passed, 26 tests passed after filtering Branxa housekeeping files in suggest gate. |
| 2026-02-21T08:50:30Z | Epic 5 compile check | `npm run build` | PASS | TypeScript compile succeeded after adding parser pipeline modules and auto-extract integration. |
| 2026-02-21T08:50:51Z | Epic 5 full suite | `npm test` | PASS | 9 suites passed, 30 tests passed, including parser extraction contracts and cursor fallback safety. |
| 2026-02-21T08:53:20Z | Epic 6/7 compile check | `npm run build` | PASS | TypeScript compile succeeded after MCP and VS Code adapter integration. |
| 2026-02-21T08:53:42Z | Epic 6/7 full suite | `npm test` | PASS | 11 suites passed, 37 tests passed, including MCP tool/resource and VS Code bridge parity tests. |
| 2026-02-21T08:56:50Z | Epic 8 compile check | `npm run build` | PASS | TypeScript compile succeeded after config command and persistence integrity changes. |
| 2026-02-21T08:57:11Z | Epic 8 full suite | `npm test` | PASS | 12 suites passed, 40 tests passed, including config coercion/masking and merge-dedupe integrity tests. |
| 2026-02-21T08:59:20Z | Epic 9 compile check | `npm run build` | PASS | TypeScript compile succeeded after release-gate verification test additions. |
| 2026-02-21T08:59:30Z | Epic 9 full suite | `npm test` | PASS | 14 suites passed, 44 tests passed, including interface parity, E2E flow, and AI provider contract checks. |
