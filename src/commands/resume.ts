import { Command } from 'commander';

import { copyToClipboard } from '../lib/clipboard';
import { assertInitialized, readBranchEntries } from '../lib/context-store';
import { sortByTimestampAsc } from '../lib/context-utils';
import { getCurrentBranch, isGitRepository } from '../lib/git';
import { buildResumePrompt } from '../lib/prompt';

export interface ResumeCommandOptions {
  branch?: string;
  stdout?: boolean;
}

export interface ResumeDependencies {
  writeClipboard?: (text: string) => boolean;
}

export interface ResumeResult {
  ok: boolean;
  hasContext: boolean;
  message: string;
  output: string;
  outputMode: 'stdout' | 'clipboard';
  fallbackToStdout: boolean;
}

export async function runResume(
  cwd: string,
  options: ResumeCommandOptions,
  deps: ResumeDependencies = {}
): Promise<ResumeResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      hasContext: false,
      message: 'Branxa resume requires a git repository.',
      output: '',
      outputMode: 'stdout',
      fallbackToStdout: false
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      hasContext: false,
      message: initialized.message,
      output: '',
      outputMode: 'stdout',
      fallbackToStdout: false
    };
  }

  const branch = options.branch ?? getCurrentBranch(cwd);
  const entries = sortByTimestampAsc(await readBranchEntries(cwd, branch));

  if (entries.length === 0) {
    return {
      ok: true,
      hasContext: false,
      message: `No saved context found for branch '${branch}'.`,
      output: '',
      outputMode: 'stdout',
      fallbackToStdout: false
    };
  }

  const output = buildResumePrompt(branch, entries);

  if (options.stdout) {
    return {
      ok: true,
      hasContext: true,
      message: `Generated resume prompt for branch '${branch}'.`,
      output,
      outputMode: 'stdout',
      fallbackToStdout: false
    };
  }

  const clipboardWriter = deps.writeClipboard ?? copyToClipboard;
  const copied = clipboardWriter(output);

  if (copied) {
    return {
      ok: true,
      hasContext: true,
      message: `Copied resume prompt for branch '${branch}' to clipboard.`,
      output,
      outputMode: 'clipboard',
      fallbackToStdout: false
    };
  }

  return {
    ok: true,
    hasContext: true,
    message: 'Clipboard unavailable; printing resume prompt to stdout.',
    output,
    outputMode: 'stdout',
    fallbackToStdout: true
  };
}

export function createResumeCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('resume')
    .description('Resume latest coding context')
    .option('--branch <value>')
    .option('--stdout')
    .action(async (options: ResumeCommandOptions) => {
      const result = await runResume(resolveCwd(), options);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      if (!result.hasContext) {
        console.warn(result.message);
        return;
      }

      if (result.outputMode === 'stdout' || result.fallbackToStdout) {
        console.log(result.output);
      }

      if (result.outputMode === 'clipboard' || result.fallbackToStdout) {
        console.log(result.message);
      }
    });
}
