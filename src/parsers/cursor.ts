import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { ExtractedContext } from './types';

const CURSOR_PATHS = ['.cursor', '.cursor/rules', '.cursor/session'];

export async function extractCursorContext(cwd: string): Promise<ExtractedContext | null> {
  for (const relativePath of CURSOR_PATHS) {
    try {
      await fs.access(path.join(cwd, relativePath));
      // Cursor SQLite/session parsing is intentionally skipped for parity safety.
      return null;
    } catch {
      // keep checking
    }
  }

  return null;
}
