import { promises as fs } from 'node:fs';
import path from 'node:path';

import { currentBranch, makeGitRepo } from './helpers';

import { runCompress } from '../src/commands/compress';
import { runInit } from '../src/commands/init';
import { runSuggest } from '../src/commands/suggest';
import { runSummarize } from '../src/commands/summarize';
import { runSave } from '../src/commands/save';
import { readBranchEntries } from '../src/lib/context-store';

describe('E4-T1 summarize command', () => {
  test('builds AI prompt from git state and parses JSON result', async () => {
    const repoPath = await makeGitRepo('branxa-summarize-json-');
    await runInit(repoPath);

    await fs.writeFile(path.join(repoPath, 'feature.ts'), 'export const x = 1;\n', 'utf8');

    let capturedPrompt = '';
    const result = await runSummarize(repoPath, {
      askAI: async ({ userPrompt }) => {
        capturedPrompt = userPrompt;
        return JSON.stringify({
          task: 'Implement AI summarize',
          goal: 'Persist structured summary',
          approaches: ['use prompt contract'],
          decisions: ['store branch entry'],
          currentState: 'summary generated',
          nextSteps: ['write tests', 'ship'],
          blockers: []
        });
      }
    });

    expect(result.ok).toBe(true);
    expect(result.usedRawFallback).toBe(false);
    expect(capturedPrompt).toContain('Branch:');
    expect(capturedPrompt).toContain('feature.ts');

    const entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    const latest = entries[entries.length - 1];
    expect(latest.task).toBe('Implement AI summarize');
    expect(latest.nextSteps).toEqual(['write tests', 'ship']);
  });

  test('falls back to raw summary save path when JSON parse fails', async () => {
    const repoPath = await makeGitRepo('branxa-summarize-raw-');
    await runInit(repoPath);

    const result = await runSummarize(repoPath, {
      askAI: async () => 'This is free-form summary text, not JSON.'
    });

    expect(result.ok).toBe(true);
    expect(result.usedRawFallback).toBe(true);

    const entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    const latest = entries[entries.length - 1];
    expect(latest.currentState).toContain('Raw AI summary');
    expect(latest.currentState).toContain('free-form summary text');
  });
});

describe('E4-T2 suggest command', () => {
  test('emits 3-5 actionable steps when context exists', async () => {
    const repoPath = await makeGitRepo('branxa-suggest-steps-');
    await runInit(repoPath);
    await runSave(repoPath, 'Implement suggest command', { state: 'ready for AI suggestions' });

    const result = await runSuggest(repoPath, {
      askAI: async () => JSON.stringify(['Step 1', 'Step 2', 'Step 3', 'Step 4'])
    });

    expect(result.ok).toBe(true);
    expect(result.hasSuggestions).toBe(true);
    expect(result.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestions.length).toBeLessThanOrEqual(5);
  });

  test('returns explicit warning when no context and no changes exist', async () => {
    const repoPath = await makeGitRepo('branxa-suggest-empty-');
    await runInit(repoPath);

    const result = await runSuggest(repoPath);

    expect(result.ok).toBe(true);
    expect(result.hasSuggestions).toBe(false);
    expect(result.message).toContain('No context or repository changes found');
  });
});

describe('E4-T3 compress command', () => {
  test('blocks compression when entry count is <= 2', async () => {
    const repoPath = await makeGitRepo('branxa-compress-block-');
    await runInit(repoPath);

    await runSave(repoPath, 'entry one', { state: 'one' });
    await runSave(repoPath, 'entry two', { state: 'two' });

    const result = await runCompress(repoPath);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('at least 3 context entries');
    expect(result.beforeCount).toBe(2);
    expect(result.afterCount).toBe(2);
  });

  test('rewrites branch file to [compressed, latest]', async () => {
    const repoPath = await makeGitRepo('branxa-compress-rewrite-');
    await runInit(repoPath);

    await runSave(repoPath, 'entry one', { state: 'one', decisions: 'd1', nextSteps: 'n1' });
    await runSave(repoPath, 'entry two', { state: 'two', decisions: 'd2', nextSteps: 'n2' });
    await runSave(repoPath, 'entry three', { state: 'three', decisions: 'd3', nextSteps: 'n3' });

    const before = await readBranchEntries(repoPath, currentBranch(repoPath));
    const latestBefore = before[before.length - 1];

    const result = await runCompress(repoPath, {
      now: () => new Date('2026-02-21T09:00:00Z')
    });

    expect(result.ok).toBe(true);
    expect(result.beforeCount).toBe(3);
    expect(result.afterCount).toBe(2);

    const after = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(after).toHaveLength(2);
    expect(after[0].compressed).toBe(true);
    expect(after[1].id).toBe(latestBefore.id);
  });
});
