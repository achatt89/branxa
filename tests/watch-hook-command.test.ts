import { promises as fs } from 'node:fs';
import path from 'node:path';

import { makeGitRepo } from './helpers';

import { runHook } from '../src/commands/hook';
import { runInit } from '../src/commands/init';
import { runWatch } from '../src/commands/watch';

describe('E3-T3 watch and hook workflows', () => {
  test('watch auto-saves after interval when changes are detected', async () => {
    const repoPath = await makeGitRepo('branxa-watch-autosave-');
    await runInit(repoPath);

    const snapshots = [[], ['a.ts'], ['a.ts'], ['a.ts', 'b.ts']];
    let index = 0;

    const getChangedFiles = jest.fn(() => snapshots[Math.min(index++, snapshots.length - 1)]);
    const saveSnapshot = jest.fn(async () => ({ ok: true, message: 'saved', warnings: [] }));

    const result = await runWatch(
      repoPath,
      { interval: '1' },
      {
        getChangedFiles,
        saveSnapshot,
        sleep: async () => undefined,
        maxTicks: 3
      }
    );

    expect(result.ok).toBe(true);
    expect(result.ticks).toBe(3);
    expect(result.autoSaves).toBe(2);
    expect(saveSnapshot).toHaveBeenCalledTimes(2);
  });

  test('hook install appends Branxa block and remove deletes only managed lines', async () => {
    const repoPath = await makeGitRepo('branxa-hook-install-remove-');
    await runInit(repoPath);

    const hookPath = path.join(repoPath, '.git', 'hooks', 'post-commit');
    await fs.writeFile(hookPath, '#!/bin/sh\necho custom\n', 'utf8');

    const installResult = await runHook(repoPath, 'install');
    expect(installResult.ok).toBe(true);
    expect(installResult.changed).toBe(true);

    const withBlock = await fs.readFile(hookPath, 'utf8');
    expect(withBlock).toContain('echo custom');
    expect(withBlock).toContain('# BRANXA-HOOK-START');
    expect(withBlock).toContain('# BRANXA-HOOK-END');

    const secondInstallResult = await runHook(repoPath, 'install');
    expect(secondInstallResult.ok).toBe(true);
    expect(secondInstallResult.changed).toBe(false);

    const removeResult = await runHook(repoPath, 'remove');
    expect(removeResult.ok).toBe(true);
    expect(removeResult.changed).toBe(true);

    const withoutBlock = await fs.readFile(hookPath, 'utf8');
    expect(withoutBlock).toContain('echo custom');
    expect(withoutBlock).not.toContain('# BRANXA-HOOK-START');
    expect(withoutBlock).not.toContain('# BRANXA-HOOK-END');
  });
});
