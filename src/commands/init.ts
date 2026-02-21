import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

import { DEFAULT_CONFIG } from '../lib/config';
import { isGitRepository } from '../lib/git';
import { ensureBranxaGitignoreEntry } from '../lib/gitignore';
import {
  BRANXA_BRANCHES_DIR,
  BRANXA_CONFIG_PATH,
  BRANXA_ROOT_DIR,
  BRANXA_SESSIONS_DIR
} from '../lib/paths';

export interface InitResult {
  ok: boolean;
  alreadyInitialized: boolean;
  message: string;
}

export async function runInit(cwd: string): Promise<InitResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      alreadyInitialized: false,
      message: 'Branxa init requires a git repository. Run this inside an existing git work tree.'
    };
  }

  const branxaRoot = path.join(cwd, BRANXA_ROOT_DIR);
  const sessionsDir = path.join(cwd, BRANXA_SESSIONS_DIR);
  const branchesDir = path.join(cwd, BRANXA_BRANCHES_DIR);
  const configPath = path.join(cwd, BRANXA_CONFIG_PATH);

  const alreadyInitialized = await hasBranxaLayout(branxaRoot, sessionsDir, branchesDir, configPath);

  await fs.mkdir(sessionsDir, { recursive: true });
  await fs.mkdir(branchesDir, { recursive: true });
  await ensureConfig(configPath);
  await ensureBranxaGitignoreEntry(cwd);

  if (alreadyInitialized) {
    return {
      ok: true,
      alreadyInitialized: true,
      message: 'Branxa is already initialized for this repository.'
    };
  }

  return {
    ok: true,
    alreadyInitialized: false,
    message: `Initialized Branxa context store in ${BRANXA_ROOT_DIR}.`
  };
}

export function createInitCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('init')
    .description('Initialize Branxa repository storage')
    .action(async () => {
      const result = await runInit(resolveCwd());

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      if (result.alreadyInitialized) {
        console.warn(result.message);
        return;
      }

      console.log(result.message);
    });
}

async function ensureConfig(configPath: string): Promise<void> {
  try {
    await fs.access(configPath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') {
      throw error;
    }

    await fs.writeFile(configPath, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, 'utf8');
  }
}

async function hasBranxaLayout(
  branxaRoot: string,
  sessionsDir: string,
  branchesDir: string,
  configPath: string
): Promise<boolean> {
  const checks = [branxaRoot, sessionsDir, branchesDir, configPath].map(async (target) => {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  });

  const result = await Promise.all(checks);
  return result.every(Boolean);
}
