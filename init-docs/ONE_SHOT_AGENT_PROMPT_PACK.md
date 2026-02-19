# One-Shot Agentic Development Prompt Pack

Version: 1.0  
Date: 2026-02-19

## Master Prompt
Implement this project end-to-end using these files as source of truth:
- BRD_MANIFEST.md
- PRD_MANIFEST.md
- TECHNICAL_MANIFEST.json
- CANONICAL_INTERFACE_MANIFEST.md
- IMPLEMENTATION_BACKLOG_MANIFEST.md
- FR_TRACEABILITY_MATRIX.md
- PARITY_AUDIT_CHECKLIST.md
- ONE_SHOT_AGENT_WORKFLOW.json
- AGENTS.md

Constraints:
1. Do not copy source code from reference implementation.
2. Implement behavior parity only.
3. Do not skip non-core interfaces (CLI + MCP + VS Code).
4. Maintain execution artifacts continuously.
5. Treat critical checklist failures as release blockers.

Required artifacts during execution:
- EXECUTION_LOG.md
- TEST_EVIDENCE.md
- PARITY_AUDIT_RESULT.md
- FINAL_SIGNOFF.json

Failure policy:
- Diagnose and patch root cause.
- Re-run failing tests.
- Retry max 3 times per blocker.
- If still blocked, mark BLOCKED with evidence and continue independent tasks.

Completion criteria:
- All FR rows have passing tests.
- All critical parity checks are PASS (or explicitly BLOCKED with approved waiver metadata).
- FINAL_SIGNOFF.json reflects GO/NO-GO accurately.
