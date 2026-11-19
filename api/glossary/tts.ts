import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

interface VercelIncomingMessage extends IncomingMessage {
  body?: unknown;
}

const glossaryTtsCache = new Map<string, { audioBase64: string; mimeType: string }>();

async function readJsonBody(req: VercelIncomingMessage): Promise<Record<string, unknown> | null> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export default async function handler(req: VercelIncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = (await readJsonBody(req)) as {
      text?: string;
      language?: 'ar' | 'en';
      segment?: 'term' | 'explanation';
    } | null;

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const language = body?.language === 'en' ? 'en' : body?.language === 'ar' ? 'ar' : null;
    const segment = body?.segment === 'term' ? 'term' : 'explanation';

    if (!text || text.length > 1500 || !language) {
      sendJson(res, 400, { ok: false, error: 'Invalid TTS request payload.' });
      return;
    }

    const cacheKey = `${language}:${segment}:${text}`;
    const cached = glossaryTtsCache.get(cacheKey);
    if (cached) {
      sendJson(res, 200, {
        ok: true,
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        dialect: language === 'ar' ? 'ar-EG' : 'en-US',
        engine: 'gemini-3.8-flash-lite-tts',
        cached: true,
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      sendJson(res, 503, {
        ok: false,
        error:
          language === 'ar'
            ? 'خدمة النطق الصوتي بالعامية المصرية غير متاحة حالياً لعدم تهيئة مفتاح الخدمة على الخادم.'
            : 'Audio pronunciation service is unavailable because the server API key is not configured.',
      });
      return;
    }

    const style =
      language === 'ar'
        ? 'Speak exclusively in natural, warm, calm Cairo Egyptian colloquial Arabic (العامية المصرية القاهرية). Pronounce every word authentically in Egyptian Arabic dialect, never Modern Standard Arabic (Fusha). Calm, supportive academic tone.'
        : 'Speak exclusively in clear, calm, natural American English with a gentle academic psychology educator tone.';

    const ttsClient = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ttsClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: language === 'ar' ? 'Kore' : 'Zephyr' },
          },
        },
      },
    });

    const inlinePart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData?.data
    )?.inlineData;

    if (!inlinePart?.data) {
      throw new Error('TTS model returned no audio data.');
    }

    const mimeType = inlinePart.mimeType || 'audio/wav';
    if (glossaryTtsCache.size >= 250) {
      const oldestKey = glossaryTtsCache.keys().next().value;
      if (oldestKey) glossaryTtsCache.delete(oldestKey);
    }
    glossaryTtsCache.set(cacheKey, { audioBase64: inlinePart.data, mimeType });

    sendJson(res, 200, {
      ok: true,
      audioBase64: inlinePart.data,
      mimeType,
      dialect: language === 'ar' ? 'ar-EG' : 'en-US',
      engine: 'gemini-3.8-flash-lite-tts',
      cached: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TTS generation failed';
    sendJson(res, 502, {
      ok: false,
      error: message,
    });
  }
}
