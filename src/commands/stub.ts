import { Command } from 'commander';

interface StubCommandOptions {
  name: string;
  description: string;
  configure?: (command: Command) => void;
}

export function createStubCommand(options: StubCommandOptions): Command {
  const command = new Command(options.name).description(options.description);

  options.configure?.(command);
  command.action(() => {
    // Stubs keep command wiring stable while later epics are implemented.
    console.log(`'${options.name}' is not implemented yet.`);
  });

  return command;
}
