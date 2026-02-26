import { makeGitRepo, noPrompt } from './helpers';

import { runInit } from '../src/commands/init';
import { runResume } from '../src/commands/resume';
import { runSave } from '../src/commands/save';

describe('E2-T2 resume command contract', () => {
  test('resume --stdout emits generated prompt', async () => {
    const repoPath = await makeGitRepo('branxa-resume-stdout-');
    await runInit(repoPath);

    await runSave(repoPath, 'Implement resume command', { state: 'core behavior done' }, noPrompt);

    const result = await runResume(repoPath, { stdout: true });

    expect(result.ok).toBe(true);
    expect(result.hasContext).toBe(true);
    expect(result.outputMode).toBe('stdout');
    expect(result.output).toContain('Task: Implement resume command');
  });

  test('default resume falls back to stdout when clipboard path fails', async () => {
    const repoPath = await makeGitRepo('branxa-resume-clipboard-');
    await runInit(repoPath);

    await runSave(repoPath, 'Implement clipboard fallback', { state: 'ready to resume' }, noPrompt);

    const clipboardWriter = jest.fn(() => false);
    const result = await runResume(repoPath, {}, { writeClipboard: clipboardWriter });

    expect(result.ok).toBe(true);
    expect(result.hasContext).toBe(true);
    expect(result.fallbackToStdout).toBe(true);
    expect(result.outputMode).toBe('stdout');
    expect(result.output).toContain('Task: Implement clipboard fallback');
    expect(clipboardWriter).toHaveBeenCalledTimes(1);
  });

  test('empty branch context returns warning and no crash', async () => {
    const repoPath = await makeGitRepo('branxa-resume-empty-');
    await runInit(repoPath);

    const result = await runResume(repoPath, { stdout: true });

    expect(result.ok).toBe(true);
    expect(result.hasContext).toBe(false);
    expect(result.message).toContain('No saved context');
  });
});
