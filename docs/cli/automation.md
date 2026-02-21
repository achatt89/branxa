# watch and hook

## watch

```bash
branxa watch [--interval <seconds>]
```

- polls Git change signature periodically
- auto-saves when signature changes
- default interval comes from config key `watchInterval`

## hook

```bash
branxa hook install
branxa hook remove
```

- installs/removes only Branxa-managed `post-commit` block
- preserves unrelated custom hook lines

## Key implementation

- `src/commands/watch.ts`
- `src/commands/hook.ts`
