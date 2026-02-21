# Parser Pipeline

## Priority order

1. Claude sources
2. Antigravity sources
3. Cursor fallback

## Claude extraction

Reads from memory JSON and JSONL candidates and attempts structured tag extraction.

## Antigravity extraction

Reads `task.md`, `implementation_plan.md`, and `walkthrough.md` for tagged values and bullets.

## Cursor extraction

Current behavior is conservative: detect known paths and return `null` (no SQLite parsing).

## Key implementation

- `src/parsers/index.ts`
- `src/parsers/claude.ts`
- `src/parsers/antigravity.ts`
- `src/parsers/cursor.ts`
- `src/parsers/shared.ts`
