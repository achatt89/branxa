# MCP

## Transport

- stdio, line-delimited JSON messages

## Supported tools

- `branxa_resume`
- `branxa_save`
- `branxa_log`

## Supported resources

- `branxa://context`

## Request format

Tool call:

```json
{"id":"1","kind":"tool","tool":"branxa_resume","args":{"branch":"main"}}
```

Resource read:

```json
{"id":"2","kind":"resource","uri":"branxa://context"}
```

## Response format

Tool result:

```json
{"id":"1","content":[{"type":"text","text":"..."}]}
```

Resource result:

```json
{"id":"2","resource":{"uri":"branxa://context","text":"..."}}
```

## Key implementation

- `src/mcp/contracts.ts`
- `src/mcp/index.ts`
