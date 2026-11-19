import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CustomTest, Language } from '../types/platform';
import { InstitutionalLogosStrip } from './InstitutionalHeader';

interface CustomTestCoverPageProps {
  test: CustomTest;
  language: Language;
  onStartSession: () => void;
  onBack: () => void;
}

const BG_STYLES: Record<CustomTest['coverConfig']['bgStyle'], string> = {
  'pastel-sage': 'bg-[#FFFFFF] border-[#C9DACB]',
  'pastel-slate': 'bg-[#FFFFFF] border-[#D4DFDD]',
  'pastel-sand': 'bg-[#FAF8F3] border-[#E4E0D4]',
  'pastel-indigo': 'bg-[#FFFFFF] border-[#DCDCE7]',
};

export function CustomTestCoverPage({
  test,
  language,
  onStartSession,
  onBack,
}: CustomTestCoverPageProps) {
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const cfg = test.coverConfig;
  const cardBg = BG_STYLES[cfg.bgStyle] || BG_STYLES['pastel-sage'];
  const accentColor = !cfg.accentColor || cfg.accentColor === '#1D5C4B' ? '#587564' : cfg.accentColor;

  const title =
    language === 'ar' ? cfg.titleAr || test.titleAr : cfg.titleEn || test.titleEn || test.titleAr;
  const subtitle = language === 'ar' ? cfg.subtitleAr : cfg.subtitleEn || cfg.subtitleAr;
  const description =
    language === 'ar'
      ? cfg.descriptionAr || test.descriptionAr
      : cfg.descriptionEn || test.descriptionEn || test.descriptionAr;
  const institution =
    language === 'ar' ? cfg.institutionAr : cfg.institutionEn || cfg.institutionAr;
  const ctaLabel =
    language === 'ar'
      ? cfg.ctaLabelAr || 'ابدأ الجلسة التقييمية'
      : cfg.ctaLabelEn || 'Start Assessment Session';

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-[#5F6D64] hover:text-[#34443A] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
      >
        <BackIcon className="w-4 h-4" />
        <span>{language === 'ar' ? 'العودة إلى الغلاف الرئيسي' : 'Back to Main Cover'}</span>
      </button>

      <section
        className={`border rounded-2xl p-6 sm:p-10 space-y-8 shadow-[0_2px_14px_rgba(52,68,58,0.04)] ${cardBg}`}
      >
        {cfg.showInstitutionalLogos && (
          <div className="pb-6 border-b border-[#E4E9E3] text-center space-y-3">
            <InstitutionalLogosStrip compact />
            {institution && <p className="text-sm font-semibold text-[#587564]">{institution}</p>}
          </div>
        )}

        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="text-xs font-medium text-[#78847B] flex items-center justify-center gap-2">
            <span>{test.testType}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {test.questions.length} {language === 'ar' ? 'بند' : 'items'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#587564] text-balance">{title}</h1>
          {subtitle && <p className="text-base sm:text-lg text-[#34443A] font-medium">{subtitle}</p>}
          {description && (
            <p className="text-sm sm:text-base text-[#34443A] leading-relaxed bg-[#FAF8F3] border border-[#E4E9E3] rounded-xl p-5">
              {description}
            </p>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onStartSession}
            style={{ backgroundColor: accentColor }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-base shadow-xs hover:opacity-92 transition-opacity cursor-pointer min-h-[50px]"
          >
            <span>{ctaLabel}</span>
            <ArrowIcon className="w-5 h-5" />
          </button>
        </div>
      </section>
    </main>
  );
}
