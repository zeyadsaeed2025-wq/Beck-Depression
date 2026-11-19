import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Info,
  Loader2,
  Pause,
  Play,
  Search,
  ShieldAlert,
  Square,
  Star,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_TERMS,
  type GlossaryCategory,
  type GlossaryTerm,
} from '../data/glossaryTerms';
import {
  glossaryAudio,
  type GlossaryAudioSegment,
  type GlossaryAudioState,
} from '../services/glossaryAudio';
import {
  loadFavoriteTermIds,
  toggleFavoriteTermId,
} from '../services/glossaryFavorites';
import type { Language } from '../types/platform';

interface GlossaryViewProps {
  language: Language;
  isDuringTest?: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'favorites' | GlossaryCategory;

export function GlossaryView({
  language,
  isDuringTest = false,
  onClose,
}: GlossaryViewProps) {
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadFavoriteTermIds());
  const [audioState, setAudioState] = useState<GlossaryAudioState>(() =>
    glossaryAudio.getState()
  );

  // Subscribe to isolated audio controller
  useEffect(() => {
    return glossaryAudio.subscribe(setAudioState);
  }, []);

  // Automatically bind audio dialect/language to active UI language without reload
  useEffect(() => {
    glossaryAudio.syncLanguage(language);
  }, [language]);

  // Stop active playback when leaving the glossary
  useEffect(() => {
    return () => {
      glossaryAudio.stop();
    };
  }, []);

  // Close detail modal on Escape
  useEffect(() => {
    if (!selectedTermId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTermId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTermId]);

  const termMap = useMemo(() => {
    const map = new Map<string, GlossaryTerm>();
    GLOSSARY_TERMS.forEach((t) => map.set(t.id, t));
    return map;
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((term) => {
      if (activeTab === 'favorites' && !favoriteSet.has(term.id)) {
        return false;
      }
      if (
        activeTab !== 'all' &&
        activeTab !== 'favorites' &&
        term.category !== activeTab
      ) {
        return false;
      }
      if (!q) return true;
      return (
        term.termAr.toLowerCase().includes(q) ||
        term.termEn.toLowerCase().includes(q) ||
        term.simpleAr.toLowerCase().includes(q) ||
        term.simpleEn.toLowerCase().includes(q) ||
        term.scientificAr.toLowerCase().includes(q) ||
        term.scientificEn.toLowerCase().includes(q)
      );
    });
  }, [activeTab, favoriteSet, searchQuery]);

  const selectedTerm = selectedTermId ? termMap.get(selectedTermId) || null : null;

  const handleToggleFavorite = (termId: string) => {
    setFavoriteIds((prev) => toggleFavoriteTermId(prev, termId));
  };

  const handleAudioAction = (term: GlossaryTerm, segment: GlossaryAudioSegment) => {
    const isSameClip =
      audioState.termId === term.id &&
      audioState.segment === segment &&
      audioState.language === language;

    if (isSameClip && audioState.status === 'playing') {
      glossaryAudio.pause();
      return;
    }
    if (isSameClip && audioState.status === 'paused') {
      void glossaryAudio.resume();
      return;
    }

    const textToSpeak =
      language === 'ar'
        ? segment === 'term'
          ? term.spokenArTerm
          : term.spokenArExplanation
        : segment === 'term'
          ? term.spokenEnTerm
          : term.spokenEnExplanation;

    void glossaryAudio.play(term.id, segment, language, textToSpeak);
  };

  const renderAudioSegmentButton = (
    term: GlossaryTerm,
    segment: GlossaryAudioSegment,
    compact = false
  ) => {
    const isThis =
      audioState.termId === term.id &&
      audioState.segment === segment &&
      audioState.language === language;
    const isLoading = isThis && audioState.status === 'loading';
    const isPlaying = isThis && audioState.status === 'playing';
    const isPaused = isThis && audioState.status === 'paused';

    const label =
      segment === 'term'
        ? isAr
          ? isPlaying
            ? 'إيقاف مؤقت'
            : isPaused
              ? 'استئناف النطق'
              : 'نطق المصطلح'
          : isPlaying
            ? 'Pause'
            : isPaused
              ? 'Resume'
              : 'Pronounce Term'
        : isAr
          ? isPlaying
            ? 'إيقاف مؤقت'
            : isPaused
              ? 'استئناف الشرح'
              : 'سماع الشرح بالعامية المصرية'
          : isPlaying
            ? 'Pause'
            : isPaused
              ? 'Resume Explanation'
              : 'Listen to Explanation';

    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleAudioAction(term, segment)}
          disabled={isLoading}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-70 ${
            compact ? 'px-3 py-2 text-xs min-h-[38px]' : 'px-4 py-2.5 text-xs sm:text-sm min-h-[42px]'
          } ${
            isPlaying || isPaused
              ? 'bg-[#587564] text-white'
              : 'bg-[#E7EFE8] hover:bg-[#DAE6DC] text-[#34443A] border border-[#C6D9C9]'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 shrink-0" />
          ) : (
            <Play className="w-4 h-4 shrink-0" />
          )}
          <span>
            {isLoading
              ? isAr
                ? 'جارٍ التحميل...'
                : 'Loading...'
              : label}
          </span>
        </button>

        {(isPlaying || isPaused || isLoading) && (
          <button
            type="button"
            onClick={() => glossaryAudio.stop()}
            aria-label={isAr ? 'إيقاف الصوت' : 'Stop audio'}
            title={isAr ? 'إيقاف الصوت' : 'Stop audio'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#EAC8CD] bg-[#FDF4F5] text-[#9E2A3B] hover:bg-[#F9E6E9] transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>
    );
  };

  const activeTermForBar = audioState.termId ? termMap.get(audioState.termId) : null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-6">
      {/* Top Bar & Title Card */}
      <section className="calm-card p-5 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#587564]">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>
                {isAr
                  ? 'مرجع معرفي مستخرج من قائمة بيك للاكتئاب (BDI)'
                  : 'Educational Reference Extracted from the Beck Depression Inventory (BDI)'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#34443A]">
              {isAr
                ? 'قاموس المصطلحات النفسية'
                : 'Psychology Glossary'}
            </h1>
            <p className="text-sm text-[#5F6D64] leading-relaxed">
              {isAr
                ? 'دليل مبسط وموثق لشرح المفاهيم والأعراض الواردة في قائمة بيك للاكتئاب، مع نطق صوتي بالعامية المصرية الطبيعية أو الإنجليزية حسب لغة الموقع.'
                : 'A calm, academic guide explaining the terms and symptoms used in the Beck Depression Inventory, with clear audio pronunciation in English or Egyptian Arabic based on your active language.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              glossaryAudio.stop();
              onClose();
            }}
            className="calm-btn-outline inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#34443A] cursor-pointer shrink-0 min-h-[42px]"
          >
            <BackArrow className="w-4 h-4 text-[#587564]" />
            <span>
              {isDuringTest
                ? isAr
                  ? 'العودة لاستكمال الاختبار'
                  : 'Return to Assessment'
                : isAr
                  ? 'العودة'
                  : 'Back'}
            </span>
          </button>
        </div>

        {/* Preserved Test Progress Reassurance Banner */}
        {isDuringTest && (
          <div className="flex items-start gap-2.5 rounded-xl bg-[#E7EFE8] border border-[#C6D9C9] px-4 py-3 text-xs sm:text-sm text-[#34443A]">
            <Info className="w-4 h-4 text-[#587564] shrink-0 mt-0.5" />
            <span>
              {isAr
                ? 'تقدمك وإجاباتك الحالية في الاختبار محفوظة بالكامل ولن تتأثر أثناء تصفح القاموس؛ عند الضغط على "العودة لاستكمال الاختبار" ستستأنف من نفس البند مباشرة.'
                : 'Your current assessment answers and item position are safely preserved while browsing the glossary. Returning resumes at your exact question.'}
            </span>
          </div>
        )}

        {/* Non-Diagnostic Guardrail Notice */}
        <div className="flex items-start gap-2.5 rounded-xl bg-[#FAF8F3] border border-[#E4E9E3] px-4 py-3 text-xs text-[#5F6D64] leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-[#587564] shrink-0 mt-0.5" />
          <span>
            {isAr
              ? 'تنبيه معرفي غير تشخيصي: هذا القاموس لأغراض التثقيف والفهم العام فقط ولا يُعد أداة تشخيص. مجرد القراءة عن أي عَرَض أو إضافته للمفضلة لا يعني وجود اضطراب نفسي، وتُحفظ المفضلة على جهازك فقط دون ربطها بأي نتائج اختبار.'
              : 'Non-diagnostic educational notice: This glossary is strictly for general understanding and does not diagnose any condition. Saving or reading about any symptom never implies a disorder; favorites stay locally on your device and are never linked to test scores.'}
          </span>
        </div>
      </section>

      {/* Active Audio Status & Error Bar */}
      {(audioState.status !== 'idle' || audioState.errorMessage) && (
        <section
          aria-live="polite"
          className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
            audioState.status === 'error'
              ? 'bg-[#FDF4F5] border-[#EAC8CD] text-[#9E2A3B]'
              : 'bg-[#FFFFFF] border-[#8FAE98] text-[#34443A]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm">
            <Volume2
              className={`w-5 h-5 shrink-0 ${
                audioState.status === 'error' ? 'text-[#9E2A3B]' : 'text-[#587564]'
              }`}
            />
            <div>
              {audioState.status === 'error' ? (
                <p className="font-semibold">{audioState.errorMessage}</p>
              ) : (
                <>
                  <p className="font-bold">
                    {activeTermForBar
                      ? isAr
                        ? activeTermForBar.termAr
                        : activeTermForBar.termEn
                      : ''}
                    {' · '}
                    {audioState.segment === 'term'
                      ? isAr
                        ? 'نطق المصطلح'
                        : 'Term Pronunciation'
                      : isAr
                        ? 'شرح المصطلح'
                        : 'Term Explanation'}
                  </p>
                  <p className="text-xs text-[#5F6D64]">
                    {audioState.status === 'loading'
                      ? isAr
                        ? 'جارٍ تجهيز الصوت بالعامية المصرية...'
                        : 'Preparing English audio...'
                      : audioState.status === 'playing'
                        ? isAr
                          ? 'يتم التشغيل الآن (اللهجة المصرية – ar-EG)'
                          : 'Playing now (English – en-US)'
                        : isAr
                          ? 'متوقف مؤقتًا (اللهجة المصرية – ar-EG)'
                          : 'Paused (English – en-US)'}
                  </p>
                </>
              )}
            </div>
          </div>

          {audioState.status !== 'error' && (
            <div className="flex items-center gap-2">
              {audioState.status === 'playing' && (
                <button
                  type="button"
                  onClick={() => glossaryAudio.pause()}
                  className="calm-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إيقاف مؤقت' : 'Pause'}</span>
                </button>
              )}
              {audioState.status === 'paused' && (
                <button
                  type="button"
                  onClick={() => void glossaryAudio.resume()}
                  className="calm-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isAr ? 'استئناف' : 'Resume'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => glossaryAudio.stop()}
                className="calm-btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{isAr ? 'إيقاف' : 'Stop'}</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Search & Category Filter Controls */}
      <section className="calm-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 text-[#78847B] absolute top-1/2 -translate-y-1/2 ${
                isAr ? 'right-3.5' : 'left-3.5'
              }`}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث عن مصطلح بالعربية أو الإنجليزية (مثل: التشاؤم، الأرق، Anhedonia)...'
                  : 'Search terms in English or Arabic (e.g., Insomnia, Pessimism, الاكتئاب)...'
              }
              className={`calm-input w-full py-2.5 text-sm ${
                isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>

          <div className="text-xs font-medium text-[#5F6D64] shrink-0 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#587564]" />
            <span>
              {isAr
                ? 'لغة النطق المفعلة: العامية المصرية (ar-EG)'
                : 'Active audio voice: English (en-US)'}
            </span>
          </div>
        </div>

        {/* Category Tabs + Favorites Tab */}
        <div className="flex flex-wrap gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#587564] text-white'
                : 'bg-[#FAF8F3] text-[#34443A] border border-[#E4E9E3] hover:bg-[#E7EFE8]'
            }`}
          >
            {isAr
              ? `جميع المصطلحات (${GLOSSARY_TERMS.length})`
              : `All Terms (${GLOSSARY_TERMS.length})`}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#587564] text-white'
                : 'bg-[#FAF8F3] text-[#34443A] border border-[#E4E9E3] hover:bg-[#E7EFE8]'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                activeTab === 'favorites'
                  ? 'fill-white text-white'
                  : 'text-[#B47B2B] fill-[#B47B2B]'
              }`}
            />
            <span>
              {isAr
                ? `مصطلحاتي المفضلة (${favoriteIds.length})`
                : `My Favorite Terms (${favoriteIds.length})`}
            </span>
          </button>

          {GLOSSARY_CATEGORIES.map((cat) => {
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#587564] text-white'
                    : 'bg-[#FAF8F3] text-[#34443A] border border-[#E4E9E3] hover:bg-[#E7EFE8]'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </section>

      {/* Empty States or Terms Grid */}
      {filteredTerms.length === 0 ? (
        <section className="calm-card p-8 text-center space-y-3">
          <p className="text-base font-bold text-[#34443A]">
            {activeTab === 'favorites' && favoriteIds.length === 0
              ? isAr
                ? 'لم تقم بحفظ أي مصطلحات في المفضلة بعد.'
                : 'You have not saved any favorite terms yet.'
              : isAr
                ? 'لم يتم العثور على مصطلحات مطابقة لبحثك.'
                : 'No glossary terms matched your search.'}
          </p>
          <p className="text-sm text-[#5F6D64]">
            {activeTab === 'favorites' && favoriteIds.length === 0
              ? isAr
                ? 'اضغط على أيقونة النجمة بجانب أي مصطلح لإضافته إلى "مصطلحاتي المفضلة" للرجوع إليه بسهولة.'
                : 'Click the star button on any term card to add it to My Favorite Terms for quick access.'
              : isAr
                ? 'جرّب البحث بكلمة أخرى أو اختر "جميع المصطلحات".'
                : 'Try another search keyword or switch back to All Terms.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="calm-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            {isAr ? 'عرض جميع المصطلحات' : 'Show All Terms'}
          </button>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((term) => {
            const isFav = favoriteSet.has(term.id);
            const categoryMeta = GLOSSARY_CATEGORIES.find((c) => c.id === term.category);
            return (
              <article
                key={term.id}
                className="calm-card p-5 flex flex-col justify-between gap-4 hover:border-[#8FAE98] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-[#587564]">
                        {isAr ? categoryMeta?.labelAr : categoryMeta?.labelEn} ·{' '}
                        {isAr ? term.pdfReference.ar : term.pdfReference.en}
                      </p>
                      <h2 className="text-lg font-bold text-[#34443A] leading-snug">
                        {isAr ? term.termAr : term.termEn}
                      </h2>
                      <p className="text-xs font-medium text-[#78847B]">
                        {isAr ? term.termEn : term.termAr}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(term.id)}
                      aria-pressed={isFav}
                      aria-label={
                        isFav
                          ? isAr
                            ? 'إزالة من مصطلحاتي المفضلة'
                            : 'Remove from favorites'
                          : isAr
                            ? 'إضافة إلى مصطلحاتي المفضلة'
                            : 'Add to favorites'
                      }
                      title={
                        isFav
                          ? isAr
                            ? 'إزالة من المفضلة'
                            : 'Remove from favorites'
                          : isAr
                            ? 'حفظ في المفضلة'
                            : 'Save to favorites'
                      }
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                        isFav
                          ? 'bg-[#FBF6EC] border-[#E8D6B3] text-[#B47B2B]'
                          : 'bg-[#FAF8F3] border-[#E4E9E3] text-[#78847B] hover:border-[#8FAE98]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-sm text-[#5F6D64] leading-relaxed">
                    {isAr ? term.simpleAr : term.simpleEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E4E9E3] flex flex-wrap items-center justify-between gap-2">
                  {renderAudioSegmentButton(term, 'term', true)}

                  <button
                    type="button"
                    onClick={() => setSelectedTermId(term.id)}
                    className="calm-btn-outline px-3.5 py-2 text-xs font-semibold text-[#587564] cursor-pointer min-h-[38px]"
                  >
                    {isAr ? 'التفاصيل والاستماع للشرح' : 'Details & Audio'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Term Detail Modal */}
      {selectedTerm && (
        <div
          className="fixed inset-0 z-50 bg-[#34443A]/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="glossary-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTermId(null);
            }
          }}
        >
          <div className="calm-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-5 bg-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E4E9E3] pb-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#587564]">
                  {isAr ? selectedTerm.pdfReference.ar : selectedTerm.pdfReference.en}
                </p>
                <h2
                  id="glossary-detail-title"
                  className="text-xl sm:text-2xl font-bold text-[#34443A]"
                >
                  {isAr ? selectedTerm.termAr : selectedTerm.termEn}
                </h2>
                <p className="text-sm font-medium text-[#78847B]">
                  {isAr ? selectedTerm.termEn : selectedTerm.termAr}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(selectedTerm.id)}
                  aria-pressed={favoriteSet.has(selectedTerm.id)}
                  aria-label={
                    isAr ? 'حفظ في مصطلحاتي المفضلة' : 'Save to favorites'
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    favoriteSet.has(selectedTerm.id)
                      ? 'bg-[#FBF6EC] border-[#E8D6B3] text-[#B47B2B]'
                      : 'bg-[#FAF8F3] border-[#E4E9E3] text-[#5F6D64] hover:border-[#8FAE98]'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      favoriteSet.has(selectedTerm.id) ? 'fill-current' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {favoriteSet.has(selectedTerm.id)
                      ? isAr
                        ? 'في المفضلة'
                        : 'Saved'
                      : isAr
                        ? 'حفظ'
                        : 'Save'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTermId(null)}
                  aria-label={isAr ? 'إغلاق نافذة المصطلح' : 'Close term details'}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E4E9E3] bg-[#FAF8F3] text-[#34443A] hover:bg-[#E7EFE8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dedicated Audio Controls Box */}
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#E4E9E3] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#587564]">
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isAr
                      ? 'الاستماع الصوتي (بالعامية المصرية الطبيعية)'
                      : 'Audio Pronunciation & Explanation (English)'}
                  </span>
                </div>
                <span className="text-[11px] font-mono-num text-[#78847B]">
                  {isAr ? 'ar-EG' : 'en-US'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {renderAudioSegmentButton(selectedTerm, 'term')}
                {renderAudioSegmentButton(selectedTerm, 'explanation')}
              </div>

              {audioState.status === 'error' && audioState.errorMessage && (
                <p className="text-xs font-semibold text-[#9E2A3B]">
                  {audioState.errorMessage}
                </p>
              )}
            </div>

            {/* Simple Explanation */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#587564]">
                {isAr ? 'الشرح المبسط لغير المتخصص' : 'Plain-Language Explanation'}
              </h3>
              <p className="text-sm sm:text-base text-[#34443A] leading-relaxed">
                {isAr ? selectedTerm.simpleAr : selectedTerm.simpleEn}
              </p>
            </div>

            {/* Scientific Definition */}
            <div className="calm-surface p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-[#587564]">
                {isAr ? 'التعريف العلمي الدقيق' : 'Scientific Definition'}
              </h3>
              <p className="text-sm text-[#34443A] leading-relaxed">
                {isAr ? selectedTerm.scientificAr : selectedTerm.scientificEn}
              </p>
            </div>

            {/* Illustrative Example */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#587564]">
                {isAr ? 'مثال توضيحي يومي (غير تشخيصي)' : 'Everyday Non-Diagnostic Example'}
              </h3>
              <p className="text-sm text-[#5F6D64] leading-relaxed">
                {isAr ? selectedTerm.exampleAr : selectedTerm.exampleEn}
              </p>
            </div>

            {/* Related Terms */}
            {selectedTerm.relatedIds.length > 0 && (
              <div className="space-y-2 pt-1">
                <h3 className="text-sm font-bold text-[#587564]">
                  {isAr ? 'مصطلحات ذات صلة' : 'Related Terms'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.relatedIds.map((relId) => {
                    const rel = termMap.get(relId);
                    if (!rel) return null;
                    return (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => setSelectedTermId(rel.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#E7EFE8] hover:bg-[#DAE6DC] border border-[#C6D9C9] text-xs font-semibold text-[#34443A] transition-colors cursor-pointer"
                      >
                        {isAr ? rel.termAr : rel.termEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Credible Academic Reference */}
            <div className="pt-3 border-t border-[#E4E9E3] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-[#5F6D64]">
                <span className="font-bold text-[#34443A]">
                  {isAr ? 'المرجع العلمي: ' : 'Academic Reference: '}
                </span>
                <span>
                  {isAr ? selectedTerm.source.nameAr : selectedTerm.source.nameEn}
                </span>
              </div>
              <a
                href={selectedTerm.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#587564] hover:underline"
              >
                <span>{isAr ? 'فتح المصدر المرجعي' : 'Open Reference'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
