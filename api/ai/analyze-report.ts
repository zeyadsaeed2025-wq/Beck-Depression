import { GoogleGenAI, Type } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

interface AnalyzeItemPayload {
  index: number;
  symptomLabel: string;
  score: number;
  selectedText: string;
}

interface VercelIncomingMessage extends IncomingMessage {
  body?: unknown;
}

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
    } | null;

    if (
      !body ||
      typeof body.rawScore !== 'number' ||
      typeof body.maxScore !== 'number' ||
      !Array.isArray(body.itemResponses) ||
      body.itemResponses.length === 0
    ) {
      sendJson(res, 400, {
        ok: false,
        fallback: true,
        error: 'Insufficient assessment data for assistive analysis.',
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      sendJson(res, 503, {
        ok: false,
        fallback: true,
        error: 'AI analysis service is not configured. Deterministic score report remains fully available.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
    sendJson(res, 200, {
      ok: true,
      ar: parsed.ar,
      en: parsed.en,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    sendJson(res, 502, {
      ok: false,
      fallback: true,
      error: message,
    });
  }
}
