# VS Code Bridge

## Exposed command IDs

- `branxa.save`
- `branxa.resume`
- `branxa.log`
- `branxa.diff`

## Behavior

- executes CLI via `npx branxa <command>`
- forwards stdout/stderr to output channel
- supports startup auto-resume (`resume --stdout`)
- provides status text from latest context timestamp

## Key implementation

- `src/vscode/bridge.ts`
