import { promises as fs } from 'node:fs';
import path from 'node:path';

import { makeGitRepo } from './helpers';

import { runConfig } from '../src/commands/config';
import { runInit } from '../src/commands/init';
import { loadConfig } from '../src/lib/config';
import {
  mergeAndSortEntries,
  mergeBranchEntries,
  readBranchEntries,
  readSessionEntries,
  writeBranchEntries
} from '../src/lib/context-store';
import type { ContextEntry } from '../src/types';

function makeEntry(id: string, timestamp: string, branch = 'main'): ContextEntry {
  return {
    id,
    timestamp,
    branch,
    repo: 'repo',
    author: 'author',
    task: `task-${id}`,
    goal: '',
    approaches: [],
    decisions: [],
    currentState: 'state',
    nextSteps: [],
    blockers: [],
    filesChanged: [],
    filesStaged: [],
    recentCommits: []
  };
}

describe('E8-T1 config command contract', () => {
  test('list/get/set validate keys, coerce values, and mask API key', async () => {
    const repoPath = await makeGitRepo('branxa-config-contract-');
    await runInit(repoPath);

    const setNumber = await runConfig(repoPath, 'set', 'recentCommitCount', '9.8');
    expect(setNumber.ok).toBe(true);
    expect(setNumber.message).toContain('recentCommitCount=9');

    const getNumber = await runConfig(repoPath, 'get', 'recentCommitCount', undefined);
    expect(getNumber.ok).toBe(true);
    expect(getNumber.message).toContain('recentCommitCount=9');

    const setBool = await runConfig(repoPath, 'set', 'autoGitCapture', 'false');
    expect(setBool.ok).toBe(true);
    expect(setBool.message).toContain('autoGitCapture=false');

    const setKey = await runConfig(repoPath, 'set', 'aiApiKey', 'sk-test-secret-value');
    expect(setKey.ok).toBe(true);

    const listResult = await runConfig(repoPath, 'list', undefined, undefined);
    expect(listResult.ok).toBe(true);
    expect(listResult.lines.join('\n')).toContain('aiApiKey=sk-***lue');
    expect(listResult.lines.join('\n')).not.toContain('sk-test-secret-value');

    const invalidKey = await runConfig(repoPath, 'set', 'unknownKey', 'value');
    expect(invalidKey.ok).toBe(false);
    expect(invalidKey.message).toContain('Unknown config key');
  });
});

describe('E8-T2 persistence integrity', () => {
  test('merge/sync dedupes by id and orders by ascending timestamp', async () => {
    const existing = [
      makeEntry('1', '2026-02-21T00:00:01Z'),
      makeEntry('2', '2026-02-21T00:00:02Z')
    ];

    const incoming = [
      makeEntry('2', '2026-02-21T00:00:05Z'),
      makeEntry('3', '2026-02-21T00:00:03Z')
    ];

    const merged = mergeAndSortEntries(existing, incoming);

    expect(merged).toHaveLength(3);
    expect(merged.map((entry) => entry.id)).toEqual(['1', '3', '2']);
    expect(merged.find((entry) => entry.id === '2')?.timestamp).toBe('2026-02-21T00:00:05Z');
  });

  test('mergeBranchEntries persists deduped results and malformed reads fail gracefully', async () => {
    const repoPath = await makeGitRepo('branxa-persistence-integrity-');
    await runInit(repoPath);

    await writeBranchEntries(repoPath, 'main', [makeEntry('1', '2026-02-21T00:00:01Z', 'main')]);

    await mergeBranchEntries(repoPath, 'main', [
      makeEntry('1', '2026-02-21T00:00:04Z', 'main'),
      makeEntry('2', '2026-02-21T00:00:02Z', 'main')
    ]);

    const branchEntries = await readBranchEntries(repoPath, 'main');
    expect(branchEntries.map((entry) => entry.id)).toEqual(['2', '1']);

    const configPath = path.join(repoPath, '.branxa', 'config.json');
    await fs.writeFile(configPath, '{broken-json', 'utf8');

    const config = await loadConfig(repoPath);
    expect(config.defaultLogCount).toBe(10);

    const sessionsPath = path.join(repoPath, '.branxa', 'sessions');
    await fs.writeFile(path.join(sessionsPath, 'good.json'), JSON.stringify(makeEntry('good', '2026-02-21T00:00:10Z')), 'utf8');
    await fs.writeFile(path.join(sessionsPath, 'bad.json'), '{bad-json', 'utf8');

    const sessionEntries = await readSessionEntries(repoPath);
    expect(sessionEntries.find((entry) => entry.id === 'good')).toBeDefined();
    expect(sessionEntries.find((entry) => entry.id === 'bad')).toBeUndefined();
  });
});
