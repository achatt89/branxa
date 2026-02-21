import { randomUUID } from 'node:crypto';
import { Command } from 'commander';

import { requestAIText, resolveAIConfig, extractJsonValue, validateAIConfig } from '../lib/ai';
import { uniqueValues, toStringArray } from '../lib/arrays';
import { loadConfig } from '../lib/config';
import { appendBranchEntry, assertInitialized, saveSessionEntry } from '../lib/context-store';
import {
  getChangedFiles,
  getCurrentBranch,
  getGitAuthor,
  getRecentCommits,
  getRepoName,
  getStagedFiles,
  isGitRepository
} from '../lib/git';
import type { ContextEntry } from '../types';

interface SummarizePayload {
  task: string;
  goal: string;
  approaches: string[];
  decisions: string[];
  currentState: string;
  nextSteps: string[];
  blockers: string[];
}

export interface SummarizeDependencies {
  now?: () => Date;
  askAI?: (input: { systemPrompt: string; userPrompt: string; cwd: string }) => Promise<string>;
}

export interface SummarizeResult {
  ok: boolean;
  message: string;
  usedRawFallback: boolean;
  entry?: ContextEntry;
}

export async function runSummarize(cwd: string, deps: SummarizeDependencies = {}): Promise<SummarizeResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa summarize requires a git repository.',
      usedRawFallback: false
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      usedRawFallback: false
    };
  }

  const config = await loadConfig(cwd);
  const branch = getCurrentBranch(cwd);
  const filesChanged = getChangedFiles(cwd);
  const filesStaged = getStagedFiles(cwd);
  const recentCommits = getRecentCommits(cwd, config.recentCommitCount);

  const systemPrompt =
    'You are a coding context summarizer. Return strict JSON object with keys: task, goal, approaches, decisions, currentState, nextSteps, blockers.';
  const userPrompt = buildSummarizePrompt(branch, filesChanged, filesStaged, recentCommits);

  const aiTextResult = await requestSummaryText(cwd, systemPrompt, userPrompt, deps.askAI);
  if (!aiTextResult.ok) {
    return {
      ok: false,
      message: aiTextResult.error,
      usedRawFallback: false
    };
  }

  const parsedPayload = tryParseSummaryPayload(aiTextResult.text);
  const usedRawFallback = !parsedPayload;

  const payload: SummarizePayload =
    parsedPayload ??
    {
      task: `AI summary for ${branch}`,
      goal: '',
      approaches: [],
      decisions: [],
      currentState: `Raw AI summary: ${aiTextResult.text.trim()}`,
      nextSteps: [],
      blockers: []
    };

  const now = deps.now ?? (() => new Date());
  const entry: ContextEntry = {
    id: randomUUID(),
    timestamp: now().toISOString(),
    branch,
    repo: getRepoName(cwd),
    author: getGitAuthor(cwd),
    task: payload.task,
    goal: payload.goal,
    approaches: uniqueValues(payload.approaches),
    decisions: uniqueValues(payload.decisions),
    currentState: payload.currentState,
    nextSteps: uniqueValues(payload.nextSteps),
    blockers: uniqueValues(payload.blockers),
    filesChanged,
    filesStaged,
    recentCommits
  };

  await appendBranchEntry(cwd, entry);
  await saveSessionEntry(cwd, entry);

  return {
    ok: true,
    message: usedRawFallback
      ? 'Saved AI summary using raw-text fallback (structured parse failed).'
      : 'Saved AI-generated structured summary.',
    usedRawFallback,
    entry
  };
}

export function createSummarizeCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('summarize').description('Summarize repository activity with AI').action(async () => {
    const result = await runSummarize(resolveCwd());

    if (!result.ok) {
      console.error(result.message);
      process.exitCode = 1;
      return;
    }

    console.log(result.message);
  });
}

async function requestSummaryText(
  cwd: string,
  systemPrompt: string,
  userPrompt: string,
  askAI: SummarizeDependencies['askAI']
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
      error: aiResult.error ?? 'Unknown AI summarize failure.'
    };
  }

  return {
    ok: true,
    text: aiResult.text
  };
}

function buildSummarizePrompt(
  branch: string,
  filesChanged: string[],
  filesStaged: string[],
  recentCommits: string[]
): string {
  return [
    `Branch: ${branch}`,
    `Files changed: ${filesChanged.length > 0 ? filesChanged.join(', ') : '(none)'}`,
    `Files staged: ${filesStaged.length > 0 ? filesStaged.join(', ') : '(none)'}`,
    `Recent commits: ${recentCommits.length > 0 ? recentCommits.join(' | ') : '(none)'}`,
    'Summarize this state into actionable coding context.'
  ].join('\n');
}

function tryParseSummaryPayload(rawText: string): SummarizePayload | null {
  const parsed = extractJsonValue(rawText);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const record = parsed as Record<string, unknown>;

  return {
    task: asString(record.task) || 'AI summary',
    goal: asString(record.goal),
    approaches: toStringArray(record.approaches),
    decisions: toStringArray(record.decisions),
    currentState: asString(record.currentState) || asString(record.summary),
    nextSteps: toStringArray(record.nextSteps),
    blockers: toStringArray(record.blockers)
  };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
