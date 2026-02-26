import { Command } from 'commander';
import {
  assertInitialized,
  deleteAllEntries,
  deleteBranchEntry,
  readBranchEntries,
} from '../lib/context-store';
import { getCurrentBranch, isGitRepository } from '../lib/git';
import { sortByTimestampDesc } from '../lib/context-utils';

export interface DeleteCommandOptions {
  last?: boolean;
  id?: string;
  all?: boolean;
}

export interface DeleteResult {
  ok: boolean;
  message: string;
}

export async function runDelete(cwd: string, options: DeleteCommandOptions): Promise<DeleteResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa delete requires a git repository.',
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
    };
  }

  if (options.all) {
    await deleteAllEntries(cwd);
    return {
      ok: true,
      message: 'Deleted all context entries and sessions.',
    };
  }

  const branch = getCurrentBranch(cwd);

  if (options.last) {
    const entries = sortByTimestampDesc(await readBranchEntries(cwd, branch));
    if (entries.length === 0) {
      return {
        ok: false,
        message: `No context entries found for branch '${branch}'.`,
      };
    }

    const last = entries[0];
    await deleteBranchEntry(cwd, branch, last.id);
    return {
      ok: true,
      message: `Deleted most recent context entry (${last.id.slice(0, 8)}) for branch '${branch}'.`,
    };
  }

  if (options.id) {
    const success = await deleteBranchEntry(cwd, branch, options.id);
    if (!success) {
      return {
        ok: false,
        message: `Context entry with ID '${options.id}' not found in branch '${branch}'.`,
      };
    }
    return {
      ok: true,
      message: `Deleted context entry '${options.id}' from branch '${branch}'.`,
    };
  }

  return {
    ok: false,
    message: 'Specify --last, --id <id>, or --all to delete.',
  };
}

export function createDeleteCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('delete')
    .description('Delete context entries')
    .option('--last', 'Delete the most recent context entry for the current branch')
    .option('--id <value>', 'Delete a specific context entry by ID')
    .option('--all', 'Delete all context entries across all branches')
    .action(async (options: DeleteCommandOptions) => {
      const result = await runDelete(resolveCwd(), options);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      console.log(result.message);
    });
}
