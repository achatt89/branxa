import { currentBranch, makeGitRepo } from './helpers';

import { runInit } from '../src/commands/init';
import { runSave } from '../src/commands/save';
import { readBranchEntries } from '../src/lib/context-store';

describe('E2-T1 save command modes', () => {
  test('interactive mode captures required fields', async () => {
    const repoPath = await makeGitRepo('branxa-save-interactive-');
    await runInit(repoPath);

    const responses = ['Implement parser', 'in progress', 'ship parity', 'step 1;;step 2', 'none'];
    let index = 0;

    const result = await runSave(
      repoPath,
      undefined,
      {},
      {
        prompt: async () => responses[index++] ?? '',
      },
    );

    expect(result.ok).toBe(true);
    expect(result.entry?.task).toBe('Implement parser');
    expect(result.entry?.currentState).toBe('in progress');
    expect(result.entry?.goal).toBe('ship parity');
    expect(result.entry?.nextSteps).toEqual(['step 1', 'step 2']);

    const entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(entries).toHaveLength(1);
    expect(entries[0].task).toBe('Implement parser');
  });

  test('structured flag mode parses ;; multi-value fields', async () => {
    const repoPath = await makeGitRepo('branxa-save-structured-');
    await runInit(repoPath);

    const result = await runSave(
      repoPath,
      'Refactor context lifecycle',
      {
        goal: 'Parity with canonical contract',
        approaches: 'approach one;;approach two',
        decisions: 'decision one;; decision two',
        state: 'implemented and pending tests',
        nextSteps: 'write tests;;run test suite',
        blockers: 'none;;network flake',
      },
      {},
    );

    expect(result.ok).toBe(true);
    expect(result.entry?.approaches).toEqual(['approach one', 'approach two']);
    expect(result.entry?.decisions).toEqual(['decision one', 'decision two']);
    expect(result.entry?.nextSteps).toEqual(['write tests', 'run test suite']);
    expect(result.entry?.blockers).toEqual(['none', 'network flake']);
  });

  test('--auto attempts extraction and falls back safely on failure', async () => {
    const repoPath = await makeGitRepo('branxa-save-auto-');
    await runInit(repoPath);

    const autoExtract = jest.fn(async () => {
      throw new Error('extract failed');
    });

    const result = await runSave(
      repoPath,
      'Fallback task',
      {
        auto: true,
        state: 'continuing without extracted context',
      },
      {
        autoExtract,
        prompt: async () => '',
      },
    );

    expect(result.ok).toBe(true);
    expect(autoExtract).toHaveBeenCalledTimes(1);
    expect(result.entry?.task).toBe('Fallback task');
    expect(result.warnings).toContain('Auto extraction failed; falling back to manual values.');
  });
});
