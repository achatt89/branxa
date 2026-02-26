# Getting Started

Branxa is a persistent coding context system designed to help you (and your AI assistant) pick up work exactly where you left off. It bridges the gap between high-level project goals and low-level Git state.

## 1. Installation

### As a project dependency (Recommended)
Add Branxa to your project to ensure everyone on your team has access to the same version:

```bash
npm install @thelogicatelier/branxa --save-dev
```

### Global installation
If you want to use Branxa across multiple repositories without adding it to each `package.json`:

```bash
npm install -g @thelogicatelier/branxa
```

---

## 2. Project Initialization

Branxa stores all its context in a local `.branxa` directory within your repository. This directory is ignored by Git by default unless you explicitly enable sharing.

Navigate to your Git repository and run:

```bash
branxa init
```

This creates the `.branxa` folder structure and ensures it's added to your `.gitignore`.

---

## 3. The Core e2e Workflow

The most powerful way to use Branxa is the **Save-Resume Loop**.

### Step A: Saving your current state
At the end of a coding session, or when finishing a sub-task, capture your context:

```bash
branxa save "Implement auth middleware" \
  --goal "Ship v1 security layer" \
  --state "token validation logic is done; refresh flow is missing" \
  --next-steps "implement refresh token endpoint;;add integration tests"
```

Branxa will automatically:
1. Detect your current **Git branch**.
2. Capture a list of **files changed** and **staged**.
3. Log the **most recent commits**.
4. Combine your manual notes with this technical state into a single **Context Entry**.

### Step B: Resuming work later
When you return to the project (or when your AI assistant starts a new session), "resume" the context:

```bash
branxa resume --stdout
```

This prints a comprehensive "Context Prompt" that includes everything from your high-level goals down to the last file you edited. You can paste this directly into an AI assistant like Claude, ChatGPT, or Gemini to give it instant project-specific memory.

---

## 4. Advanced Automation

### Auto-Capture with Git Hooks
Never forget to save your context. Install a Git hook to automatically capture context on every commit:

```bash
branxa hook install
```

### Context Watcher
For long sessions without frequent commits, run the watcher to capture state every few minutes:

```bash
branxa watch --interval 60
```

---

## 5. Collaboration (Handoff)

Ready to pass the baton to a teammate? Use the handoff flow:

```bash
# 1. Enable sharing
branxa share

# 2. Record the handoff
branxa handoff "alice" "Please harden the token validation logic and ship"

# 3. Push to your repo
git push
```

Alice can then `git pull` and run `branxa resume` to see exactly what you expect from her.

---

## 6. AI Features

Branxa can help you analyze your own progress using your configured AI provider:

- **Summarize Activity**: `branxa summarize`
- **Next Steps Suggestion**: `branxa suggest`
- **History Compression**: `branxa compress` (condenses long branch histories into vital checkpoints)

---

## Development & Contribution

If you are contributing to the Branxa codebase itself:

### Clone and bootstrap
```bash
git clone https://github.com/achatt89/branxa.git
cd branxa
npm install
npm run build
npm test
```

### Run in development mode
You can run the source code directly using `tsx`:
```bash
npm run dev -- init
npm run dev -- save "Testing the dev build"
```