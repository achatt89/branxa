# FR Traceability Matrix

Version: 1.0  
Date: 2026-02-19

| PRD FR | Requirement Summary | Backlog Mapping | TECH Mapping | Primary Acceptance Tests |
|---|---|---|---|---|
| FR-1 | Init and directory bootstrap | E1-T2 | `dataModel.paths` | init contract tests |
| FR-2 | Save multi-mode capture | E2-T1 | `interfaceContracts.cli`, `dataModel.contextEntryFields` | save mode tests |
| FR-3 | Resume prompt generation | E2-T2 | `interfaceContracts.cli` | resume stdout/clipboard tests |
| FR-4 | Log history views | E2-T3 | `interfaceContracts.cli` | log all/branch tests |
| FR-5 | Diff progression analysis | E2-T3 | `interfaceContracts.cli` | diff delta tests |
| FR-6 | Handoff capture | E3-T1 | `dataModel.contextEntryFields` | handoff tests |
| FR-7 | Share toggle + commit | E3-T2 | `interfaceContracts.cli` | share/stop tests |
| FR-8 | Watch auto-capture | E3-T3 | `configurationContract.userConfigKeys` | watch interval tests |
| FR-9 | Hook management | E3-T3 | `interfaceContracts.cli` | hook install/remove tests |
| FR-10 | AI summarize | E4-T1 | `aiIntegration.commandsUsingAI` | summarize tests |
| FR-11 | AI suggest | E4-T2 | `aiIntegration.commandsUsingAI` | suggest tests |
| FR-12 | Context compression | E4-T3 | `aiIntegration.commandsUsingAI` | compress tests |
| FR-13 | Config list/get/set | E8-T1 | `configurationContract` | config tests |
| FR-14 | MCP parity tools/resources | E6-T1, E6-T2 | `interfaceContracts.mcp` | mcp contract tests |
| FR-15 | VS Code extension parity | E7-T1, E7-T2 | `interfaceContracts.vscode` | extension bridge tests |
| FR-16 | Context merge/sync integrity | E8-T2 | `dataModel.mergeBehavior` | merge/sync tests |
| FR-17 | Parser source pipeline | E5-T1, E5-T2, E5-T3 | `parserPipeline` | parser tests |
| FR-18 | AI provider override/env behavior | E4-T1, E8-T1 | `aiIntegration.envOverrides` | ai config tests |
