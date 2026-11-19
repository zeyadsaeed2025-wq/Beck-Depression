import { BookOpen, Globe, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { INSTITUTIONAL_LOGOS } from '../data/bdiTest';
import { UI_TEXT } from '../data/i18n';
import type { Language } from '../types/platform';

export type AppRoute =
  | 'cover'
  | 'custom-cover'
  | 'intake'
  | 'runner'
  | 'completion'
  | 'report'
  | 'doctor';

interface InstitutionalHeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  disableNavDuringTest?: boolean;
  isGlossaryOpen?: boolean;
  onOpenGlossary?: () => void;
}

export function InstitutionalLogosStrip({
  compact = false,
  headerLayout = false,
}: {
  compact?: boolean;
  headerLayout?: boolean;
}) {
  if (headerLayout) {
    return (
      <div
        dir="rtl"
        className="w-full max-w-3xl mx-auto px-3 sm:px-10 grid grid-cols-3 items-center gap-4 sm:gap-8"
      >
        {/* Right: Menoufia University */}
        <div className="flex items-center justify-start">
          <div className="h-14 w-16 sm:h-20 sm:w-24 flex items-center justify-center">
            <img
              src={INSTITUTIONAL_LOGOS.university}
              alt="شعار جامعة المنوفية - Menoufia University Logo"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Center: Faculty of Arts */}
        <div className="flex items-center justify-center">
          <div className="h-14 w-16 sm:h-20 sm:w-24 flex items-center justify-center overflow-hidden">
            <img
              src={INSTITUTIONAL_LOGOS.arts}
              alt="شعار كلية الآداب جامعة المنوفية - Faculty of Arts Logo"
              className="max-h-full max-w-full object-contain scale-125"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Left: Faculty of Specific Education */}
        <div className="flex items-center justify-end">
          <div className="h-14 w-16 sm:h-20 sm:w-24 flex items-center justify-center">
            <img
              src={INSTITUTIONAL_LOGOS.specificEducation}
              alt="شعار كلية التربية النوعية جامعة المنوفية - Faculty of Specific Education Logo"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    );
  }

  const heightClass = compact ? 'h-12 sm:h-14' : 'h-16 sm:h-20';
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-10">
      <div className="flex flex-col items-center">
        <img
          src={INSTITUTIONAL_LOGOS.university}
          alt="شعار جامعة المنوفية - Menoufia University Logo"
          className={`${heightClass} w-auto max-w-full object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col items-center">
        <img
          src={INSTITUTIONAL_LOGOS.specificEducation}
          alt="شعار كلية التربية النوعية جامعة المنوفية - Faculty of Specific Education Logo"
          className={`${heightClass} w-auto max-w-full object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col items-center">
        <img
          src={INSTITUTIONAL_LOGOS.arts}
          alt="شعار كلية الآداب جامعة المنوفية - Faculty of Arts Logo"
          className={`${heightClass} w-auto max-w-full object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

export function InstitutionalHeader({
  language,
  onToggleLanguage,
  currentRoute,
  onNavigate,
  disableNavDuringTest = false,
  isGlossaryOpen = false,
  onOpenGlossary,
}: InstitutionalHeaderProps) {
  const t = UI_TEXT[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const glossaryLabel = language === 'ar' ? 'القاموس النفسي' : 'Psychology Glossary';

  const isCoverActive = !isGlossaryOpen && (currentRoute === 'cover' || currentRoute === 'custom-cover');
  const isSessionActive =
    !isGlossaryOpen &&
    (currentRoute === 'intake' || currentRoute === 'runner' || currentRoute === 'completion');
  const isDoctorActive = !isGlossaryOpen && currentRoute === 'doctor';

  const handleMobileNav = (target: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(target);
  };

  const handleOpenGlossary = () => {
    setMobileMenuOpen(false);
    onOpenGlossary?.();
  };

  return (
    <header className="no-print sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand Title */}
        <button
          type="button"
          disabled={disableNavDuringTest}
          onClick={() => handleMobileNav('cover')}
          className="text-start font-bold text-sm sm:text-base text-[#34443A] hover:text-[#587564] transition-colors truncate max-w-[210px] sm:max-w-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t.platformName}
        </button>

        {/* Zone 2: Clean Desktop Navigation Links with Sage Green Active Indicator */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#78847B]">
          <button
            type="button"
            disabled={disableNavDuringTest}
            onClick={() => onNavigate('cover')}
            className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isCoverActive
                ? 'border-[#587564] text-[#587564] font-semibold'
                : 'border-transparent hover:text-[#34443A]'
            }`}
          >
            {t.navCover}
          </button>
          <button
            type="button"
            disabled={disableNavDuringTest}
            onClick={() => onNavigate('intake')}
            className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSessionActive
                ? 'border-[#587564] text-[#587564] font-semibold'
                : 'border-transparent hover:text-[#34443A]'
            }`}
          >
            {t.navStartSession}
          </button>
          {onOpenGlossary && (
            <button
              type="button"
              onClick={handleOpenGlossary}
              className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                isGlossaryOpen
                  ? 'border-[#587564] text-[#587564] font-semibold'
                  : 'border-transparent hover:text-[#34443A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{glossaryLabel}</span>
            </button>
          )}
          <button
            type="button"
            disabled={disableNavDuringTest}
            onClick={() => onNavigate('doctor')}
            className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDoctorActive
                ? 'border-[#587564] text-[#587564] font-semibold'
                : 'border-transparent hover:text-[#34443A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.navDoctorPortal}</span>
          </button>
        </nav>

        {/* Zone 3: Language Switcher + Responsive Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenGlossary && disableNavDuringTest && (
            <button
              type="button"
              onClick={handleOpenGlossary}
              aria-label={glossaryLabel}
              className={`md:hidden inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
                isGlossaryOpen
                  ? 'border-[#587564] bg-[#E7EFE8] text-[#587564]'
                  : 'border-[#E4E9E3] bg-[#FAF8F3] text-[#34443A] hover:bg-[#E7EFE8]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#587564]" />
              <span>{language === 'ar' ? 'القاموس' : 'Glossary'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4E9E3] bg-[#FAF8F3] hover:bg-[#E7EFE8] hover:border-[#8FAE98] text-xs sm:text-sm font-semibold text-[#34443A] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <Globe className="w-4 h-4 text-[#587564]" />
            <span>{t.langSwitch}</span>
          </button>

          <button
            type="button"
            disabled={disableNavDuringTest && !onOpenGlossary}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={language === 'ar' ? 'قائمة التنقل' : 'Navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E4E9E3] bg-[#FAF8F3] text-[#34443A] hover:bg-[#E7EFE8] transition-colors cursor-pointer disabled:opacity-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label={language === 'ar' ? 'القائمة الرئيسية' : 'Mobile Navigation'}
          className="md:hidden border-t border-[#E4E9E3] bg-[#FFFFFF] px-4 py-3 space-y-1.5"
        >
          <button
            type="button"
            disabled={disableNavDuringTest}
            onClick={() => handleMobileNav('cover')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isCoverActive
                ? 'bg-[#E7EFE8] text-[#587564] font-semibold'
                : 'text-[#34443A] hover:bg-[#FAF8F3]'
            }`}
          >
            {t.navCover}
          </button>
          <button
            type="button"
            disabled={disableNavDuringTest}
            onClick={() => handleMobileNav('intake')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSessionActive
                ? 'bg-[#E7EFE8] text-[#587564] font-semibold'
                : 'text-[#34443A] hover:bg-[#FAF8F3]'
            }`}
          >
            {t.navStartSession}
          </button>
          {onOpenGlossary && (
            <button
              type="button"
              onClick={handleOpenGlossary}
              className={`w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2 ${
                isGlossaryOpen
                  ? 'bg-[#E7EFE8] text-[#587564] font-semibold'
                  : 'text-[#34443A] hover:bg-[#FAF8F3]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#587564]" />
              <span>{glossaryLabel}</span>
            </button>
          )}
          <button
            type="button"
            disabled={disableNavDuringTest}
            onClick={() => handleMobileNav('doctor')}
            className={`w-full text-start px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDoctorActive
                ? 'bg-[#E7EFE8] text-[#587564] font-semibold'
                : 'text-[#34443A] hover:bg-[#FAF8F3]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#587564]" />
            <span>{t.navDoctorPortal}</span>
          </button>
        </nav>
      )}
    </header>
  );
}
