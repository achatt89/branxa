# init

## Synopsis

```bash
branxa init
```

## Behavior

- requires current directory to be a Git repository
- creates `.branxa/config.json`
- creates `.branxa/sessions/` and `.branxa/branches/`
- appends a managed ignore block for `.branxa/`
- idempotent: second run returns already-initialized message

## Key implementation

- `src/commands/init.ts`
- `src/lib/gitignore.ts`
