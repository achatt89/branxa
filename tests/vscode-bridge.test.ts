import { makeGitRepo, noPrompt } from './helpers';

import { runInit } from '../src/commands/init';
import { runSave } from '../src/commands/save';
import {
  runExtensionCommand,
  resolveStatusBarText,
  tryStartupAutoResume,
  VS_CODE_COMMANDS,
  type CommandExecutionResult,
  type CommandExecutor,
  type OutputChannelLike,
} from '../src/vscode/bridge';

function makeOutputChannel(): { channel: OutputChannelLike; lines: string[] } {
  const lines: string[] = [];
  return {
    lines,
    channel: {
      appendLine(value: string): void {
        lines.push(value);
      },
    },
  };
}

describe('E7-T1 command bridge behavior', () => {
  test('extension commands call npx branxa in workspace and render output channel', async () => {
    const repoPath = await makeGitRepo('branxa-vscode-bridge-');
    const output = makeOutputChannel();

    const executor: CommandExecutor = jest.fn(async () => ({
      stdout: 'resume output',
      stderr: '',
      exitCode: 0,
    }));

    const result = await runExtensionCommand(executor, output.channel, repoPath, 'resume', [
      '--stdout',
    ]);

    expect(result.exitCode).toBe(0);
    expect(executor).toHaveBeenCalledWith({
      cwd: repoPath,
      command: 'npx',
      args: ['@thelogicatelier/branxa', 'resume', '--stdout'],
    });
    expect(output.lines).toEqual(['resume output']);
    expect(VS_CODE_COMMANDS).toEqual([
      'branxa.init',
      'branxa.save',
      'branxa.resume',
      'branxa.log',
      'branxa.diff',
    ]);
  });

  test('output channel renders for log and diff command output', async () => {
    const repoPath = await makeGitRepo('branxa-vscode-output-');
    const output = makeOutputChannel();

    const executor: CommandExecutor = jest.fn(async ({ args }) => ({
      stdout: args[1] === 'log' ? 'log output line' : 'diff output line',
      stderr: '',
      exitCode: 0,
    }));

    await runExtensionCommand(executor, output.channel, repoPath, 'log');
    await runExtensionCommand(executor, output.channel, repoPath, 'diff');

    expect(output.lines).toEqual(['log output line', 'diff output line']);
  });
});

describe('E7-T2 startup and status behavior', () => {
  test('startup auto-resume attempts on activation', async () => {
    const repoPath = await makeGitRepo('branxa-vscode-startup-');
    const output = makeOutputChannel();

    const executor: CommandExecutor = jest.fn(
      async (): Promise<CommandExecutionResult> => ({
        stdout: 'startup resume output',
        stderr: '',
        exitCode: 0,
      }),
    );

    await tryStartupAutoResume(executor, output.channel, repoPath);

    expect(executor).toHaveBeenCalledWith({
      cwd: repoPath,
      command: 'npx',
      args: ['@thelogicatelier/branxa', 'resume', '--stdout'],
    });
    expect(output.lines).toContain('startup resume output');
  });

  test('status bar shows latest context timestamp or fallback state', async () => {
    const repoPath = await makeGitRepo('branxa-vscode-status-');
    await runInit(repoPath);

    const emptyStatus = await resolveStatusBarText(repoPath);
    expect(emptyStatus).toBe('Branxa: no context');

    await runSave(
      repoPath,
      'Status test task',
      { state: 'saved for status' },
      { ...noPrompt, now: () => new Date('2026-02-21T10:10:10Z') },
    );

    const filledStatus = await resolveStatusBarText(repoPath);
    expect(filledStatus).toBe('Branxa: 2026-02-21T10:10:10.000Z');
  });
});
