# AGENTS.md

Version: 1.0  
Date: 2026-02-19

## Objective
Execute one-shot parity implementation with clear agent scope boundaries and evidence-based gates.

## Source of Truth
1. BRD_MANIFEST.md
2. PRD_MANIFEST.md
3. TECHNICAL_MANIFEST.json
4. CANONICAL_INTERFACE_MANIFEST.md
5. IMPLEMENTATION_BACKLOG_MANIFEST.md
6. FR_TRACEABILITY_MATRIX.md
7. PARITY_AUDIT_CHECKLIST.md
8. ONE_SHOT_AGENT_PROMPT_PACK.md
9. ONE_SHOT_AGENT_WORKFLOW.json
10. FINAL_SIGNOFF_TEMPLATE.json

## Agent Topology
- A0 Coordinator: sequencing, merge control, release decision.
- A1 CLI Core: init/save/resume/log/diff/config.
- A2 Collaboration: handoff/share/watch/hook.
- A3 AI Features: summarize/suggest/compress + provider integration.
- A4 Parser: Claude/Antigravity/Cursor extraction pipeline.
- A5 MCP + VS Code: adapter parity and interface contracts.
- A6 QA Gate: traceability, parity checklist, signoff package.

## Rules
1. Each agent edits only assigned scope files.
2. Shared files require coordinator lock.
3. No task closes without test evidence.
4. Critical parity failures block GO.

## Required Runtime Artifacts
- EXECUTION_LOG.md
- TEST_EVIDENCE.md
- PARITY_AUDIT_RESULT.md
- FINAL_SIGNOFF.json
