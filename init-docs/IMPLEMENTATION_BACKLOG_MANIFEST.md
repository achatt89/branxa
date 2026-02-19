# Implementation Backlog Manifest (Execution + Acceptance Tests)

Version: 1.0  
Date: 2026-02-19

## Epic 1 — Foundation and Initialization
### E1-T1: CLI bootstrap and command wiring
Acceptance Tests:
- `branxa --version` and `branxa --help` expose expected metadata.
- All command names register without runtime throw.

### E1-T2: Repository initialization
Acceptance Tests:
- `init` creates `.branxa/sessions`, `.branxa/branches`, `.branxa/config.json`.
- `init` is idempotent and warns when already initialized.
- Non-git path returns friendly failure.

## Epic 2 — Core Context Lifecycle
### E2-T1: Save command modes
Acceptance Tests:
- Interactive mode captures required fields.
- Structured flag mode parses `;;` multi-values.
- `--auto` mode attempts parser extraction and falls back safely.

### E2-T2: Resume command contract
Acceptance Tests:
- `resume --stdout` emits generated prompt.
- default resume copies to clipboard or falls back to stdout.
- empty branch context returns warning and no crash.

### E2-T3: Log and diff visibility
Acceptance Tests:
- `log --all` and branch log respect count bounds.
- `diff` reports new/still/resolved file categories.
- `diff` emits decision and next-step progression when history exists.

## Epic 3 — Team Collaboration and Automation
### E3-T1: Handoff workflow
Acceptance Tests:
- handoff quick mode persists assignee and note.
- handoff guided mode prompts required fields and persists context.

### E3-T2: Share workflow
Acceptance Tests:
- `share` removes `.branxa` ignore entries and creates commit.
- `share --stop` restores ignore entry with expected messaging.

### E3-T3: Watch and hook workflows
Acceptance Tests:
- watch mode auto-saves after interval when changes detected.
- hook install appends Branxa post-commit logic safely.
- hook remove removes only Branxa-managed lines and preserves other content.

## Epic 4 — AI-Assisted Commands
### E4-T1: Summarize command
Acceptance Tests:
- summarize builds AI prompt from git state and parses JSON result.
- parse failures fallback to raw summary save path.

### E4-T2: Suggest command
Acceptance Tests:
- suggest emits 3-5 actionable steps when context/changes exist.
- no-context path returns explicit warning.

### E4-T3: Compress command
Acceptance Tests:
- compress blocks when <=2 entries.
- compress rewrites branch file to `[compressed, latest]`.

## Epic 5 — Parser and Extraction Pipeline
### E5-T1: Claude extraction
Acceptance Tests:
- memory and JSONL extraction produce task/approach/decision/state outputs.

### E5-T2: Antigravity extraction
Acceptance Tests:
- implementation/task/walkthrough artifacts produce structured context.

### E5-T3: Cursor fallback behavior
Acceptance Tests:
- cursor paths do not crash; unresolved states return null.

## Epic 6 — MCP Server Parity
### E6-T1: MCP tool contracts
Acceptance Tests:
- `branxa_resume`, `branxa_save`, `branxa_log` return valid MCP text content.
- uninitialized repo paths return expected guidance.

### E6-T2: MCP resource contract
Acceptance Tests:
- `branxa://context` returns prompt content or explicit no-context state.

## Epic 7 — VS Code Extension Parity
### E7-T1: Command bridge behavior
Acceptance Tests:
- extension commands call `npx branxa ...` in workspace context.
- output channel content renders for resume/log/diff.

### E7-T2: Startup/status behavior
Acceptance Tests:
- auto-resume attempts on startup.
- status bar displays latest context timestamp or fallback state.

## Epic 8 — Reliability and Config Safety
### E8-T1: Config command contract
Acceptance Tests:
- list/get/set paths validate keys and coerce values.
- API key masking behavior verified.

### E8-T2: Persistence integrity
Acceptance Tests:
- merge/sync dedupe by id and timestamp ordering.
- malformed config/session read paths fail gracefully.

## Epic 9 — Integration and Release Gate
### E9-T1: Interface parity verification
Acceptance Tests:
- CLI/MCP/extension command inventory matches canonical interface manifest.

### E9-T2: End-to-end branch continuity flow
Acceptance Tests:
- init → save → resume → diff → log → handoff flow succeeds in sample repo.

### E9-T3: Final parity checklist run
Acceptance Tests:
- all critical checklist rows PASS or are explicitly BLOCKED with evidence.
