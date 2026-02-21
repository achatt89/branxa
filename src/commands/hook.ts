import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

import { assertInitialized } from '../lib/context-store';
import { isGitRepository } from '../lib/git';

const BRANXA_HOOK_START = '# BRANXA-HOOK-START';
const BRANXA_HOOK_END = '# BRANXA-HOOK-END';
const BRANXA_HOOK_BODY = `${BRANXA_HOOK_START}\nif command -v branxa >/dev/null 2>&1; then\n  branxa save "Auto-save after commit" --state "post-commit hook snapshot" >/dev/null 2>&1 || true\nfi\n${BRANXA_HOOK_END}\n`;

export interface HookResult {
  ok: boolean;
  changed: boolean;
  message: string;
}

export async function runHook(cwd: string, action: string): Promise<HookResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      changed: false,
      message: 'Branxa hook requires a git repository.'
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      changed: false,
      message: initialized.message
    };
  }

  if (action === 'install') {
    return installHook(cwd);
  }

  if (action === 'remove') {
    return removeHook(cwd);
  }

  return {
    ok: false,
    changed: false,
    message: "Hook action must be 'install' or 'remove'."
  };
}

export function createHookCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('hook')
    .description('Manage git hook integration')
    .argument('<action>')
    .action(async (action: string) => {
      const result = await runHook(resolveCwd(), action);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      console.log(result.message);
    });
}

async function installHook(cwd: string): Promise<HookResult> {
  const hookPath = path.join(cwd, '.git', 'hooks', 'post-commit');
  let existing = '';

  try {
    existing = await fs.readFile(hookPath, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') {
      throw error;
    }
  }

  if (existing.includes(BRANXA_HOOK_START) && existing.includes(BRANXA_HOOK_END)) {
    return {
      ok: true,
      changed: false,
      message: 'Branxa post-commit hook is already installed.'
    };
  }

  let content = existing;
  if (!content) {
    content = '#!/bin/sh\n';
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  content += BRANXA_HOOK_BODY;
  await fs.writeFile(hookPath, content, 'utf8');
  await fs.chmod(hookPath, 0o755);

  return {
    ok: true,
    changed: true,
    message: 'Installed Branxa post-commit hook.'
  };
}

async function removeHook(cwd: string): Promise<HookResult> {
  const hookPath = path.join(cwd, '.git', 'hooks', 'post-commit');
  let existing = '';

  try {
    existing = await fs.readFile(hookPath, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return {
        ok: true,
        changed: false,
        message: 'No post-commit hook file found.'
      };
    }

    throw error;
  }

  const lines = existing.split('\n');
  const startIndex = lines.findIndex((line) => line.trim() === BRANXA_HOOK_START);
  const endIndex = lines.findIndex((line) => line.trim() === BRANXA_HOOK_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return {
      ok: true,
      changed: false,
      message: 'Branxa post-commit hook is not installed.'
    };
  }

  const nextLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex + 1)];
  const nextContent = `${nextLines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
  await fs.writeFile(hookPath, nextContent, 'utf8');

  return {
    ok: true,
    changed: true,
    message: 'Removed Branxa-managed post-commit hook block.'
  };
}
