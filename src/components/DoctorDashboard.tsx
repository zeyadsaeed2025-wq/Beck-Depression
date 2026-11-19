import { signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BDI_ITEMS } from '../data/bdiTest';
import { UI_TEXT } from '../data/i18n';
import { auth, googleProvider } from '../lib/firebase';
import {
  deleteExamineeWithAudit,
  deleteSessionWithAudit,
  fetchAllCustomTests,
  fetchAllExaminees,
  fetchAllSessions,
  fetchAuditLogs,
  recordAuditLog,
  savePublicPlatformSettings,
} from '../services/firestoreService';
import type {
  AssessmentSessionRecord,
  AuditLogRecord,
  CustomTest,
  ExamineeRecord,
  Language,
  PlatformSetting,
} from '../types/platform';
import { CustomTestBuilder } from './CustomTestBuilder';
import { ReportView } from './ReportView';

interface DoctorDashboardProps {
  language: Language;
  user: User | null;
  authReady: boolean;
  platformSettings: PlatformSetting | null;
  onRefreshPublicData: () => Promise<void>;
}

type DashboardTab = 'overview' | 'archive' | 'analytics' | 'builder' | 'settings';

function parseTimestampMs(val: unknown): number {
  if (val instanceof Date) return val.getTime();
  if (
    val &&
    typeof val === 'object' &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate().getTime();
  }
  if (typeof val === 'string' || typeof val === 'number') {
    return new Date(val).getTime();
  }
  return 0;
}

function formatDateShort(val: unknown, lang: Language): string {
  const ms = parseTimestampMs(val);
  if (!ms) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms));
}

export function DoctorDashboard({
  language,
  user,
  authReady,
  platformSettings,
  onRefreshPublicData,
}: DoctorDashboardProps) {
  const t = UI_TEXT[language];
  const isAr = language === 'ar';

  const [tab, setTab] = useState<DashboardTab>('overview');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [examinees, setExaminees] = useState<ExamineeRecord[]>([]);
  const [sessions, setSessions] = useState<AssessmentSessionRecord[]>([]);
  const [customTests, setCustomTests] = useState<CustomTest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'needsReview' | 'reviewed'>('all');
  const [selectedExamineeCode, setSelectedExamineeCode] = useState<string | null>(null);
  const [activeReportSession, setActiveReportSession] = useState<AssessmentSessionRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'session'; session: AssessmentSessionRecord }
    | { type: 'examinee'; examinee: ExamineeRecord; sessionCount: number }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  // Settings state
  const [subtitleAr, setSubtitleAr] = useState(platformSettings?.platformSubtitleAr || '');
  const [subtitleEn, setSubtitleEn] = useState(platformSettings?.platformSubtitleEn || '');
  const [showCopyright, setShowCopyright] = useState(
    platformSettings ? platformSettings.showCopyrightNotice : true
  );
  const [coverAccent, setCoverAccent] = useState(platformSettings?.bdiCoverAccent || '#587564');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    if (platformSettings) {
      setSubtitleAr(platformSettings.platformSubtitleAr || '');
      setSubtitleEn(platformSettings.platformSubtitleEn || '');
      setShowCopyright(platformSettings.showCopyrightNotice);
      setCoverAccent(platformSettings.bdiCoverAccent || '#587564');
    }
  }, [platformSettings]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    setLoadError('');
    try {
      const [exList, sessList, testsList, logsList] = await Promise.all([
        fetchAllExaminees(),
        fetchAllSessions(),
        fetchAllCustomTests(),
        fetchAuditLogs(),
      ]);
      setExaminees(exList);
      setSessions(sessList);
      setCustomTests(testsList);
      setAuditLogs(logsList);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load dashboard data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (authReady && user) {
      loadDashboardData();
    }
  }, [authReady, user?.uid]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setAuthError('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await recordAuditLog(
          'DOCTOR_SIGN_IN',
          'auth',
          cred.user.uid,
          `Doctor portal accessed by ${cred.user.email || 'Google user'}`
        );
      }
    } catch (e) {
      setAuthError(
        e instanceof Error
          ? e.message
          : isAr
            ? 'تعذر إتمام تسجيل الدخول بحساب Google.'
            : 'Google Sign-In failed.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setActiveReportSession(null);
    setSelectedExamineeCode(null);
  };

  const kpis = useMemo(() => {
    const completedCount = sessions.length;
    const needsReviewCount = sessions.filter((s) => s.needsReview && s.status !== 'reviewed').length;
    const reviewedCount = sessions.filter((s) => s.status === 'reviewed').length;
    return {
      totalExaminees: examinees.length,
      totalSessions: sessions.length,
      completedCount,
      needsReviewCount,
      reviewedCount,
      customTestsCount: customTests.length,
    };
  }, [examinees, sessions, customTests]);

  const bdiDistribution = useMemo(() => {
    const counts = { minimal: 0, mild: 0, moderate: 0, severe: 0 };
    for (const s of sessions) {
      if (s.isBdi && s.classificationLevel in counts) {
        counts[s.classificationLevel as keyof typeof counts] += 1;
      }
    }
    return counts;
  }, [sessions]);

  const bdiItemMeans = useMemo(() => {
    const bdiSessions = sessions.filter((s) => s.isBdi && s.answers.length === BDI_ITEMS.length);
    if (bdiSessions.length === 0) return [];
    return BDI_ITEMS.map((item, idx) => {
      const total = bdiSessions.reduce((acc, s) => acc + (s.answers[idx] || 0), 0);
      return {
        number: item.number,
        name: item.symptomName,
        mean: Number((total / bdiSessions.length).toFixed(2)),
      };
    });
  }, [sessions]);

  const filteredExaminees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return examinees.filter((ex) => {
      const exSessions = sessions.filter((s) => s.examineeCode === ex.code);
      if (reviewFilter === 'needsReview' && !exSessions.some((s) => s.needsReview)) {
        return false;
      }
      if (reviewFilter === 'reviewed' && !exSessions.some((s) => s.status === 'reviewed')) {
        return false;
      }
      if (!q) return true;
      return (
        ex.code.toLowerCase().includes(q) ||
        (ex.name && ex.name.toLowerCase().includes(q))
      );
    });
  }, [examinees, sessions, searchQuery, reviewFilter]);

  const selectedExaminee = useMemo(
    () => examinees.find((e) => e.code === selectedExamineeCode) || null,
    [examinees, selectedExamineeCode]
  );

  const selectedExamineeSessions = useMemo(() => {
    if (!selectedExamineeCode) return [];
    return sessions
      .filter((s) => s.examineeCode === selectedExamineeCode)
      .sort((a, b) => parseTimestampMs(a.createdAt) - parseTimestampMs(b.createdAt));
  }, [sessions, selectedExamineeCode]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'session') {
        await deleteSessionWithAudit(
          deleteTarget.session.id,
          deleteTarget.session.examineeCode
        );
        if (activeReportSession?.id === deleteTarget.session.id) {
          setActiveReportSession(null);
        }
      } else {
        const assocIds = sessions
          .filter((s) => s.examineeCode === deleteTarget.examinee.code)
          .map((s) => s.id);
        await deleteExamineeWithAudit(deleteTarget.examinee.code, assocIds);
        if (selectedExamineeCode === deleteTarget.examinee.code) {
          setSelectedExamineeCode(null);
        }
      }
      setDeleteTarget(null);
      await loadDashboardData();
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      await savePublicPlatformSettings({
        platformSubtitleAr: subtitleAr,
        platformSubtitleEn: subtitleEn,
        showCopyrightNotice: showCopyright,
        bdiCoverAccent: coverAccent,
      });
      await onRefreshPublicData();
      await loadDashboardData();
      setSettingsMsg(isAr ? 'تم حفظ إعدادات الغلاف بنجاح.' : 'Cover settings saved.');
    } catch (err) {
      setSettingsMsg(err instanceof Error ? err.message : 'Error saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Auth loading gate
  if (!authReady) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center text-sm text-[#5F6D64]">
        {isAr ? 'جارٍ التحقق من حالة الجلسة...' : 'Checking authentication state...'}
      </main>
    );
  }

  // Unauthenticated Doctor Login Gate
  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        <section className="calm-card p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#587564]">{t.doctorLoginTitle}</h1>
            <p className="text-sm text-[#5F6D64] leading-relaxed">{t.doctorLoginDesc}</p>
          </div>

          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleSignIn}
            className="calm-btn-primary w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 font-bold text-sm sm:text-base cursor-pointer disabled:opacity-60"
          >
            <span>{signingIn ? '...' : t.doctorSignInGoogle}</span>
          </button>

          {authError && (
            <div className="bg-[#FDF4F5] border border-[#EAC8CD] text-[#9E2A3B] rounded-xl p-3 text-xs">
              {authError}
            </div>
          )}

          {/* Mandatory Security & Privacy Advisory per Section 11.1 */}
          <div className="text-start bg-[#FBF6EC] border border-[#E8D6B3] rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B47B2B] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-[#6E4E1E] leading-relaxed">
              <div className="font-bold">{t.doctorPrivacyWarningTitle}</div>
              <p>{t.doctorPrivacyWarningBody}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Report Detail View inside Doctor Dashboard
  if (activeReportSession) {
    const relatedTest = customTests.find((c) => c.id === activeReportSession.testId) || null;
    return (
      <ReportView
        session={activeReportSession}
        customTest={relatedTest}
        language={language}
        viewerRole="doctor"
        onBack={() => setActiveReportSession(null)}
        onSessionUpdated={(updated) => {
          setActiveReportSession(updated);
          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }}
      />
    );
  }

  const maxBandCount = Math.max(
    1,
    bdiDistribution.minimal,
    bdiDistribution.mild,
    bdiDistribution.moderate,
    bdiDistribution.severe
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Doctor Strip & Privacy Reminder */}
      <div className="calm-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-bold text-[#587564]">{t.navDoctorPortal}</h1>
          <p className="text-xs text-[#5F6D64] flex flex-wrap items-center gap-2">
            <span>{user.displayName || user.email}</span>
            <span aria-hidden="true">·</span>
            <span dir="ltr" className="font-mono-num text-[#78847B]">
              {user.email}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            className="calm-btn-outline px-3.5 py-2 text-xs font-semibold cursor-pointer"
          >
            {isAr ? 'تحديث البيانات' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAC8CD] bg-white text-xs font-semibold text-[#9E2A3B] hover:bg-[#FDF4F5] transition-colors cursor-pointer min-h-[38px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>

      {/* Privacy Governance Banner */}
      <div className="bg-[#FBF6EC] border border-[#E8D6B3] rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-[#6E4E1E]">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#B47B2B]" />
        <p>{t.doctorPrivacyWarningBody}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FAF8F3] border border-[#E4E9E3] rounded-2xl">
        {(
          [
            { id: 'overview', icon: LayoutDashboard, label: isAr ? 'الإحصائيات العامة' : 'Overview' },
            { id: 'archive', icon: Users, label: isAr ? 'أرشيف المفحوصين والجلسات' : 'Examinees & Sessions' },
            { id: 'analytics', icon: BarChart3, label: isAr ? 'التقارير والتحليلات' : 'Analytics' },
            { id: 'builder', icon: ClipboardList, label: isAr ? 'منشئ الاختبارات' : 'Test Builder' },
            { id: 'settings', icon: Settings, label: isAr ? 'الإعدادات والتدقيق' : 'Settings & Audit' },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                active
                  ? 'bg-[#E7EFE8] border border-[#8FAE98] text-[#34443A] shadow-xs'
                  : 'border border-transparent text-[#5F6D64] hover:text-[#34443A] hover:bg-white/70'
              }`}
            >
              <Icon className="w-4 h-4 text-[#587564]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {loadError && (
        <div className="bg-[#FDF4F5] border border-[#EAC8CD] text-[#9E2A3B] rounded-xl p-4 text-sm">
          {loadError}
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: isAr ? 'إجمالي المفحوصين' : 'Total Examinees', val: kpis.totalExaminees },
              { label: isAr ? 'إجمالي الجلسات' : 'Total Sessions', val: kpis.totalSessions },
              { label: isAr ? 'الاختبارات المكتملة' : 'Completed', val: kpis.completedCount },
              {
                label: isAr ? 'تحتاج مراجعة' : 'Needs Review',
                val: kpis.needsReviewCount,
                highlight: kpis.needsReviewCount > 0,
              },
              { label: isAr ? 'الاختبارات المنشأة' : 'Custom Tests', val: kpis.customTestsCount },
            ].map((card, i) => (
              <div
                key={i}
                className={`border rounded-2xl p-5 space-y-1 shadow-[0_2px_12px_rgba(52,68,58,0.03)] ${
                  card.highlight
                    ? 'border-[#EAC8CD] bg-[#FDF4F5]'
                    : 'border-[#E4E9E3] bg-white'
                }`}
              >
                <div className="text-xs text-[#5F6D64]">{card.label}</div>
                <div
                  className={`text-2xl sm:text-3xl font-bold font-mono-num ${
                    card.highlight ? 'text-[#9E2A3B]' : 'text-[#587564]'
                  }`}
                >
                  {loadingData ? '—' : card.val}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BDI Distribution Chart */}
            <section className="calm-card p-6 space-y-4">
              <h2 className="text-base font-bold text-[#587564]">
                {isAr
                  ? 'توزيع تصنيفات قائمة بيك للاكتئاب (بيانات فعلية)'
                  : 'BDI Classification Distribution (Live Data)'}
              </h2>
              <div className="space-y-3.5">
                {[
                  {
                    label: isAr ? 'المدى الأقل (٠ – ٩)' : 'Minimal Range (0–9)',
                    count: bdiDistribution.minimal,
                    color: '#587564',
                  },
                  {
                    label: isAr ? 'اكتئاب معتدل (١٠ – ١٦)' : 'Mild Depression (10–16)',
                    count: bdiDistribution.mild,
                    color: '#8FAE98',
                  },
                  {
                    label: isAr ? 'اكتئاب متوسط (١٧ – ٢٩)' : 'Moderate Depression (17–29)',
                    count: bdiDistribution.moderate,
                    color: '#C18A3B',
                  },
                  {
                    label: isAr ? 'اكتئاب شديد (٣٠ – ٦٣)' : 'Severe Depression (30–63)',
                    count: bdiDistribution.severe,
                    color: '#9E2A3B',
                  },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#34443A]">{bar.label}</span>
                      <span className="font-mono-num font-bold text-[#587564]">{bar.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAF8F3] border border-[#E4E9E3] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round((bar.count / maxBandCount) * 100)}%`,
                          backgroundColor: bar.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Sessions */}
            <section className="calm-card p-6 space-y-4">
              <h2 className="text-base font-bold text-[#587564]">
                {isAr ? 'أحدث الجلسات المسجلة' : 'Recent Assessment Sessions'}
              </h2>
              {sessions.length === 0 ? (
                <p className="text-sm text-[#5F6D64] py-6 text-center">
                  {isAr ? 'لا توجد جلسات مسجلة حتى الآن.' : 'No assessment sessions recorded yet.'}
                </p>
              ) : (
                <div className="divide-y divide-[#E4E9E3]">
                  {sessions.slice(0, 6).map((s) => (
                    <div
                      key={s.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#34443A] flex items-center gap-2">
                          <span className="font-mono-num" dir="ltr">
                            {s.examineeCode}
                          </span>
                          {s.needsReview && (
                            <span className="text-[#9E2A3B] font-bold">
                              · {isAr ? 'مراجعة' : 'Review'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#78847B] truncate">
                          {s.testTitle} · {formatDateShort(s.createdAt, language)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono-num font-bold text-[#587564]">
                          {s.rawScore}/{s.maxScore}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveReportSession(s)}
                          className="calm-btn-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          {isAr ? 'التقرير' : 'Report'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: EXAMINEES & SESSIONS ARCHIVE */}
      {tab === 'archive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search & List Column */}
          <div className="lg:col-span-5 calm-card p-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#78847B] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr ? 'ابحث بالكود التعريفي أو الاسم (إن وُجد)...' : 'Search by Code or Name...'
                }
                className="calm-input w-full ps-10 pe-4 py-2.5 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'all', label: isAr ? 'الكل' : 'All' },
                  { id: 'needsReview', label: isAr ? 'تتطلب مراجعة' : 'Needs Review' },
                  { id: 'reviewed', label: isAr ? 'تمت المراجعة' : 'Reviewed' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setReviewFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer min-h-[34px] ${
                    reviewFilter === f.id
                      ? 'bg-[#587564] text-white'
                      : 'bg-[#FAF8F3] border border-[#E4E9E3] text-[#5F6D64] hover:text-[#34443A] hover:bg-[#E7EFE8]/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-[#E4E9E3] max-h-[540px] overflow-y-auto">
              {filteredExaminees.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#5F6D64]">
                  {isAr ? 'لا توجد سجلات مطابقة.' : 'No matching examinees found.'}
                </p>
              ) : (
                filteredExaminees.map((ex) => {
                  const exSess = sessions.filter((s) => s.examineeCode === ex.code);
                  const hasFlag = exSess.some((s) => s.needsReview && s.status !== 'reviewed');
                  const isSelected = selectedExamineeCode === ex.code;
                  return (
                    <button
                      key={ex.code}
                      type="button"
                      onClick={() => setSelectedExamineeCode(ex.code)}
                      className={`w-full text-start py-3.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#E7EFE8] border border-[#8FAE98]'
                          : 'hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-mono-num font-bold text-sm text-[#34443A]" dir="ltr">
                          {ex.code}
                        </div>
                        <div className="text-xs text-[#5F6D64] truncate">
                          {ex.name || (isAr ? 'دون اسم' : 'No name')} ·{' '}
                          {isAr ? `${ex.age} سنة` : `${ex.age} yrs`} · {exSess.length}{' '}
                          {isAr ? 'جلسة' : 'sessions'}
                        </div>
                      </div>
                      {hasFlag && <ShieldAlert className="w-4 h-4 text-[#9E2A3B] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Examinee Detail & Session Longitudinal Comparison Column */}
          <div className="lg:col-span-7 calm-card p-6 space-y-6">
            {!selectedExaminee ? (
              <div className="py-16 text-center text-sm text-[#5F6D64]">
                {isAr
                  ? 'اختر مفحوصًا من القائمة لعرض بياناته، جلساته، ومقارنة الدرجات عبر الزمن.'
                  : 'Select an examinee from the list to view records, sessions, and longitudinal score chart.'}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E4E9E3] pb-4">
                  <div className="space-y-1">
                    <div className="text-xs text-[#78847B]">
                      {isAr ? 'ملف المفحوص' : 'Examinee Record'}
                    </div>
                    <h2 className="text-xl font-bold font-mono-num text-[#587564]" dir="ltr">
                      {selectedExaminee.code}
                    </h2>
                    <div className="text-sm text-[#5F6D64] flex flex-wrap gap-2">
                      <span>
                        {selectedExaminee.name || (isAr ? 'الاسم غير مدخل' : 'Name not provided')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isAr ? `العمر: ${selectedExaminee.age} سنة` : `Age: ${selectedExaminee.age}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: 'examinee',
                        examinee: selectedExaminee,
                        sessionCount: selectedExamineeSessions.length,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAC8CD] bg-white text-xs font-semibold text-[#9E2A3B] hover:bg-[#FDF4F5] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حذف السجل بالكامل' : 'Delete Record'}</span>
                  </button>
                </div>

                {/* Longitudinal Session Comparison SVG Chart */}
                {selectedExamineeSessions.length > 0 && (
                  <div className="calm-surface p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#587564]">
                        {isAr ? 'مقارنة درجات الجلسات عبر الزمن' : 'Session Scores Over Time'}
                      </h3>
                      <span className="text-[11px] text-[#78847B]">
                        {isAr
                          ? 'عرض وصفي يتطلب تفسيرًا سريريًا متخصصًا'
                          : 'Descriptive trend requiring specialist interpretation'}
                      </span>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <svg
                        viewBox="0 0 520 150"
                        className="w-full h-36 min-w-[320px]"
                        role="img"
                        aria-label="Longitudinal session scores chart"
                      >
                        <line x1="36" y1="20" x2="36" y2="120" stroke="#CBD5CC" strokeWidth="1" />
                        <line x1="36" y1="120" x2="500" y2="120" stroke="#CBD5CC" strokeWidth="1" />
                        {selectedExamineeSessions.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#587564"
                            strokeWidth="2.5"
                            points={selectedExamineeSessions
                              .map((s, idx) => {
                                const x =
                                  56 +
                                  (idx / Math.max(1, selectedExamineeSessions.length - 1)) * 420;
                                const ratio = s.maxScore > 0 ? s.rawScore / s.maxScore : 0;
                                const y = 115 - ratio * 90;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        )}
                        {selectedExamineeSessions.map((s, idx) => {
                          const x =
                            selectedExamineeSessions.length === 1
                              ? 260
                              : 56 + (idx / (selectedExamineeSessions.length - 1)) * 420;
                          const ratio = s.maxScore > 0 ? s.rawScore / s.maxScore : 0;
                          const y = 115 - ratio * 90;
                          return (
                            <g key={s.id}>
                              <circle cx={x} cy={y} r="5" fill="#587564" />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill="#34443A"
                              >
                                {s.rawScore}
                              </text>
                              <text
                                x={x}
                                y="138"
                                textAnchor="middle"
                                fontSize="10"
                                fill="#78847B"
                              >
                                #{idx + 1}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}

                {/* Sessions List for Selected Examinee */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#587564]">
                    {isAr ? 'سجل الجلسات والتقارير' : 'Assessment Sessions'}
                  </h3>
                  {selectedExamineeSessions.map((s) => (
                    <div
                      key={s.id}
                      className="border border-[#E4E9E3] bg-[#FAF8F3]/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs text-[#78847B] tabular-nums">
                          {formatDateShort(s.createdAt, language)}
                        </div>
                        <div className="font-bold text-sm text-[#34443A]">{s.testTitle}</div>
                        <div className="text-xs text-[#5F6D64] flex flex-wrap items-center gap-2">
                          <span className="font-mono-num font-bold text-[#587564]">
                            {s.rawScore} / {s.maxScore}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{isAr ? s.classificationAr : s.classificationEn}</span>
                          {s.needsReview && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-bold text-[#9E2A3B]">
                                {s.status === 'reviewed'
                                  ? isAr
                                    ? 'تمت المراجعة'
                                    : 'Reviewed'
                                  : isAr
                                    ? 'يحتاج مراجعة'
                                    : 'Needs Review'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveReportSession(s)}
                          className="calm-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isAr ? 'فتح التقرير' : 'Open Report'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'session', session: s })}
                          className="p-2.5 rounded-xl border border-[#EAC8CD] bg-white text-[#9E2A3B] hover:bg-[#FDF4F5] transition-colors cursor-pointer"
                          aria-label="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS & ANALYTICS */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <section className="calm-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#587564]" />
              <h2 className="text-base font-bold text-[#587564]">
                {isAr
                  ? 'متوسط شدة الأعراض عبر البنود الـ ٢١ لقائمة بيك'
                  : 'Mean Severity Across the 21 BDI Symptoms'}
              </h2>
            </div>

            {bdiItemMeans.length === 0 ? (
              <p className="text-sm text-[#5F6D64] py-8 text-center">
                {isAr
                  ? 'ستظهر الإحصائيات التفصيلية هنا فور اكتمال جلسات قائمة بيك.'
                  : 'Item-level statistics will appear once BDI sessions are recorded.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {bdiItemMeans.map((item) => (
                  <div
                    key={item.number}
                    className="calm-surface p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#34443A]">
                        {item.number}. {item.name}
                      </span>
                      <span className="font-mono-num font-bold text-[#587564]">
                        {item.mean} / 3
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E7EFE8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#587564] rounded-full"
                        style={{ width: `${Math.round((item.mean / 3) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: CUSTOM TEST BUILDER */}
      {tab === 'builder' && (
        <CustomTestBuilder
          language={language}
          customTests={customTests}
          onRefreshTests={async () => {
            await loadDashboardData();
            await onRefreshPublicData();
          }}
        />
      )}

      {/* TAB 5: SETTINGS & AUDIT LOGS */}
      {tab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 calm-card p-6 space-y-4">
            <h2 className="text-base font-bold text-[#587564]">
              {isAr ? 'إعدادات الغلاف الرئيسي للمنصة' : 'Platform Cover Settings'}
            </h2>
            <p className="text-xs text-[#5F6D64] leading-relaxed">
              {isAr
                ? 'يمكن تخصيص العنوان الفرعي ولون الغلاف وعرض تنويه حقوق النشر فقط؛ بينما تظل بنود بيك ومعاييره ثابتة ومحمية.'
                : 'Only presentation metadata may be customized; official BDI items and scoring norms remain immutable.'}
            </p>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'نص تعريفي إضافي (عربي)' : 'Cover Subtitle (Arabic)'}
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={subtitleAr}
                  onChange={(e) => setSubtitleAr(e.target.value)}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34443A] mb-1">
                  {isAr ? 'نص تعريفي إضافي (إنجليزي)' : 'Cover Subtitle (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  maxLength={300}
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  className="calm-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#34443A] mb-1">
                    {isAr ? 'لون الزر الرئيسي' : 'Primary Accent'}
                  </label>
                  <input
                    type="color"
                    value={coverAccent}
                    onChange={(e) => setCoverAccent(e.target.value)}
                    className="h-9 w-16 rounded-lg border border-[#E4E9E3] cursor-pointer"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#34443A] pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCopyright}
                    onChange={(e) => setShowCopyright(e.target.checked)}
                    className="w-4 h-4 accent-[#587564]"
                  />
                  <span>{isAr ? 'إظهار تنويه حقوق النشر' : 'Show Copyright Notice'}</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={savingSettings}
                className="calm-btn-primary px-5 py-2.5 text-sm font-bold cursor-pointer disabled:opacity-60"
              >
                {savingSettings ? '...' : isAr ? 'حفظ الإعدادات' : 'Save Settings'}
              </button>
              {settingsMsg && (
                <p className="text-xs font-semibold text-[#587564]">{settingsMsg}</p>
              )}
            </form>
          </section>

          <section className="lg:col-span-7 calm-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#587564]" />
              <h2 className="text-base font-bold text-[#587564]">
                {isAr ? 'سجل التدقيق للعمليات الإدارية الحساسة' : 'Administrative Audit Trail'}
              </h2>
            </div>

            <div className="divide-y divide-[#E4E9E3] max-h-[420px] overflow-y-auto text-xs">
              {auditLogs.length === 0 ? (
                <p className="py-8 text-center text-[#5F6D64]">
                  {isAr ? 'لا توجد عمليات مسجلة بعد.' : 'No audit logs yet.'}
                </p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#34443A] font-mono-num">{log.action}</span>
                      <span className="text-[#78847B] tabular-nums">
                        {formatDateShort(log.createdAt, language)}
                      </span>
                    </div>
                    <div className="text-[#5F6D64]">{log.details}</div>
                    <div className="text-[11px] text-[#78847B]" dir="ltr">
                      {log.actorEmail} · {log.targetType}/{log.targetId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Confirmation Modal for Deleting Records */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#34443A]/35 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="calm-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-[#9E2A3B]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">
                {isAr ? 'تأكيد الحذف النهائي للسجل' : 'Confirm Permanent Record Deletion'}
              </h3>
            </div>
            <p className="text-sm text-[#34443A] leading-relaxed">
              {deleteTarget.type === 'session'
                ? isAr
                  ? `سيتم حذف الجلسة (${deleteTarget.session.id}) الخاصة بالكود (${deleteTarget.session.examineeCode}) نهائيًا وتسجيل العملية في سجل التدقيق.`
                  : `Session ${deleteTarget.session.id} for code ${deleteTarget.session.examineeCode} will be permanently deleted and logged in the audit trail.`
                : isAr
                  ? `سيتم حذف سجل المفحوص (${deleteTarget.examinee.code}) وجميع جلساته البالغة (${deleteTarget.sessionCount}) نهائيًا مع توثيق العملية في سجل التدقيق.`
                  : `Examinee ${deleteTarget.examinee.code} and all ${deleteTarget.sessionCount} associated session(s) will be permanently deleted and audited.`}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="calm-btn-outline px-4 py-2 text-xs font-semibold text-[#5F6D64] cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#9E2A3B] text-white text-xs font-bold hover:bg-[#822130] transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting
                  ? '...'
                  : isAr
                    ? 'تأكيد الحذف وتسجيله'
                    : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
