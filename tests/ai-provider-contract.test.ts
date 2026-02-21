import { makeGitRepo } from './helpers';

import { runInit } from '../src/commands/init';
import { runSummarize } from '../src/commands/summarize';
import { requestAIText } from '../src/lib/ai';

describe('AI integration gate contracts', () => {
  test('OpenAI-compatible /chat/completions call contract is respected', async () => {
    const originalFetch = global.fetch;
    const mockFetch = jest.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: 'ok-response' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    global.fetch = mockFetch as unknown as typeof fetch;

    try {
      const result = await requestAIText(
        {
          provider: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
          apiKey: 'test-key'
        },
        [
          { role: 'system', content: 'system prompt' },
          { role: 'user', content: 'user prompt' }
        ]
      );

      expect(result.ok).toBe(true);
      expect(result.text).toBe('ok-response');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({ method: 'POST' })
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  test('missing AI key/provider behavior returns explicit failure', async () => {
    const repoPath = await makeGitRepo('branxa-ai-missing-key-');
    await runInit(repoPath);

    const previousKey = process.env.BRANXA_AI_KEY;
    const previousProvider = process.env.BRANXA_AI_PROVIDER;

    delete process.env.BRANXA_AI_KEY;
    process.env.BRANXA_AI_PROVIDER = '';

    try {
      const result = await runSummarize(repoPath);

      expect(result.ok).toBe(false);
      expect(result.message).toContain('Missing AI provider URL');
    } finally {
      if (previousKey === undefined) {
        delete process.env.BRANXA_AI_KEY;
      } else {
        process.env.BRANXA_AI_KEY = previousKey;
      }

      if (previousProvider === undefined) {
        delete process.env.BRANXA_AI_PROVIDER;
      } else {
        process.env.BRANXA_AI_PROVIDER = previousProvider;
      }
    }
  });
});
