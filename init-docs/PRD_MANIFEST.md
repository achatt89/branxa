# Branxa Replication PRD Manifest

Version: 1.0  
Date: 2026-02-19  
Product Codename: Branxa Persistent Coding Context System

## 1) Purpose
Build an independent implementation that reproduces Branxa’s target externally observable behavior for CLI, MCP, and VS Code extension workflows.

## 2) Product Vision
Give developers and teams one portable context memory layer for AI coding sessions, preserving intent, decisions, progress, and next steps across time and tools.

## 3) Target Users
- Solo developers using AI coding tools.
- Teams handing off tasks across branches and time zones.
- Agentic workflows requiring structured session continuity.

## 4) Scope (In)
### 4.1 CLI Command Contract
- `branxa init`
- `branxa save [message]` (+ structured flags and `--auto`)
- `branxa resume` (`--branch`, `--stdout`)
- `branxa log` (`--all`, `--count`)
- `branxa diff`
- `branxa handoff [assignee] [message]`
- `branxa share` (`--stop`)
- `branxa watch` (`--interval`)
- `branxa hook <install/remove>`
- `branxa summarize`
- `branxa suggest`
- `branxa compress`
- `branxa config [list|get|set] [key] [value]`

### 4.2 MCP Server Contract
- Tool: `branxa_resume`
- Tool: `branxa_save`
- Tool: `branxa_log`
- Resource: `branxa://context`

### 4.3 VS Code Extension Contract
- Startup auto-resume attempt.
- Commands: `branxa.save`, `branxa.resume`, `branxa.log`, `branxa.diff`.
- Status bar context visibility.

### 4.4 Persistence and Data Model
- Repo-local `.branxa/` with:
  - `config.json`
  - `sessions/*.json`
  - `branches/<branch>.json`
- `ContextEntry` model with metadata, task context, auto-captured git context, and optional handoff fields.

### 4.5 Auto-Extraction Inputs
- Claude Code memory/session artifacts.
- Antigravity brain artifacts (`task.md`, `implementation_plan.md`, `walkthrough.md`, metadata).
- Cursor path presence detection (no SQLite deep parse in current implementation).

### 4.6 AI Features
- `summarize`: infer structured context from git state via OpenAI-compatible endpoint.
- `suggest`: propose actionable next steps from context and repo signals.
- `compress`: condense branch history while preserving latest entry.

## 5) Scope (Out)
- Cloud sync service.
- Server-side user auth/identity.
- Full Cursor state DB parsing.

## 6) Functional Requirements
- FR-1: `init` creates `.branxa` structure and updates `.gitignore` if needed.
- FR-2: `save` supports interactive, message-only, structured, and auto-extract modes.
- FR-3: `resume` emits AI-ready prompt from branch history and supports clipboard/stdout paths.
- FR-4: `log` supports current-branch and all-branch views with count limits.
- FR-5: `diff` compares latest saved context to current repo state and reports delta categories.
- FR-6: `handoff` captures assignee + handoff note with optional guided prompts.
- FR-7: `share` toggles `.branxa` git sharing state and commits share action.
- FR-8: `watch` captures periodic auto-save snapshots when file changes occur.
- FR-9: `hook` manages `post-commit` integration safely.
- FR-10: `summarize` persists AI-generated structured context from git activity.
- FR-11: `suggest` outputs AI next-step guidance from current context.
- FR-12: `compress` reduces branch context history to compressed summary + latest.
- FR-13: `config` supports list/get/set with key validation and type coercion.
- FR-14: MCP tools/resources expose parity context capabilities.
- FR-15: VS Code extension executes CLI commands and surfaces outputs.
- FR-16: Context store supports dedup/merge for shared branch files.
- FR-17: Parser pipeline prioritizes Claude/Antigravity/Cursor sources without crashing.
- FR-18: AI provider config supports env override and stored config fallback.

## 7) Non-Functional Requirements
- Runtime: Node.js + TypeScript transpilation.
- Portability: macOS/Linux/Windows compatible shell+filesystem behavior.
- Safety: graceful handling when uninitialized/non-git/headless clipboard unavailable.
- Maintainability: strict TS compile and test harness (`jest` + `ts-jest`).

## 8) Acceptance Criteria (High-Level)
- All CLI commands execute and emit expected success/failure UX paths.
- MCP tools return valid content for initialized/uninitialized repos.
- VS Code extension command actions invoke CLI and render output channels.
- Parser tests pass for Claude and Antigravity extraction fixtures.
- Parity checklist critical rows pass before GO signoff.

## 9) Replication Rule
Reproduce external behavior, contracts, and workflows; do not copy implementation source.
