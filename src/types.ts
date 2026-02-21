export interface BranxaConfig {
  defaultOutput: 'clipboard' | 'stdout';
  autoGitCapture: boolean;
  recentCommitCount: number;
  defaultLogCount: number;
  watchInterval: number;
  autoHook: boolean;
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
}

export interface CommandContext {
  cwd: string;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
}
