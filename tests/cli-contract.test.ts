import { createProgram } from '../src/cli';

const EXPECTED_COMMANDS = [
  'init',
  'save',
  'resume',
  'log',
  'diff',
  'handoff',
  'share',
  'watch',
  'hook',
  'summarize',
  'suggest',
  'compress',
  'config',
  'delete',
];

describe('E1-T1 CLI bootstrap and command wiring', () => {
  test('registers the full canonical command surface without throw', () => {
    const program = createProgram();
    const commandNames = program.commands.map((command) => command.name());

    expect(commandNames).toEqual(EXPECTED_COMMANDS);
  });

  test('exposes version metadata', () => {
    const program = createProgram();
    expect(program.version()).toBe('0.1.0');
  });

  test('exposes help metadata', () => {
    const program = createProgram();
    const help = program.helpInformation();

    expect(help).toContain('Usage: branxa');
    expect(help).toContain('Initialize Branxa repository storage');
    expect(help).toContain('save [options] [message]');
    expect(help).toContain('config [action] [key] [value]');
  });
});
