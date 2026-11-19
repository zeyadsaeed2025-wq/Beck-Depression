import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import { BDI_ITEMS, BDI_METADATA } from '../data/bdiTest';
import { UI_TEXT } from '../data/i18n';
import type { CustomTest, Language } from '../types/platform';

interface TestRunnerPageProps {
  language: Language;
  isBdi: boolean;
  customTest: CustomTest | null;
  examineeCode: string;
  isSubmitting: boolean;
  submitError: string;
  onComplete: (selectedOptionIndices: number[]) => void;
}

export function TestRunnerPage({
  language,
  isBdi,
  customTest,
  examineeCode,
  isSubmitting,
  submitError,
  onComplete,
}: TestRunnerPageProps) {
  const t = UI_TEXT[language];
  const isRtl = language === 'ar';
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const totalItems = isBdi ? BDI_ITEMS.length : customTest?.questions.length || 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<(number | null)[]>(() =>
    Array(totalItems).fill(null)
  );
  const [showInstructions, setShowInstructions] = useState(true);
  const [incompleteIndices, setIncompleteIndices] = useState<number[]>([]);
  const [showUniformPrompt, setShowUniformPrompt] = useState(false);

  if (!isBdi && !customTest) return null;

  const answeredCount = selectedIndices.filter((v) => v !== null).length;
  const progressPercent = totalItems > 0 ? Math.round((answeredCount / totalItems) * 100) : 0;

  const handleSelectOption = (optionIdx: number) => {
    setSelectedIndices((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIdx;
      return next;
    });
    setIncompleteIndices((prev) => prev.filter((idx) => idx !== currentIndex));
    setShowUniformPrompt(false);
  };

  const handleAttemptFinish = () => {
    const missing: number[] = [];
    for (let i = 0; i < totalItems; i++) {
      if (selectedIndices[i] === null) {
        missing.push(i);
      }
    }
    if (missing.length > 0) {
      setIncompleteIndices(missing);
      setCurrentIndex(missing[0]);
      return;
    }

    // Check PDF Page 2 Note (5) for BDI uniform ratings across all 21 items
    if (isBdi && !showUniformPrompt) {
      const scores = selectedIndices.map((optIdx, itemIdx) =>
        BDI_ITEMS[itemIdx].options[optIdx as number].score
      );
      if (new Set(scores).size === 1) {
        setShowUniformPrompt(true);
        return;
      }
    }

    onComplete(selectedIndices as number[]);
  };

  const currentBdiItem = isBdi ? BDI_ITEMS[currentIndex] : null;
  const currentCustomItem = !isBdi && customTest ? customTest.questions[currentIndex] : null;

  const instructionsText = isBdi
    ? BDI_METADATA.examineeInstructions
    : language === 'ar'
      ? customTest?.instructionsAr || customTest?.instructionsEn || ''
      : customTest?.instructionsEn || customTest?.instructionsAr || '';

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5">
      {/* Top Progress Card */}
      <section className="calm-card p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="font-bold text-[#587564]">
            {isBdi
              ? BDI_METADATA.titleAr
              : language === 'ar'
                ? customTest?.titleAr
                : customTest?.titleEn || customTest?.titleAr}
          </div>
          <div className="flex items-center gap-3 text-[#5F6D64]">
            <span className="font-mono-num">
              {language === 'ar' ? 'الكود:' : 'Code:'} {examineeCode}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#587564] tabular-nums">
              {t.itemProgressPrefix} {currentIndex + 1} {t.itemProgressOf} {totalItems} (
              {progressPercent}%)
            </span>
          </div>
        </div>

        {/* Calm Sage Progress Bar */}
        <div
          className="w-full h-2.5 bg-[#E7EFE8] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[#587564] transition-all duration-200 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Item Navigation Strip */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedIndices.map((val, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = val !== null;
            const isMissing = incompleteIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${t.itemProgressPrefix} ${idx + 1}`}
                className={`w-8 h-8 rounded-lg text-xs font-mono-num font-semibold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#587564] text-white ring-2 ring-[#8FAE98]/60'
                    : isMissing
                      ? 'bg-[#FDF4F5] border border-[#EAC8CD] text-[#9E2A3B]'
                      : isAnswered
                        ? 'bg-[#E7EFE8] border border-[#C6D9C9] text-[#34443A] hover:bg-[#DAE6DC]'
                        : 'bg-[#FAF8F3] border border-[#E4E9E3] text-[#78847B] hover:bg-[#E7EFE8]/60'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </section>

      {/* Instructions Box (Verbatim for BDI) */}
      {instructionsText && (
        <section className="bg-[#FAF8F3] border border-[#E4E9E3] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#587564]">
              <Info className="w-4 h-4 text-[#587564] shrink-0" />
              <span>
                {isBdi
                  ? `تعليمات التطبيق ${BDI_METADATA.examineeHeader}`
                  : language === 'ar'
                    ? 'تعليمات الاختبار'
                    : 'Instructions'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInstructions((v) => !v)}
              className="text-xs font-semibold text-[#587564] hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-[#E7EFE8]"
            >
              {showInstructions
                ? language === 'ar'
                  ? 'إخفاء'
                  : 'Hide'
                : language === 'ar'
                  ? 'عرض التعليمات'
                  : 'Show Instructions'}
            </button>
          </div>
          {showInstructions && (
            <div
              className="mt-3 text-sm text-[#34443A] leading-relaxed space-y-2"
              dir={isBdi ? 'rtl' : undefined}
            >
              <p>{instructionsText}</p>
              {isBdi && (
                <p className="text-xs font-semibold text-[#587564]">{BDI_METADATA.examineeClosing}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Incomplete Warning */}
      {incompleteIndices.length > 0 && (
        <div className="flex items-center gap-2.5 bg-[#FDF4F5] border border-[#EAC8CD] text-[#9E2A3B] rounded-xl p-4 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {t.incompleteWarning} ({language === 'ar' ? 'المتبقي:' : 'Remaining:'}{' '}
            {incompleteIndices.map((i) => i + 1).join(', ')})
          </span>
        </div>
      )}

      {/* Uniform Response Gentle Prompt (PDF Page 2 Note 5) */}
      {showUniformPrompt && (
        <div className="bg-[#FBF6EC] border border-[#E8D6B3] text-[#6E4E1E] rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#B47B2B]" />
            <div className="space-y-1 text-sm leading-relaxed" dir="rtl">
              <p className="font-bold">ملاحظة مراجعة قبل الاعتماد (دليل التطبيق):</p>
              <p>
                لقد قمت بإعطاء التقدير نفسه لجميع البنود الإحدى والعشرين. تذكر ملاحظات التطبيق أن
                الناس نادراً ما يستجيبون بالطريقة ذاتها بالنسبة لكل عَرَض، وربما تريد أن تعيد النظر
                في بعض التقديرات قبل الإنهاء.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowUniformPrompt(false);
                setCurrentIndex(0);
              }}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8D6B3] text-xs font-bold text-[#6E4E1E] hover:bg-[#FAF8F3] cursor-pointer"
            >
              مراجعة التقديرات
            </button>
            <button
              type="button"
              onClick={() => onComplete(selectedIndices as number[])}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#B47B2B] text-white text-xs font-bold hover:opacity-95 cursor-pointer disabled:opacity-60"
            >
              تأكيد الإجابات وإنهاء الاختبار
            </button>
          </div>
        </div>
      )}

      {/* Single-Item Focused Calm Card */}
      <section
        className="calm-card p-6 sm:p-8 space-y-6"
        dir={isBdi ? 'rtl' : undefined}
      >
        {isBdi && currentBdiItem ? (
          <>
            <div className="flex items-center justify-between border-b border-[#E4E9E3] pb-4">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#E7EFE8] border border-[#C6D9C9] text-[#587564] font-bold text-lg">
                  {currentBdiItem.arabicNumber}
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#587564]">
                    البند ({currentBdiItem.arabicNumber})
                  </h2>
                  <p className="text-xs text-[#78847B]">اختر عبارة واحدة أدق في وصف حالتك</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5" role="radiogroup" aria-label={`البند ${currentBdiItem.number}`}>
              {currentBdiItem.options.map((opt, idx) => {
                const isSelected = selectedIndices[currentIndex] === idx;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-start p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-3.5 min-h-[58px] ${
                      isSelected
                        ? 'border-[#587564] bg-[#E7EFE8] ring-1 ring-[#8FAE98]'
                        : 'border-[#E4E9E3] bg-[#FAF8F3] hover:border-[#8FAE98] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#587564] text-white'
                          : 'bg-white border border-[#E4E9E3] text-[#34443A]'
                      }`}
                    >
                      {opt.arabicNumeral}
                    </span>
                    <span className="text-base sm:text-[17px] text-[#34443A] leading-relaxed flex-1">
                      {opt.text}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#587564] shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          currentCustomItem && (
            <>
              <div className="flex items-center gap-3.5 border-b border-[#E4E9E3] pb-4">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#E7EFE8] border border-[#C6D9C9] text-[#587564] font-mono-num font-bold text-base shrink-0">
                  {currentIndex + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#34443A] leading-snug">
                  {language === 'ar'
                    ? currentCustomItem.promptAr || currentCustomItem.promptEn
                    : currentCustomItem.promptEn || currentCustomItem.promptAr}
                </h2>
              </div>

              <div className="space-y-3.5" role="radiogroup">
                {currentCustomItem.options.map((opt, idx) => {
                  const isSelected = selectedIndices[currentIndex] === idx;
                  const label =
                    language === 'ar' ? opt.textAr || opt.textEn : opt.textEn || opt.textAr;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-start p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 min-h-[56px] ${
                        isSelected
                          ? 'border-[#587564] bg-[#E7EFE8] ring-1 ring-[#8FAE98]'
                          : 'border-[#E4E9E3] bg-[#FAF8F3] hover:border-[#8FAE98] hover:bg-white'
                      }`}
                    >
                      <span className="text-base text-[#34443A] leading-relaxed">{label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono-num text-[#78847B]">({opt.score})</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#587564]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )
        )}

        {submitError && (
          <div className="bg-[#FDF4F5] border border-[#EAC8CD] text-[#9E2A3B] rounded-xl p-3 text-sm">
            {submitError}
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E4E9E3]">
          <button
            type="button"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="calm-btn-outline inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#5F6D64] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PrevIcon className="w-4 h-4" />
            <span>{t.previousItem}</span>
          </button>

          {currentIndex < totalItems - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(totalItems - 1, i + 1))}
              className="calm-btn-primary inline-flex items-center gap-1.5 px-6 py-3 text-sm font-bold cursor-pointer"
            >
              <span>{t.nextItem}</span>
              <NextIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAttemptFinish}
              className="calm-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              <span>
                {isSubmitting
                  ? language === 'ar'
                    ? 'جارٍ الحفظ...'
                    : 'Saving...'
                  : t.finishTest}
              </span>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
