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
