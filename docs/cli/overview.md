# CLI Overview

## Binary names

- `branxa`
- `branxa-mcp`

## Command groups

- core lifecycle: `init`, `save`, `resume`, `log`, `diff`
- collaboration: `handoff`, `share`
- automation: `watch`, `hook`
- AI workflows: `summarize`, `suggest`, `compress`
- settings: `config`

## Design rules

- commands must be deterministic and scriptable
- non-fatal fallback paths should be explicit in output
- command behavior must align with parity tests
