import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Printer,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BDI_ITEMS, BDI_METADATA } from '../data/bdiTest';
import { UI_TEXT } from '../data/i18n';
import { scoreBdiResponses } from '../engine/bdiScoring';
import { cacheSessionAiAnalysis, updateSessionDoctorReview } from '../services/firestoreService';
import type {
  AiReportResponse,
  AiStructuredAnalysis,
  AssessmentSessionRecord,
  CustomTest,
  Language,
} from '../types/platform';
import { InstitutionalLogosStrip } from './InstitutionalHeader';

interface ReportViewProps {
  session: AssessmentSessionRecord;
  customTest?: CustomTest | null;
  language: Language;
  viewerRole: 'examinee' | 'doctor';
  onBack: () => void;
  onSessionUpdated?: (updated: AssessmentSessionRecord) => void;
}

function formatSessionDate(value: unknown, lang: Language): string {
  let d = new Date();
  if (value instanceof Date) {
    d = value;
  } else if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    d = (value as { toDate: () => Date }).toDate();
  } else if (typeof value === 'string' || typeof value === 'number') {
    d = new Date(value);
  }
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d);
}

function tryParseStructuredAi(raw: string): AiStructuredAnalysis | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as AiStructuredAnalysis;
    if (obj && typeof obj.summary === 'string') return obj;
    return null;
  } catch {
    return null;
  }
}

export function ReportView({
  session,
  customTest,
  language,
  viewerRole,
  onBack,
  onSessionUpdated,
}: ReportViewProps) {
  const [reportLang, setReportLang] = useState<Language>(language);
  const t = UI_TEXT[reportLang];
  const isRtl = reportLang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [aiAr, setAiAr] = useState<AiStructuredAnalysis | null>(() =>
    tryParseStructuredAi(session.aiAnalysisAr)
  );
  const [aiEn, setAiEn] = useState<AiStructuredAnalysis | null>(() =>
    tryParseStructuredAi(session.aiAnalysisEn)
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const [doctorNotes, setDoctorNotes] = useState(session.doctorNotes || '');
  const [reviewStatus, setReviewStatus] = useState<'completed' | 'reviewed'>(session.status);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSavedMsg, setReviewSavedMsg] = useState('');

  // Re-evaluate deterministic BDI clinical alerts cleanly if BDI
  const bdiEval =
    session.isBdi && session.answers.length === BDI_ITEMS.length
      ? scoreBdiResponses(session.answers)
      : null;

  useEffect(() => {
    setReportLang(language);
  }, [language]);

  useEffect(() => {
    if (aiAr && aiEn) return;
    let cancelled = false;

    const loadAiAnalysis = async () => {
      setAiLoading(true);
      setAiUnavailable(false);
      try {
        const itemResponses = session.answers.map((score, idx) => {
          if (session.isBdi) {
            const item = BDI_ITEMS[idx];
            const optIdx = session.selectedIndices[idx] ?? score;
            const opt = item?.options[optIdx] || item?.options[0];
            return {
              index: idx + 1,
              symptomLabel: item?.symptomName || `Item ${idx + 1}`,
              score,
              selectedText: opt?.text || '',
            };
          }
          const q = customTest?.questions[idx];
          const optIdx = session.selectedIndices[idx] ?? 0;
          const opt = q?.options[optIdx];
          return {
            index: idx + 1,
            symptomLabel: q?.promptAr || q?.promptEn || `Item ${idx + 1}`,
            score,
            selectedText: opt?.textAr || opt?.textEn || '',
          };
        });

        const res = await fetch('/api/ai/analyze-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testTitle: session.testTitle,
            isBdi: session.isBdi,
            age: session.examineeAge,
            rawScore: session.rawScore,
            maxScore: session.maxScore,
            classificationAr: session.classificationAr,
            classificationEn: session.classificationEn,
            cognitiveAffectiveScore: session.cognitiveAffectiveScore,
            somaticScore: session.somaticScore,
            alerts: session.alerts,
            itemResponses,
          }),
        });

        if (!res.ok) {
          if (!cancelled) setAiUnavailable(true);
          return;
        }
        const data = (await res.json()) as AiReportResponse;
        if (!cancelled && data.ok && data.ar && data.en) {
          setAiAr(data.ar);
          setAiEn(data.en);
          if (viewerRole === 'doctor') {
            try {
              const serializedAr = JSON.stringify(data.ar);
              const serializedEn = JSON.stringify(data.en);
              await cacheSessionAiAnalysis(session.id, serializedAr, serializedEn);
              onSessionUpdated?.({
                ...session,
                aiAnalysisAr: serializedAr,
                aiAnalysisEn: serializedEn,
              });
            } catch {
              // Non-fatal caching failure
            }
          }
        } else if (!cancelled) {
          setAiUnavailable(true);
        }
      } catch {
        if (!cancelled) setAiUnavailable(true);
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };

    loadAiAnalysis();
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  const handleSaveDoctorReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReview(true);
    setReviewSavedMsg('');
    try {
      await updateSessionDoctorReview(session.id, reviewStatus, doctorNotes);
      onSessionUpdated?.({
        ...session,
        status: reviewStatus,
        doctorNotes,
      });
      setReviewSavedMsg(
        reportLang === 'ar' ? 'تم حفظ المراجعة السريرية بنجاح.' : 'Clinical review saved.'
      );
    } catch {
      setReviewSavedMsg(
        reportLang === 'ar' ? 'تعذر حفظ المراجعة.' : 'Failed to save review.'
      );
    } finally {
      setSavingReview(false);
    }
  };

  const activeAi = reportLang === 'ar' ? aiAr : aiEn;
  const formattedDate = formatSessionDate(session.createdAt, reportLang);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Control Toolbar (hidden when printing) */}
      <div className="no-print calm-card flex flex-wrap items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={onBack}
          className="calm-btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#34443A] cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#587564]" />
          <span>{reportLang === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bilingual Report Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#FAF8F3] border border-[#E4E9E3]">
            <button
              type="button"
              onClick={() => setReportLang('ar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                reportLang === 'ar'
                  ? 'bg-[#E7EFE8] text-[#34443A] shadow-xs'
                  : 'text-[#78847B] hover:text-[#34443A]'
              }`}
            >
              التقرير بالعربية
            </button>
            <button
              type="button"
              onClick={() => setReportLang('en')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                reportLang === 'en'
                  ? 'bg-[#E7EFE8] text-[#34443A] shadow-xs'
                  : 'text-[#78847B] hover:text-[#34443A]'
              }`}
            >
              English Report
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="calm-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printPdfBtn}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet — Calm Academic Clinical Document */}
      <article className="print-container bg-white border-2 border-[#587564] p-6 sm:p-10 space-y-7 shadow-[0_4px_24px_rgba(52,68,58,0.06)]">
        {/* Official 3-Zone Institutional Header */}
        <header className="print-avoid-break border-b-2 border-[#587564] pb-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-xs sm:text-sm">
            {/* Institutional Block */}
            <div className="text-center md:text-start space-y-0.5 text-[#34443A]">
              <p className="font-bold text-sm sm:text-base text-[#587564]">{t.universityName}</p>
              <p className="text-xs text-[#5F6D64]">{t.developingFaculty}</p>
              <p className="text-xs text-[#5F6D64]">{t.collaboratingFaculty}</p>
            </div>

            {/* Three Original Institutional Logos */}
            <div className="flex justify-center">
              <InstitutionalLogosStrip compact />
            </div>

            {/* Document Reference Metadata */}
            <div className="text-center md:text-end space-y-1 text-xs text-[#5F6D64]">
              <p>
                <span className="font-semibold text-[#587564]">
                  {reportLang === 'ar' ? 'رقم الجلسة:' : 'Session Ref:'}
                </span>{' '}
                <span className="font-mono-num text-[#34443A]" dir="ltr">
                  {session.id}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#587564]">
                  {reportLang === 'ar' ? 'المقياس:' : 'Instrument:'}
                </span>{' '}
                <span className="text-[#34443A]">{session.isBdi ? 'BDI-IA (1971)' : session.testId}</span>
              </p>
            </div>
          </div>

          {/* Centered Underlined Official Report Title */}
          <div className="text-center space-y-2 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#587564] underline underline-offset-8 decoration-2 decoration-[#8FAE98]">
              {t.reportTitle}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#34443A] pt-1">
              {session.isBdi
                ? reportLang === 'ar'
                  ? `${BDI_METADATA.titleAr} (${BDI_METADATA.titleEn})`
                  : `${BDI_METADATA.titleEn} — ${BDI_METADATA.titleAr}`
                : session.testTitle}
            </p>
          </div>
        </header>

        {/* Formal Ruled Demographic Block */}
        <section className="print-avoid-break border border-[#8FAE98] divide-y divide-[#E4E9E3] bg-[#FAF8F3] text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-[#E4E9E3]">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="font-bold text-[#587564]">{t.codeLabel}:</span>
              <span className="font-mono-num font-bold text-[#34443A]" dir="ltr">
                {session.examineeCode}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="font-bold text-[#587564]">{t.nameLabel}:</span>
              <span className="font-semibold text-[#34443A]">
                {session.examineeName ||
                  (reportLang === 'ar' ? 'غير مسجل (اختياري)' : 'Not provided (Optional)')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-[#E4E9E3]">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="font-bold text-[#587564]">{t.ageLabel}:</span>
              <span className="font-mono-num font-semibold text-[#34443A]">
                {session.examineeAge} {reportLang === 'ar' ? 'سنة' : 'years'}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="font-bold text-[#587564]">{t.dateLabel}:</span>
              <span className="font-medium text-[#34443A] text-xs sm:text-sm tabular-nums">
                {formattedDate}
              </span>
            </div>
          </div>
        </section>

        {/* Deterministic Score & Classification Summary (Identical in both languages) */}
        <section className="print-avoid-break space-y-4">
          <h2 className="text-center text-base sm:text-lg font-bold text-[#587564] underline underline-offset-8 decoration-[#8FAE98]">
            {reportLang === 'ar'
              ? 'ملخص الدرجة والتصنيف المعتمد'
              : 'Score & Official Classification Summary'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#8FAE98] p-5 space-y-2 bg-white">
              <div className="text-xs font-bold text-[#78847B]">{t.rawScoreLabel}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono-num text-[#587564]">
                  {session.rawScore}
                </span>
                <span className="text-lg font-mono-num text-[#78847B]">/ {session.maxScore}</span>
              </div>
              {session.isBdi && (
                <div className="pt-2 border-t border-[#E4E9E3] text-xs text-[#5F6D64] flex flex-wrap gap-x-4 gap-y-1">
                  <span className="tabular-nums">
                    {t.cognitiveAffectiveLabel}:{' '}
                    <strong className="text-[#34443A]">{session.cognitiveAffectiveScore}</strong> / 39
                  </span>
                  <span className="tabular-nums">
                    {t.somaticLabel}:{' '}
                    <strong className="text-[#34443A]">{session.somaticScore}</strong> / 24
                  </span>
                </div>
              )}
            </div>

            <div className="border border-[#8FAE98] p-5 space-y-2 bg-[#E7EFE8]/45">
              <div className="text-xs font-bold text-[#587564]">{t.classificationLabel}</div>
              <div className="text-xl font-bold text-[#34443A]">
                {reportLang === 'ar' ? session.classificationAr : session.classificationEn}
              </div>
              <div className="text-xs text-[#5F6D64]">
                {reportLang === 'ar'
                  ? `المقابل الإنجليزي الموحد: ${session.classificationEn}`
                  : `Official Arabic Label: ${session.classificationAr}`}
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Review Alerts (Synchronized across languages) */}
        {bdiEval && bdiEval.alerts.length > 0 && (
          <section className="print-avoid-break space-y-4">
            <h2 className="text-center text-base sm:text-lg font-bold text-[#9E2A3B] underline underline-offset-8 decoration-[#9E2A3B] flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#9E2A3B]" />
              <span>{t.alertsHeading}</span>
            </h2>
            <div className="space-y-2.5">
              {bdiEval.alerts.map((alert) => {
                const isPriority = alert.severity === 'priority';
                const isAttention = alert.severity === 'attention';
                return (
                  <div
                    key={alert.code}
                    className={`border p-4 text-sm leading-relaxed flex items-start gap-3 ${
                      isPriority
                        ? 'bg-[#FDF4F5] border-[#EAC8CD] text-[#7D2230]'
                        : isAttention
                          ? 'bg-[#FBF6EC] border-[#E8D6B3] text-[#6E4E1E]'
                          : 'bg-[#FAF8F3] border-[#E4E9E3] text-[#34443A]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p>{reportLang === 'ar' ? alert.messageAr : alert.messageEn}</p>
                      {isPriority && (
                        <p className="text-xs font-semibold pt-1">
                          {reportLang === 'ar'
                            ? 'بروتوكول المراجعة البشرية: يتطلب هذا المؤشر تواصلًا وتقييمًا مباشرًا من الأخصائي النفسي أو الطبيب المختص، ولا يُعتمد على التنبيه الآلي وحده.'
                            : 'Human Review Protocol: Direct evaluation by a licensed clinician or faculty specialist is required; automated flags do not replace human judgment.'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AI-Assisted Analytical Narrative (Server-side Gemini with graceful fallback) */}
        <section className="print-avoid-break space-y-4 border border-[#8FAE98] p-5 sm:p-6 bg-[#FAF8F3]">
          <div className="flex items-center justify-center gap-2 text-base font-bold text-[#587564] underline underline-offset-8 decoration-[#8FAE98]">
            <Sparkles className="w-4 h-4 text-[#587564]" />
            <span>{t.aiSectionHeading}</span>
          </div>

          {aiLoading && <p className="text-sm text-[#5F6D64] text-center">{t.aiLoading}</p>}

          {!aiLoading && aiUnavailable && !activeAi && (
            <p className="text-sm text-[#5F6D64] bg-white border border-[#E4E9E3] p-4">
              {t.aiUnavailable}
            </p>
          )}

          {activeAi && (
            <div className="space-y-4 text-sm text-[#34443A] leading-relaxed pt-1">
              <div className="bg-white border border-[#E4E9E3] p-4">
                <h3 className="font-bold text-[#587564] mb-1">
                  {reportLang === 'ar' ? 'الملخص العام للاستجابات' : 'General Response Summary'}
                </h3>
                <p>{activeAi.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-[#E4E9E3] p-4">
                  <h4 className="font-bold text-[#587564] mb-1 text-xs sm:text-sm">
                    {reportLang === 'ar' ? 'الأنماط المعرفية' : 'Cognitive Patterns'}
                  </h4>
                  <p className="text-xs sm:text-sm">{activeAi.cognitivePatterns}</p>
                </div>
                <div className="bg-white border border-[#E4E9E3] p-4">
                  <h4 className="font-bold text-[#587564] mb-1 text-xs sm:text-sm">
                    {reportLang === 'ar' ? 'الجوانب الوجدانية' : 'Affective Aspects'}
                  </h4>
                  <p className="text-xs sm:text-sm">{activeAi.affectiveAspects}</p>
                </div>
                <div className="bg-white border border-[#E4E9E3] p-4">
                  <h4 className="font-bold text-[#587564] mb-1 text-xs sm:text-sm">
                    {reportLang === 'ar' ? 'الأعراض الجسمية' : 'Somatic Symptoms'}
                  </h4>
                  <p className="text-xs sm:text-sm">{activeAi.somaticSymptoms}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-[#E4E9E3] p-4">
                  <h4 className="font-bold text-[#587564] mb-2 text-xs sm:text-sm">
                    {reportLang === 'ar' ? 'الأعراض الأكثر ارتفاعًا' : 'More Elevated Indicators'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    {activeAi.elevatedSymptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-[#E4E9E3] p-4">
                  <h4 className="font-bold text-[#587564] mb-2 text-xs sm:text-sm">
                    {reportLang === 'ar' ? 'جوانب أقل حدة' : 'Lower Severity Areas'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    {activeAi.lowerSeverityAreas.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-[#E4E9E3] p-4">
                  <h4 className="font-bold text-[#587564] mb-2 text-xs sm:text-sm">
                    {reportLang === 'ar' ? 'نقاط الدعم للمناقشة' : 'Support & Discussion Points'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    {activeAi.supportResources.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Custom Test Report Template if applicable */}
        {!session.isBdi && customTest && (customTest.reportTemplateAr || customTest.reportTemplateEn) && (
          <section className="print-avoid-break border border-[#8FAE98] p-5 bg-[#FAF8F3] text-sm text-[#34443A]">
            <h3 className="font-bold text-[#587564] mb-1">
              {reportLang === 'ar' ? 'ملاحظات قالب التقرير' : 'Assessment Report Template Notes'}
            </h3>
            <p>
              {reportLang === 'ar'
                ? customTest.reportTemplateAr || customTest.reportTemplateEn
                : customTest.reportTemplateEn || customTest.reportTemplateAr}
            </p>
          </section>
        )}

        {/* Item-by-Item Response Table (Calm Soft Sage Header Grid) */}
        <section className="space-y-4">
          <h2 className="text-center text-base sm:text-lg font-bold text-[#587564] underline underline-offset-8 decoration-[#8FAE98]">
            {t.responsesTableHeading}
          </h2>
          <div className="overflow-x-auto border border-[#8FAE98]">
            <table className="w-full text-sm text-start border-collapse">
              <thead className="bg-[#E7EFE8] border-b border-[#8FAE98] text-xs sm:text-sm font-bold text-[#34443A]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-14 border-e border-[#C6D9C9]">
                    {reportLang === 'ar' ? 'م' : '#'}
                  </th>
                  <th className="py-2.5 px-4 text-start border-e border-[#C6D9C9]">
                    {reportLang === 'ar' ? 'البند / العرض' : 'Item / Domain'}
                  </th>
                  <th className="py-2.5 px-4 text-start border-e border-[#C6D9C9]">
                    {reportLang === 'ar' ? 'العبارة المختارة' : 'Selected Response'}
                  </th>
                  <th className="py-2.5 px-3 text-center w-24">
                    {reportLang === 'ar' ? 'الدرجة' : 'Score'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E3]">
                {session.answers.map((score, idx) => {
                  if (session.isBdi) {
                    const item = BDI_ITEMS[idx];
                    const optIdx = session.selectedIndices[idx] ?? score;
                    const opt = item?.options[optIdx];
                    return (
                      <tr key={idx} className="odd:bg-white even:bg-[#FAF8F3]">
                        <td className="py-2.5 px-3 text-center font-mono-num text-[#5F6D64] border-e border-[#E4E9E3]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#34443A] border-e border-[#E4E9E3]" dir="rtl">
                          {item?.symptomName}
                        </td>
                        <td className="py-2.5 px-4 text-[#34443A] border-e border-[#E4E9E3]" dir="rtl">
                          {opt?.text}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono-num font-bold text-[#587564]">
                          {score}
                        </td>
                      </tr>
                    );
                  }
                  const q = customTest?.questions[idx];
                  const optIdx = session.selectedIndices[idx] ?? 0;
                  const opt = q?.options[optIdx];
                  return (
                    <tr key={idx} className="odd:bg-white even:bg-[#FAF8F3]">
                      <td className="py-2.5 px-3 text-center font-mono-num text-[#5F6D64] border-e border-[#E4E9E3]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#34443A] border-e border-[#E4E9E3]">
                        {reportLang === 'ar' ? q?.promptAr || q?.promptEn : q?.promptEn || q?.promptAr}
                      </td>
                      <td className="py-2.5 px-4 text-[#34443A] border-e border-[#E4E9E3]">
                        {reportLang === 'ar' ? opt?.textAr || opt?.textEn : opt?.textEn || opt?.textAr}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono-num font-bold text-[#587564]">
                        {score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Doctor Clinical Notes (Visible if written, editable by Doctor) */}
        {(viewerRole === 'doctor' || session.doctorNotes) && (
          <section className="print-avoid-break border border-[#8FAE98] p-5 space-y-3 bg-white">
            <h3 className="text-sm font-bold text-[#587564] underline underline-offset-4 decoration-[#8FAE98]">
              {reportLang === 'ar' ? 'ملاحظات المراجعة الإكلينيكية للدكتور' : 'Clinician Review Notes'}
            </h3>
            {viewerRole === 'doctor' ? (
              <form onSubmit={handleSaveDoctorReview} className="no-print space-y-3">
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder={
                    reportLang === 'ar'
                      ? 'أضف ملاحظات المتابعة أو نتائج الفحص السريري المباشر...'
                      : 'Add clinical review or follow-up observations...'
                  }
                  className="calm-input w-full px-4 py-3 text-sm"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-[#34443A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewStatus === 'reviewed'}
                      onChange={(e) => setReviewStatus(e.target.checked ? 'reviewed' : 'completed')}
                      className="w-4 h-4 accent-[#587564]"
                    />
                    <span>
                      {reportLang === 'ar'
                        ? 'اعتماد الحالة كمُراجعة من قِبل المختص'
                        : 'Mark session as clinically reviewed'}
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={savingReview}
                    className="calm-btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingReview ? '...' : reportLang === 'ar' ? 'حفظ المراجعة' : 'Save Review'}</span>
                  </button>
                </div>
                {reviewSavedMsg && (
                  <p className="text-xs font-semibold text-[#587564]">{reviewSavedMsg}</p>
                )}
              </form>
            ) : null}
            {session.doctorNotes && (
              <p className="text-sm text-[#34443A] whitespace-pre-wrap">{session.doctorNotes}</p>
            )}
          </section>
        )}

        {/* Formal Two-Column Signature & Academic Endorsement Block */}
        <section className="print-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-xs sm:text-sm text-[#34443A]">
          <div className="space-y-2 text-center sm:text-start">
            <p className="font-bold text-[#587564]">
              {reportLang === 'ar' ? 'مراجعة الأخصائي / عضو هيئة التدريس' : 'Specialist / Faculty Review'}
            </p>
            <p className="text-xs text-[#5F6D64]">
              {session.reviewedByEmail
                ? `${reportLang === 'ar' ? 'تمت المراجعة بواسطة:' : 'Reviewed by:'} ${session.reviewedByEmail}`
                : reportLang === 'ar'
                  ? 'الاسم والتوقيع: ................................................'
                  : 'Name & Signature: ........................................'}
            </p>
          </div>
          <div className="space-y-2 text-center sm:text-end">
            <p className="font-bold text-[#587564]">
              {reportLang === 'ar' ? 'الاعتماد المؤسسي للمنصة' : 'Institutional Platform Endorsement'}
            </p>
            <p className="text-xs text-[#5F6D64]">
              {t.universityName} · {t.collaboratingFaculty}
            </p>
          </div>
        </section>

        {/* Mandatory Academic & Medical Disclaimer */}
        <footer className="print-avoid-break border-t-2 border-[#587564] pt-4 space-y-1.5 text-xs text-[#5F6D64] leading-relaxed">
          <div className="font-bold text-[#587564]">{t.disclaimerHeading}</div>
          <p>{t.disclaimerBody}</p>
          <p className="text-[11px] text-[#78847B]">{t.collaborationLine}</p>
        </footer>
      </article>
    </div>
  );
}
