import { promises as fs } from 'node:fs';
import path from 'node:path';

import { makeGitRepo, noPrompt } from './helpers';

import { createProgram } from '../src/cli';
import { runDiff } from '../src/commands/diff';
import { runHandoff } from '../src/commands/handoff';
import { runInit } from '../src/commands/init';
import { runLog } from '../src/commands/log';
import { runResume } from '../src/commands/resume';
import { runSave } from '../src/commands/save';
import { MCP_RESOURCE_URIS, MCP_TOOL_NAMES, MCP_TRANSPORT } from '../src/mcp/contracts';
import { VS_CODE_COMMANDS } from '../src/vscode/bridge';

function extractManifestEntries(section: string): string[] {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- `'))
    .map((line) => {
      const match = line.match(/- `([^`]+)`/);
      return match?.[1] ?? '';
    })
    .filter((value) => value.length > 0);
}

describe('E9-T2 end-to-end branch continuity flow', () => {
  test('init -> save -> resume -> diff -> log -> handoff succeeds', async () => {
    const repoPath = await makeGitRepo('branxa-e2e-flow-');

    const initResult = await runInit(repoPath);
    expect(initResult.ok).toBe(true);

    const saveResult = await runSave(
      repoPath,
      'Implement release gate flow',
      {
        state: 'saved initial context',
        nextSteps: 'run diff;;prepare handoff',
      },
      noPrompt,
    );
    expect(saveResult.ok).toBe(true);

    const resumeResult = await runResume(repoPath, { stdout: true });
    expect(resumeResult.ok).toBe(true);
    expect(resumeResult.hasContext).toBe(true);
    expect(resumeResult.output).toContain('Task: Implement release gate flow');

    const diffResult = await runDiff(repoPath);
    expect(diffResult.ok).toBe(true);
    expect(diffResult.hasContext).toBe(true);

    const logResult = await runLog(repoPath, { count: '5' });
    expect(logResult.ok).toBe(true);
    expect(logResult.entries.length).toBeGreaterThanOrEqual(1);

    const handoffResult = await runHandoff(
      repoPath,
      'teammate',
      'Continue with release checklist and signoff',
    );
    expect(handoffResult.ok).toBe(true);

    const postHandoffLog = await runLog(repoPath, { count: '5' });
    expect(postHandoffLog.entries.length).toBeGreaterThanOrEqual(2);
  });
});
