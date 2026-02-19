# Parity Audit Checklist (Release Gate)

Version: 1.0  
Date: 2026-02-19

## 1) Governance Gate (Critical)
- [ ] BRD, PRD, Technical, Backlog, and Traceability manifests exist and align.
- [ ] Every FR row has at least one mapped acceptance test.

## 2) CLI Command Contract Gate (Critical)
- [ ] `init` parity verified.
- [ ] `save` parity verified across interactive/structured/auto modes.
- [ ] `resume` parity verified for stdout/clipboard paths.
- [ ] `log` parity verified for branch/all views.
- [ ] `diff` parity verified for delta categories.
- [ ] `handoff`, `share`, `watch`, `hook` parity verified.
- [ ] `summarize`, `suggest`, `compress`, `config` parity verified.

## 3) Persistence/Data Gate (Critical)
- [ ] `.branxa` layout and file semantics match contracts.
- [ ] branch and session files remain readable and appendable.
- [ ] merge/dedupe/sync behavior validated.

## 4) Parser and Auto-Extraction Gate (Critical)
- [ ] Claude extraction contract passes fixtures.
- [ ] Antigravity extraction contract passes fixtures.
- [ ] Cursor fallback path is safe and non-crashing.

## 5) AI Integration Gate (Critical)
- [ ] OpenAI-compatible API call contract validated.
- [ ] missing key/provider error behavior validated.
- [ ] summarize/suggest/compress command outputs validated.

## 6) MCP Gate (Critical)
- [ ] MCP server starts with stdio transport.
- [ ] tools (`branxa_resume`, `branxa_save`, `branxa_log`) validated.
- [ ] resource (`branxa://context`) validated.

## 7) VS Code Extension Gate
- [ ] extension commands execute CLI bridge in workspace.
- [ ] startup auto-resume behavior validated.
- [ ] status bar state updates validated.

## 8) Reliability/Safety Gate
- [ ] uninitialized repo handling validated across commands.
- [ ] non-git repo error handling validated.
- [ ] clipboard headless fallback validated.

## 9) Final Decision
- [ ] All critical rows PASS, or BLOCKED with approved waiver + remediation plan.
