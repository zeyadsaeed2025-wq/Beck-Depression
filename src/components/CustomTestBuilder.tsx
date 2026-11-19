import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  Lock,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteCustomTest, saveCustomTest } from '../services/firestoreService';
import type {
  CustomClassificationBand,
  CustomCoverConfig,
  CustomTest,
  CustomTestQuestion,
  Language,
} from '../types/platform';
import { CustomTestCoverPage } from './CustomTestCoverPage';

interface CustomTestBuilderProps {
  language: Language;
  customTests: CustomTest[];
  onRefreshTests: () => Promise<void>;
}

function makeEmptyQuestion(idx: number): CustomTestQuestion {
  const qid = `q_${Date.now()}_${idx}`;
  return {
    id: qid,
    promptAr: `السؤال رقم ${idx + 1}`,
    promptEn: `Question ${idx + 1}`,
    options: [
      { id: `${qid}_o0`, textAr: 'أبدًا', textEn: 'Never', score: 0 },
      { id: `${qid}_o1`, textAr: 'أحيانًا', textEn: 'Sometimes', score: 1 },
      { id: `${qid}_o2`, textAr: 'غالبًا', textEn: 'Often', score: 2 },
      { id: `${qid}_o3`, textAr: 'دائمًا', textEn: 'Always', score: 3 },
    ],
  };
}

function makeBlankDraft(): Omit<
  CustomTest,
  'createdAt' | 'updatedAt' | 'createdByUid' | 'createdByEmail'
> {
  return {
    id: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    instructionsAr: 'يرجى قراءة كل عبارة بعناية واختيار الإجابة الأقرب لحالتك.',
    instructionsEn: 'Please read each statement carefully and select the most accurate response.',
    language: 'both',
    testType: 'مقياس نفسي أكاديمي',
    scoringMethod: 'sum',
    minPossibleScore: 0,
    maxPossibleScore: 6,
    questions: [makeEmptyQuestion(0), makeEmptyQuestion(1)],
    classificationBands: [
      {
        id: 'band_1',
        min: 0,
        max: 3,
        labelAr: 'مستوى منخفض',
        labelEn: 'Low Level',
        descriptionAr: '',
        descriptionEn: '',
      },
      {
        id: 'band_2',
        min: 4,
        max: 6,
        labelAr: 'مستوى مرتفع',
        labelEn: 'Elevated Level',
        descriptionAr: '',
        descriptionEn: '',
      },
    ],
    coverConfig: {
      titleAr: '',
      titleEn: '',
      subtitleAr: 'دراسة ومقياس أكاديمي',
      subtitleEn: 'Academic Psychological Scale',
      descriptionAr: '',
      descriptionEn: '',
      institutionAr: 'جامعة المنوفية – كلية الآداب / كلية التربية النوعية',
      institutionEn: 'Menoufia University',
      accentColor: '#587564',
      bgStyle: 'pastel-sage',
      showInstitutionalLogos: true,
      ctaLabelAr: 'ابدأ الجلسة التقييمية',
      ctaLabelEn: 'Start Assessment Session',
    },
    reportTemplateAr: 'تعرض هذه الصفحة خلاصة الاستجابات وفق المعايير المحددة لهذا المقياس.',
    reportTemplateEn: 'This report summarizes responses according to the configured scale criteria.',
    status: 'draft',
  };
}

export function CustomTestBuilder({
  language,
  customTests,
  onRefreshTests,
}: CustomTestBuilderProps) {
  const isAr = language === 'ar';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(makeBlankDraft);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreviewCover, setShowPreviewCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const computedBounds = useMemo(() => {
    if (draft.questions.length === 0) return { min: 0, max: 0 };
    let minSum = 0;
    let maxSum = 0;
    for (const q of draft.questions) {
      if (q.options.length === 0) continue;
      const scores = q.options.map((o) => Number(o.score) || 0);
      minSum += Math.min(...scores);
      maxSum += Math.max(...scores);
    }
    if (draft.scoringMethod === 'average') {
      return {
        min: Number((minSum / draft.questions.length).toFixed(2)),
        max: Number((maxSum / draft.questions.length).toFixed(2)),
      };
    }
    return { min: minSum, max: maxSum };
  }, [draft.questions, draft.scoringMethod]);

  const handleOpenNew = () => {
    setEditingId(null);
    setDraft(makeBlankDraft());
    setShowEditor(true);
    setShowPreviewCover(false);
    setFeedback(null);
  };

  const handleEditExisting = (t: CustomTest) => {
    setEditingId(t.id);
    setDraft({
      id: t.id,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      descriptionAr: t.descriptionAr,
      descriptionEn: t.descriptionEn,
      instructionsAr: t.instructionsAr,
      instructionsEn: t.instructionsEn,
      language: t.language,
      testType: t.testType,
      scoringMethod: t.scoringMethod,
      minPossibleScore: t.minPossibleScore,
      maxPossibleScore: t.maxPossibleScore,
      questions: JSON.parse(JSON.stringify(t.questions)),
      classificationBands: JSON.parse(JSON.stringify(t.classificationBands)),
      coverConfig: { ...t.coverConfig },
      reportTemplateAr: t.reportTemplateAr,
      reportTemplateEn: t.reportTemplateEn,
      status: t.status,
    });
    setShowEditor(true);
    setShowPreviewCover(false);
    setFeedback(null);
  };

  const validateBeforePublish = (): string | null => {
    if (!draft.titleAr.trim()) {
      return isAr ? 'يرجى إدخال اسم الاختبار قبل النشر.' : 'Please enter test title before publishing.';
    }
    if (draft.questions.length === 0) {
      return isAr ? 'يجب إضافة سؤال واحد على الأقل.' : 'Add at least one question.';
    }
    for (let i = 0; i < draft.questions.length; i++) {
      if (!draft.questions[i].promptAr.trim() && !draft.questions[i].promptEn.trim()) {
        return isAr ? `السؤال ${i + 1} فارغ.` : `Question ${i + 1} is empty.`;
      }
      if (draft.questions[i].options.length < 2) {
        return isAr
          ? `يجب أن يحتوي السؤال ${i + 1} على اختيارين على الأقل.`
          : `Question ${i + 1} needs at least 2 options.`;
      }
    }
    if (draft.classificationBands.length === 0) {
      return isAr ? 'يرجى تحديد معايير التصنيف.' : 'Please define classification bands.';
    }
    return null;
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    setFeedback(null);
    if (!draft.titleAr.trim()) {
      setFeedback({
        type: 'err',
        text: isAr ? 'اسم الاختبار مطلوب.' : 'Test title is required.',
      });
      return;
    }
    if (targetStatus === 'published') {
      const err = validateBeforePublish();
      if (err) {
        setFeedback({ type: 'err', text: err });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...draft,
        minPossibleScore: computedBounds.min,
        maxPossibleScore: computedBounds.max,
        coverConfig: {
          ...draft.coverConfig,
          titleAr: draft.coverConfig.titleAr.trim() || draft.titleAr.trim(),
          titleEn: draft.coverConfig.titleEn.trim() || draft.titleEn.trim(),
        },
        status: targetStatus,
      };
      const saved = await saveCustomTest(payload, Boolean(editingId));
      setEditingId(saved.id);
      setDraft((d) => ({ ...d, id: saved.id, status: saved.status }));
      await onRefreshTests();
      setFeedback({
        type: 'ok',
        text:
          targetStatus === 'published'
            ? isAr
              ? 'تم نشر الاختبار بنجاح مع غلافه المستقل.'
              : 'Custom test published with its independent cover.'
            : isAr
              ? 'تم حفظ المسودة بنجاح.'
              : 'Draft saved successfully.',
      });
    } catch (e) {
      setFeedback({
        type: 'err',
        text: e instanceof Error ? e.message : 'Error saving test.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublishDirect = async (ct: CustomTest) => {
    setSaving(true);
    try {
      const nextStatus = ct.status === 'published' ? 'draft' : 'published';
      await saveCustomTest({ ...ct, status: nextStatus }, true);
      await onRefreshTests();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (ct: CustomTest) => {
    if (!window.confirm(isAr ? `تأكيد حذف الاختبار "${ct.titleAr}"؟` : `Delete "${ct.titleAr}"?`)) {
      return;
    }
    await deleteCustomTest(ct.id, ct.titleAr);
    if (editingId === ct.id) {
      setShowEditor(false);
      setEditingId(null);
    }
    await onRefreshTests();
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.questions.length) return;
    const next = [...draft.questions];
    [next[idx], next[target]] = [next[target], next[idx]];
    setDraft((d) => ({ ...d, questions: next }));
  };

  const updateCover = <K extends keyof CustomCoverConfig>(key: K, value: CustomCoverConfig[K]) => {
    setDraft((d) => ({
      ...d,
      coverConfig: { ...d.coverConfig, [key]: value },
    }));
  };

  if (showPreviewCover) {
    const previewTest: CustomTest = {
      ...draft,
      id: editingId || 'preview-test',
      minPossibleScore: computedBounds.min,
      maxPossibleScore: computedBounds.max,
      coverConfig: {
        ...draft.coverConfig,
        titleAr: draft.coverConfig.titleAr || draft.titleAr || 'عنوان الغلاف',
        titleEn: draft.coverConfig.titleEn || draft.titleEn || 'Cover Title',
      },
      createdByUid: 'preview',
      createdByEmail: 'preview',
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#E7EFE8] border border-[#8FAE98] rounded-xl p-3.5">
          <span className="text-xs sm:text-sm font-semibold text-[#34443A]">
            {isAr ? 'معاينة الغلاف المستقل للاختبار' : 'Independent Cover Preview'}
          </span>
          <button
            type="button"
            onClick={() => setShowPreviewCover(false)}
            className="calm-btn-outline px-4 py-1.5 text-xs font-bold cursor-pointer"
          >
            {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>
        <CustomTestCoverPage
          test={previewTest}
          language={language}
          onBack={() => setShowPreviewCover(false)}
          onStartSession={() => setShowPreviewCover(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Protected BDI Notice */}
      <div className="bg-[#E7EFE8]/70 border border-[#C6D9C9] rounded-2xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#587564] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#34443A] leading-relaxed">
          <strong className="text-[#587564] block mb-0.5">
            {isAr
              ? 'قائمة "بيك" للاكتئاب (BDI) محمية ومستقلة تمامًا'
              : 'Original Beck Depression Inventory (BDI) is Locked & Protected'}
          </strong>
          {isAr
            ? 'لا يسمح منشئ الاختبارات بالتعديل على بنود بيك أو اختياراتها أو درجاتها أو تعليماتها أو معايير تصنيفها. جميع الاختبارات المنشأة هنا مستقلة ولكل منها غلافه الخاص.'
            : 'The Custom Test Builder never alters original BDI items, options, scoring, instructions, or classification norms. All tests created here are independent with dedicated covers.'}
        </div>
      </div>

      {/* Header Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#587564]">
            {isAr ? 'منشئ الاختبارات الأكاديمية' : 'Custom Academic Test Builder'}
          </h2>
          <p className="text-xs text-[#5F6D64]">
            {isAr
              ? 'إنشاء اختبارات جديدة بنظام يشبه النماذج مع قواعد تصحيح وغلاف مستقل لكل اختبار.'
              : 'Create new academic scales with custom scoring rules and an independent cover page.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="calm-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء اختبار جديد' : 'Create New Test'}</span>
        </button>
      </div>

      {/* Existing Custom Tests List */}
      {!showEditor && (
        <div className="space-y-3">
          {customTests.length === 0 ? (
            <div className="calm-card p-8 text-center text-sm text-[#5F6D64]">
              {isAr
                ? 'لا توجد اختبارات مخصصة منشأة بعد. اضغط على "إنشاء اختبار جديد" للبدء.'
                : 'No custom tests created yet. Click "Create New Test" to begin.'}
            </div>
          ) : (
            customTests.map((ct) => (
              <div
                key={ct.id}
                className="calm-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs text-[#78847B] flex items-center gap-2">
                    <span className="font-semibold text-[#587564]">
                      {ct.status === 'published'
                        ? isAr
                          ? 'منشور'
                          : 'Published'
                        : isAr
                          ? 'مسودة'
                          : 'Draft'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ct.testType}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {ct.questions.length} {isAr ? 'أسئلة' : 'questions'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#34443A]">{ct.titleAr}</h3>
                  {ct.titleEn && <p className="text-xs text-[#78847B]">{ct.titleEn}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditExisting(ct)}
                    className="calm-btn-outline px-3.5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    {isAr ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleTogglePublishDirect(ct)}
                    className="calm-btn-secondary px-3.5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    {ct.status === 'published'
                      ? isAr
                        ? 'إلغاء النشر'
                        : 'Unpublish'
                      : isAr
                        ? 'نشر'
                        : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTest(ct)}
                    className="p-2.5 rounded-xl border border-[#EAC8CD] bg-white text-[#9E2A3B] hover:bg-[#FDF4F5] transition-colors cursor-pointer"
                    aria-label="Delete test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Test Editor Form */}
      {showEditor && (
        <div className="calm-card p-6 sm:p-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E9E3] pb-4">
            <h3 className="text-lg font-bold text-[#587564]">
              {editingId
                ? isAr
                  ? 'تعديل الاختبار الأكاديمي'
                  : 'Edit Custom Test'
                : isAr
                  ? 'إعداد اختبار أكاديمي جديد'
                  : 'New Academic Test'}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewCover(true)}
                className="calm-btn-outline inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#587564]" />
                <span>{isAr ? 'معاينة الغلاف' : 'Preview Cover'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="calm-btn-outline px-3.5 py-2 text-xs font-semibold text-[#5F6D64] cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>

          {/* 1. Basic Metadata */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#587564]">
              {isAr ? '١. البيانات الأساسية والتعليمات' : '1. Basic Information & Instructions'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'اسم الاختبار (عربي) *' : 'Test Title (Arabic) *'}
                </label>
                <input
                  type="text"
                  value={draft.titleAr}
                  onChange={(e) => setDraft((d) => ({ ...d, titleAr: e.target.value }))}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'اسم الاختبار (إنجليزي)' : 'Test Title (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={draft.titleEn}
                  onChange={(e) => setDraft((d) => ({ ...d, titleEn: e.target.value }))}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'نوع الاختبار' : 'Test Type'}
                </label>
                <input
                  type="text"
                  value={draft.testType}
                  onChange={(e) => setDraft((d) => ({ ...d, testType: e.target.value }))}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'لغة الاختبار' : 'Language'}
                </label>
                <select
                  value={draft.language}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, language: e.target.value as CustomTest['language'] }))
                  }
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                >
                  <option value="both">{isAr ? 'العربية والإنجليزية' : 'Arabic & English'}</option>
                  <option value="ar">{isAr ? 'العربية فقط' : 'Arabic Only'}</option>
                  <option value="en">{isAr ? 'الإنجليزية فقط' : 'English Only'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'التعليمات (عربي)' : 'Instructions (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  value={draft.instructionsAr}
                  onChange={(e) => setDraft((d) => ({ ...d, instructionsAr: e.target.value }))}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'التعليمات (إنجليزي)' : 'Instructions (English)'}
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={draft.instructionsEn}
                  onChange={(e) => setDraft((d) => ({ ...d, instructionsEn: e.target.value }))}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 2. Questions & Options Editor */}
          <div className="space-y-4 border-t border-[#E4E9E3] pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#587564]">
                {isAr ? '٢. البنود والأسئلة والدرجات' : '2. Questions, Options & Scores'}
              </h4>
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    questions: [...d.questions, makeEmptyQuestion(d.questions.length)],
                  }))
                }
                className="calm-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#587564]" />
                <span>{isAr ? 'إضافة سؤال' : 'Add Question'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {draft.questions.map((q, qIdx) => (
                <div key={q.id} className="calm-surface p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#587564] font-mono-num">
                      #{qIdx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={qIdx === 0}
                        onClick={() => moveQuestion(qIdx, -1)}
                        className="p-1.5 rounded-lg border border-[#E4E9E3] bg-white hover:bg-[#E7EFE8] disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-[#34443A]" />
                      </button>
                      <button
                        type="button"
                        disabled={qIdx === draft.questions.length - 1}
                        onClick={() => moveQuestion(qIdx, 1)}
                        className="p-1.5 rounded-lg border border-[#E4E9E3] bg-white hover:bg-[#E7EFE8] disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-[#34443A]" />
                      </button>
                      <button
                        type="button"
                        disabled={draft.questions.length <= 1}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            questions: d.questions.filter((_, i) => i !== qIdx),
                          }))
                        }
                        className="p-1.5 rounded-lg border border-[#EAC8CD] bg-white text-[#9E2A3B] hover:bg-[#FDF4F5] disabled:opacity-40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={q.promptAr}
                      placeholder={isAr ? 'نص السؤال (عربي)' : 'Question (Arabic)'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((d) => {
                          const next = [...d.questions];
                          next[qIdx] = { ...next[qIdx], promptAr: val };
                          return { ...d, questions: next };
                        });
                      }}
                      className="px-3 py-2 rounded-lg border border-[#E4E9E3] bg-white text-sm text-[#34443A] focus:border-[#587564] focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={q.promptEn}
                      placeholder="Question (English)"
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((d) => {
                          const next = [...d.questions];
                          next[qIdx] = { ...next[qIdx], promptEn: val };
                          return { ...d, questions: next };
                        });
                      }}
                      className="px-3 py-2 rounded-lg border border-[#E4E9E3] bg-white text-sm text-[#34443A] focus:border-[#587564] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={opt.textAr}
                          placeholder={isAr ? 'الاختيار (عربي)' : 'Option AR'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((d) => {
                              const next = [...d.questions];
                              const opts = [...next[qIdx].options];
                              opts[oIdx] = { ...opts[oIdx], textAr: val };
                              next[qIdx] = { ...next[qIdx], options: opts };
                              return { ...d, questions: next };
                            });
                          }}
                          className="col-span-5 px-2.5 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs text-[#34443A] focus:border-[#587564] focus:outline-none"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={opt.textEn}
                          placeholder="Option EN"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((d) => {
                              const next = [...d.questions];
                              const opts = [...next[qIdx].options];
                              opts[oIdx] = { ...opts[oIdx], textEn: val };
                              next[qIdx] = { ...next[qIdx], options: opts };
                              return { ...d, questions: next };
                            });
                          }}
                          className="col-span-4 px-2.5 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs text-[#34443A] focus:border-[#587564] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={opt.score}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setDraft((d) => {
                              const next = [...d.questions];
                              const opts = [...next[qIdx].options];
                              opts[oIdx] = { ...opts[oIdx], score: val };
                              next[qIdx] = { ...next[qIdx], options: opts };
                              return { ...d, questions: next };
                            });
                          }}
                          className="col-span-2 px-2 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs font-mono-num text-center text-[#34443A] focus:border-[#587564] focus:outline-none"
                          title="Score"
                        />
                        <button
                          type="button"
                          disabled={q.options.length <= 2}
                          onClick={() => {
                            setDraft((d) => {
                              const next = [...d.questions];
                              next[qIdx] = {
                                ...next[qIdx],
                                options: next[qIdx].options.filter((_, i) => i !== oIdx),
                              };
                              return { ...d, questions: next };
                            });
                          }}
                          className="col-span-1 text-[#9E2A3B] disabled:opacity-30 text-xs font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setDraft((d) => {
                          const next = [...d.questions];
                          const newOpt = {
                            id: `${q.id}_o${Date.now()}`,
                            textAr: 'اختيار جديد',
                            textEn: 'New Option',
                            score: q.options.length,
                          };
                          next[qIdx] = { ...next[qIdx], options: [...next[qIdx].options, newOpt] };
                          return { ...d, questions: next };
                        });
                      }}
                      className="text-xs font-semibold text-[#587564] hover:underline cursor-pointer"
                    >
                      + {isAr ? 'إضافة اختيار' : 'Add option'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Scoring Rules & Classification Review */}
          <div className="space-y-4 border-t border-[#E4E9E3] pt-6">
            <h4 className="text-sm font-bold text-[#587564]">
              {isAr ? '٣. قواعد التصحيح ومستويات التصنيف' : '3. Scoring Rules & Classification Bands'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#E7EFE8]/55 border border-[#C6D9C9] rounded-xl p-4">
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'طريقة الحساب' : 'Scoring Method'}
                </label>
                <select
                  value={draft.scoringMethod}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      scoringMethod: e.target.value as 'sum' | 'average',
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E9E3] bg-white text-sm text-[#34443A]"
                >
                  <option value="sum">{isAr ? 'مجموع الدرجات' : 'Sum of Item Scores'}</option>
                  <option value="average">{isAr ? 'المتوسط الحسابي' : 'Mean Score'}</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-[#5F6D64]">{isAr ? 'الحد الأدنى المتاح' : 'Min Score'}</div>
                <div className="text-xl font-bold font-mono-num text-[#587564] mt-1">
                  {computedBounds.min}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#5F6D64]">{isAr ? 'الحد الأقصى المتاح' : 'Max Score'}</div>
                <div className="text-xl font-bold font-mono-num text-[#587564] mt-1">
                  {computedBounds.max}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {draft.classificationBands.map((band, bIdx) => (
                <div
                  key={band.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center calm-surface p-3"
                >
                  <input
                    type="number"
                    step="0.1"
                    value={band.min}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDraft((d) => {
                        const bands = [...d.classificationBands];
                        bands[bIdx] = { ...bands[bIdx], min: val };
                        return { ...d, classificationBands: bands };
                      });
                    }}
                    className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs font-mono-num text-[#34443A]"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={band.max}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDraft((d) => {
                        const bands = [...d.classificationBands];
                        bands[bIdx] = { ...bands[bIdx], max: val };
                        return { ...d, classificationBands: bands };
                      });
                    }}
                    className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs font-mono-num text-[#34443A]"
                    placeholder="Max"
                  />
                  <input
                    type="text"
                    value={band.labelAr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((d) => {
                        const bands = [...d.classificationBands];
                        bands[bIdx] = { ...bands[bIdx], labelAr: val };
                        return { ...d, classificationBands: bands };
                      });
                    }}
                    className="sm:col-span-4 px-2.5 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs text-[#34443A]"
                    placeholder={isAr ? 'التصنيف (عربي)' : 'Label AR'}
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={band.labelEn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((d) => {
                        const bands = [...d.classificationBands];
                        bands[bIdx] = { ...bands[bIdx], labelEn: val };
                        return { ...d, classificationBands: bands };
                      });
                    }}
                    className="sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-[#E4E9E3] bg-white text-xs text-[#34443A]"
                    placeholder="Label EN"
                  />
                  <button
                    type="button"
                    disabled={draft.classificationBands.length <= 1}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        classificationBands: d.classificationBands.filter((_, i) => i !== bIdx),
                      }))
                    }
                    className="sm:col-span-1 text-[#9E2A3B] text-xs font-bold disabled:opacity-30 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newBand: CustomClassificationBand = {
                    id: `band_${Date.now()}`,
                    min: 0,
                    max: computedBounds.max,
                    labelAr: 'تصنيف جديد',
                    labelEn: 'New Band',
                    descriptionAr: '',
                    descriptionEn: '',
                  };
                  setDraft((d) => ({
                    ...d,
                    classificationBands: [...d.classificationBands, newBand],
                  }));
                }}
                className="text-xs font-semibold text-[#587564] hover:underline cursor-pointer"
              >
                + {isAr ? 'إضافة مستوى تصنيف' : 'Add Classification Band'}
              </button>
            </div>
          </div>

          {/* 4. Independent Cover Page Customizer */}
          <div className="space-y-4 border-t border-[#E4E9E3] pt-6">
            <h4 className="text-sm font-bold text-[#587564]">
              {isAr ? '٤. تخصيص الغلاف المستقل للاختبار' : '4. Independent Cover Page Customization'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'عنوان الغلاف (عربي)' : 'Cover Title (Arabic)'}
                </label>
                <input
                  type="text"
                  value={draft.coverConfig.titleAr}
                  onChange={(e) => updateCover('titleAr', e.target.value)}
                  placeholder={draft.titleAr || ''}
                  className="calm-input w-full px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'عنوان الغلاف (إنجليزي)' : 'Cover Title (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={draft.coverConfig.titleEn}
                  onChange={(e) => updateCover('titleEn', e.target.value)}
                  placeholder={draft.titleEn || ''}
                  className="calm-input w-full px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'وصف الغلاف (عربي)' : 'Cover Description (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={draft.coverConfig.descriptionAr}
                  onChange={(e) => updateCover('descriptionAr', e.target.value)}
                  className="calm-input w-full px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'الجهة الأكاديمية على الغلاف' : 'Institution Name'}
                </label>
                <input
                  type="text"
                  value={draft.coverConfig.institutionAr}
                  onChange={(e) => updateCover('institutionAr', e.target.value)}
                  className="calm-input w-full px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'خلفية الغلاف الهادئة' : 'Cover Pastel Style'}
                </label>
                <select
                  value={draft.coverConfig.bgStyle}
                  onChange={(e) =>
                    updateCover('bgStyle', e.target.value as CustomCoverConfig['bgStyle'])
                  }
                  className="calm-input w-full px-3.5 py-2 text-sm"
                >
                  <option value="pastel-sage">Pastel Sage (أخضر هادئ)</option>
                  <option value="pastel-slate">Pastel Slate (أزرق رمادي)</option>
                  <option value="pastel-sand">Pastel Sand (بيج أكاديمي)</option>
                  <option value="pastel-indigo">Pastel Indigo (نيلي هادئ)</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#34443A] mb-1">
                    {isAr ? 'لون الزر والتمييز' : 'Accent Color'}
                  </label>
                  <input
                    type="color"
                    value={draft.coverConfig.accentColor}
                    onChange={(e) => updateCover('accentColor', e.target.value)}
                    className="h-10 w-16 rounded-lg border border-[#E4E9E3] cursor-pointer"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#34443A] pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.coverConfig.showInstitutionalLogos}
                    onChange={(e) => updateCover('showInstitutionalLogos', e.target.checked)}
                    className="w-4 h-4 accent-[#587564]"
                  />
                  <span>{isAr ? 'عرض الشعارات الأكاديمية' : 'Show Institutional Logos'}</span>
                </label>
              </div>
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-xl border p-3.5 text-sm flex items-center gap-2 ${
                feedback.type === 'ok'
                  ? 'bg-[#E7EFE8] border-[#8FAE98] text-[#34443A]'
                  : 'bg-[#FDF4F5] border-[#EAC8CD] text-[#9E2A3B]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#587564]" />
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Save Draft / Publish Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E4E9E3] pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="calm-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-[#587564]" />
              <span>{isAr ? 'حفظ كمسودة (Save Draft)' : 'Save Draft'}</span>
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="calm-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isAr ? 'مراجعة ونشر الاختبار (Publish)' : 'Publish Test'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
