import { CheckCircle2, FileText, RotateCcw } from 'lucide-react';
import { UI_TEXT } from '../data/i18n';
import type { Language } from '../types/platform';

interface CompletionPageProps {
  language: Language;
  examineeCode: string;
  onViewReportOptional: () => void;
  onStartNewSession: () => void;
  onBackToCover: () => void;
}

export function CompletionPage({
  language,
  examineeCode,
  onViewReportOptional,
  onStartNewSession,
  onBackToCover,
}: CompletionPageProps) {
  const t = UI_TEXT[language];

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <section className="calm-card p-8 sm:p-10 text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#E7EFE8] border border-[#C6D9C9] flex items-center justify-center text-[#587564]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#587564]">{t.completionHeading}</h1>
          <p className="text-sm text-[#5F6D64] leading-relaxed">{t.completionSubheading}</p>
        </div>

        <div className="calm-surface p-4 text-xs sm:text-sm text-[#34443A]">
          <span>{language === 'ar' ? 'الكود التعريفي للجلسة:' : 'Session Identification Code:'}</span>{' '}
          <strong className="font-mono-num text-[#587564]" dir="ltr">
            {examineeCode}
          </strong>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {/* Strictly optional report button — never opens automatically */}
          <button
            type="button"
            onClick={onViewReportOptional}
            className="calm-btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t.viewReportOptional}</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onStartNewSession}
              className="calm-btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#587564]" />
              <span>{t.startAnotherSession}</span>
            </button>
            <button
              type="button"
              onClick={onBackToCover}
              className="calm-btn-outline inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5F6D64] cursor-pointer"
            >
              {t.backToHome}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
