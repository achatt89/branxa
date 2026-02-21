import { promises as fs } from 'node:fs';
import path from 'node:path';

import { BRANXA_BRANCHES_DIR, BRANXA_CONFIG_PATH, BRANXA_ROOT_DIR, BRANXA_SESSIONS_DIR } from './paths';
import type { ContextEntry } from '../types';

function branchFilename(branch: string): string {
  return `${encodeURIComponent(branch)}.json`;
}

function branchPath(cwd: string, branch: string): string {
  return path.join(cwd, BRANXA_BRANCHES_DIR, branchFilename(branch));
}

export async function isBranxaInitialized(cwd: string): Promise<boolean> {
  const checks = [BRANXA_ROOT_DIR, BRANXA_SESSIONS_DIR, BRANXA_BRANCHES_DIR, BRANXA_CONFIG_PATH].map(
    async (relative) => {
      try {
        await fs.access(path.join(cwd, relative));
        return true;
      } catch {
        return false;
      }
    }
  );

  const result = await Promise.all(checks);
  return result.every(Boolean);
}

export async function assertInitialized(cwd: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (await isBranxaInitialized(cwd)) {
    return { ok: true };
  }

  return {
    ok: false,
    message: "Branxa is not initialized in this repository. Run 'branxa init' first."
  };
}

export async function readBranchEntries(cwd: string, branch: string): Promise<ContextEntry[]> {
  const filePath = branchPath(cwd, branch);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as ContextEntry[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function writeBranchEntries(cwd: string, branch: string, entries: ContextEntry[]): Promise<void> {
  const filePath = branchPath(cwd, branch);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

export async function appendBranchEntry(cwd: string, entry: ContextEntry): Promise<void> {
  const entries = await readBranchEntries(cwd, entry.branch);
  entries.push(entry);
  await writeBranchEntries(cwd, entry.branch, entries);
}

export async function saveSessionEntry(cwd: string, entry: ContextEntry): Promise<void> {
  const sessionPath = path.join(cwd, BRANXA_SESSIONS_DIR, `${entry.id}.json`);
  await fs.mkdir(path.dirname(sessionPath), { recursive: true });
  await fs.writeFile(sessionPath, `${JSON.stringify(entry, null, 2)}\n`, 'utf8');
}

export async function readAllBranchEntries(cwd: string): Promise<ContextEntry[]> {
  const branchesPath = path.join(cwd, BRANXA_BRANCHES_DIR);

  try {
    const files = await fs.readdir(branchesPath);
    const allEntries = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          try {
            const raw = await fs.readFile(path.join(branchesPath, file), 'utf8');
            const parsed = JSON.parse(raw) as ContextEntry[];
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })
    );

    return allEntries.flat();
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}
