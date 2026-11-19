import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Copy,
  KeyRound,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { UI_TEXT } from '../data/i18n';
import {
  checkCodeExists,
  generateUniqueExamineeCode,
  sanitizeExamineeCode,
} from '../services/firestoreService';
import type { Language } from '../types/platform';

export interface IntakeSessionData {
  examineeCode: string;
  examineeName: string;
  examineeAge: number;
  isNewCode: boolean;
  applicationDateIso: string;
}

interface ExamineeIntakePageProps {
  language: Language;
  activeTestTitle: string;
  onBack: () => void;
  onStartTest: (data: IntakeSessionData) => void;
}

export function ExamineeIntakePage({
  language,
  activeTestTitle,
  onBack,
  onStartTest,
}: ExamineeIntakePageProps) {
  const t = UI_TEXT[language];
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [codeInput, setCodeInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'new' | 'existing' | 'invalid'>('idle');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [applicationDate] = useState(() => new Date());

  const cleanCode = sanitizeExamineeCode(codeInput);
  const parsedAge = Number(ageInput);
  const isAgeValid =
    ageInput.trim() !== '' && Number.isInteger(parsedAge) && parsedAge >= 10 && parsedAge <= 110;

  useEffect(() => {
    if (!cleanCode) {
      setCodeStatus('idle');
      return;
    }
    if (cleanCode.length < 4 || cleanCode.length > 24) {
      setCodeStatus('invalid');
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsCheckingCode(true);
      try {
        const exists = await checkCodeExists(cleanCode);
        if (!cancelled) {
          setCodeStatus(exists ? 'existing' : 'new');
        }
      } catch {
        if (!cancelled) {
          setCodeStatus('new');
        }
      } finally {
        if (!cancelled) {
          setIsCheckingCode(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cleanCode]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const freshCode = await generateUniqueExamineeCode();
      setCodeInput(freshCode);
      setCodeStatus('new');
      setCopied(false);
    } catch {
      setErrorMsg(
        language === 'ar'
          ? 'تعذر توليد كود جديد الآن. يرجى المحاولة مرة أخرى.'
          : 'Could not generate a unique code right now. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!cleanCode) return;
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isFormValid =
    cleanCode.length >= 4 &&
    cleanCode.length <= 24 &&
    (codeStatus === 'new' || codeStatus === 'existing') &&
    !isCheckingCode &&
    isAgeValid &&
    consentChecked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى التحقق من إدخال الكود التعريفي والعمر الصحيح والموافقة على سياسة الخصوصية.'
          : 'Please verify your identification code, valid age (10–110), and privacy consent.'
      );
      return;
    }
    onStartTest({
      examineeCode: cleanCode,
      examineeName: nameInput.trim(),
      examineeAge: parsedAge,
      isNewCode: codeStatus === 'new',
      applicationDateIso: applicationDate.toISOString(),
    });
  };

  const formattedDate = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(applicationDate);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="calm-card p-6 sm:p-8 space-y-6">
        <div className="space-y-2 border-b border-[#E4E9E3] pb-5">
          <div className="text-xs font-semibold text-[#587564]">{activeTestTitle}</div>
          <h1 className="text-2xl font-bold text-[#34443A]">{t.intakeTitle}</h1>
          <p className="text-sm text-[#5F6D64] leading-relaxed">{t.intakeSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Field 1: Identification Code (Mandatory) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="examinee-code" className="text-sm font-semibold text-[#34443A]">
                {t.codeLabel} <span className="text-[#9E2A3B]">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="calm-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#587564] ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{t.generateNewCode}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-[#78847B] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  id="examinee-code"
                  type="text"
                  dir="ltr"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(sanitizeExamineeCode(e.target.value));
                    setErrorMsg('');
                  }}
                  placeholder="MNU-2026-XXXXXX"
                  maxLength={24}
                  required
                  className="calm-input w-full ps-10 pe-4 py-3 font-mono-num text-sm tracking-wide"
                />
              </div>
              {cleanCode.length >= 4 && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="calm-btn-outline inline-flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold cursor-pointer shrink-0 min-h-[46px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#587564]" />
                      <span>{t.copiedCode}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#78847B]" />
                      <span>{t.copyCode}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-[#78847B]">{t.codeHint}</p>

            {isCheckingCode && (
              <p className="text-xs text-[#5F6D64]">
                {language === 'ar' ? 'جارٍ التحقق من الكود...' : 'Checking code...'}
              </p>
            )}
            {!isCheckingCode && codeStatus === 'invalid' && (
              <p className="text-xs text-[#9E2A3B]">
                {language === 'ar'
                  ? 'يجب أن يتكون الكود من 4 إلى 24 حرفًا أو رقمًا باللغة الإنجليزية (أو - و _).'
                  : 'Code must be 4–24 alphanumeric characters (A-Z, 0-9, -, _).'}
              </p>
            )}
            {!isCheckingCode && codeStatus === 'new' && (
              <div className="bg-[#E7EFE8] border border-[#8FAE98] rounded-xl p-3.5 text-xs text-[#34443A]">
                {t.newCodeNotice}
              </div>
            )}
            {!isCheckingCode && codeStatus === 'existing' && (
              <div className="bg-[#FAF8F3] border border-[#8FAE98] rounded-xl p-3.5 text-xs text-[#34443A]">
                {t.existingCodeNotice}
              </div>
            )}
          </div>

          {/* Field 2: Examinee Name (Optional plain text) */}
          <div className="space-y-1.5">
            <label htmlFor="examinee-name" className="text-sm font-semibold text-[#34443A] flex items-center gap-2">
              <span>{t.nameLabel}</span>
              <span className="text-xs font-normal text-[#78847B]">({t.nameOptionalTag})</span>
            </label>
            <input
              id="examinee-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={120}
              placeholder={language === 'ar' ? 'اكتب الاسم إذا رغبت (اختياري)' : 'Enter name if desired (optional)'}
              className="calm-input w-full px-4 py-3 text-sm"
            />
          </div>

          {/* Field 3: Age (Mandatory) */}
          <div className="space-y-1.5">
            <label htmlFor="examinee-age" className="text-sm font-semibold text-[#34443A]">
              {t.ageLabel} <span className="text-[#9E2A3B]">*</span>
            </label>
            <input
              id="examinee-age"
              type="number"
              inputMode="numeric"
              min={10}
              max={110}
              value={ageInput}
              onChange={(e) => {
                setAgeInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder={language === 'ar' ? 'أدخل العمر بالسنوات (مثال: 21)' : 'Enter age in years (e.g. 21)'}
              required
              className="calm-input w-full px-4 py-3 text-sm font-mono-num"
            />
            {ageInput.trim() !== '' && !isAgeValid && (
              <p className="text-xs text-[#9E2A3B]">
                {language === 'ar'
                  ? 'يرجى إدخال عمر صحيح (رقم صحيح بين 10 و 110).'
                  : 'Please enter a valid integer age between 10 and 110.'}
              </p>
            )}
          </div>

          {/* Field 4: Automatic Application Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#34443A]">{t.dateLabel}</label>
            <div className="calm-surface flex items-center gap-2.5 px-4 py-3 text-sm text-[#34443A]">
              <Calendar className="w-4 h-4 text-[#587564] shrink-0" />
              <span className="tabular-nums">{formattedDate}</span>
            </div>
          </div>

          {/* Privacy Policy & Consent */}
          <div className="calm-surface p-4 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-[#5F6D64] leading-relaxed">
              <Shield className="w-4 h-4 text-[#587564] shrink-0 mt-0.5" />
              <p>{t.privacyPolicySummary}</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => {
                  setConsentChecked(e.target.checked);
                  setErrorMsg('');
                }}
                className="mt-1 w-4 h-4 accent-[#587564] rounded cursor-pointer shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium text-[#34443A]">
                {t.privacyConsentLabel}
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-[#FDF4F5] border border-[#EAC8CD] text-[#9E2A3B] rounded-xl p-3 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="calm-btn-outline px-5 py-3 text-sm font-semibold text-[#5F6D64] cursor-pointer"
            >
              {t.backToHome}
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="calm-btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <span>{t.startScaleBtn}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
