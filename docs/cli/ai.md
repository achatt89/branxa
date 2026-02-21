# summarize, suggest, compress

## summarize

```bash
branxa summarize
```

- builds prompt from branch/files/commits state
- expects strict JSON response payload
- raw-text fallback is persisted when JSON parsing fails

## suggest

```bash
branxa suggest
```

- returns 3 to 5 actionable suggestions
- includes fallback suggestions when AI output is not parseable
- if no context and no changes exist, returns explicit warning

## compress

```bash
branxa compress
```

- requires at least 3 branch entries
- rewrites history to `[compressed_summary, latest_original]`

## Key implementation

- `src/commands/summarize.ts`
- `src/commands/suggest.ts`
- `src/commands/compress.ts`
- `src/lib/ai.ts`
