import { currentBranch, makeGitRepo, noPrompt } from './helpers';
import { runInit } from '../src/commands/init';
import { runSave } from '../src/commands/save';
import { runDelete } from '../src/commands/delete';
import { readBranchEntries } from '../src/lib/context-store';

const TIMEOUT = 10000;
jest.setTimeout(TIMEOUT);

describe('branxa delete command', () => {
  test('deletes the most recent entry with --last', async () => {
    const repoPath = await makeGitRepo('branxa-delete-last-');
    await runInit(repoPath);

    // Save two entries
    await runSave(repoPath, 'Task 1', { state: 'state 1' }, noPrompt);
    await runSave(repoPath, 'Task 2', { state: 'state 2' }, noPrompt);

    let entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(entries).toHaveLength(2);
    const lastId = entries[1].id;

    const result = await runDelete(repoPath, { last: true });
    expect(result.ok).toBe(true);
    expect(result.message).toContain('Deleted most recent context entry');

    entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(entries).toHaveLength(1);
    expect(entries[0].task).toBe('Task 1');
    expect(entries.find((e) => e.id === lastId)).toBeUndefined();
  });

  test('deletes a specific entry with --id', async () => {
    const repoPath = await makeGitRepo('branxa-delete-id-');
    await runInit(repoPath);

    await runSave(repoPath, 'Task 1', { state: 'state 1' }, noPrompt);
    await runSave(repoPath, 'Task 2', { state: 'state 2' }, noPrompt);

    let entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    const targetId = entries[0].id;

    const result = await runDelete(repoPath, { id: targetId });
    expect(result.ok).toBe(true);

    entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(entries).toHaveLength(1);
    expect(entries[0].task).toBe('Task 2');
  });

  test('deletes everything with --all', async () => {
    const repoPath = await makeGitRepo('branxa-delete-all-');
    await runInit(repoPath);

    await runSave(repoPath, 'Task 1', { state: 'state 1' }, noPrompt);
    await runSave(repoPath, 'Task 2', { state: 'state 2' }, noPrompt);

    let entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(entries).toHaveLength(2);

    const result = await runDelete(repoPath, { all: true });
    expect(result.ok).toBe(true);

    entries = await readBranchEntries(repoPath, currentBranch(repoPath));
    expect(entries).toHaveLength(0);
  });

  test('returns error if nothing specified', async () => {
    const repoPath = await makeGitRepo('branxa-delete-none-');
    await runInit(repoPath);

    const result = await runDelete(repoPath, {});
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Specify --last, --id <id>, or --all');
  });
});
