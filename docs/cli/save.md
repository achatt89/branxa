# save

## Synopsis

```bash
branxa save [message] [options]
```

## Options

- `--goal <value>`: higher-level objective
- `--auto`: attempt parser-based context extraction
- `--approaches <value>`: `;;` separated approaches
- `--decisions <value>`: `;;` separated decisions
- `--state <value>`: current state text
- `--next-steps <value>`: `;;` separated actions
- `--blockers <value>`: `;;` separated blockers

## Example

```bash
branxa save "Finalize migration" \
  --goal "Ship v1 migration" \
  --auto \
  --approaches "incremental rollout;;shadow writes" \
  --decisions "keep old write path for rollback" \
  --state "validation complete; prod rollout pending" \
  --next-steps "run canary;;announce release" \
  --blockers "none"
```

## Notes

- if required fields are missing and TTY is available, prompts are used
- when `--auto` yields no context, manual flow continues
- Git metadata capture depends on config key `autoGitCapture`

## Key implementation

- `src/commands/save.ts`
- `src/lib/auto-extract.ts`
- `src/parsers/*`
