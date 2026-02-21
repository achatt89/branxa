# Data Model and Storage

## Storage layout

```text
.branxa/
  config.json
  sessions/<uuid>.json
  branches/<encoded-branch>.json
```

## Context entry fields

- `id`, `timestamp`, `branch`, `repo`, `author`
- `task`, `goal`, `approaches`, `decisions`
- `currentState`, `nextSteps`, `blockers`
- `filesChanged`, `filesStaged`, `recentCommits`
- optional: `assignee`, `handoffNote`, `compressed`

## Merge semantics

When merging branch entries:

- dedupe key: `id`
- winner for duplicates: newest `timestamp`
- output order: ascending `timestamp`

## Key implementation

- `src/lib/context-store.ts`
- `src/types.ts`
