# Branxa

Branxa is a Git-aware CLI that captures, resumes, and shares coding context across branches, sessions, teammates, and AI tools.

It is designed for local-first workflows and stores context in your repository under `.branxa/`.

## Table of contents

- [Why Branxa](#why-branxa)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Command reference](#command-reference)
- [Option-by-option guide](#option-by-option-guide)
- [Configuration](#configuration)
- [AI integration](#ai-integration)
- [Auto extraction (`save --auto`)](#auto-extraction-save---auto)
- [Storage model](#storage-model)
- [MCP server](#mcp-server)
- [VS Code integration](#vs-code-integration)
- [Team workflows](#team-workflows)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Developer docs site](#developer-docs-site)
- [Publishing to npm](#publishing-to-npm)
- [Privacy and security notes](#privacy-and-security-notes)

## Why Branxa

Branxa helps you avoid lost context when:

- switching branches
- handing work to teammates
- resuming work with an AI coding assistant
- returning to a task after interruptions

It keeps a structured history of task intent, state, decisions, next steps, blockers, and Git signals.

## Features

- **Core context lifecycle:** `init`, `save`, `resume`, `log`, `diff`
- **Team flows:** `handoff`, `share`
- **Automation:** `watch`, `hook`
- **AI features:** `summarize`, `suggest`
- **History management:** `compress`
- **Configuration:** `config list/get/set`
- **Adapters:** MCP (`branxa-mcp`) and VS Code bridge helpers
- **Auto extraction pipeline:** Claude -> Antigravity -> Cursor fallback

## Requirements

- Node.js `>= 20`
- Git repository (all runtime commands require a Git work tree)
- Optional for AI commands:
  - an OpenAI-compatible provider endpoint
  - API key
- Optional for clipboard resume output:
  - macOS: `pbcopy`
  - Windows: `clip`
  - Linux: `wl-copy` or `xclip`

## Installation

### Install from npm (global)

```bash
npm install -g branxa
```

Then run:

```bash
branxa --help
```

### Run without global install

```bash
npx branxa@latest --help
```

### Local development install

```bash
git clone <your-repo-url>
cd branxa
npm install
npm run build
node dist/index.js --help
```

## Quick start

From any Git repository:

```bash
# 1) Initialize storage
branxa init

# 2) Save context
branxa save "Implement auth middleware" \
  --goal "Ship auth for API v2" \
  --approaches "middleware layer;;route guards" \
  --decisions "use signed cookies" \
  --state "token verification added; integration tests pending" \
  --next-steps "add edge-case tests;;document rollout" \
  --blockers "none"

# 3) Resume context as prompt text
branxa resume --stdout

# 4) Inspect recent entries
branxa log --count 5

# 5) Compare current changes vs latest saved context
branxa diff
```

For a full explanation of every option shown above (for example `--goal`, `--auto`, and `--next-steps`), see the [Option-by-option guide](#option-by-option-guide).

## Command reference

Each command section below includes usage examples. For option semantics and edge-case behavior, use the [Option-by-option guide](#option-by-option-guide).

### `branxa init`

Initialize `.branxa/` in the current repository:

```bash
branxa init
```

Creates:

- `.branxa/config.json`
- `.branxa/sessions/`
- `.branxa/branches/`

Also appends a managed ignore block to `.gitignore`:

```gitignore
# Branxa (managed)
.branxa/
```

---

### `branxa save [message]`

Save context for the current branch.

```bash
branxa save "Fix flaky integration test" [options]
```

Options:

- `--goal <value>`
- `--auto` (attempt auto extraction from local assistant artifacts)
- `--approaches <value>` (`;;` separated)
- `--decisions <value>` (`;;` separated)
- `--state <value>`
- `--next-steps <value>` (`;;` separated)
- `--blockers <value>` (`;;` separated)

Notes:

- If required fields are missing and running in a TTY, Branxa prompts interactively.
- If `--auto` fails or finds no context, Branxa falls back to manual values.
- Git metadata is captured when `autoGitCapture=true`.

---

### `branxa resume`

Generate a resume prompt from latest context.

```bash
branxa resume [options]
```

Options:

- `--branch <value>` (resume another branch)
- `--stdout` (print prompt directly)

Default behavior tries clipboard output first; if clipboard is unavailable, it falls back to stdout.

---

### `branxa log`

Show recent context history.

```bash
branxa log [options]
```

Options:

- `--all` (aggregate all branch histories)
- `--count <value>` (bounded to 1..100)

---

### `branxa diff`

Show what changed since latest saved context:

- new files
- still-changed files
- resolved files
- decision and next-step progression between latest and previous entries

```bash
branxa diff
```

---

### `branxa handoff [assignee] [message]`

Save teammate handoff context.

```bash
branxa handoff alice "Please finish migration and ship"
```

If missing args and running in TTY, Branxa prompts for assignee and note.

---

### `branxa share`

Enable sharing `.branxa/` in Git by removing managed ignore lines and attempting an automatic commit for `.gitignore`.

```bash
branxa share
```

Disable sharing (restore ignore):

```bash
branxa share --stop
```

---

### `branxa watch`

Polls Git changes and auto-saves on change signature updates.

```bash
branxa watch --interval 30
```

Option:

- `--interval <value>` seconds (minimum 1; defaults to config `watchInterval`)

Stop with `Ctrl+C`.

---

### `branxa hook <action>`

Manage Branxa-managed `post-commit` hook block.

```bash
branxa hook install
branxa hook remove
```

The installed block runs:

```bash
branxa save "Auto-save after commit" --state "post-commit hook snapshot"
```

---

### `branxa summarize`

Use AI to generate and save structured context from current repo state.

```bash
branxa summarize
```

Prompt input includes:

- current branch
- changed files
- staged files
- recent commits

Expected AI output is JSON with keys:

- `task`
- `goal`
- `approaches`
- `decisions`
- `currentState`
- `nextSteps`
- `blockers`

If JSON parsing fails, Branxa stores a raw-text fallback summary.

---

### `branxa suggest`

Use AI to suggest 3-5 next actions.

```bash
branxa suggest
```

If there is no saved context and no current repo changes, Branxa returns a no-context warning.

---

### `branxa compress`

Compress branch history to keep context concise.

```bash
branxa compress
```

Behavior:

- requires at least 3 entries on current branch
- rewrites branch history to exactly two entries:
  - a synthetic compressed summary entry
  - latest original entry

---

### `branxa config [action] [key] [value]`

Manage configuration.

```bash
branxa config list
branxa config get aiModel
branxa config set recentCommitCount 10
branxa config set autoGitCapture false
```

Actions:

- `list` (default)
- `get`
- `set`

Unknown keys are rejected. `aiApiKey` is masked in output.

## Option-by-option guide

This section explains every command option and argument with concrete examples.

### `save` options

#### `--goal <value>`

Stores the higher-level objective for the task entry.

```bash
branxa save "Implement checkout retries" --goal "Increase payment success rate"
```

#### `--auto`

Attempts to prefill context from local assistant artifacts (Claude/Antigravity/Cursor pipeline), then falls back to manual values when needed.

```bash
branxa save --auto --state "validated extracted summary"
```

You can combine `--auto` with manual overrides. Manual values win for fields you pass explicitly.

```bash
branxa save --auto --goal "Ship parser parity" --next-steps "run tests;;open PR"
```

#### `--approaches <value>`

Stores approaches tried. Use `;;` to provide multiple values.

```bash
branxa save "Refactor cache layer" --approaches "LRU memoization;;request-level caching"
```

#### `--decisions <value>`

Stores key decisions made. Use `;;` to provide multiple values.

```bash
branxa save "Refactor cache layer" --decisions "keep Redis TTL at 60s;;no cache for admin endpoints"
```

#### `--state <value>`

Stores current implementation state (where you left off).

```bash
branxa save "Refactor cache layer" --state "cache invalidation wired; load-test still pending"
```

#### `--next-steps <value>`

Stores upcoming actions. Use `;;` to provide multiple values.

```bash
branxa save "Refactor cache layer" --next-steps "run load test;;update docs;;prepare rollout note"
```

#### `--blockers <value>`

Stores blockers. Use `;;` to provide multiple values.

```bash
branxa save "Refactor cache layer" --blockers "staging Redis access missing;;waiting for infra approval"
```

---

### `resume` options

#### `--branch <value>`

Resume context from a specific branch instead of current branch.

```bash
branxa resume --branch feature/checkout-retries --stdout
```

#### `--stdout`

Print the resume prompt directly to terminal.

```bash
branxa resume --stdout
```

Without `--stdout`, Branxa attempts clipboard output first.

---

### `log` options

#### `--all`

Show merged history across all branches.

```bash
branxa log --all --count 20
```

#### `--count <value>`

Limit number of entries returned (bounded 1..100).

```bash
branxa log --count 5
```

If omitted, Branxa uses `defaultLogCount` from config.

---

### `share` options

#### `--stop`

Stop sharing `.branxa/` by restoring managed ignore lines in `.gitignore`.

```bash
branxa share --stop
```

---

### `watch` options

#### `--interval <value>`

Polling interval in seconds for change detection. Minimum is `1`.

```bash
branxa watch --interval 15
```

If omitted, Branxa uses `watchInterval` from config.

---

### `hook` action argument

`hook` uses an action argument instead of `--flags`.

#### `install`

Install Branxa-managed `post-commit` hook block.

```bash
branxa hook install
```

#### `remove`

Remove only Branxa-managed hook lines and keep unrelated custom hook lines.

```bash
branxa hook remove
```

---

### `config` arguments

`config` uses positional arguments: `[action] [key] [value]`.

#### `list`

Show full config (with masked `aiApiKey`).

```bash
branxa config list
```

#### `get <key>`

Get one key value.

```bash
branxa config get recentCommitCount
```

#### `set <key> <value>`

Set one key value (with type coercion/validation rules).

```bash
branxa config set autoGitCapture false
branxa config set recentCommitCount 12
branxa config set aiModel gpt-4o-mini
```

### Option matrix (quick lookup)

| Command | Option / Arg | Type | Meaning | Example |
| --- | --- | --- | --- | --- |
| `save` | `--goal` | string | high-level objective | `branxa save "task" --goal "ship v1"` |
| `save` | `--auto` | boolean | auto-extract context | `branxa save --auto --state "validated"` |
| `save` | `--approaches` | string (`;;`) | approaches attempted | `branxa save "task" --approaches "a1;;a2"` |
| `save` | `--decisions` | string (`;;`) | key decisions | `branxa save "task" --decisions "d1;;d2"` |
| `save` | `--state` | string | current state | `branxa save "task" --state "wip"` |
| `save` | `--next-steps` | string (`;;`) | follow-up actions | `branxa save "task" --next-steps "n1;;n2"` |
| `save` | `--blockers` | string (`;;`) | current blockers | `branxa save "task" --blockers "b1;;b2"` |
| `resume` | `--branch` | string | target branch | `branxa resume --branch main --stdout` |
| `resume` | `--stdout` | boolean | print prompt | `branxa resume --stdout` |
| `log` | `--all` | boolean | include all branches | `branxa log --all` |
| `log` | `--count` | number | max entries (1..100) | `branxa log --count 10` |
| `share` | `--stop` | boolean | stop sharing `.branxa/` | `branxa share --stop` |
| `watch` | `--interval` | number | polling seconds | `branxa watch --interval 30` |
| `hook` | `install` | arg | install managed hook | `branxa hook install` |
| `hook` | `remove` | arg | remove managed hook | `branxa hook remove` |
| `config` | `list` | arg | list config keys | `branxa config list` |
| `config` | `get <key>` | args | read one key | `branxa config get aiModel` |
| `config` | `set <k> <v>` | args | update one key | `branxa config set watchInterval 60` |

## Configuration

Config file path: `.branxa/config.json`

Default values:

```json
{
  "defaultOutput": "clipboard",
  "autoGitCapture": true,
  "recentCommitCount": 5,
  "defaultLogCount": 10,
  "watchInterval": 120,
  "autoHook": false,
  "aiProvider": "https://api.openai.com/v1",
  "aiModel": "gpt-4o-mini",
  "aiApiKey": ""
}
```

Key details:

- `defaultOutput`: compatibility key for output preference storage
- `autoGitCapture`: include changed/staged files and recent commits in entries
- `recentCommitCount`: max commits attached to entry snapshots
- `defaultLogCount`: default `log` count when omitted
- `watchInterval`: default polling interval (seconds) for `watch`
- `autoHook`: compatibility flag for hook automation flows
- `aiProvider`, `aiModel`, `aiApiKey`: AI command settings

## AI integration

Branxa uses an OpenAI-compatible `POST /chat/completions` API contract.

Environment variable overrides:

- `BRANXA_AI_PROVIDER`
- `BRANXA_AI_MODEL`
- `BRANXA_AI_KEY`

Precedence:

1. environment variables
2. `.branxa/config.json`

Example:

```bash
export BRANXA_AI_PROVIDER="https://api.openai.com/v1"
export BRANXA_AI_MODEL="gpt-4o-mini"
export BRANXA_AI_KEY="sk-..."
branxa summarize
```

## Auto extraction (`save --auto`)

Source priority:

1. Claude artifacts
2. Antigravity artifacts
3. Cursor presence fallback (currently returns no parsed context)

Claude candidates:

- `.claude/branxa-memory.json`
- `.claude/memory.json`
- `.claude/session.jsonl`
- `.claude/sessions/latest.jsonl`

Antigravity candidates:

- `.antigravity/task.md` (or `antigravity/task.md`)
- `.antigravity/implementation_plan.md` (or `antigravity/implementation_plan.md`)
- `.antigravity/walkthrough.md` (or `antigravity/walkthrough.md`)

Tagged line patterns include keys such as:

- `Task:`
- `Goal:`
- `Approach:`
- `Decision:`
- `Current State:`
- `Next Step:`
- `Blocker:`

## Storage model

Branxa stores local data under `.branxa/`:

```text
.branxa/
  config.json
  branches/
    <url-encoded-branch>.json
  sessions/
    <entry-id>.json
```

Each branch file stores an array of context entries.

Example entry:

```json
{
  "id": "3b6ee836-bf1a-4f66-8867-d3f5d147f5bb",
  "timestamp": "2026-02-21T10:10:10.000Z",
  "branch": "feature/auth",
  "repo": "my-repo",
  "author": "Abhijit",
  "task": "Implement auth middleware",
  "goal": "Ship auth for API v2",
  "approaches": ["middleware layer", "route guards"],
  "decisions": ["use signed cookies"],
  "currentState": "token verification added; integration tests pending",
  "nextSteps": ["add edge-case tests", "document rollout"],
  "blockers": [],
  "filesChanged": ["src/auth.ts"],
  "filesStaged": ["src/auth.ts"],
  "recentCommits": ["abc1234 add auth scaffold"],
  "assignee": "alice",
  "handoffNote": "Please finish migration and ship"
}
```

## MCP server

Binary: `branxa-mcp`  
Transport: line-delimited JSON over stdio

Start:

```bash
branxa-mcp
# or in local source checkout:
npm run mcp
```

Supported tools:

- `branxa_resume`
- `branxa_save`
- `branxa_log`

Supported resource:

- `branxa://context`

### Tool request example

```json
{"id":"1","kind":"tool","tool":"branxa_resume","args":{"branch":"main"}}
```

### Tool response example

```json
{"id":"1","content":[{"type":"text","text":"Branch: main\nTask: ..."}]}
```

### Resource request example

```json
{"id":"2","kind":"resource","uri":"branxa://context"}
```

### Resource response example

```json
{"id":"2","resource":{"uri":"branxa://context","text":"Branch: main\nTask: ..."}}
```

## VS Code integration

Branxa includes extension bridge helpers in `src/vscode/bridge.ts` with command IDs:

- `branxa.save`
- `branxa.resume`
- `branxa.log`
- `branxa.diff`

Bridge behavior:

- executes `npx branxa <command>`
- appends stdout/stderr to extension output channel
- supports startup auto-resume (`resume --stdout`)
- exposes status text as:
  - `Branxa: <timestamp>` when context exists
  - `Branxa: no context` otherwise

## Team workflows

### Handoff flow

```bash
branxa save "Complete OAuth callback flow" --state "done except error-path tests"
branxa handoff "teammate" "Please finish error-path tests and prepare release PR"
branxa resume --stdout
```

### Shared context flow

```bash
branxa share
git log -1 --pretty=%s
# chore(branxa): enable .branxa sharing
```

### Auto-capture flow

```bash
branxa hook install
branxa watch --interval 60
```

## Troubleshooting

### `Branxa is not initialized...`

Run:

```bash
branxa init
```

### `requires a git repository`

Run Branxa inside a Git work tree:

```bash
git rev-parse --is-inside-work-tree
```

### Resume did not copy to clipboard

Use stdout mode:

```bash
branxa resume --stdout
```

### AI command fails with missing config

Set AI environment variables or config keys:

```bash
branxa config set aiProvider https://api.openai.com/v1
branxa config set aiModel gpt-4o-mini
branxa config set aiApiKey sk-...
```

### `branxa share` cannot auto-commit

This can happen when Git user identity is missing or repository policies reject local commits.  
Fallback:

```bash
git add .gitignore
git commit -m "chore(branxa): enable .branxa sharing"
```

## Development

Scripts:

```bash
npm run build
npm test
npm run dev -- <command>
npm run mcp
```

Project layout:

- `src/commands/*` CLI commands
- `src/lib/*` core utilities (Git, config, context store, AI, prompt, parsing helpers)
- `src/parsers/*` auto-extraction pipeline
- `src/mcp/*` MCP contracts + server
- `src/vscode/*` VS Code bridge helpers
- `tests/*` contract and parity suites

## Developer docs site

The repository includes GitBook-style developer docs in `docs/`:

- entry page: `docs/README.md`
- navigation index: `docs/SUMMARY.md`
- local build: `npm run docs:build`
- local preview: `npm run docs:serve`

GitHub Pages deployment is configured in `.github/workflows/docs-pages.yml`.

## Publishing to npm

Before publish, update `package.json`:

1. set `"private": false`
2. bump `"version"`
3. ensure built artifacts exist (`npm run build`)
4. ensure tests pass (`npm test`)
5. ensure `bin` paths are correct:
   - `branxa -> dist/index.js`
   - `branxa-mcp -> dist/mcp/index.js`

Recommended publish flow:

```bash
npm run build
npm test
npm pack --dry-run
npm publish --access public
```

Post-publish sanity:

```bash
npx branxa@latest --help
npx branxa@latest init
```

## Privacy and security notes

- Branxa stores context locally in your repository.
- AI commands (`summarize`, `suggest`) send prompt data to your configured AI provider endpoint.
- Avoid storing secrets in context notes if `.branxa/` is shared with Git.
