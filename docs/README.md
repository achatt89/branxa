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

- [Getting Started](getting-started.md)
- [Architecture](architecture.md)
- [CLI](cli/overview.md)
- [Adapters](adapters/mcp.md)
- [Internals](internals/data-model.md)
- [Contributing](contributing.md)
- [GitHub Pages Deployment](deployment-github-pages.md)
