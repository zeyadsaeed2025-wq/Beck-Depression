import { ArrowLeft, ArrowRight, BookOpen, FileText, Info } from 'lucide-react';
import { BDI_METADATA } from '../data/bdiTest';
import { UI_TEXT } from '../data/i18n';
import type { CustomTest, Language, PlatformSetting } from '../types/platform';
import { InstitutionalLogosStrip } from './InstitutionalHeader';

interface CoverPageProps {
  language: Language;
  platformSettings: PlatformSetting | null;
  publishedCustomTests: CustomTest[];
  onStartBdiSession: () => void;
  onSelectCustomTestCover: (test: CustomTest) => void;
}

export function CoverPage({
  language,
  platformSettings,
  publishedCustomTests,
  onStartBdiSession,
  onSelectCustomTestCover,
}: CoverPageProps) {
  const t = UI_TEXT[language];
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Use Calm Deep Sage as default primary accent while preserving custom doctor overrides
  const rawAccent = platformSettings?.bdiCoverAccent;
  const accentColor = !rawAccent || rawAccent === '#1D5C4B' ? '#587564' : rawAccent;
  const showCopyright = platformSettings ? platformSettings.showCopyrightNotice : true;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Main Academic Cover Card */}
      <section className="calm-card p-6 sm:p-10 space-y-8">
        {/* Institutional Logos Row */}
        <div className="space-y-4 text-center pb-6 border-b border-[#E4E9E3]">
          <InstitutionalLogosStrip headerLayout />
          <div className="space-y-1.5 pt-2">
            <p className="text-sm sm:text-base font-bold text-[#587564]">{t.universityName}</p>
            <p className="text-xs sm:text-sm text-[#5F6D64] leading-relaxed max-w-3xl mx-auto">
              {t.collaborationLine}
            </p>
            {(platformSettings?.platformSubtitleAr || platformSettings?.platformSubtitleEn) && (
              <p className="text-xs text-[#78847B]">
                {language === 'ar'
                  ? platformSettings.platformSubtitleAr
                  : platformSettings.platformSubtitleEn}
              </p>
            )}
          </div>
        </div>

        {/* Assessment Identity */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="text-xs font-medium text-[#78847B] flex flex-wrap items-center justify-center gap-2">
            <span>{language === 'ar' ? 'المقياس الأساسي المعتمد' : 'Primary Standardized Scale'}</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'ar' ? '٢١ بندًا' : '21 Items'}</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'ar' ? 'صيغة ١٩٧١ المعدلة' : 'Revised 1971 Form'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#587564] tracking-tight leading-tight text-balance">
            {BDI_METADATA.titleAr}
          </h1>
          <p className="font-editorial-en text-xl sm:text-2xl text-[#34443A] font-medium">
            {BDI_METADATA.titleEn}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-[#5F6D64]">
            <span>
              <strong className="font-semibold text-[#34443A]">
                {language === 'ar' ? 'المؤلفان:' : 'Authors:'}
              </strong>{' '}
              {language === 'ar' ? BDI_METADATA.authorsAr : BDI_METADATA.authorsEn}
            </span>
            <span className="hidden sm:inline text-[#78847B]" aria-hidden="true">
              ·
            </span>
            <span>
              <strong className="font-semibold text-[#34443A]">
                {language === 'ar' ? 'الترجمة العربية:' : 'Arabic Adaptation:'}
              </strong>{' '}
              {language === 'ar' ? BDI_METADATA.translatorAr : BDI_METADATA.translatorEn}
            </span>
          </div>
        </div>

        {/* Brief Source-Verified Overview */}
        <div className="calm-surface p-5 sm:p-6 max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#587564]">
            <BookOpen className="w-4 h-4 text-[#587564] shrink-0" />
            <span>
              {language === 'ar' ? 'نبذة عن الاختبار (وفق الوثيقة المعتمدة)' : 'Scale Overview (Source-Verified)'}
            </span>
          </div>
          <p className="text-sm text-[#34443A] leading-relaxed" dir="rtl">
            {BDI_METADATA.overviewParagraph1}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E4E9E3] text-xs sm:text-sm text-[#5F6D64]">
            <div>
              <span className="font-semibold text-[#34443A] block mb-1">
                {language === 'ar' ? 'الجهة المطورة برمجيًا:' : 'Software Engineering:'}
              </span>
              <span>{t.developingFaculty}</span>
            </div>
            <div>
              <span className="font-semibold text-[#34443A] block mb-1">
                {language === 'ar' ? 'التعاون الأكاديمي:' : 'Academic Collaboration:'}
              </span>
              <span>{t.collaboratingFaculty}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <button
            type="button"
            onClick={onStartBdiSession}
            style={{ backgroundColor: accentColor }}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-base sm:text-lg shadow-xs hover:opacity-92 active:translate-y-px transition-all cursor-pointer min-h-[52px]"
          >
            <span>{t.startAssessmentBtn}</span>
            <ArrowIcon className="w-5 h-5" />
          </button>

          {showCopyright && (
            <div className="max-w-2xl text-center flex items-start justify-center gap-2 text-xs text-[#78847B] leading-relaxed pt-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#8FAE98]" />
              <p>{t.copyrightNoticeBody}</p>
            </div>
          )}
        </div>
      </section>

      {/* Published Custom Academic Tests Section */}
      {publishedCustomTests.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-[#E4E9E3] pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#587564]">
                {language === 'ar'
                  ? 'الاختبارات الأكاديمية الإضافية المنشورة'
                  : 'Published Custom Academic Assessments'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6D64]">
                {language === 'ar'
                  ? 'اختبارات منشأة من قِبل أعضاء هيئة التدريس بغلاف مستقل لكل اختبار.'
                  : 'Faculty-authored assessments, each featuring its own dedicated academic cover.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {publishedCustomTests.map((ct) => {
              const cardAccent =
                !ct.coverConfig.accentColor || ct.coverConfig.accentColor === '#1D5C4B'
                  ? '#587564'
                  : ct.coverConfig.accentColor;

              return (
                <article
                  key={ct.id}
                  className="calm-card p-6 flex flex-col justify-between gap-5 hover:border-[#8FAE98] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="text-xs text-[#78847B] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#587564]" />
                      <span>{ct.testType || (language === 'ar' ? 'اختبار أكاديمي' : 'Academic Scale')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {ct.questions.length} {language === 'ar' ? 'بند' : 'items'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#34443A]">
                      {language === 'ar'
                        ? ct.coverConfig.titleAr || ct.titleAr
                        : ct.coverConfig.titleEn || ct.titleEn || ct.titleAr}
                    </h3>
                    <p className="text-sm text-[#5F6D64] line-clamp-2 leading-relaxed">
                      {language === 'ar'
                        ? ct.coverConfig.descriptionAr || ct.descriptionAr
                        : ct.coverConfig.descriptionEn || ct.descriptionEn || ct.descriptionAr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E4E9E3]">
                    <span className="text-xs text-[#78847B] truncate">
                      {language === 'ar'
                        ? ct.coverConfig.institutionAr
                        : ct.coverConfig.institutionEn || ct.coverConfig.institutionAr}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectCustomTestCover(ct)}
                      style={{ backgroundColor: cardAccent }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold hover:opacity-92 transition-opacity cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]"
                    >
                      <span>
                        {language === 'ar'
                          ? ct.coverConfig.ctaLabelAr || 'عرض الغلاف والبدء'
                          : ct.coverConfig.ctaLabelEn || 'Open Cover'}
                      </span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
