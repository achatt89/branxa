import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractAntigravityContext } from '../src/parsers/antigravity';
import { extractClaudeContext } from '../src/parsers/claude';
import { extractCursorContext } from '../src/parsers/cursor';
import { extractAutoContext } from '../src/parsers';

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe('E5-T1 Claude extraction', () => {
  test('extracts structured context from Claude memory JSON', async () => {
    const root = await makeTempDir('branxa-parser-claude-memory-');
    await fs.mkdir(path.join(root, '.claude'), { recursive: true });

    await fs.writeFile(
      path.join(root, '.claude', 'memory.json'),
      JSON.stringify({
        task: 'Implement parser pipeline',
        approaches: ['parse memory first'],
        decisions: ['prefer deterministic extraction'],
        currentState: 'memory parsed'
      }),
      'utf8'
    );

    const result = await extractClaudeContext(root);

    expect(result?.task).toBe('Implement parser pipeline');
    expect(result?.approaches).toEqual(['parse memory first']);
    expect(result?.decisions).toEqual(['prefer deterministic extraction']);
    expect(result?.currentState).toBe('memory parsed');
  });

  test('extracts task/approach/decision/state from Claude JSONL content', async () => {
    const root = await makeTempDir('branxa-parser-claude-jsonl-');
    await fs.mkdir(path.join(root, '.claude'), { recursive: true });

    const jsonl = [
      JSON.stringify({ role: 'user', content: 'Task: Build extraction tests' }),
      JSON.stringify({ role: 'assistant', content: 'Approach: parse JSONL records' }),
      JSON.stringify({ role: 'assistant', content: 'Decision: use tag-based parser' }),
      JSON.stringify({ role: 'assistant', content: 'State: parser implemented' })
    ].join('\n');

    await fs.writeFile(path.join(root, '.claude', 'session.jsonl'), jsonl, 'utf8');

    const result = await extractClaudeContext(root);

    expect(result?.task).toBe('Build extraction tests');
    expect(result?.approaches).toEqual(expect.arrayContaining(['parse JSONL records']));
    expect(result?.decisions).toEqual(expect.arrayContaining(['use tag-based parser']));
    expect(result?.currentState).toBe('parser implemented');
  });
});

describe('E5-T2 Antigravity extraction', () => {
  test('extracts structured context from task/implementation/walkthrough files', async () => {
    const root = await makeTempDir('branxa-parser-antigravity-');
    await fs.mkdir(path.join(root, '.antigravity'), { recursive: true });

    await fs.writeFile(path.join(root, '.antigravity', 'task.md'), 'Task: Ship parser parity\nGoal: deterministic extraction\n', 'utf8');
    await fs.writeFile(
      path.join(root, '.antigravity', 'implementation_plan.md'),
      'Approach: parse markdown artifacts\nDecision: avoid sqlite introspection\nNext Step: add parser tests\n',
      'utf8'
    );
    await fs.writeFile(
      path.join(root, '.antigravity', 'walkthrough.md'),
      'Current State: parser behavior validated\nBlocker: none\n',
      'utf8'
    );

    const result = await extractAntigravityContext(root);

    expect(result?.task).toBe('Ship parser parity');
    expect(result?.goal).toBe('deterministic extraction');
    expect(result?.approaches).toEqual(expect.arrayContaining(['parse markdown artifacts']));
    expect(result?.decisions).toEqual(expect.arrayContaining(['avoid sqlite introspection']));
    expect(result?.nextSteps).toEqual(expect.arrayContaining(['add parser tests']));
    expect(result?.currentState).toBe('parser behavior validated');
  });
});

describe('E5-T3 Cursor fallback behavior', () => {
  test('cursor paths do not crash and unresolved states return null', async () => {
    const root = await makeTempDir('branxa-parser-cursor-');
    await fs.mkdir(path.join(root, '.cursor', 'rules'), { recursive: true });

    const cursorResult = await extractCursorContext(root);
    const pipelineResult = await extractAutoContext(root);

    expect(cursorResult).toBeNull();
    expect(pipelineResult).toBeNull();
  });
});
