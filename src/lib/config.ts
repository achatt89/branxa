import { promises as fs } from 'node:fs';
import path from 'node:path';

import { BRANXA_CONFIG_PATH } from './paths';
import type { BranxaConfig } from '../types';

export const DEFAULT_CONFIG: BranxaConfig = {
  defaultOutput: 'clipboard',
  autoGitCapture: true,
  recentCommitCount: 5,
  defaultLogCount: 10,
  watchInterval: 120,
  autoHook: false,
  aiProvider: 'https://api.openai.com/v1',
  aiModel: 'gpt-4o-mini',
  aiApiKey: ''
};

export async function loadConfig(cwd: string): Promise<BranxaConfig> {
  const configPath = path.join(cwd, BRANXA_CONFIG_PATH);

  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<BranxaConfig>;

    return {
      ...DEFAULT_CONFIG,
      ...parsed
    };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return DEFAULT_CONFIG;
    }

    return DEFAULT_CONFIG;
  }
}
