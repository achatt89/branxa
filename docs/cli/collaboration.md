# Handoff and Share

Branxa's collaboration commands let you transfer work between teammates while preserving full context. The two commands work together: **handoff** captures what you've done and who should continue, **share** makes that context available via Git.

## Handoff

### Purpose

When you're handing a branch off to a teammate — end of day, shift change, pair rotation, or moving on to another task — `branxa handoff` creates a structured context entry that tells the next person **what you were doing**, **where you left off**, and **what they should do next**.

### Syntax

```bash
branxa handoff [assignee] [message]
```

| Argument   | Required | Description                                 |
|------------|----------|---------------------------------------------|
| `assignee` | Yes*     | The teammate who should pick up the work    |
| `message`  | Yes*     | A note explaining what they should do next  |

*If omitted in a TTY terminal, Branxa will prompt you interactively.

### How it works

1. Branxa reads the **latest context entry** on the current branch
2. It creates a **new entry** that carries forward all the previous context (`task`, `goal`, `currentState`, `decisions`, `nextSteps`, `blockers`)
3. It adds two new fields: `assignee` and `handoffNote`
4. It captures current Git state (`filesChanged`, `filesStaged`, `recentCommits`)
5. The new entry is appended to the branch history in `.branxa/branches/<branch>.json`

This means the handoff entry is a complete snapshot — your teammate doesn't need your previous saves to understand the full state.

### Quick mode (recommended)

Pass assignee and note directly:

```bash
branxa handoff alice "Please finish the edge-case tests and open the release PR"
```

### Interactive/guided mode

If you omit arguments, Branxa prompts you:

```bash
branxa handoff
# Assignee: alice
# Handoff note: Please finish the edge-case tests and open the release PR
```

This only works in interactive terminals (TTY). In non-interactive environments (CI, scripts, MCP), both arguments are required.

### What gets stored

The handoff creates a context entry like this in `.branxa/branches/<branch>.json`:

```json
{
  "id": "a1b2c3d4-...",
  "timestamp": "2026-02-26T10:30:00.000Z",
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
  "filesChanged": ["src/auth.ts", "src/middleware.ts"],
  "filesStaged": [],
  "recentCommits": ["abc1234 add auth scaffold"],
  "assignee": "alice",
  "handoffNote": "Please finish the edge-case tests and open the release PR"
}
```

The `task`, `goal`, `approaches`, `decisions`, `currentState`, `nextSteps`, and `blockers` are all carried forward from your most recent save. Git file state is captured fresh at handoff time.

---

## The Complete Handoff Workflow

Here's the full end-to-end workflow for handing off work to a teammate:

### Step 1 — Save your current context

Before handing off, make sure your latest state is saved:

```bash
branxa save "Implement OAuth callback flow" \
  --state "Token verification done; error-path tests pending" \
  --next-steps "add edge-case tests;;document rollout procedure" \
  --decisions "use signed httpOnly cookies for token storage" \
  --blockers "none"
```

### Step 2 — Create the handoff

```bash
branxa handoff "alice" "Please finish error-path tests and prepare the release PR"
```

### Step 3 — Share the context with your teammate

You have three options:

#### Option A: Git sharing (persistent, recommended for teams)

Enable `.branxa/` directory sharing via Git:

```bash
branxa share
```

This removes `.branxa/` from `.gitignore` and creates an automatic commit. Now when your teammate pulls the branch, they'll get the full context store.

```bash
# alice's machine
git pull
branxa resume --stdout
```

#### Option B: Clipboard/paste (ad-hoc)

Generate the resume prompt and send it via Slack, email, or any channel:

```bash
# copies to clipboard by default
branxa resume

# or print to stdout for piping
branxa resume --stdout
```

Then paste the context to your teammate. They can feed it directly into their AI coding assistant.

#### Option C: MCP integration (AI agents)

If your teammate uses an AI coding assistant with MCP support, the `branxa://context` resource URI provides the same resume prompt programmatically:

```json
{
  "kind": "resource",
  "uri": "branxa://context"
}
```

### Step 4 — Teammate resumes

Your teammate runs:

```bash
branxa resume --stdout
```

This outputs a structured prompt containing:

```
Branch: feature/auth
Task: Implement OAuth callback flow
Goal: Ship auth for API v2
Current State: Token verification done; error-path tests pending
Approaches: middleware layer; route guards
Decisions: use signed httpOnly cookies for token storage
Next Steps: add edge-case tests; document rollout procedure
Blockers: none
Assignee: alice
Handoff Note: Please finish error-path tests and prepare the release PR
Files Changed: src/auth.ts, src/middleware.ts
Recent Commits: abc1234 add auth scaffold
```

They can paste this into their AI coding assistant for full context continuity, or simply read it to understand the state.

### Step 5 — Teammate continues the work

Your teammate saves their own progress, building on your context:

```bash
branxa save "Finish error-path tests" \
  --state "All edge-case tests written and passing" \
  --next-steps "open release PR;;update changelog"
```

The branch history now contains a complete timeline: your saves → your handoff → their saves.

---

## Share

### Purpose

By default, `branxa init` adds `.branxa/` to `.gitignore` so context stays local. The `share` command toggles this behavior, enabling or disabling Git-level sharing of the entire `.branxa/` directory.

### Enable sharing

```bash
branxa share
```

What happens:

1. Branxa removes the `.branxa/` entry from `.gitignore`
2. It creates an automatic commit: `chore(branxa): enable .branxa sharing`
3. The `.branxa/` directory will now be tracked by Git

After this, any `git push` will include the full context history. Teammates who `git pull` will receive all saved context.

### Disable sharing

```bash
branxa share --stop
```

What happens:

1. Branxa restores the `.branxa/` ignore line in `.gitignore`
2. Prints a confirmation: `Stopped sharing .branxa/ context`

The directory remains on disk but will no longer be tracked in future commits.

### When auto-commit fails

If Git cannot auto-commit (e.g., missing user identity, repository policies), Branxa will report the failure. You can commit manually:

```bash
git add .gitignore
git commit -m "chore(branxa): enable .branxa sharing"
```

---

## Choosing the Right Approach

| Scenario | Approach | Commands |
|----------|----------|----------|
| Team working on the same repo with pull-based workflow | Git sharing | `branxa share` → `git push` |
| Quick ad-hoc handoff (Slack, email) | Clipboard/stdout | `branxa handoff` → `branxa resume --stdout` |
| AI agent integration | MCP resource | `branxa://context` URI |
| Solo developer switching machines | Git sharing | `branxa share` → push/pull |
| Open-source contributor handoff | Clipboard paste | `branxa resume --stdout` → paste in PR/issue |

---

## Edge Cases and Notes

### Handoff without prior saves

If you run `branxa handoff` without having saved any context on the branch, the handoff entry will use the assignee name as the task: `"Handoff to alice"`. Other fields will be empty. It's always better to `branxa save` before doing a handoff.

### Multiple handoffs

Each handoff creates a new entry. If you hand off to `alice`, then later hand off to `bob`, both entries are in the branch history. The `resume` command always uses the **latest entry**, so Bob will see the full chain.

### Non-interactive environments

In CI, scripts, or any context where stdin is not a TTY:

- Both `assignee` and `message` arguments are **required** for `handoff`
- If either is missing, the command fails with: `Handoff requires both assignee and note.`

### Share idempotency

Running `branxa share` multiple times is safe. If `.branxa/` is already unignored, the command will still attempt a commit (which may be a no-op).

Running `branxa share --stop` is also safe. If `.branxa/` is already ignored, only one ignore line is written — no duplicates.

---

## Key Implementation Files

- `src/commands/handoff.ts` — `runHandoff()` function and CLI command
- `src/commands/share.ts` — `runShare()` function and CLI command
- `src/commands/resume.ts` — `runResume()` generates the prompt
- `src/lib/context-store.ts` — branch entry persistence
- `src/lib/gitignore.ts` — `.gitignore` manipulation for share/stop