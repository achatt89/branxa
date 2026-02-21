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

export interface ContextEntry {
  id: string;
  timestamp: string;
  branch: string;
  repo: string;
  author: string;
  task: string;
  goal: string;
  approaches: string[];
  decisions: string[];
  currentState: string;
  nextSteps: string[];
  blockers: string[];
  filesChanged: string[];
  filesStaged: string[];
  recentCommits: string[];
  assignee?: string;
  handoffNote?: string;
  compressed?: boolean;
}

export interface CommandContext {
  cwd: string;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
}
