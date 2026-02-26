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

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.deleteLast', async () => {
      await handleDeleteCommand(['--last']);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.deleteId', async () => {
      await handleDeleteIdCommand();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('branxa.deleteAll', async () => {
      await handleDeleteCommand(['--all']);
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

async function handleDeleteCommand(args: string[]) {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  const isAll = args.includes('--all');
  const confirmMessage = isAll
    ? 'Are you sure you want to delete ALL Branxa context history?'
    : 'Are you sure you want to delete the latest context entry?';

  const confirmed = await vscode.window.showWarningMessage(
    confirmMessage,
    { modal: true },
    'Yes',
    'No',
  );
  if (confirmed !== 'Yes') return;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: isAll ? 'Branxa: Clearing History...' : 'Branxa: Deleting Last Entry...',
      cancellable: false,
    },
    async () => {
      const result = await runExtensionCommand(
        executeCli,
        getOutputChannel(),
        workspacePath,
        'delete',
        args,
      );

      if (result.exitCode === 0) {
        vscode.window.showInformationMessage(`Deletion successful! $(check)`);
        updateStatusBar();
      } else {
        vscode.window.showErrorMessage(`Branxa Delete Failed: ${result.stderr}`);
      }
    },
  );
}

async function handleDeleteIdCommand() {
  const workspacePath = getWorkspacePath();
  if (!workspacePath) return;

  // 1. Fetch entries using log command logic (via bridge if possible, or direct CLI)
  // For better UX, we'll run 'log' to get JSON or parseable output
  const result = await runExtensionCommand(executeCli, getOutputChannel(), workspacePath, 'log', [
    '--count',
    '20',
  ]);

  if (result.exitCode !== 0) {
    vscode.window.showErrorMessage(`Failed to fetch history: ${result.stderr}`);
    return;
  }

  // 2. We'll reuse the bridge's readBranchEntries logic since we are in the extension
  // Use .js extensions for ESM compatibility in the extension
  const { getCurrentBranch } = await import('../../src/lib/git.js');
  const { readBranchEntries } = await import('../../src/lib/context-store.js');
  const { sortByTimestampDesc } = await import('../../src/lib/context-utils.js');

  const branch = getCurrentBranch(workspacePath);
  const entries: any[] = sortByTimestampDesc(await readBranchEntries(workspacePath, branch)).slice(
    0,
    20,
  );

  if (entries.length === 0) {
    vscode.window.showInformationMessage('No context entries found to delete.');
    return;
  }

  const items = entries.map((entry: any) => ({
    label: entry.timestamp,
    description: entry.task,
    detail: `ID: ${entry.id.substring(0, 8)}... | ${entry.currentState}`,
    id: entry.id,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a context entry to delete',
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!selected) return;

  const confirmed = await vscode.window.showWarningMessage(
    `Delete context from ${selected.label}?`,
    { modal: true },
    'Yes',
    'No',
  );

  if (confirmed !== 'Yes') return;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Branxa: Deleting Entry...',
      cancellable: false,
    },
    async () => {
      const result = await runExtensionCommand(
        executeCli,
        getOutputChannel(),
        workspacePath,
        'delete',
        ['--id', selected.id],
      );

      if (result.exitCode === 0) {
        vscode.window.showInformationMessage(`Entry deleted successfully! $(check)`);
        updateStatusBar();
      } else {
        vscode.window.showErrorMessage(`Branxa Delete Failed: ${result.stderr}`);
      }
    },
  );
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
