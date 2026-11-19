import assert from 'node:assert/strict';
import test from 'node:test';
import { BDI_CLASSIFICATION_RANGES, BDI_ITEMS } from '../src/data/bdiTest.ts';
import { scoreBdiResponses, scoreCustomTestResponses } from '../src/engine/bdiScoring.ts';
import type { CustomTest } from '../src/types/platform.ts';

test('Canonical BDI dataset integrity: exactly 21 items with 4 options (0..3) each', () => {
  assert.equal(BDI_ITEMS.length, 21);
  for (let i = 0; i < BDI_ITEMS.length; i++) {
    assert.equal(BDI_ITEMS[i].number, i + 1);
    assert.equal(BDI_ITEMS[i].options.length, 4);
    assert.deepEqual(
      BDI_ITEMS[i].options.map((o) => o.score),
      [0, 1, 2, 3]
    );
  }
  assert.equal(BDI_CLASSIFICATION_RANGES.length, 4);
});

test('Minimum possible score (0) maps to Minimal Range (0-9)', () => {
  const answers = Array(21).fill(0);
  const res = scoreBdiResponses(answers);
  assert.equal(res.rawScore, 0);
  assert.equal(res.maxScore, 63);
  assert.equal(res.classificationLevel, 'minimal');
  assert.equal(res.isUniformResponse, true);
  assert.ok(res.alerts.some((a) => a.code === 'UNIFORM_RESPONSES_NOTE'));
});

test('Maximum possible score (63) maps to Severe Depression (30-63)', () => {
  const answers = Array(21).fill(3);
  const res = scoreBdiResponses(answers);
  assert.equal(res.rawScore, 63);
  assert.equal(res.classificationLevel, 'severe');
  assert.equal(res.needsReview, true);
  assert.ok(res.alerts.some((a) => a.code === 'PESSIMISM_AND_IDEATION_PRIORITY'));
});

test('Exact classification boundary checks: 9, 10, 16, 17, 29, 30', () => {
  const buildScore = (target: number): number[] => {
    const arr = Array(21).fill(0);
    let rem = target;
    for (let i = 0; i < 21 && rem > 0; i++) {
      // Avoid item 2 (idx 1) and item 9 (idx 8) when just testing score boundaries
      if (i === 1 || i === 8) continue;
      const add = Math.min(3, rem);
      arr[i] = add;
      rem -= add;
    }
    if (rem > 0) {
      arr[1] = Math.min(3, rem);
      rem -= arr[1];
    }
    if (rem > 0) {
      arr[8] = Math.min(3, rem);
    }
    return arr;
  };

  assert.equal(scoreBdiResponses(buildScore(9)).classificationLevel, 'minimal');
  assert.equal(scoreBdiResponses(buildScore(10)).classificationLevel, 'mild');
  assert.equal(scoreBdiResponses(buildScore(16)).classificationLevel, 'mild');
  assert.equal(scoreBdiResponses(buildScore(17)).classificationLevel, 'moderate');
  assert.equal(scoreBdiResponses(buildScore(29)).classificationLevel, 'moderate');
  assert.equal(scoreBdiResponses(buildScore(30)).classificationLevel, 'severe');
});

test('Incomplete responses are strictly rejected', () => {
  const incomplete = Array(21).fill(0);
  incomplete[10] = null;
  assert.throws(() => scoreBdiResponses(incomplete), /Invalid or missing response/);
  assert.throws(() => scoreBdiResponses([0, 1, 2]), /Expected exactly 21/);
});

test('Clinical alert rules: Pessimism alone does NOT trigger suicidal ideation priority', () => {
  const answers = Array(21).fill(0);
  answers[1] = 2; // Item 2 Pessimism = 2
  answers[8] = 0; // Item 9 Suicidal ideation = 0
  const res = scoreBdiResponses(answers);
  assert.ok(res.alerts.some((a) => a.code === 'PESSIMISM_ELEVATED'));
  assert.ok(!res.alerts.some((a) => a.code === 'SUICIDAL_IDEATION_REVIEW'));
  assert.ok(!res.alerts.some((a) => a.code === 'PESSIMISM_AND_IDEATION_PRIORITY'));
});

test('Clinical alert rules: Item 9 >= 1 triggers priority specialist review', () => {
  const answers = Array(21).fill(0);
  answers[8] = 1; // Item 9 = 1
  const res = scoreBdiResponses(answers);
  assert.equal(res.needsReview, true);
  assert.ok(res.alerts.some((a) => a.code === 'SUICIDAL_IDEATION_REVIEW'));
});

test('Custom test scoring supports sum and classification bands', () => {
  const customTest: CustomTest = {
    id: 'custom-1',
    titleAr: 'مقياس القلق الأكاديمي',
    titleEn: 'Academic Anxiety Scale',
    descriptionAr: '',
    descriptionEn: '',
    instructionsAr: '',
    instructionsEn: '',
    language: 'ar',
    testType: 'Likert',
    scoringMethod: 'sum',
    minPossibleScore: 0,
    maxPossibleScore: 6,
    questions: [
      {
        id: 'q1',
        promptAr: 'سؤال 1',
        promptEn: 'Q1',
        options: [
          { id: 'o1', textAr: 'لا', textEn: 'No', score: 0 },
          { id: 'o2', textAr: 'نعم', textEn: 'Yes', score: 3 },
        ],
      },
      {
        id: 'q2',
        promptAr: 'سؤال 2',
        promptEn: 'Q2',
        options: [
          { id: 'o3', textAr: 'لا', textEn: 'No', score: 0 },
          { id: 'o4', textAr: 'نعم', textEn: 'Yes', score: 3 },
        ],
      },
    ],
    classificationBands: [
      { id: 'b1', min: 0, max: 2, labelAr: 'منخفض', labelEn: 'Low', descriptionAr: '', descriptionEn: '' },
      { id: 'b2', min: 3, max: 6, labelAr: 'مرتفع', labelEn: 'High', descriptionAr: '', descriptionEn: '' },
    ],
    coverConfig: {
      titleAr: 'مقياس القلق',
      titleEn: 'Anxiety',
      subtitleAr: '',
      subtitleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      institutionAr: 'جامعة المنوفية',
      institutionEn: 'Menoufia University',
      accentColor: '#1D5C4B',
      bgStyle: 'pastel-sage',
      showInstitutionalLogos: true,
      ctaLabelAr: 'ابدأ الاختبار',
      ctaLabelEn: 'Start Test',
    },
    reportTemplateAr: '',
    reportTemplateEn: '',
    status: 'published',
    createdByUid: 'u1',
    createdByEmail: 'doc@example.com',
  };

  const res = scoreCustomTestResponses(customTest, [1, 1]);
  assert.equal(res.rawScore, 6);
  assert.equal(res.classificationAr, 'مرتفع');
});
