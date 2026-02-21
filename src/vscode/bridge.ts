import { readBranchEntries } from '../lib/context-store';
import { sortByTimestampAsc } from '../lib/context-utils';
import { getCurrentBranch } from '../lib/git';

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export type CommandExecutor = (input: {
  cwd: string;
  command: string;
  args: string[];
}) => Promise<CommandExecutionResult>;

export interface OutputChannelLike {
  appendLine: (value: string) => void;
}

export const VS_CODE_COMMANDS = ['branxa.save', 'branxa.resume', 'branxa.log', 'branxa.diff'] as const;

export function buildNpxArgs(command: string, args: string[]): string[] {
  return ['branxa', command, ...args];
}

export async function runBranxaCli(
  executor: CommandExecutor,
  workspacePath: string,
  command: string,
  args: string[]
): Promise<CommandExecutionResult> {
  return executor({
    cwd: workspacePath,
    command: 'npx',
    args: buildNpxArgs(command, args)
  });
}

export async function runExtensionCommand(
  executor: CommandExecutor,
  outputChannel: OutputChannelLike,
  workspacePath: string,
  command: 'save' | 'resume' | 'log' | 'diff',
  args: string[] = []
): Promise<CommandExecutionResult> {
  const result = await runBranxaCli(executor, workspacePath, command, args);

  if (result.stdout.trim()) {
    outputChannel.appendLine(result.stdout.trim());
  }

  if (result.stderr.trim()) {
    outputChannel.appendLine(result.stderr.trim());
  }

  return result;
}

export async function tryStartupAutoResume(
  executor: CommandExecutor,
  outputChannel: OutputChannelLike,
  workspacePath: string
): Promise<CommandExecutionResult> {
  return runExtensionCommand(executor, outputChannel, workspacePath, 'resume', ['--stdout']);
}

export async function resolveStatusBarText(workspacePath: string): Promise<string> {
  try {
    const branch = getCurrentBranch(workspacePath);
    const entries = sortByTimestampAsc(await readBranchEntries(workspacePath, branch));
    const latest = entries[entries.length - 1];

    if (!latest) {
      return 'Branxa: no context';
    }

    return `Branxa: ${latest.timestamp}`;
  } catch {
    return 'Branxa: no context';
  }
}
