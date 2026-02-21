import { Command } from 'commander';

import { requestAIText, extractJsonValue, resolveAIConfig, validateAIConfig } from '../lib/ai';
import { uniqueValues, toStringArray } from '../lib/arrays';
import { assertInitialized, readBranchEntries } from '../lib/context-store';
import { sortByTimestampAsc } from '../lib/context-utils';
import { getChangedFiles, getCurrentBranch, isGitRepository } from '../lib/git';

export interface SuggestDependencies {
  askAI?: (input: { systemPrompt: string; userPrompt: string; cwd: string }) => Promise<string>;
}

export interface SuggestResult {
  ok: boolean;
  hasSuggestions: boolean;
  message: string;
  suggestions: string[];
}

export async function runSuggest(cwd: string, deps: SuggestDependencies = {}): Promise<SuggestResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      hasSuggestions: false,
      message: 'Branxa suggest requires a git repository.',
      suggestions: []
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      hasSuggestions: false,
      message: initialized.message,
      suggestions: []
    };
  }

  const branch = getCurrentBranch(cwd);
  const entries = sortByTimestampAsc(await readBranchEntries(cwd, branch));
  const latest = entries[entries.length - 1];
  const changedFiles = getChangedFiles(cwd);
  const actionableFiles = changedFiles.filter(
    (file) => file !== '.gitignore' && !file.startsWith('.branxa/')
  );

  if (!latest && actionableFiles.length === 0) {
    return {
      ok: true,
      hasSuggestions: false,
      message: 'No context or repository changes found. Save context or make changes first.',
      suggestions: []
    };
  }

  const systemPrompt =
    'You provide coding next steps. Return strict JSON array with 3 to 5 concise actionable strings.';
  const userPrompt = [
    `Branch: ${branch}`,
    `Task: ${latest?.task ?? '(no saved task)'}`,
    `Current state: ${latest?.currentState ?? '(none)'}`,
    `Saved next steps: ${latest?.nextSteps?.join('; ') || '(none)'}`,
    `Uncommitted files: ${actionableFiles.length > 0 ? actionableFiles.join(', ') : '(none)'}`
  ].join('\n');

  const aiTextResult = await requestSuggestionsText(cwd, systemPrompt, userPrompt, deps.askAI);
  if (!aiTextResult.ok) {
    return {
      ok: false,
      hasSuggestions: false,
      message: aiTextResult.error,
      suggestions: []
    };
  }

  const parsedSuggestions = tryParseSuggestions(aiTextResult.text);
  const normalized = normalizeSuggestions(
    parsedSuggestions.length > 0 ? parsedSuggestions : fallbackSuggestions(latest?.nextSteps ?? [], actionableFiles)
  );

  return {
    ok: true,
    hasSuggestions: true,
    message: 'Suggested next steps:',
    suggestions: normalized
  };
}

export function createSuggestCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('suggest').description('Suggest next steps with AI').action(async () => {
    const result = await runSuggest(resolveCwd());

    if (!result.ok) {
      console.error(result.message);
      process.exitCode = 1;
      return;
    }

    if (!result.hasSuggestions) {
      console.warn(result.message);
      return;
    }

    console.log(result.message);
    for (let index = 0; index < result.suggestions.length; index += 1) {
      console.log(`${index + 1}. ${result.suggestions[index]}`);
    }
  });
}

async function requestSuggestionsText(
  cwd: string,
  systemPrompt: string,
  userPrompt: string,
  askAI: SuggestDependencies['askAI']
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (askAI) {
    const text = await askAI({ systemPrompt, userPrompt, cwd });
    return { ok: true, text };
  }

  const aiConfig = await resolveAIConfig(cwd);
  const validation = validateAIConfig(aiConfig);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.message
    };
  }

  const aiResult = await requestAIText(aiConfig, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  if (!aiResult.ok) {
    return {
      ok: false,
      error: aiResult.error ?? 'Unknown AI suggest failure.'
    };
  }

  return {
    ok: true,
    text: aiResult.text
  };
}

function tryParseSuggestions(rawText: string): string[] {
  const parsed = extractJsonValue(rawText);

  if (Array.isArray(parsed)) {
    return toStringArray(parsed);
  }

  if (parsed && typeof parsed === 'object') {
    const steps = (parsed as Record<string, unknown>).steps;
    return toStringArray(steps);
  }

  return [];
}

function fallbackSuggestions(savedNextSteps: string[], changedFiles: string[]): string[] {
  const suggestions: string[] = [];

  if (savedNextSteps.length > 0) {
    suggestions.push(`Start with saved next step: ${savedNextSteps[0]}`);
  }

  if (changedFiles.length > 0) {
    suggestions.push(`Review uncommitted changes in: ${changedFiles.slice(0, 3).join(', ')}`);
  }

  suggestions.push('Run tests for the current branch scope.');
  suggestions.push('Update context with progress and decisions.');
  suggestions.push('Prepare a focused commit for the completed unit of work.');

  return suggestions;
}

function normalizeSuggestions(values: string[]): string[] {
  const unique = uniqueValues(values);
  if (unique.length >= 3) {
    return unique.slice(0, 5);
  }

  const fallback = fallbackSuggestions([], []);
  return uniqueValues([...unique, ...fallback]).slice(0, 3);
}
