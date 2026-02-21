import { makeGitRepo } from './helpers';

import { runInit } from '../src/commands/init';
import { runSave } from '../src/commands/save';
import { readMcpResource, runMcpTool } from '../src/mcp/contracts';

describe('E6-T1 MCP tool contracts', () => {
  test('branxa_save and branxa_log return MCP text content', async () => {
    const repoPath = await makeGitRepo('branxa-mcp-tools-');
    await runInit(repoPath);

    const saveResult = await runMcpTool(repoPath, 'branxa_save', {
      message: 'MCP save task',
      state: 'saved via mcp'
    });

    expect(saveResult.content).toHaveLength(1);
    expect(saveResult.content[0].type).toBe('text');
    expect(saveResult.content[0].text).toContain('Saved context');

    const logResult = await runMcpTool(repoPath, 'branxa_log', { count: '5' });
    expect(logResult.content).toHaveLength(1);
    expect(logResult.content[0].type).toBe('text');
    expect(logResult.content[0].text).toContain('MCP save task');
  });

  test('uninitialized repo returns expected guidance', async () => {
    const repoPath = await makeGitRepo('branxa-mcp-uninitialized-');

    const resumeResult = await runMcpTool(repoPath, 'branxa_resume', {});

    expect(resumeResult.content[0].text).toContain('Run \'branxa init\' first');
  });
});

describe('E6-T2 MCP resource contract', () => {
  test('branxa://context returns prompt content or explicit no-context state', async () => {
    const repoPath = await makeGitRepo('branxa-mcp-resource-');
    await runInit(repoPath);

    const emptyResource = await readMcpResource(repoPath, 'branxa://context');
    expect(emptyResource.text).toContain('No saved context');

    await runSave(repoPath, 'Resource context task', { state: 'ready for resume' });

    const filledResource = await readMcpResource(repoPath, 'branxa://context');
    expect(filledResource.uri).toBe('branxa://context');
    expect(filledResource.text).toContain('Task: Resource context task');
  });
});
