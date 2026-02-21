# Getting Started

## Clone and bootstrap

```bash
git clone <repo-url>
cd branxa
npm install
npm run build
npm test
```

## Run CLI in development

```bash
npm run dev -- --help
npm run dev -- init
npm run dev -- save "Initial context" --state "bootstrapped"
npm run dev -- resume --stdout
```

## Run built binaries

```bash
node dist/index.js --help
node dist/index.js log --count 5
node dist/mcp/index.js
```

## Key folders

- `src/commands`: command implementations
- `src/lib`: core shared modules
- `src/parsers`: auto-extraction pipeline
- `src/mcp`: MCP contracts and server transport
- `src/vscode`: VS Code integration bridge helpers
- `tests`: parity and contract tests
