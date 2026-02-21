import { loadConfig } from './config';

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export interface AITextResult {
  ok: boolean;
  text: string;
  error?: string;
}

export async function resolveAIConfig(cwd: string): Promise<AIConfig> {
  const config = await loadConfig(cwd);

  return {
    provider: (process.env.BRANXA_AI_PROVIDER ?? config.aiProvider).trim(),
    model: (process.env.BRANXA_AI_MODEL ?? config.aiModel).trim(),
    apiKey: (process.env.BRANXA_AI_KEY ?? config.aiApiKey).trim()
  };
}

export function validateAIConfig(config: AIConfig): { ok: true } | { ok: false; message: string } {
  if (!config.provider) {
    return {
      ok: false,
      message: 'Missing AI provider URL. Set BRANXA_AI_PROVIDER or config aiProvider.'
    };
  }

  if (!config.model) {
    return {
      ok: false,
      message: 'Missing AI model. Set BRANXA_AI_MODEL or config aiModel.'
    };
  }

  if (!config.apiKey) {
    return {
      ok: false,
      message: 'Missing AI API key. Set BRANXA_AI_KEY or config aiApiKey.'
    };
  }

  return { ok: true };
}

export async function requestAIText(config: AIConfig, messages: ChatMessage[]): Promise<AITextResult> {
  const endpoint = `${config.provider.replace(/\/$/, '')}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false,
        text: '',
        error: `AI request failed with ${response.status}: ${text || response.statusText}`
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = payload.choices?.[0]?.message?.content;
    if (!text) {
      return {
        ok: false,
        text: '',
        error: 'AI response did not include message content.'
      };
    }

    return {
      ok: true,
      text
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      ok: false,
      text: '',
      error: `AI request error: ${message}`
    };
  }
}

export function extractJsonValue(rawText: string): unknown | null {
  const candidates = [rawText];
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1]);
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim());
    } catch {
      // continue
    }
  }

  return null;
}
