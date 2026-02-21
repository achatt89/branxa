# AI Integration

## Provider contract

Branxa calls OpenAI-compatible endpoints:

- `POST <provider>/chat/completions`

## Config precedence

1. environment vars: `BRANXA_AI_PROVIDER`, `BRANXA_AI_MODEL`, `BRANXA_AI_KEY`
2. `.branxa/config.json`

## Commands using AI

- `summarize`
- `suggest`

## Failure handling

- missing provider/model/key returns explicit command failure message
- non-200 provider response returns response status and body text
- parse failures in summarize/suggest use command-specific fallback logic

## Key implementation

- `src/lib/ai.ts`
- `src/commands/summarize.ts`
- `src/commands/suggest.ts`
