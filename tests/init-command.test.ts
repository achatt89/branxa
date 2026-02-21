import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { runInit } from '../src/commands/init';
import { BRANXA_BRANCHES_DIR, BRANXA_CONFIG_PATH, BRANXA_SESSIONS_DIR } from '../src/lib/paths';

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe('E1-T2 repository initialization', () => {
  test('creates .branxa structure and config in a git repository', async () => {
    const repoPath = await makeTempDir('branxa-init-repo-');
    execFileSync('git', ['init'], { cwd: repoPath, stdio: 'ignore' });

    const result = await runInit(repoPath);

    expect(result.ok).toBe(true);
    expect(result.alreadyInitialized).toBe(false);
    expect(result.message).toContain('Initialized Branxa context store');

    await expect(fs.access(path.join(repoPath, BRANXA_SESSIONS_DIR))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repoPath, BRANXA_BRANCHES_DIR))).resolves.toBeUndefined();
    await expect(fs.access(path.join(repoPath, BRANXA_CONFIG_PATH))).resolves.toBeUndefined();

    const config = JSON.parse(await fs.readFile(path.join(repoPath, BRANXA_CONFIG_PATH), 'utf8'));
    expect(config).toMatchObject({
      defaultOutput: 'clipboard',
      autoGitCapture: true,
      recentCommitCount: 5,
      defaultLogCount: 10
    });

    const gitignore = await fs.readFile(path.join(repoPath, '.gitignore'), 'utf8');
    expect(gitignore).toContain('# Branxa (managed)');
    expect(gitignore).toContain('.branxa/');
  });

  test('is idempotent and returns an already-initialized warning message', async () => {
    const repoPath = await makeTempDir('branxa-init-idempotent-');
    execFileSync('git', ['init'], { cwd: repoPath, stdio: 'ignore' });

    await runInit(repoPath);
    const secondResult = await runInit(repoPath);

    expect(secondResult.ok).toBe(true);
    expect(secondResult.alreadyInitialized).toBe(true);
    expect(secondResult.message).toContain('already initialized');
  });

  test('returns a friendly failure for non-git directories', async () => {
    const nonGitPath = await makeTempDir('branxa-init-non-git-');

    const result = await runInit(nonGitPath);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('requires a git repository');
  });
});
