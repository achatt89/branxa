# delete

The `delete` command allows you to manage and prune your context history. This is useful for undoing accidental saves, removing outdated context, or clearing all data before starting fresh.

## Usage

```bash
branxa delete [options]
```

## Options

### `--last`
Removes the single most recent context entry for the current branch.

```bash
branxa delete --last
```

### `--id <id>`
Removes a specific entry by its unique ID. You can find IDs using `branxa log`.

```bash
branxa delete --id e3b0c442-98fc-1c14-9afb-f4c000e31013
```

### `--all`
**Destructive.** Clears **all** context entries and session snapshots across **all** branches.

```bash
branxa delete --all
```

## Behavior and Safety

- **Git Scoped**: By default, `delete --last` and `delete --id` only operate within the current Git repository and the current branch (for `--last`).
- **Session Cleanup**: When a context entry is deleted, Branxa also attempts to remove the corresponding session file in `.branxa/sessions/` to keep the storage clean.
- **Confirmation**: Unlike `save`, the `delete` command provides feedback on exactly which entry (by short ID) was removed.

## Examples

**Undo a quick auto-save:**
```bash
branxa save "WIP"
# realize you want to redo it
branxa delete --last
```

**Find and destroy a specific entry:**
```bash
branxa log --count 20
# copy ID from output
branxa delete --id <id>
```
