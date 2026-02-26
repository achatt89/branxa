# Architecture

Branxa is built with a modular, CLI-first architecture designed for speed, local data sovereignty, and AI tool interoperability. It operates as a "Context Engine" that sits between your Git history and your AI workflow.

## 1. Design Philosophy

- **Local First**: All context is stored in `.branxa/` locally. No cloud dependency.
- **Branch-Aware**: Context is isolated per Git branch. switching branches automatically switches the active context store.
- **Append-Only History**: Context is stored as a timeline of entries, allowing you to trace the evolution of decisions and state.
- **AI-Native Output**: Every command is optimized to produce high-fidelity prompts for Large Language Models (LLMs).

## 2. System Layers

### Interface Layer (`src/index.ts`, `src/cli.ts`)
The entry point that handles command-line arguments, interactive prompts (TTY detection), and output formatting (Clipboard vs. Stdout).

### Command Layer (`src/commands/`)
Independent modules for each command (`save`, `resume`, `handoff`, etc.). Commands are designed to be deterministic—given a Git state and user input, the produced context entry should be consistent.

### Extraction Pipeline (`src/lib/git.ts`, `src/parsers/`)
This is the core "Sensor" of the engine.
- **Git Probe**: Captures branch name, staged/unstaged file lists, and recent commit titles.
- **Parser Pipeline**: Can automatically extract context from other tool files (like Cursor shadow files or Antigravity task logs) to enrich the Branxa payload without manual typing.

### Intelligence Engine (`src/lib/ai.ts`)
A provider-agnostic bridge to LLMs. It handles prompt engineering for sub-commands like `suggest` and `summarize`, ensuring they receive the full historical timeline for better reasoning.

### Persistence Layer (`src/lib/context-store.ts`)
Manages the `.branxa` filesystem. It handles:
- Branxa directory initialization (`init`).
- Thread-safe appending to branch JSON files.
- Configuration loading and merging (Global vs. Local).

---

## 3. Data Flow: The `save` Lifecycle

1. **Trigger**: User runs `branxa save [message]`.
2. **Environment Discovery**: Branxa identifies the repo root and ensures it's initialized.
3. **Implicit Extraction**:
    - Git state is queried (staged/unstaged files).
    - Commit history is fetched (default: last 5).
4. **Interactive Enrichment**: If running in a TTY and fields are missing, the user is prompted for goal, state, etc.
5. **Payload Construction**: All data is merged into a single JSON entry with a unique UUID and UTC timestamp.
6. **Storage**: The entry is appended to `.branxa/branches/<branch>.json`.

---

## 4. The Context Resume Flow

The `resume` command is the primary "Reader". It doesn't just print the latest entry; it **synthesizes** the prompt:

1. **Load Latest**: Reads the most recent entry for the current branch.
2. **Drift-Detection**: Compares the files changed in the entry with the files *currently* changed in Git.
3. **Synthesis**:
    - If the handoff flag is present, it prioritizes the handoff note and assignee.
    - It formats the JSON into a human-readable (and AI-optimized) markdown prompt.
    - Injects instructions for the AI assistant (e.g., "Act as a pair programmer...").

---

## 5. Directory Structure

```text
.branxa/
├── config.json            # Local repository settings
├── global_config.json     # User-level settings
├── branches/              # Context history per-branch
│   ├── main.json
│   └── feature-auth.json
└── hooks/                 # Branxa-managed Git hooks
```

## 6. Component Map

| Path | Responsibility |
|------|----------------|
| `src/commands` | Implementation of all 12 CLI commands. |
| `src/lib/ai.ts` | AI provider integration (OpenAI/Ax-LLM). |
| `src/lib/git.ts` | Git state discovery and delta tracking. |
| `src/parsers` | Logic for auto-extracting context from other tools. |
| `src/mcp` | Model Context Protocol server (JSON-RPC over StdIn). |
| `src/vscode` | Bridge constants for VS Code extension parity. |
| `tests` | End-to-end, parity, and unit tests. |

## 7. Extensibility

Branxa is designed to be easily extended with new:
- **Parsers**: To support context extraction from new coding tools.
- **AI Providers**: By adding new adapters in `src/lib/ai.ts`.
- **Adapters**: New interface layers like the MCP server.