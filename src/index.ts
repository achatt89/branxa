import { createProgram } from './cli';

async function main(): Promise<void> {
  const program = createProgram();
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unexpected CLI failure: ${message}`);
  process.exitCode = 1;
});
