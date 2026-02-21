import { promises as fs } from 'node:fs';
import path from 'node:path';

import { currentBranch, makeGitRepo, runGit } from './helpers';

import { runHandoff } from '../src/commands/handoff';
import { runInit } from '../src/commands/init';
import { runSave } from '../src/commands/save';
import { runShare } from '../src/commands/share';
import { readBranchEntries } from '../src/lib/context-store';

describe('E3-T1 handoff workflow', () => {
  test('handoff quick mode persists assignee and note', async () => {
    const repoPath = await makeGitRepo('branxa-handoff-quick-');
    await runInit(repoPath);
    await runSave(repoPath, 'Implement collaboration commands', { state: 'in progress' });

    const result = await runHandoff(repoPath, 'alice', 'Please finalize and ship this branch');

    expect(result.ok).toBe(true);
    const entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    const latest = entries[entries.length - 1];

    expect(latest.assignee).toBe('alice');
    expect(latest.handoffNote).toBe('Please finalize and ship this branch');
    expect(latest.task).toBe('Implement collaboration commands');
  });

  test('handoff guided mode prompts required fields and persists context', async () => {
    const repoPath = await makeGitRepo('branxa-handoff-guided-');
    await runInit(repoPath);

    const responses = ['bob', 'Take over parser fixtures and run verification'];
    let index = 0;

    const result = await runHandoff(repoPath, undefined, undefined, {
      prompt: async () => responses[index++] ?? ''
    });

    expect(result.ok).toBe(true);
    const entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    const latest = entries[entries.length - 1];

    expect(latest.assignee).toBe('bob');
    expect(latest.handoffNote).toBe('Take over parser fixtures and run verification');
  });
});

describe('E3-T2 share workflow', () => {
  test('share removes .branxa ignore entry and creates a commit', async () => {
    const repoPath = await makeGitRepo('branxa-share-enable-');
    await runInit(repoPath);

    const result = await runShare(repoPath, {});

    expect(result.ok).toBe(true);
    expect(result.committed).toBe(true);

    const gitignore = await fs.readFile(path.join(repoPath, '.gitignore'), 'utf8');
    expect(gitignore).not.toContain('.branxa/');

    const latestCommitMessage = runGit(repoPath, ['log', '-1', '--pretty=%s']);
    expect(latestCommitMessage).toBe('chore(branxa): enable .branxa sharing');
  });

  test('share --stop restores .branxa ignore entry with expected messaging', async () => {
    const repoPath = await makeGitRepo('branxa-share-stop-');
    await runInit(repoPath);

    await runShare(repoPath, {});
    const stopResult = await runShare(repoPath, { stop: true });

    expect(stopResult.ok).toBe(true);
    expect(stopResult.message).toContain('Stopped sharing');

    const gitignore = await fs.readFile(path.join(repoPath, '.gitignore'), 'utf8');
    const matches = gitignore.match(/\.branxa\//g) ?? [];
    expect(matches).toHaveLength(1);
  });
});
