import { Command } from 'commander';

import { createDiffCommand } from './commands/diff';
import { createInitCommand } from './commands/init';
import { createLogCommand } from './commands/log';
import { createResumeCommand } from './commands/resume';
import { createSaveCommand } from './commands/save';
import { createStubCommand } from './commands/stub';

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
  program.addCommand(
    createStubCommand({
      name: 'handoff',
      description: 'Save teammate handoff details',
      configure: (command) => {
        command.argument('[assignee]').argument('[message]');
      }
    })
  );
  program.addCommand(
    createStubCommand({
      name: 'share',
      description: 'Toggle Branxa storage sharing',
      configure: (command) => {
        command.option('--stop');
      }
    })
  );
  program.addCommand(
    createStubCommand({
      name: 'watch',
      description: 'Periodically capture context',
      configure: (command) => {
        command.option('--interval <value>');
      }
    })
  );
  program.addCommand(
    createStubCommand({
      name: 'hook',
      description: 'Manage git hook integration',
      configure: (command) => {
        command.argument('<action>');
      }
    })
  );
  program.addCommand(createStubCommand({ name: 'summarize', description: 'Summarize repository activity with AI' }));
  program.addCommand(createStubCommand({ name: 'suggest', description: 'Suggest next steps with AI' }));
  program.addCommand(createStubCommand({ name: 'compress', description: 'Compress branch context history' }));
  program.addCommand(
    createStubCommand({
      name: 'config',
      description: 'Manage Branxa settings',
      configure: (command) => {
        command.argument('[action]').argument('[key]').argument('[value]');
      }
    })
  );

  return program;
}
