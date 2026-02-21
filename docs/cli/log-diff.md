# log and diff

## log

```bash
branxa log [--all] [--count <n>]
```

- `--all`: aggregate all branch histories
- `--count`: clamp to `[1..100]`, defaults to config key `defaultLogCount`

## diff

```bash
branxa diff
```

Reports:

- new files since last saved entry
- still-changed files
- resolved files
- decision and next-step progression vs previous entry

## Key implementation

- `src/commands/log.ts`
- `src/commands/diff.ts`
