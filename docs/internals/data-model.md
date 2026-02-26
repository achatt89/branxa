# Data Model and Storage

Branxa uses a transparent, JSON-based storage for all context data. This ensures that your project memory is human-readable, machine-parsable, and easily version-controlled if desired.

## 1. Storage Layout

The `.branxa/` directory is structured as follows:

```text
.branxa/
├── config.json               # Local project settings
├── branches/                 # History logs for each branch
│   ├── bWFpbg==.json         # base64url encoded "main"
│   └── ZmVhdHVyZS9hdXRo.json # base64url encoded "feature/auth"
└── hooks/                    # Branxa-managed Git hook markers
```

> [!NOTE]
> Branch names are **Base64 URL-safe encoded** to ensure they are valid filenames on all operating systems (including branches with slashes like `feature/auth`).

---

## 2. Context Entry Schema

Every save, handoff, or auto-capture produces a **Context Entry**. Below is the detailed TypeScript-aligned schema:

```typescript
interface ContextEntry {
  // Metadata
  id: string;                // RFC4122 v4 UUID
  timestamp: string;         // ISO 8601 UTC string
  branch: string;            // Original human-readable branch name
  repo: string;              // Name of the repository folder
  author: string;            // Name of the OS user or configured author

  // High-level Intent (Human Notes)
  task: string;              // Short description of the current task
  goal?: string;             // The ultimate objective
  approaches?: string[];     // List of technical paths explored
  decisions?: string[];      // List of architectural choices made
  currentState?: string;     // Technical status summary
  nextSteps?: string[];      // List of remaining sub-tasks
  blockers?: string[];       // Issues preventing progress

  // Technical State (Git Discovery)
  filesChanged: string[];    // List of unstaged and staged files
  filesStaged: string[];     // List of files explicitly in the index
  recentCommits: string[];   // List of last N commit messages (default: 5)

  // Collaboration (Optional)
  assignee?: string;         // Assigned teammate for handoffs
  handoffNote?: string;      // Specific instructions for handoffs

  // Maintenance
  compressed?: boolean;      // True if this is a synthesized summary entry
}
```

---

## 3. Storage Semantics

### Append-Only Logs
Branch history files in `.branxa/branches/` are **append-only JSON arrays**. New entries are pushed to the end of the array. This preserves the chronological order of the developer's thought process.

### Deduplication
When the CLI reads branch history (e.g., for `log` or `resume`), it uses the `id` field as a unique key. If duplicate IDs are found, the entry with the most recent `timestamp` is kept.

### History Pruning
While Branxa maintains history, the `resume` command primarily looks at the **latest entry**. You can use `branxa compress` to condense a long history file into a single milestone entry to keep the files small and relevant.

---

## 4. Configuration Hierarchy

Branxa lookups settings in three layers, with the first found taking precedence:

1.  **Command Line Flags**: e.g., `--goal "Fix bug"`
2.  **Environment Variables**: e.g., `BRANXA_AI_API_KEY`
3.  **Local Project Config**: `.branxa/config.json`
4.  **Global User Config**: `~/.branxa/global_config.json` (or OS equivalent)

### Sample `config.json`

```json
{
  "defaultOutput": "clipboard",
  "autoGitCapture": true,
  "recentCommitCount": 5,
  "defaultLogCount": 10,
  "watchInterval": 120,
  "aiProvider": "https://api.openai.com/v1",
  "aiModel": "gpt-4o-mini"
}
```

---

## 5. Key Implementation Files

- `src/types.ts`: TypeScript interface definitions for the model.
- `src/lib/context-store.ts`: The singleton-style manager for filesystem operations.
- `src/lib/config.ts`: Config merging and schema validation logic.
- `src/lib/paths.ts`: Logic for Base64 branch name encoding and path resolution.
