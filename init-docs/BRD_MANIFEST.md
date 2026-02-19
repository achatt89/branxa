# Business Requirements Document (BRD) Manifest

Version: 1.0  
Date: 2026-02-19  
Initiative: Branxa feature-parity independent reimplementation

## 1) Executive Summary
Branxa is a developer productivity platform that preserves coding intent and execution context across sessions, branches, tools, and teammates through a CLI-first workflow, MCP server integration, and VS Code extension support.

## 2) Business Problem
- AI-assisted coding sessions lose working context between handoffs and interruptions.
- Teams repeat failed attempts because prior approaches and decisions are not persisted.
- Context continuity across CLI, IDE, and MCP agents is fragmented.

## 3) Business Objectives
1. Persist rich coding context per branch and session.
2. Enable seamless resume across AI tools.
3. Support collaboration and handoff workflows.
4. Provide automation for context capture and summarization.
5. Expose context capabilities through MCP and VS Code interfaces.

## 4) Success Metrics
- Resume quality: generated prompts contain task/state/next steps for active branch.
- Adoption: regular `save`/`resume` usage per active contributor.
- Continuity: reduced repeated work in handoff flows.
- Coverage: CLI, MCP, and extension commands behave consistently.
- Reliability: no context corruption in `.branxa` session/branch stores.

## 5) Stakeholders
- Individual developers using AI coding assistants.
- Engineering teams collaborating on shared branches.
- Tooling/platform owners integrating MCP and editor workflows.

## 6) In-Scope Capabilities
- CLI command surface (`init`, `save`, `resume`, `log`, `diff`, `handoff`, `share`, `watch`, `hook`, `summarize`, `suggest`, `compress`, `config`).
- Structured context persistence and retrieval from `.branxa`.
- Auto-extraction from supported editor/session artifacts.
- AI-assisted summary/suggestion/compression commands.
- MCP tools/resources for programmatic access.
- VS Code extension commands and startup auto-resume.

## 7) Out of Scope
- Hosted backend service or remote multi-tenant API.
- Real-time collaborative conflict resolution beyond git-based sharing.
- Cursor SQLite deep parsing in current release (explicitly not implemented).

## 8) Constraints
- Must run in git repositories.
- Must preserve independent implementation (no code copying).
- Must use local filesystem as source of truth for context data.

## 9) Business Requirements (BR)
- BR-1: Initialize and manage project-scoped context storage.
- BR-2: Capture structured context manually and programmatically.
- BR-3: Resume context as AI-ready prompt output.
- BR-4: Provide branch/all-branch history visibility and delta analysis.
- BR-5: Support teammate handoff and optional git sharing flows.
- BR-6: Support continuous capture via watch mode and git hooks.
- BR-7: Provide AI-generated summarize/suggest/compress capabilities.
- BR-8: Expose parity capabilities via MCP tools/resources.
- BR-9: Expose editor-integrated workflows via VS Code extension.
- BR-10: Provide explicit acceptance tests and release parity gate.

## 10) Sign-off Criteria
- BR-1..BR-10 map to PRD + backlog + traceability.
- Critical parity checklist rows pass.
- Final signoff artifact records GO/NO-GO with evidence.
