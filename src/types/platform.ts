export type Language = 'ar' | 'en';

export type ClassificationLevel = 'minimal' | 'mild' | 'moderate' | 'severe' | 'custom';

export interface BdiOption {
  readonly score: 0 | 1 | 2 | 3;
  readonly arabicNumeral: string;
  readonly text: string;
}

export interface BdiItem {
  readonly number: number;
  readonly arabicNumber: string;
  readonly symptomName: string;
  readonly domain: 'cognitive_affective' | 'somatic';
  readonly options: readonly BdiOption[];
}

export interface BdiClassificationRange {
  readonly level: Exclude<ClassificationLevel, 'custom'>;
  readonly min: number;
  readonly max: number;
  readonly labelAr: string;
  readonly labelEn: string;
  readonly officialDescriptionAr: string;
}

export interface CustomTestOption {
  id: string;
  textAr: string;
  textEn: string;
  score: number;
}

export interface CustomTestQuestion {
  id: string;
  promptAr: string;
  promptEn: string;
  options: CustomTestOption[];
}

export interface CustomClassificationBand {
  id: string;
  min: number;
  max: number;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface CustomCoverConfig {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  institutionAr: string;
  institutionEn: string;
  accentColor: string;
  bgStyle: 'pastel-sage' | 'pastel-slate' | 'pastel-sand' | 'pastel-indigo';
  showInstitutionalLogos: boolean;
  ctaLabelAr: string;
  ctaLabelEn: string;
}

export interface CustomTest {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  instructionsAr: string;
  instructionsEn: string;
  language: 'ar' | 'en' | 'both';
  testType: string;
  scoringMethod: 'sum' | 'average';
  minPossibleScore: number;
  maxPossibleScore: number;
  questions: CustomTestQuestion[];
  classificationBands: CustomClassificationBand[];
  coverConfig: CustomCoverConfig;
  reportTemplateAr: string;
  reportTemplateEn: string;
  status: 'draft' | 'published';
  createdByUid: string;
  createdByEmail: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ExamineeRecord {
  code: string;
  name: string;
  age: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AssessmentSessionRecord {
  id: string;
  examineeCode: string;
  examineeName: string;
  examineeAge: number;
  testId: string;
  testTitle: string;
  isBdi: boolean;
  answers: number[];
  selectedIndices: number[];
  rawScore: number;
  maxScore: number;
  classificationAr: string;
  classificationEn: string;
  classificationLevel: ClassificationLevel;
  cognitiveAffectiveScore: number;
  somaticScore: number;
  needsReview: boolean;
  alerts: string[];
  aiAnalysisAr: string;
  aiAnalysisEn: string;
  status: 'completed' | 'reviewed';
  doctorNotes: string;
  reviewedByEmail: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuditLogRecord {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt?: unknown;
}

export interface PlatformSetting {
  id: string;
  platformSubtitleAr: string;
  platformSubtitleEn: string;
  showCopyrightNotice: boolean;
  bdiCoverAccent: string;
  updatedByUid: string;
  updatedAt?: unknown;
}

export interface AiStructuredAnalysis {
  summary: string;
  cognitivePatterns: string;
  affectiveAspects: string;
  somaticSymptoms: string;
  elevatedSymptoms: string[];
  lowerSeverityAreas: string[];
  supportResources: string[];
}

export interface AiReportResponse {
  ok: boolean;
  fallback?: boolean;
  error?: string;
  ar?: AiStructuredAnalysis;
  en?: AiStructuredAnalysis;
}
