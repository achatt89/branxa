# Parity Audit Checklist (Release Gate)

Version: 1.0  
Date: 2026-02-19

## 1) Governance Gate (Critical)
- [x] BRD, PRD, Technical, Backlog, and Traceability manifests exist and align.
- [x] Every FR row has at least one mapped acceptance test.

## 2) CLI Command Contract Gate (Critical)
- [x] `init` parity verified.
- [x] `save` parity verified across interactive/structured/auto modes.
- [x] `resume` parity verified for stdout/clipboard paths.
- [x] `log` parity verified for branch/all views.
- [x] `diff` parity verified for delta categories.
- [x] `handoff`, `share`, `watch`, `hook` parity verified.
- [x] `summarize`, `suggest`, `compress`, `config` parity verified.

## 3) Persistence/Data Gate (Critical)
- [x] `.branxa` layout and file semantics match contracts.
- [x] branch and session files remain readable and appendable.
- [x] merge/dedupe/sync behavior validated.

## 4) Parser and Auto-Extraction Gate (Critical)
- [x] Claude extraction contract passes fixtures.
- [x] Antigravity extraction contract passes fixtures.
- [x] Cursor fallback path is safe and non-crashing.

## 5) AI Integration Gate (Critical)
- [x] OpenAI-compatible API call contract validated.
- [x] missing key/provider error behavior validated.
- [x] summarize/suggest/compress command outputs validated.

## 6) MCP Gate (Critical)
- [x] MCP server starts with stdio transport.
- [x] tools (`branxa_resume`, `branxa_save`, `branxa_log`) validated.
- [x] resource (`branxa://context`) validated.

## 7) VS Code Extension Gate
- [x] extension commands execute CLI bridge in workspace.
- [x] startup auto-resume behavior validated.
- [x] status bar state updates validated.

## 8) Reliability/Safety Gate
- [x] uninitialized repo handling validated across commands.
- [x] non-git repo error handling validated.
- [x] clipboard headless fallback validated.

## 9) Final Decision
- [x] All critical rows PASS, or BLOCKED with approved waiver + remediation plan.
