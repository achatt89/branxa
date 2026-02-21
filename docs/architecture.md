# Architecture

Branxa follows a CLI-first, local-storage architecture.

## Layers

1. command layer (`src/commands`)
2. persistence layer (`src/lib/context-store.ts`)
3. git introspection layer (`src/lib/git.ts`)
4. AI provider layer (`src/lib/ai.ts`)
5. parser pipeline (`src/parsers`)
6. adapters (`src/mcp`, `src/vscode`)

## Runtime flow (typical command)

1. validate Git repository
2. validate Branxa initialization
3. load config and gather Git context
4. execute command-specific logic
5. persist entry and/or print output

## Interface contracts

- CLI command surface is defined in `src/cli.ts`
- MCP tools/resources contracts are defined in `src/mcp/contracts.ts`
- VS Code command constants/bridge are in `src/vscode/bridge.ts`
