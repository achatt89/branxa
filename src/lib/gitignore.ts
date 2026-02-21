import { promises as fs } from 'node:fs';
import path from 'node:path';

const MANAGED_HEADER = '# Branxa (managed)';
const MANAGED_ENTRY = '.branxa/';

export async function ensureBranxaGitignoreEntry(cwd: string): Promise<void> {
  const gitignorePath = path.join(cwd, '.gitignore');
  let existing = '';

  try {
    existing = await fs.readFile(gitignorePath, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') {
      throw error;
    }
  }

  if (existing.includes(MANAGED_ENTRY)) {
    return;
  }

  const suffix = existing.length > 0 && !existing.endsWith('\n') ? '\n' : '';
  const content = `${existing}${suffix}${MANAGED_HEADER}\n${MANAGED_ENTRY}\n`;
  await fs.writeFile(gitignorePath, content, 'utf8');
}

export async function removeBranxaGitignoreEntry(cwd: string): Promise<boolean> {
  const gitignorePath = path.join(cwd, '.gitignore');
  let existing = '';

  try {
    existing = await fs.readFile(gitignorePath, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return false;
    }

    throw error;
  }

  const originalLines = existing.split('\n');
  const filteredLines: string[] = [];
  let removed = false;

  for (const line of originalLines) {
    const trimmed = line.trim();
    if (trimmed === MANAGED_HEADER || trimmed === MANAGED_ENTRY) {
      removed = true;
      continue;
    }

    filteredLines.push(line);
  }

  if (!removed) {
    return false;
  }

  // Keep file stable but avoid trailing empty-line growth after repeated toggles.
  while (filteredLines.length > 0 && filteredLines[filteredLines.length - 1] === '') {
    filteredLines.pop();
  }

  const nextContent = `${filteredLines.join('\n')}\n`;
  await fs.writeFile(gitignorePath, nextContent, 'utf8');
  return true;
}
