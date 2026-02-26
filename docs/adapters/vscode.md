## 1. Overview

The Branxa VS Code extension provides an integrated interface for the Branxa CLI, allowing you to manage project context without leaving your editor.

## 2. Installation

### From Marketplace
Search for **"Branxa"** in the VS Code Extensions view (`Ctrl+Shift+X`) and click **Install**.

### Manual Installation (.vsix)
If you have a built `.vsix` file:
1. Open the Extensions view in VS Code.
2. Click the `...` (Views and More Actions) menu in the top right.
3. Select **Install from VSIX...**
4. Choose the `branxa-x.y.z.vsix` file.

## 3. Requirements

The extension acts as a frontend for the Branxa CLI. You must have the CLI installed for the extension to function:

```bash
npm install -g @thelogicatelier/branxa
```

---

## 4. Usage Guide

### The Status Bar
Once installed and a Branxa-initialized project is opened, you will see a **Branxa** item in the status bar (bottom right).
- **Branxa: <timestamp>**: Click to view the latest context in a side panel.
- **Branxa: no context**: Indicates no save has been performed on the current branch yet.

### Command Palette
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type `Branxa` to see all available commands:

- **Branxa: Save Context**: Opens input boxes at the top of the editor to enter your Task, Goal, and State.
- **Branxa: Resume Context**: Generates the context prompt and copies it to your clipboard.
- **Branxa: View History**: Opens the Branxa log in an output channel.
- **Branxa: Show Drift (Diff)**: Shows a breakdown of local changes since the last save.
- **Branxa: Delete Last Entry**: Removes the most recent context entry (with confirmation).
- **Branxa: Clear All History**: Destructive cleanup of all context data (with confirmation).

### Auto-Resume on Startup
By default, the extension can be configured to show your context prompt as soon as you open a workspace. This helps you immediately recall where you left off.

---

## 5. Command IDs (Advanced)

If you are building your own VS Code tasks or keybindings, you can use these command IDs:

| Command ID | Description |
|------------|-------------|
| `branxa.save` | Triggers a `branxa save` with interactive prompts for project state. |
| `branxa.resume` | Executes `branxa resume` and copies the context prompt to the clipboard. |
| `branxa.log` | Shows the context history for the current branch in an output channel. |
| `branxa.diff` | Compares current Git state with the latest context. |
| `branxa.deleteLast` | Deletes the latest context entry. |
| `branxa.deleteAll` | Full context cleanup. |

## 3. Extension Behavior

The Branxa VS Code integration follows these rules:

### Context Detection
The bridge automatically detects the root of your Git repository and uses the active Git branch to identify the correct context store.

### Multi-Root Workspaces
If you are working in a VS Code multi-root workspace, Branxa will attempt to identify the context store for the file currently in focus.

### Startup Auto-Resume
You can configure the extension to automatically run `branxa resume --stdout` when the editor starts. This ensures you are immediately reminded of your `nextSteps` and `goal`.

---

## 4. Key Implementation

The logic for standardizing command IDs and bridge behavior is contained in:
- `src/vscode/bridge.ts`: Exports constants and shared logic for the extension.

## 5. Manual Usage

While the extension is recommended, you can still use the bridge's principles manually in VS Code:

- **Integrated Terminal**: Run `branxa save` to capture state while coding.
- **Tasks**: Create a `.vscode/tasks.json` to automate context capture.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Branxa: Save Context",
      "type": "shell",
      "command": "branxa save",
      "problemMatcher": []
    }
  ]
}
```
