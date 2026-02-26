import { promises as fs } from 'node:fs';
import path from 'node:path';

import { commitAll, currentBranch, makeGitRepo, noPrompt, runGit } from './helpers';

import { runDiff } from '../src/commands/diff';
import { runInit } from '../src/commands/init';
import { runLog } from '../src/commands/log';
import { runSave } from '../src/commands/save';
import { writeBranchEntries } from '../src/lib/context-store';
import type { ContextEntry } from '../src/types';

describe('E2-T3 log and diff visibility', () => {
  test('log --all and branch log respect count bounds', async () => {
    const repoPath = await makeGitRepo('branxa-log-bounds-');
    await runInit(repoPath);
    commitAll(repoPath, 'record init artifacts');

    const mainBranch = currentBranch(repoPath);

    await runSave(
      repoPath,
      'main task one',
      { state: 'first' },
      { ...noPrompt, now: () => new Date('2026-02-21T00:00:01Z') },
    );
    await runSave(
      repoPath,
      'main task two',
      { state: 'second' },
      { ...noPrompt, now: () => new Date('2026-02-21T00:00:02Z') },
    );

    runGit(repoPath, ['checkout', '-b', 'feature/log-view']);
    await runSave(
      repoPath,
      'feature task one',
      { state: 'third' },
      { ...noPrompt, now: () => new Date('2026-02-21T00:00:03Z') },
    );

    runGit(repoPath, ['checkout', mainBranch]);

    const branchLog = await runLog(repoPath, { count: '1' });
    expect(branchLog.ok).toBe(true);
    expect(branchLog.entries).toHaveLength(1);
    expect(branchLog.entries[0].task).toBe('main task two');

    const allLog = await runLog(repoPath, { all: true, count: '2' });
    expect(allLog.ok).toBe(true);
    expect(allLog.entries).toHaveLength(2);
    expect(allLog.entries[0].task).toBe('feature task one');
    expect(allLog.entries[1].task).toBe('main task two');
  });

  test('diff reports new/still/resolved categories and progression', async () => {
    const repoPath = await makeGitRepo('branxa-diff-categories-');
    await runInit(repoPath);

    const branch = currentBranch(repoPath);
    await fs.writeFile(path.join(repoPath, 'a.txt'), 'a\n', 'utf8');
    await fs.writeFile(path.join(repoPath, 'b.txt'), 'b\n', 'utf8');
    runGit(repoPath, ['add', 'a.txt', 'b.txt']);
    runGit(repoPath, ['commit', '-m', 'add tracked files']);

    await fs.writeFile(path.join(repoPath, 'b.txt'), 'b updated\n', 'utf8');
    await fs.writeFile(path.join(repoPath, 'c.txt'), 'c\n', 'utf8');

    const baseEntry: Omit<ContextEntry, 'id' | 'timestamp'> = {
      branch,
      repo: 'test-repo',
      author: 'tester',
      task: 'task',
      goal: 'goal',
      approaches: [],
      decisions: [],
      currentState: 'state',
      nextSteps: [],
      blockers: [],
      filesChanged: ['a.txt', 'b.txt'],
      filesStaged: [],
      recentCommits: [],
    };

    await writeBranchEntries(repoPath, branch, [
      {
        ...baseEntry,
        id: 'entry-1',
        timestamp: '2026-02-21T00:00:01Z',
        decisions: ['decision one'],
        nextSteps: ['step one'],
      },
      {
        ...baseEntry,
        id: 'entry-2',
        timestamp: '2026-02-21T00:00:02Z',
        decisions: ['decision one', 'decision two'],
        nextSteps: ['step two'],
      },
    ]);

    const result = await runDiff(repoPath);

    expect(result.ok).toBe(true);
    expect(result.hasContext).toBe(true);
    expect(result.newFiles).toEqual(expect.arrayContaining(['c.txt']));
    expect(result.stillFiles).toEqual(expect.arrayContaining(['b.txt']));
    expect(result.resolvedFiles).toEqual(expect.arrayContaining(['a.txt']));
    expect(result.decisionAdded).toEqual(['decision two']);
    expect(result.nextStepsAdded).toEqual(['step two']);
    expect(result.nextStepsResolved).toEqual(['step one']);
  });
});
