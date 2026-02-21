import { execFileSync } from 'node:child_process';
import path from 'node:path';

function runGit(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
}

export function isGitRepository(cwd: string): boolean {
  try {
    return runGit(cwd, ['rev-parse', '--is-inside-work-tree']) === 'true';
  } catch {
    return false;
  }
}

export function getCurrentBranch(cwd: string): string {
  return runGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
}

export function getRepoName(cwd: string): string {
  try {
    const topLevel = runGit(cwd, ['rev-parse', '--show-toplevel']);
    return path.basename(topLevel);
  } catch {
    return path.basename(cwd);
  }
}

export function getGitAuthor(cwd: string): string {
  try {
    const author = runGit(cwd, ['config', '--get', 'user.name']);
    if (author.length > 0) {
      return author;
    }
  } catch {
    // fall through
  }

  return process.env.USER ?? process.env.USERNAME ?? 'unknown';
}

export function getChangedFiles(cwd: string): string[] {
  try {
    const output = execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    if (!output) {
      return [];
    }

    return output
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => line.slice(3).trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => {
        const renameParts = entry.split(' -> ');
        return renameParts[renameParts.length - 1];
      });
  } catch {
    return [];
  }
}

export function getStagedFiles(cwd: string): string[] {
  try {
    const output = runGit(cwd, ['diff', '--cached', '--name-only']);
    if (!output) {
      return [];
    }

    return output.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

export function getRecentCommits(cwd: string, count: number): string[] {
  if (count <= 0) {
    return [];
  }

  try {
    const output = runGit(cwd, ['log', `--max-count=${count}`, '--pretty=format:%h %s']);
    if (!output) {
      return [];
    }

    return output.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  } catch {
    return [];
  }
}
