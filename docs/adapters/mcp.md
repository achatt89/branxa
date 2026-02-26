# Model Context Protocol (MCP)

Branxa includes a built-in Model Context Protocol (MCP) server. This allows AI assistants (like Claude Desktop) to interact directly with your Branxa context store, enabling them to "self-resume" projects and save their own progress automatically.

## 1. Overview

The MCP server provides a standardized way for AI tools to:
- **Read Context**: Fetch the latest project state to understand what to do next.
- **Save Context**: Update the project state after completing a task.
- **Browse History**: See previous decisions and approaches.

## 2. Configuration

To use the Branxa MCP server with **Claude Desktop**, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "branxa": {
      "command": "npx",
      "args": ["-y", "@thelogicatelier/branxa", "mcp"]
    }
  }
}
```

If you have installed Branxa locally in your project, you can point to the local binary:

```json
{
  "mcpServers": {
    "branxa": {
      "command": "node",
      "args": ["/path/to/your/project/node_modules/.bin/branxa", "mcp"]
    }
  }
}
```

---

## 3. Supported Tools

The MCP server exposes the core Branxa commands as tools that an AI agent can call.

### `branxa_resume`
Fetches the latest context prompt for a specific branch.

**Arguments:**
- `branch` (string, optional): The Git branch to resume from. Defaults to the current active branch.

### `branxa_save`
Saves a new context entry. This is used by AI agents to "check in" after finishing a task.

**Arguments:**
- `message` (string, required): Brief summary of what was done.
- `goal` (string, optional): The high-level objective.
- `state` (string, optional): Technical status (e.g., "Tests passing, refactor complete").
- `nextSteps` (string, optional): Recommended next actions (separate with `;;`).
- `approaches` (string, optional): Strategies explored.
- `decisions` (string, optional): Key architectural choices made.
- `blockers` (string, optional): Outstanding issues.
- `auto` (boolean, optional): Set to `true` to enable auto-extraction of additional context from supported IDE files.

### `branxa_log`
Retrieves a list of recent context entries to help the AI understand the project's evolution.

**Arguments:**
- `count` (number, optional): Number of entries to return (default: 10).
- `all` (boolean, optional): Whether to show all branches or just the current one.

---

## 4. Supported Resources

Resources are static-ish data that an AI can "read" at any time without calling a tool.

### `branxa://context`
Provides the same comprehensive context prompt as `branxa_resume`. This is often the first thing an AI assistant will read when you mention "Branxa" or "Project Context".

---

## 5. Development & Testing

The MCP server uses **JSON-RPC 2.0** over **Standard Input/Output (stdio)**.

### Testing manually
You can run the MCP server in your terminal to see it in action:

```bash
branxa mcp
```

Then paste a tool call request (followed by Enter):

```json
{"id":"1","kind":"tool","tool":"branxa_resume","args":{}}
```

### Protocol Details
- **Transport**: `stdio`
- **Serialization**: Line-delimited JSON
- **Implementation**: See `src/mcp/index.ts` (transport) and `src/mcp/contracts.ts` (tool logic).

---

## 6. Best Practices for AI Agents

When building or using an AI agent with Branxa:

1.  **Always Resume First**: The first step of any agent task should be reading `branxa://context` or calling `branxa_resume`.
2.  **Save Major Milestones**: Agents should call `branxa_save` after any significant achievement (e.g., "Auth implemented", "Bug #123 fixed").
3.  **Use Structured Fields**: Encourage agents to populate `nextSteps` and `decisions` so the next person (or agent) can hit the ground running.
