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
