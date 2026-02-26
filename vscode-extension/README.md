# Branxa for VS Code

**Persistent Context System for AI-Native Coding.**

Branxa bridges the gap between your Git history and your AI workflow. This extension brings the high-fidelity context capture of Branxa directly into your VS Code status bar and command palette.

[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/thelogicatelier.branxa-vscode?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=thelogicatelier.branxa-vscode)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/achatt89/branxa/blob/main/LICENSE)

---

## 🚀 Quick Start

1. **Install the CLI**: The extension depends on the Branxa CLI logic.
   ```bash
   npm install -g @thelogicatelier/branxa
   ```
2. **Initialize your project**: Open your project in VS Code and run `Branxa: Init` from the Command Palette (`Cmd+Shift+P`).
3. **Save Context**: Use `Branxa: Save Context` whenever you finish a task or reach a milestone.
4. **Resume Everywhere**: Use `Branxa: Resume Context` to copy a high-fidelity prompt to your clipboard for your AI assistant.

---

## ✨ Features

### 📊 Status Bar Insights
See your current **Task** and **State** at a glance in the bottom right corner. Click the status bar item to instantly copy your resume prompt to the clipboard.

### 📝 Interactive Save Flow
Never forget what you were doing. The `Save` command opens native VS Code input boxes to help you quickly document:
- **Task**: What you just finished.
- **Goal**: The high-level objective.
- **Current State**: Where the code stands technically.

### 🕰️ History & Drift
- **Branxa: View History**: Interactive log of your previous context entries.
- **Branxa: Show Drift (Diff)**: See exactly what has changed in your codebase since your last saved context.

---

## 💡 Gotchas & Pro-Tips

> [!TIP]
> **Git Hooks Integration**: If you enable hooks via the CLI (`branxa config set hooks.enabled true`), the status bar will automatically update on every commit!

- **Branch Awareness**: Branxa stores context per-branch. When you switch Git branches in VS Code, the extension automatically loads the context for the new branch.
- **Local First**: All data is stored in a hidden `.branxa/` folder in your workspace root. It never leaves your machine unless you explicitly use `branxa share`.
- **Node Version**: Ensure you are running Node 22+ for the best performance with the underlying CLI.

---

## 🛠️ Configuration

You can customize the extension behavior in your User Settings (`settings.json`):

- `branxa.autoResumeOnStartup`: (Default: `true`) Automatically show the resume prompt when opening a Branxa-enabled workspace.
- `branxa.cliPath`: (Default: `npx @thelogicatelier/branxa`) Path to the Branxa CLI binary if you prefer a global installation or a specific version.

---

## 🔗 Links & Support

- **Source Code**: [GitHub Repository](https://github.com/achatt89/branxa)
- **Issue Tracker**: [Report a Bug](https://github.com/achatt89/branxa/issues)
- **Documentation**: [Full User Guide](https://achatt89.github.io/branxa/)
- **Publisher**: [The Logic Atelier](https://thelogicatelier.com)

---

Built with ❤️ by [The Logic Atelier](https://thelogicatelier.com)
