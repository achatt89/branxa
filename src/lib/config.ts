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

export const CONFIG_KEYS = Object.keys(DEFAULT_CONFIG) as Array<keyof BranxaConfig>;

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

    // Malformed config should not crash command execution paths.
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(cwd: string, config: BranxaConfig): Promise<void> {
  const configPath = path.join(cwd, BRANXA_CONFIG_PATH);
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

export function isKnownConfigKey(key: string): key is keyof BranxaConfig {
  return CONFIG_KEYS.includes(key as keyof BranxaConfig);
}

export function coerceConfigValue(
  key: keyof BranxaConfig,
  value: string
): { ok: true; value: BranxaConfig[keyof BranxaConfig] } | { ok: false; message: string } {
  const trimmed = value.trim();

  if (key === 'defaultOutput') {
    if (trimmed !== 'clipboard' && trimmed !== 'stdout') {
      return {
        ok: false,
        message: "defaultOutput must be 'clipboard' or 'stdout'."
      };
    }

    return { ok: true, value: trimmed };
  }

  if (key === 'autoGitCapture' || key === 'autoHook') {
    const lowered = trimmed.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lowered)) {
      return { ok: true, value: true };
    }

    if (['false', '0', 'no', 'off'].includes(lowered)) {
      return { ok: true, value: false };
    }

    return {
      ok: false,
      message: `${key} must be a boolean value (true/false).`
    };
  }

  if (key === 'recentCommitCount' || key === 'defaultLogCount' || key === 'watchInterval') {
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return {
        ok: false,
        message: `${key} must be a positive number.`
      };
    }

    return { ok: true, value: Math.trunc(parsed) };
  }

  return { ok: true, value: trimmed };
}

export function maskApiKey(value: string): string {
  if (!value) {
    return '';
  }

  if (value.length <= 6) {
    return '***';
  }

  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}
