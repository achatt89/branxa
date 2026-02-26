import * as vscode from 'vscode';
import * as path from 'path';
import {
  resolveStatusBarText,
  runExtensionCommand,
  VS_CODE_COMMANDS,
} from '../../src/vscode/bridge';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // 1. Initialize Status Bar (Premium UX Item)
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'branxa.resume';
  statusBarItem.tooltip = 'Click to resume latest context';
  context.subscriptions.push(statusBarItem);

  // Initial refresh
  updateStatusBar();

  // 2. Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.init', async () => {
      await handleInitCommand();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.save', async () => {
      await handleSaveCommand();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.resume', async () => {
      await handleResumeCommand();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.log', async () => {
      await handleLogCommand();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.diff', async () => {
      await handleDiffCommand();
    }),
  );

  // 3. Listen for file changes to refresh status bar
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => updateStatusBar()));

  console.log('Branxa extension is now active');
}

async function handleInitCommand() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Branxa: Initializing Context Store...',
      cancellable: false,
    },
    async () => {
      const result = await runExtensionCommand(
        executeCli,
        getOutputChannel(),
        workspacePath,
        'init',
      );

      if (result.exitCode === 0) {
        vscode.window.showInformationMessage('Branxa storage initialized! $(check)');
        updateStatusBar();
      } else {
        vscode.window.showErrorMessage(`Branxa Init Failed: ${result.stderr}`);
      }
    },
  );
}

async function handleSaveCommand() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  // Premium UX: Native multi-step input box
  const task = await vscode.window.showInputBox({
    prompt: 'What task are you working on?',
    placeHolder: 'e.g., Implementing auth middleware',
  });
  if (task === undefined) return;

  const goal = await vscode.window.showInputBox({
    prompt: 'What is the ultimate goal?',
    placeHolder: 'e.g., Ship secure login flow',
  });

  const state = await vscode.window.showInputBox({
    prompt: 'Current technical state?',
    placeHolder: 'e.g., Logic complete; tests pending',
  });

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Branxa: Saving Context...',
      cancellable: false,
    },
    async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
      const args = [task];
      if (goal) args.push('--goal', goal);
      if (state) args.push('--state', state);

      // Note: We use the bridge's runExtensionCommand but pass a real VS Code executor
      const result = await runExtensionCommand(
        executeCli,
        getOutputChannel(),
        workspacePath,
        'save',
        args,
      );

      if (result.exitCode === 0) {
        vscode.window.showInformationMessage('Context saved successfully! $(check)');
        updateStatusBar();
      } else {
        vscode.window.showErrorMessage(`Branxa Save Failed: ${result.stderr}`);
      }
    },
  );
}

async function handleResumeCommand() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Branxa: Resuming Context...',
      cancellable: false,
    },
    async () => {
      const result = await runExtensionCommand(
        executeCli,
        getOutputChannel(),
        workspacePath,
        'resume',
        ['--stdout'],
      );

      if (result.exitCode === 0) {
        await vscode.env.clipboard.writeText(result.stdout);
        vscode.window.showInformationMessage('Context prompt copied to clipboard! $(clippy)');
      } else {
        vscode.window.showErrorMessage(`Branxa Resume Failed: ${result.stderr}`);
      }
    },
  );
}

async function handleLogCommand() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  getOutputChannel().show();
  await runExtensionCommand(executeCli, getOutputChannel(), workspacePath, 'log');
}

async function handleDiffCommand() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  getOutputChannel().show();
  await runExtensionCommand(executeCli, getOutputChannel(), workspacePath, 'diff');
}

async function updateStatusBar() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) {
    statusBarItem.hide();
    return;
  }

  const text = await resolveStatusBarText(workspacePath);
  statusBarItem.text = `$(history) ${text}`;
  statusBarItem.show();
}

/**
 * VS Code implementations of CLI execution
 */
async function executeCli({
  cwd,
  command,
  args,
}: {
  cwd: string;
  command: string;
  args: string[];
}) {
  const { execFile } = await import('child_process');
  const util = await import('util');
  const execFilePromise = util.promisify(execFile);

  try {
    const { stdout, stderr } = await execFilePromise(command, args, { cwd });
    return { stdout, stderr, exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || 'Unknown error',
      exitCode: error.code || 1,
    };
  }
}

let _outputChannel: vscode.OutputChannel;
function getOutputChannel() {
  if (!_outputChannel) {
    _outputChannel = vscode.window.createOutputChannel('Branxa');
  }
  return _outputChannel;
}

function getWorkspacePath(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;

  // Try to find folder for active text editor, fallback to first folder
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    if (folder) return folder.uri.fsPath;
  }

  return folders[0].uri.fsPath;
}

export function deactivate() {}
