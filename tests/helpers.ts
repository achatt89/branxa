import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function makeGitRepo(prefix: string): Promise<string> {
  const repoPath = await fs.mkdtemp(path.join(os.tmpdir(), prefix));

  runGit(repoPath, ['init']);
  runGit(repoPath, ['config', 'user.email', 'test@example.com']);
  runGit(repoPath, ['config', 'user.name', 'Branxa Test']);

  await fs.writeFile(path.join(repoPath, 'README.md'), '# test\n', 'utf8');
  runGit(repoPath, ['add', 'README.md']);
  runGit(repoPath, ['commit', '-m', 'initial commit']);

  return repoPath;
}

export function runGit(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

export function currentBranch(cwd: string): string {
  return runGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
}

export function commitAll(cwd: string, message: string): void {
  runGit(cwd, ['add', '-A']);
  runGit(cwd, ['commit', '-m', message]);
}
