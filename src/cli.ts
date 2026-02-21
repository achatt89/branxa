import { Command } from 'commander';

import { createDiffCommand } from './commands/diff';
import { createCompressCommand } from './commands/compress';
import { createConfigCommand } from './commands/config';
import { createHandoffCommand } from './commands/handoff';
import { createHookCommand } from './commands/hook';
import { createInitCommand } from './commands/init';
import { createLogCommand } from './commands/log';
import { createResumeCommand } from './commands/resume';
import { createSaveCommand } from './commands/save';
import { createShareCommand } from './commands/share';
import { createSuggestCommand } from './commands/suggest';
import { createSummarizeCommand } from './commands/summarize';
import { createWatchCommand } from './commands/watch';

export interface ProgramDependencies {
  cwd?: () => string;
}

export function createProgram(deps: ProgramDependencies = {}): Command {
  const resolveCwd = deps.cwd ?? (() => process.cwd());
  const program = new Command();

  program
    .name('branxa')
    .description('Branxa persistent coding context system')
    .version('0.1.0');

  program.addCommand(createInitCommand(resolveCwd));
  program.addCommand(createSaveCommand(resolveCwd));
  program.addCommand(createResumeCommand(resolveCwd));
  program.addCommand(createLogCommand(resolveCwd));
  program.addCommand(createDiffCommand(resolveCwd));
  program.addCommand(createHandoffCommand(resolveCwd));
  program.addCommand(createShareCommand(resolveCwd));
  program.addCommand(createWatchCommand(resolveCwd));
  program.addCommand(createHookCommand(resolveCwd));
  program.addCommand(createSummarizeCommand(resolveCwd));
  program.addCommand(createSuggestCommand(resolveCwd));
  program.addCommand(createCompressCommand(resolveCwd));
  program.addCommand(createConfigCommand(resolveCwd));

  return program;
}
