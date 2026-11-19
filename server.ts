import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

interface AnalyzeItemPayload {
  index: number;
  symptomLabel: string;
  score: number;
  selectedText: string;
}

app.post('/api/ai/analyze-report', async (req, res) => {
  try {
    const body = req.body as {
      testTitle?: string;
      isBdi?: boolean;
      age?: number;
      rawScore?: number;
      maxScore?: number;
      classificationAr?: string;
      classificationEn?: string;
      cognitiveAffectiveScore?: number;
      somaticScore?: number;
      alerts?: string[];
      itemResponses?: AnalyzeItemPayload[];
    };

    if (
      !body ||
      typeof body.rawScore !== 'number' ||
      typeof body.maxScore !== 'number' ||
      !Array.isArray(body.itemResponses) ||
      body.itemResponses.length === 0
    ) {
      res.status(400).json({
        ok: false,
        fallback: true,
        error: 'Insufficient assessment data for assistive analysis.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        fallback: true,
        error: 'AI analysis service is not configured. Deterministic score report remains fully available.',
      });
      return;
    }

    // Strictly anonymize: never forward examinee name, code, or identifiers to external AI
    const anonymizedPayload = {
      assessmentName: String(body.testTitle || 'Psychological Assessment').slice(0, 160),
      isBdi: Boolean(body.isBdi),
      ageGroupYears: typeof body.age === 'number' ? body.age : null,
      deterministicRawScore: body.rawScore,
      maxScore: body.maxScore,
      officialClassificationAr: String(body.classificationAr || '').slice(0, 160),
      officialClassificationEn: String(body.classificationEn || '').slice(0, 160),
      cognitiveAffectiveSubtotal: body.cognitiveAffectiveScore ?? null,
      somaticSubtotal: body.somaticScore ?? null,
      clinicalReviewAlertsCount: Array.isArray(body.alerts) ? body.alerts.length : 0,
      responses: body.itemResponses.slice(0, 100).map((item) => ({
        itemNumber: Number(item.index),
        domainOrSymptom: String(item.symptomLabel || '').slice(0, 120),
        score: Number(item.score),
        selectedStatement: String(item.selectedText || '').slice(0, 300),
      })),
    };

    const sectionSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        cognitivePatterns: { type: Type.STRING },
        affectiveAspects: { type: Type.STRING },
        somaticSymptoms: { type: Type.STRING },
        elevatedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
        lowerSeverityAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
        supportResources: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        'summary',
        'cognitivePatterns',
        'affectiveAspects',
        'somaticSymptoms',
        'elevatedSymptoms',
        'lowerSeverityAreas',
        'supportResources',
      ],
    };

    const systemInstruction = [
      'You are an academic clinical psychology documentation assistant supporting university researchers and licensed clinicians.',
      'You receive strictly anonymized item responses and an already-computed deterministic score and classification.',
      'CRITICAL RULES:',
      '1. NEVER alter, question, or recalculate the deterministic raw score or classification.',
      '2. NEVER invent symptoms, behaviors, or history that are not explicitly present in the provided responses.',
      '3. NEVER make a definitive medical diagnosis or state that the examinee has clinical depression or any disorder.',
      '4. NEVER predict suicide definitively or infer imminent self-harm intent from pessimism or raw score alone.',
      '5. Always use cautious, non-diagnostic academic phrasing such as:',
      '   Arabic: "تشير الاستجابات إلى...", "تظهر بعض المؤشرات التي تستدعي مراجعة...", "يمكن مناقشة هذه النتائج مع الأخصائي النفسي..."',
      '   English: "Responses suggest...", "Certain indicators warrant specialist review...", "These observations may be discussed with a qualified psychologist..."',
      '6. If item data is minimal or sparse, explicitly state that data is limited.',
      '7. Produce strictly aligned, consistent observations in both Arabic (ar) and English (en), grounded only in the provided items.',
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze these anonymized assessment responses and produce aligned bilingual (Arabic & English) assistive clinical observations:\n${JSON.stringify(anonymizedPayload)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ar: sectionSchema,
            en: sectionSchema,
          },
          required: ['ar', 'en'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini model.');
    }

    const parsed = JSON.parse(rawText);
    res.json({
      ok: true,
      ar: parsed.ar,
      en: parsed.en,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    console.error('AI report analysis failed:', message);
    res.status(502).json({
      ok: false,
      fallback: true,
      error: message,
    });
  }
});

// --- Isolated Psychology Glossary TTS Endpoint (Egyptian Arabic ar-EG & English en-US) ---
const glossaryTtsCache = new Map<string, { audioBase64: string; mimeType: string }>();

app.post('/api/glossary/tts', async (req, res) => {
  try {
    const body = req.body as {
      text?: string;
      language?: 'ar' | 'en';
      segment?: 'term' | 'explanation';
    };

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const language = body?.language === 'en' ? 'en' : body?.language === 'ar' ? 'ar' : null;
    const segment = body?.segment === 'term' ? 'term' : 'explanation';

    if (!text || text.length > 1500 || !language) {
      res.status(400).json({
        ok: false,
        error: 'Invalid TTS request payload.',
      });
      return;
    }

    const cacheKey = `${language}:${segment}:${text}`;
    const cached = glossaryTtsCache.get(cacheKey);
    if (cached) {
      res.json({
        ok: true,
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        dialect: language === 'ar' ? 'ar-EG' : 'en-US',
        engine: 'gemini-3.8-flash-lite-tts',
        cached: true,
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        ok: false,
        error:
          language === 'ar'
            ? 'خدمة النطق الصوتي بالعامية المصرية غير متاحة حالياً لعدم تهيئة مفتاح الخدمة على الخادم.'
            : 'Audio pronunciation service is unavailable because the server API key is not configured.',
      });
      return;
    }

    const promptText = text;
    const style =
      language === 'ar'
        ? 'Speak exclusively in natural, warm, calm Cairo Egyptian colloquial Arabic (العامية المصرية القاهرية). Pronounce every word authentically in Egyptian Arabic dialect, never Modern Standard Arabic (Fusha). Calm, supportive academic tone.'
        : 'Speak exclusively in clear, calm, natural American English with a gentle academic psychology educator tone.';

    const ttsClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
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
              text: promptText,
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

    res.json({
      ok: true,
      audioBase64: inlinePart.data,
      mimeType,
      dialect: language === 'ar' ? 'ar-EG' : 'en-US',
      engine: 'gemini-3.8-flash-lite-tts',
      cached: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TTS generation failed';
    console.error('Glossary TTS error:', message);
    res.status(502).json({
      ok: false,
      error: message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Menoufia Academic Psychological Platform running on port ${PORT}`);
  });
}

startServer();
