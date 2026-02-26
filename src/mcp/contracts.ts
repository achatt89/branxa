import { runLog } from '../commands/log';
import { runResume } from '../commands/resume';
import { runSave } from '../commands/save';
import { assertInitialized } from '../lib/context-store';

export const MCP_TRANSPORT = 'stdio' as const;
export const MCP_TOOL_NAMES = ['branxa_resume', 'branxa_save', 'branxa_log'] as const;
export const MCP_RESOURCE_URIS = ['branxa://context'] as const;

export interface MCPTextContent {
  type: 'text';
  text: string;
}

export interface MCPToolResult {
  content: MCPTextContent[];
}

export interface MCPResourceResult {
  uri: string;
  text: string;
}

export async function runMcpTool(
  cwd: string,
  name: (typeof MCP_TOOL_NAMES)[number],
  args: Record<string, unknown>,
): Promise<MCPToolResult> {
  if (name === 'branxa_resume') {
    const result = await runResume(cwd, {
      branch: asString(args.branch) || undefined,
      stdout: true,
    });

    if (!result.ok) {
      return textResult(result.message);
    }

    if (!result.hasContext) {
      return textResult(result.message);
    }

    return textResult(result.output);
  }

  if (name === 'branxa_save') {
    const result = await runSave(
      cwd,
      asString(args.message) || undefined,
      {
        goal: asString(args.goal) || undefined,
        auto: Boolean(args.auto),
        approaches: asString(args.approaches) || undefined,
        decisions: asString(args.decisions) || undefined,
        state: asString(args.state) || undefined,
        nextSteps: asString(args.nextSteps) || undefined,
        blockers: asString(args.blockers) || undefined,
      },
      {
        prompt: async () => '',
      },
    );

    return textResult(result.message);
  }

  const result = await runLog(cwd, {
    all: Boolean(args.all),
    count: asString(args.count) || undefined,
  });

  if (!result.ok || result.lines.length === 0) {
    return textResult(result.message);
  }

  return textResult([result.message, ...result.lines].join('\n'));
}

export async function readMcpResource(cwd: string, uri: string): Promise<MCPResourceResult> {
  if (uri !== 'branxa://context') {
    return {
      uri,
      text: `Unsupported resource URI: ${uri}`,
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      uri,
      text: initialized.message,
    };
  }

  const result = await runResume(cwd, { stdout: true });
  if (!result.ok) {
    return {
      uri,
      text: result.message,
    };
  }

  if (!result.hasContext) {
    return {
      uri,
      text: result.message,
    };
  }

  return {
    uri,
    text: result.output,
  };
}

function textResult(text: string): MCPToolResult {
  return {
    content: [{ type: 'text', text }],
  };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
