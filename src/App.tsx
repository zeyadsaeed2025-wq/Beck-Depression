import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { CompletionPage } from './components/CompletionPage';
import { CoverPage } from './components/CoverPage';
import { CustomTestCoverPage } from './components/CustomTestCoverPage';
import { DoctorDashboard } from './components/DoctorDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExamineeIntakePage, type IntakeSessionData } from './components/ExamineeIntakePage';
import { GlossaryView } from './components/GlossaryView';
import { InstitutionalHeader, type AppRoute } from './components/InstitutionalHeader';
import { ReportView } from './components/ReportView';
import { TestRunnerPage } from './components/TestRunnerPage';
import { BDI_ITEMS, BDI_METADATA, BDI_TEST_ID } from './data/bdiTest';
import { UI_TEXT } from './data/i18n';
import { scoreBdiResponses, scoreCustomTestResponses } from './engine/bdiScoring';
import { auth, testFirestoreConnection } from './lib/firebase';
import {
  fetchPublicPlatformSettings,
  fetchPublishedCustomTests,
  submitAssessmentSession,
} from './services/firestoreService';
import type {
  AssessmentSessionRecord,
  CustomTest,
  Language,
  PlatformSetting,
} from './types/platform';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [route, setRoute] = useState<AppRoute>('cover');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [publishedCustomTests, setPublishedCustomTests] = useState<CustomTest[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting | null>(null);

  // Active assessment flow state (kept strictly in memory — never exposed via URL code params)
  const [selectedCustomTest, setSelectedCustomTest] = useState<CustomTest | null>(null);
  const [intakeData, setIntakeData] = useState<IntakeSessionData | null>(null);
  const [completedSession, setCompletedSession] = useState<AssessmentSessionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const loadPublicData = async () => {
    try {
      const [tests, settings] = await Promise.all([
        fetchPublishedCustomTests(),
        fetchPublicPlatformSettings(),
      ]);
      setPublishedCustomTests(tests);
      setPlatformSettings(settings);
    } catch {
      // Non-fatal on initial boot if rules or network settle
    }
  };

  useEffect(() => {
    testFirestoreConnection();
    loadPublicData();
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleNavigate = (target: AppRoute) => {
    setIsGlossaryOpen(false);
    if (target === 'cover') {
      setSelectedCustomTest(null);
      setIntakeData(null);
      setCompletedSession(null);
    } else if (target === 'intake') {
      setSelectedCustomTest(null);
      setCompletedSession(null);
    }
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteTest = async (selectedOptionIndices: number[]) => {
    if (!intakeData) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const isBdi = !selectedCustomTest;

      if (isBdi) {
        const answers = selectedOptionIndices.map(
          (optIdx, itemIdx) => BDI_ITEMS[itemIdx].options[optIdx].score
        );
        const scored = scoreBdiResponses(answers);
        const saved = await submitAssessmentSession({
          examineeCode: intakeData.examineeCode,
          examineeName: intakeData.examineeName,
          examineeAge: intakeData.examineeAge,
          isNewCode: intakeData.isNewCode,
          testId: BDI_TEST_ID,
          testTitle: BDI_METADATA.titleAr,
          isBdi: true,
          answers,
          selectedIndices: selectedOptionIndices,
          rawScore: scored.rawScore,
          maxScore: scored.maxScore,
          classificationAr: scored.classificationAr,
          classificationEn: scored.classificationEn,
          classificationLevel: scored.classificationLevel,
          cognitiveAffectiveScore: scored.cognitiveAffectiveScore,
          somaticScore: scored.somaticScore,
          needsReview: scored.needsReview,
          alerts: scored.alerts.map((a) => a.code),
        });
        setCompletedSession(saved);
        setRoute('completion');
      } else {
        const answers = selectedOptionIndices.map(
          (optIdx, qIdx) => selectedCustomTest.questions[qIdx].options[optIdx].score
        );
        const scored = scoreCustomTestResponses(selectedCustomTest, selectedOptionIndices);
        const saved = await submitAssessmentSession({
          examineeCode: intakeData.examineeCode,
          examineeName: intakeData.examineeName,
          examineeAge: intakeData.examineeAge,
          isNewCode: intakeData.isNewCode,
          testId: selectedCustomTest.id,
          testTitle: selectedCustomTest.titleAr,
          isBdi: false,
          answers,
          selectedIndices: selectedOptionIndices,
          rawScore: scored.rawScore,
          maxScore: scored.maxScore,
          classificationAr: scored.classificationAr,
          classificationEn: scored.classificationEn,
          classificationLevel: 'custom',
          cognitiveAffectiveScore: 0,
          somaticScore: 0,
          needsReview: scored.needsReview,
          alerts: [],
        });
        setCompletedSession(saved);
        setRoute('completion');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : language === 'ar'
            ? 'تعذر حفظ الجلسة. يرجى المحاولة مرة أخرى.'
            : 'Could not save session. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTestTitle = selectedCustomTest
    ? language === 'ar'
      ? selectedCustomTest.titleAr
      : selectedCustomTest.titleEn || selectedCustomTest.titleAr
    : language === 'ar'
      ? `${BDI_METADATA.titleAr} (BDI)`
      : BDI_METADATA.titleEn;

  const t = UI_TEXT[language];

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F4EFE6] text-[#34443A]">
        <InstitutionalHeader
          language={language}
          onToggleLanguage={handleToggleLanguage}
          currentRoute={route}
          onNavigate={handleNavigate}
          disableNavDuringTest={route === 'runner'}
          isGlossaryOpen={isGlossaryOpen}
          onOpenGlossary={() => {
            setIsGlossaryOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <div className="flex-1">
          {isGlossaryOpen && (
            <GlossaryView
              language={language}
              isDuringTest={route === 'runner'}
              onClose={() => {
                setIsGlossaryOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
          <div className={isGlossaryOpen ? 'hidden' : ''}>
          {route === 'cover' && (
            <CoverPage
              language={language}
              platformSettings={platformSettings}
              publishedCustomTests={publishedCustomTests}
              onStartBdiSession={() => {
                setSelectedCustomTest(null);
                setRoute('intake');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCustomTestCover={(test) => {
                setSelectedCustomTest(test);
                setRoute('custom-cover');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {route === 'custom-cover' && selectedCustomTest && (
            <CustomTestCoverPage
              test={selectedCustomTest}
              language={language}
              onBack={() => handleNavigate('cover')}
              onStartSession={() => {
                setRoute('intake');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {route === 'intake' && (
            <ExamineeIntakePage
              language={language}
              activeTestTitle={activeTestTitle}
              onBack={() =>
                setRoute(selectedCustomTest ? 'custom-cover' : 'cover')
              }
              onStartTest={(data) => {
                setIntakeData(data);
                setCompletedSession(null);
                setSubmitError('');
                setRoute('runner');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {route === 'runner' && intakeData && (
            <TestRunnerPage
              language={language}
              isBdi={!selectedCustomTest}
              customTest={selectedCustomTest}
              examineeCode={intakeData.examineeCode}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onComplete={handleCompleteTest}
            />
          )}

          {route === 'completion' && completedSession && (
            <CompletionPage
              language={language}
              examineeCode={completedSession.examineeCode}
              onViewReportOptional={() => {
                setRoute('report');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartNewSession={() => {
                setIntakeData(null);
                setCompletedSession(null);
                setRoute('intake');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToCover={() => handleNavigate('cover')}
            />
          )}

          {route === 'report' && completedSession && (
            <ReportView
              session={completedSession}
              customTest={selectedCustomTest}
              language={language}
              viewerRole="examinee"
              onBack={() => setRoute('completion')}
            />
          )}

          {route === 'doctor' && (
            <DoctorDashboard
              language={language}
              user={user}
              authReady={authReady}
              platformSettings={platformSettings}
              onRefreshPublicData={loadPublicData}
            />
          )}
          </div>
        </div>

        <footer className="no-print border-t border-[#E4E9E3] bg-[#FAF8F3] py-6 px-4 sm:px-6 text-center text-xs text-[#78847B] space-y-1">
          <p className="font-semibold text-[#587564]">{t.collaborationLine}</p>
          <p>{t.universityName}</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
