import type { ContextEntry } from '../types';

export function buildResumePrompt(branch: string, entries: ContextEntry[]): string {
  const latest = entries[entries.length - 1];
  const lines = [
    `Branch: ${branch}`,
    `Task: ${latest.task}`,
    `Goal: ${latest.goal || '(not specified)'}`,
    `Current State: ${latest.currentState || '(not specified)'}`,
    `Approaches: ${formatList(latest.approaches)}`,
    `Decisions: ${formatList(latest.decisions)}`,
    `Next Steps: ${formatList(latest.nextSteps)}`,
    `Blockers: ${formatList(latest.blockers)}`,
    `Files Changed: ${formatList(latest.filesChanged)}`,
    `Recent Commits: ${formatList(latest.recentCommits)}`
  ];

  if (entries.length > 1) {
    lines.push('', `History Entries: ${entries.length}`);
  }

  return lines.join('\n');
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join('; ') : '(none)';
}
