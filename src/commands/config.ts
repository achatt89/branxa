import { Command } from 'commander';

import {
  coerceConfigValue,
  CONFIG_KEYS,
  isKnownConfigKey,
  loadConfig,
  maskApiKey,
  saveConfig
} from '../lib/config';
import { assertInitialized } from '../lib/context-store';
import { isGitRepository } from '../lib/git';
import type { BranxaConfig } from '../types';

export interface ConfigResult {
  ok: boolean;
  message: string;
  lines: string[];
}

export async function runConfig(
  cwd: string,
  actionArg: string | undefined,
  keyArg: string | undefined,
  valueArg: string | undefined
): Promise<ConfigResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa config requires a git repository.',
      lines: []
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      lines: []
    };
  }

  const action = (actionArg ?? 'list').trim().toLowerCase();

  if (!['list', 'get', 'set'].includes(action)) {
    return {
      ok: false,
      message: "Config action must be one of: list, get, set.",
      lines: []
    };
  }

  const config = await loadConfig(cwd);

  if (action === 'list') {
    return {
      ok: true,
      message: 'Current Branxa config:',
      lines: formatConfigLines(config)
    };
  }

  if (!keyArg || !isKnownConfigKey(keyArg)) {
    return {
      ok: false,
      message: `Unknown config key. Valid keys: ${CONFIG_KEYS.join(', ')}`,
      lines: []
    };
  }

  if (action === 'get') {
    return {
      ok: true,
      message: `${keyArg}=${formatConfigValue(keyArg, config[keyArg])}`,
      lines: []
    };
  }

  if (typeof valueArg !== 'string') {
    return {
      ok: false,
      message: 'Config set requires a value.',
      lines: []
    };
  }

  const coerced = coerceConfigValue(keyArg, valueArg);
  if (!coerced.ok) {
    return {
      ok: false,
      message: coerced.message,
      lines: []
    };
  }

  const nextConfig: BranxaConfig = {
    ...config,
    [keyArg]: coerced.value
  };

  await saveConfig(cwd, nextConfig);

  return {
    ok: true,
    message: `Updated ${keyArg}=${formatConfigValue(keyArg, nextConfig[keyArg])}`,
    lines: []
  };
}

export function createConfigCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('config')
    .description('Manage Branxa settings')
    .argument('[action]')
    .argument('[key]')
    .argument('[value]')
    .action(async (action: string | undefined, key: string | undefined, value: string | undefined) => {
      const result = await runConfig(resolveCwd(), action, key, value);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      console.log(result.message);
      for (const line of result.lines) {
        console.log(line);
      }
    });
}

function formatConfigLines(config: BranxaConfig): string[] {
  return CONFIG_KEYS.map((key) => `${key}=${formatConfigValue(key, config[key])}`);
}

function formatConfigValue(key: keyof BranxaConfig, value: BranxaConfig[keyof BranxaConfig]): string {
  if (key === 'aiApiKey') {
    return maskApiKey(String(value));
  }

  return String(value);
}
