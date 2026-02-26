# CLI Overview

The Branxa CLI is designed to be a high-fidelity capture system for coding context. It follows a "Capture Once, Resume Everywhere" philosophy.

## Command Groups

### 1. Project Setup
| Command | Description |
|---------|-------------|
| `init` | Prepares the `.branxa` context store and configures `.gitignore`. |
| `config` | Manages project or global settings (AI providers, API keys, etc.). |

### 2. Context Capture
| Command | Description |
|---------|-------------|
| `save [message]` | The primary command for capturing current state. Supports flags for goal, state, etc. |
| `watch` | Runs a foreground process that auto-captures context on file/git changes. |
| `hook install` | Integrates Branxa into your Git lifecycle (pre-commit, post-checkout). |

### 3. Context Retrieval
| Command | Description |
|---------|-------------|
| `resume` | Generates a structured prompt from the latest context. Defaults to clipboard output. |
| `log` | Lists historical context entries with their timestamps and state summaries. |
| `diff` | Compares the current repository state with the latest saved context identifying "drift". |

### 4. Collaboration
| Command | Description |
|---------|-------------|
| `handoff [user]` | Specifically tags an entry for a teammate, carrying forward all active context. |
| `share` | Toggles whether the `.branxa` directory is ignored or tracked by Git. |

### 5. Intelligence (AI-Powered)
| Command | Description |
|---------|-------------|
| `summarize` | USes your configured AI to distill recent activity into a brief report. |
| `suggest` | Predicts and recommends next technical steps based on current state and goals. |
| `compress` | Condenses a large branch history into a few critical milestone entries. |

---

## Global Options

The CLI supports standard flags across multiple commands:

- `-h, --help`: Show help for any command.
- `-V, --version`: Show version number (`0.1.0`).
- `--cwd <path>`: Run the command in a different directory.

## Common Command Flags

Many context-manipulation commands (`save`, `resume`, `handoff`) share specific flags:

- `--stdout`: Print output to the terminal instead of copying to clipboard.
- `--goal <text>`: Set the high-level objective.
- `--state <text>`: Describe the current technical status.
- `--next-steps <text>`: List planned actions (separate with `;;`).
- `--approaches <text>`: List strategies considered.
- `--decisions <text>`: Record key architectural choices.
- `--blockers <text>`: List current showstoppers.

## Interactive Behavior

Branxa is optimized for both **Human** and **Agent** (AI) usage:

- **Interactive (TTY)**: When arguments are missing, Branxa will prompt you using an interactive readline session.
- **Non-Interactive (Scripts)**: In headless environments, Branxa skips prompts and relies on command-line arguments. If required arguments are missing, the command will fail clearly.

## Data Persistence

Context is stored as JSON in `.branxa/branches/<branch-name>.json`. This ensures that context is branch-specific, allowing you to switch workstreams without mixing state.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error (missing config, file system error) |
| `2` | CLI usage error (missing required arguments) |
| `130` | User cancelled (Ctrl+C in interactive mode) |