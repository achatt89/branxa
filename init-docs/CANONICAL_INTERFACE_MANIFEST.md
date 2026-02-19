# Canonical Interface Manifest

Version: 1.0  
Date: 2026-02-19

Branding note: Product identity and interface namespace are Branxa.

## 1) CLI Commands
- `branxa init`
- `branxa save [message]`
  - `--goal`
  - `--auto`
  - `--approaches`
  - `--decisions`
  - `--state`
  - `--next-steps`
  - `--blockers`
- `branxa resume`
  - `--branch`
  - `--stdout`
- `branxa log`
  - `--all`
  - `--count`
- `branxa diff`
- `branxa handoff [assignee] [message]`
- `branxa share`
  - `--stop`
- `branxa watch`
  - `--interval`
- `branxa hook <action>`
- `branxa summarize`
- `branxa suggest`
- `branxa compress`
- `branxa config [action] [key] [value]`

## 2) MCP Tools
- `branxa_resume`
- `branxa_save`
- `branxa_log`

## 3) MCP Resources
- `branxa://context`

## 4) VS Code Extension Commands
- `branxa.save`
- `branxa.resume`
- `branxa.log`
- `branxa.diff`

## 5) Change Control
- Any interface addition/removal must update this file first.
- PRD, technical manifest, backlog, traceability, and parity checklist must remain consistent with this file.
