# GitHub Pages Deployment

This repository includes a Pages workflow at `.github/workflows/docs-pages.yml`.

## Deployment model

- trigger: push to `main` (and manual dispatch)
- build engine: HonKit (`npx honkit build docs docs-site`)
- publish target: GitHub Pages artifact from `docs-site/`

## One-time repository setup

1. Open repository settings in GitHub.
2. Go to **Pages**.
3. Under **Build and deployment**, set source to **GitHub Actions**.

After setup, every push to `main` rebuilds and deploys the docs site.

## Local preview before push

```bash
npx honkit build docs docs-site
npx honkit serve docs
```
