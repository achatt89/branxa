# handoff and share

## handoff

```bash
branxa handoff [assignee] [message]
```

- saves assignee + handoff note in a branch entry
- can prompt when values are omitted in interactive terminal

Example:

```bash
branxa handoff alice "Please complete test hardening and merge"
```

## share

```bash
branxa share
branxa share --stop
```

- `share`: removes managed `.branxa/` ignore lines and attempts commit
- `share --stop`: restores managed ignore lines

If auto-commit fails, fallback is manual `git add .gitignore` + commit.

## Key implementation

- `src/commands/handoff.ts`
- `src/commands/share.ts`
