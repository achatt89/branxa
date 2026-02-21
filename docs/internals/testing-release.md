# Testing and Release Gate

## Test strategy

- command contract tests
- parser extraction tests
- config/persistence integrity tests
- MCP and VS Code adapter tests
- release gate inventory and end-to-end flow tests

Run all tests:

```bash
npm test
```

## Release gate artifacts

- `init-docs/PARITY_AUDIT_CHECKLIST.md`
- `init-docs/PARITY_AUDIT_RESULT.md`
- `init-docs/TEST_EVIDENCE.md`
- `init-docs/FINAL_SIGNOFF.json`

## Recommended pre-release checks

```bash
npm run build
npm test
npm pack --dry-run
```
