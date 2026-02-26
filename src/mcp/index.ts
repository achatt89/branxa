#!/usr/bin/env node
import readline from 'node:readline';

import { readMcpResource, runMcpTool } from './contracts';

type MCPRequest =
  | {
      kind: 'tool';
      id?: string;
      tool: 'branxa_resume' | 'branxa_save' | 'branxa_log';
      args?: Record<string, unknown>;
      cwd?: string;
    }
  | {
      kind: 'resource';
      id?: string;
      uri: string;
      cwd?: string;
    };

async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const request = JSON.parse(trimmed) as MCPRequest;
      const cwd = request.cwd ?? process.cwd();

      if (request.kind === 'tool') {
        const response = await runMcpTool(cwd, request.tool, request.args ?? {});
        process.stdout.write(`${JSON.stringify({ id: request.id, ...response })}\n`);
        continue;
      }

      const resource = await readMcpResource(cwd, request.uri);
      process.stdout.write(`${JSON.stringify({ id: request.id, resource })}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stdout.write(`${JSON.stringify({ error: message })}\n`);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`MCP server failure: ${message}`);
  process.exitCode = 1;
});
