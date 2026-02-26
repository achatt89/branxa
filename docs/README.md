# Branxa Developer Docs

This documentation is for engineers who maintain or extend Branxa.

## Who this is for

- maintainers of the CLI package
- contributors adding commands or adapters
- teams integrating Branxa with MCP or editor tooling

## Prerequisites

- Node.js 20+
- npm
- Git

## Local docs workflow

```bash
# Build docs static site
npx honkit build docs docs-site

# Serve docs locally
npx honkit serve docs
```

## Documentation map

- **[Getting Started](getting-started.md)**: Installation, CLI bootstrap, and your first save/resume loop.
- **[Architecture](architecture.md)**: System design, data flow analysis, and internal component mapping.
- **[CLI Overview](cli/overview.md)**: Complete command reference, global flags, and interactive behavior.
- **[Collaboration](cli/collaboration.md)**: Deep dive into the `handoff` and `share` workflows for teams.
- **[Adapters](adapters/mcp.md)**: Integrating Branxa with MCP (AI Agents) and VS Code.
- **[Internals](internals/data-model.md)**: JSON schema specifications and context storage details.
- **[Contributing](contributing.md)**: Guidelines for code style, testing, and PR submissions.
- **[GitHub Pages Deployment](deployment-github-pages.md)**: How the documentation site and npm packages are published.

---

Built by [The Logic Atelier](https://thelogicatelier.com)
