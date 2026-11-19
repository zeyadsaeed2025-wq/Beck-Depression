import { BDI_CLASSIFICATION_RANGES, BDI_ITEMS } from '../data/bdiTest.ts';
import type {
  BdiClassificationRange,
  ClassificationLevel,
  CustomTest,
} from '../types/platform.ts';

export interface BdiAlert {
  code:
    | 'SUICIDAL_IDEATION_REVIEW'
    | 'PESSIMISM_AND_IDEATION_PRIORITY'
    | 'PESSIMISM_ELEVATED'
    | 'SOMATIC_VEGETATIVE_ELEVATION'
    | 'UNIFORM_RESPONSES_NOTE';
  severity: 'info' | 'attention' | 'priority';
  messageAr: string;
  messageEn: string;
}

export interface BdiScoringResult {
  rawScore: number;
  maxScore: 63;
  classificationLevel: Exclude<ClassificationLevel, 'custom'>;
  classificationAr: string;
  classificationEn: string;
  officialDescriptionAr: string;
  cognitiveAffectiveScore: number;
  somaticScore: number;
  isUniformResponse: boolean;
  needsReview: boolean;
  alerts: BdiAlert[];
}

export interface CustomScoringResult {
  rawScore: number;
  maxScore: number;
  classificationAr: string;
  classificationEn: string;
  descriptionAr: string;
  descriptionEn: string;
  needsReview: boolean;
}

/**
 * Deterministic scoring engine for the Beck Depression Inventory (BDI-IA Arabic 1971).
 * Completely independent of AI.
 */
export function scoreBdiResponses(answers: readonly (number | null | undefined)[]): BdiScoringResult {
  if (!Array.isArray(answers) || answers.length !== BDI_ITEMS.length) {
    throw new Error(`Expected exactly ${BDI_ITEMS.length} item responses for BDI scoring.`);
  }

  let rawScore = 0;
  let cognitiveAffectiveScore = 0;
  let somaticScore = 0;

  for (let i = 0; i < BDI_ITEMS.length; i++) {
    const val = answers[i];
    if (typeof val !== 'number' || !Number.isInteger(val) || val < 0 || val > 3) {
      throw new Error(`Invalid or missing response at BDI item ${i + 1}. Expected integer 0..3.`);
    }
    rawScore += val;
    if (BDI_ITEMS[i].domain === 'cognitive_affective') {
      cognitiveAffectiveScore += val;
    } else {
      somaticScore += val;
    }
  }

  const matchedRange: BdiClassificationRange | undefined = BDI_CLASSIFICATION_RANGES.find(
    (range) => rawScore >= range.min && rawScore <= range.max
  );

  if (!matchedRange) {
    throw new Error(`Computed score ${rawScore} falls outside valid BDI range (0..63).`);
  }

  const uniqueValues = new Set(answers as number[]);
  const isUniformResponse = uniqueValues.size === 1;

  // Clinical Review Alerts grounded strictly in PDF Page 2
  const alerts: BdiAlert[] = [];
  const pessimismScore = answers[1] as number; // Item 2 (1-indexed)
  const suicidalIdeationScore = answers[8] as number; // Item 9 (1-indexed)
  const sleepScore = answers[15] as number; // Item 16 (الأرق)
  const appetiteScore = answers[17] as number; // Item 18 (فقد الشهية)
  const weightScore = answers[18] as number; // Item 19 (فقد الوزن)

  if (suicidalIdeationScore >= 1 && pessimismScore >= 2) {
    alerts.push({
      code: 'PESSIMISM_AND_IDEATION_PRIORITY',
      severity: 'priority',
      messageAr:
        'مراجعة إكلينيكية ذات أولوية (وفق دليل القائمة ص ٢): سجّل المفحوص استجابة في البند رقم (٩) للأفكار الانتحارية مع ارتفاع في البند رقم (٢) للتشاؤم؛ يلزم فحص سريري متخصص مباشر وفق بروتوكول المراجعة البشرية الآمن.',
      messageEn:
        'Priority Specialist Review (per manual p. 2): Non-zero response on Item 9 (Suicidal Ideation) alongside elevated Item 2 (Pessimism); direct human clinical assessment is required under the safety review protocol.',
    });
  } else if (suicidalIdeationScore >= 1) {
    alerts.push({
      code: 'SUICIDAL_IDEATION_REVIEW',
      severity: 'priority',
      messageAr:
        'تنبيه مراجعة متخصصة (البند رقم ٩): تشير الاستجابة إلى وجود أفكار انتحارية تتطلب فحصًا وتقييمًا بشريًا مباشرًا من المختص، ولا تمثل هذه الأداة تشخيصًا أو تنبؤًا قطعيًا.',
      messageEn:
        'Specialist Review Alert (Item 9): Response indicates suicidal thoughts requiring direct human clinical evaluation. This automated flag is not a definitive prediction or diagnosis.',
    });
  } else if (pessimismScore >= 2) {
    alerts.push({
      code: 'PESSIMISM_ELEVATED',
      severity: 'attention',
      messageAr:
        'مؤشر يستدعي الانتباه الإكلينيكي (البند رقم ٢ – التشاؤم): تشير الدراسات المذكورة في الدليل (ص ٢) إلى أهمية الانتباه لبند التشاؤم؛ مع التأكيد على أن التشاؤم وحده لا يُعد دليلًا على نية انتحارية أو خطر وشيك.',
      messageEn:
        'Clinical Attention Indicator (Item 2 – Pessimism): Manual notes (p. 2) highlight monitoring pessimism; pessimism alone does NOT constitute proof of suicidal intent or imminent risk.',
    });
  }

  if (sleepScore >= 2 || appetiteScore >= 2 || weightScore >= 2) {
    alerts.push({
      code: 'SOMATIC_VEGETATIVE_ELEVATION',
      severity: 'attention',
      messageAr:
        'ملاحظة الأعراض البدنية والجسمية (ص ٢): يظهر ارتفاع في مؤشرات النوم أو الشهية أو الوزن (البنود ١٦، ١٨، ١٩)، ويوصى بمراجعة النمط البدني والوجداني بصورة فردية شاملة.',
      messageEn:
        'Somatic & Vegetative Pattern Note (p. 2): Elevated indicators in sleep, appetite, or weight (Items 16, 18, 19); comprehensive individual clinical review is recommended.',
    });
  }

  if (isUniformResponse) {
    alerts.push({
      code: 'UNIFORM_RESPONSES_NOTE',
      severity: 'info',
      messageAr:
        'ملاحظة تطبيقية (ص ٢، فقرة ٥): أعطى المفحوص التقدير نفسه لجميع البنود الإحدى والعشرين؛ ينبغي أخذ ذلك في الاعتبار عند مراجعة الجلسة.',
      messageEn:
        'Administration Note (p. 2, Note 5): Identical rating selected across all 21 items; consider reviewing response consistency with the examinee.',
    });
  }

  const needsReview =
    suicidalIdeationScore >= 1 ||
    pessimismScore >= 2 ||
    matchedRange.level === 'moderate' ||
    matchedRange.level === 'severe';

  return {
    rawScore,
    maxScore: 63,
    classificationLevel: matchedRange.level,
    classificationAr: matchedRange.labelAr,
    classificationEn: matchedRange.labelEn,
    officialDescriptionAr: matchedRange.officialDescriptionAr,
    cognitiveAffectiveScore,
    somaticScore,
    isUniformResponse,
    needsReview,
    alerts,
  };
}

export function scoreCustomTestResponses(
  test: CustomTest,
  selectedIndices: readonly (number | null | undefined)[]
): CustomScoringResult {
  if (!Array.isArray(selectedIndices) || selectedIndices.length !== test.questions.length) {
    throw new Error(`Expected exactly ${test.questions.length} answers.`);
  }

  let sum = 0;
  for (let i = 0; i < test.questions.length; i++) {
    const idx = selectedIndices[i];
    const q = test.questions[i];
    if (typeof idx !== 'number' || !Number.isInteger(idx) || idx < 0 || idx >= q.options.length) {
      throw new Error(`Missing or invalid option index at question ${i + 1}.`);
    }
    sum += q.options[idx].score;
  }

  const rawScore =
    test.scoringMethod === 'average' && test.questions.length > 0
      ? Number((sum / test.questions.length).toFixed(2))
      : sum;

  const band = test.classificationBands.find((b) => rawScore >= b.min && rawScore <= b.max);

  return {
    rawScore,
    maxScore: test.maxPossibleScore,
    classificationAr: band?.labelAr || 'خارج النطاق المحدد',
    classificationEn: band?.labelEn || 'Outside defined bands',
    descriptionAr: band?.descriptionAr || '',
    descriptionEn: band?.descriptionEn || '',
    needsReview: false,
  };
}
