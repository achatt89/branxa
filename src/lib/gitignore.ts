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
