# config

## Synopsis

```bash
branxa config [action] [key] [value]
```

## Actions

- `list` (default)
- `get <key>`
- `set <key> <value>`

## Supported keys

- `defaultOutput`
- `autoGitCapture`
- `recentCommitCount`
- `defaultLogCount`
- `watchInterval`
- `autoHook`
- `aiProvider`
- `aiModel`
- `aiApiKey`

## Validation rules

- unknown keys are rejected
- numeric fields are coerced to positive integers
- boolean fields accept true/false style values
- `aiApiKey` is masked when shown in list output

## Example

```bash
branxa config list
branxa config get aiModel
branxa config set watchInterval 60
branxa config set autoGitCapture false
```

## Key implementation

- `src/commands/config.ts`
- `src/lib/config.ts`
