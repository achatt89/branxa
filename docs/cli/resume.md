# resume

## Synopsis

```bash
branxa resume [options]
```

## Options

- `--branch <branch>`: resume context from another branch
- `--stdout`: print prompt to terminal

## Behavior

- default path attempts clipboard copy
- clipboard failure falls back to stdout
- no context returns a non-crashing warning result

## Examples

```bash
branxa resume --stdout
branxa resume --branch feature/auth --stdout
```

## Key implementation

- `src/commands/resume.ts`
- `src/lib/prompt.ts`
- `src/lib/clipboard.ts`
