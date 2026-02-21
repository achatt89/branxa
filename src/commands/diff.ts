import { Command } from 'commander';

import { assertInitialized, readBranchEntries } from '../lib/context-store';
import { sortByTimestampAsc } from '../lib/context-utils';
import { getChangedFiles, getCurrentBranch, isGitRepository } from '../lib/git';

export interface DiffResult {
  ok: boolean;
  hasContext: boolean;
  message: string;
  newFiles: string[];
  stillFiles: string[];
  resolvedFiles: string[];
  decisionAdded: string[];
  decisionResolved: string[];
  nextStepsAdded: string[];
  nextStepsResolved: string[];
}

export async function runDiff(cwd: string): Promise<DiffResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      hasContext: false,
      message: 'Branxa diff requires a git repository.',
      newFiles: [],
      stillFiles: [],
      resolvedFiles: [],
      decisionAdded: [],
      decisionResolved: [],
      nextStepsAdded: [],
      nextStepsResolved: []
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      hasContext: false,
      message: initialized.message,
      newFiles: [],
      stillFiles: [],
      resolvedFiles: [],
      decisionAdded: [],
      decisionResolved: [],
      nextStepsAdded: [],
      nextStepsResolved: []
    };
  }

  const branch = getCurrentBranch(cwd);
  const entries = sortByTimestampAsc(await readBranchEntries(cwd, branch));

  if (entries.length === 0) {
    return {
      ok: true,
      hasContext: false,
      message: `No saved context found for branch '${branch}'.`,
      newFiles: [],
      stillFiles: [],
      resolvedFiles: [],
      decisionAdded: [],
      decisionResolved: [],
      nextStepsAdded: [],
      nextStepsResolved: []
    };
  }

  const latest = entries[entries.length - 1];
  const currentFiles = getChangedFiles(cwd);
  const latestSavedFiles = latest.filesChanged ?? [];

  const newFiles = currentFiles.filter((file) => !latestSavedFiles.includes(file));
  const stillFiles = currentFiles.filter((file) => latestSavedFiles.includes(file));
  const resolvedFiles = latestSavedFiles.filter((file) => !currentFiles.includes(file));

  const previous = entries.length > 1 ? entries[entries.length - 2] : null;
  const previousDecisions = previous?.decisions ?? [];
  const latestDecisions = latest.decisions ?? [];
  const previousNextSteps = previous?.nextSteps ?? [];
  const latestNextSteps = latest.nextSteps ?? [];

  return {
    ok: true,
    hasContext: true,
    message: `Compared repository state with latest saved context for branch '${branch}'.`,
    newFiles,
    stillFiles,
    resolvedFiles,
    decisionAdded: latestDecisions.filter((value) => !previousDecisions.includes(value)),
    decisionResolved: previousDecisions.filter((value) => !latestDecisions.includes(value)),
    nextStepsAdded: latestNextSteps.filter((value) => !previousNextSteps.includes(value)),
    nextStepsResolved: previousNextSteps.filter((value) => !latestNextSteps.includes(value))
  };
}

export function createDiffCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('diff').description('Compare context with repository state').action(async () => {
    const result = await runDiff(resolveCwd());

    if (!result.ok) {
      console.error(result.message);
      process.exitCode = 1;
      return;
    }

    if (!result.hasContext) {
      console.warn(result.message);
      return;
    }

    console.log(result.message);
    console.log(`New files: ${formatList(result.newFiles)}`);
    console.log(`Still changed: ${formatList(result.stillFiles)}`);
    console.log(`Resolved since save: ${formatList(result.resolvedFiles)}`);

    if (
      result.decisionAdded.length > 0 ||
      result.decisionResolved.length > 0 ||
      result.nextStepsAdded.length > 0 ||
      result.nextStepsResolved.length > 0
    ) {
      console.log(`Decision progression: +${formatList(result.decisionAdded)} | -${formatList(result.decisionResolved)}`);
      console.log(`Next-step progression: +${formatList(result.nextStepsAdded)} | -${formatList(result.nextStepsResolved)}`);
    }
  });
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : '(none)';
}
