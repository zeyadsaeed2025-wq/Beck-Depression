import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { BDI_TEST_ID } from '../data/bdiTest';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  AssessmentSessionRecord,
  AuditLogRecord,
  CustomTest,
  ExamineeRecord,
  PlatformSetting,
} from '../types/platform';

function createSafeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const time = Date.now().toString(36).toUpperCase();
  return `${prefix}-${time}-${rand}`;
}

export function sanitizeExamineeCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
}

export async function checkCodeExists(rawCode: string): Promise<boolean> {
  const code = sanitizeExamineeCode(rawCode);
  if (code.length < 4 || code.length > 24) return false;
  const path = `codeRegistry/${code}`;
  try {
    const snap = await getDoc(doc(db, 'codeRegistry', code));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function generateUniqueExamineeCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidate = `MNU-${year}-${randomNum}`;
    const exists = await checkCodeExists(candidate);
    if (!exists) {
      return candidate;
    }
  }
  return `MNU-${Date.now().toString(36).toUpperCase()}`;
}

export interface SubmitSessionInput {
  examineeCode: string;
  examineeName: string;
  examineeAge: number;
  isNewCode: boolean;
  testId: string;
  testTitle: string;
  isBdi: boolean;
  answers: number[];
  selectedIndices: number[];
  rawScore: number;
  maxScore: number;
  classificationAr: string;
  classificationEn: string;
  classificationLevel: AssessmentSessionRecord['classificationLevel'];
  cognitiveAffectiveScore: number;
  somaticScore: number;
  needsReview: boolean;
  alerts: string[];
}

export async function submitAssessmentSession(
  input: SubmitSessionInput
): Promise<AssessmentSessionRecord> {
  const code = sanitizeExamineeCode(input.examineeCode);
  const cleanName = input.examineeName.trim().slice(0, 120);
  const sessionId = createSafeId('SES');

  const sessionPayload: AssessmentSessionRecord = {
    id: sessionId,
    examineeCode: code,
    examineeName: cleanName,
    examineeAge: Math.round(input.examineeAge),
    testId: input.testId,
    testTitle: input.testTitle.slice(0, 200),
    isBdi: input.isBdi,
    answers: input.answers,
    selectedIndices: input.selectedIndices,
    rawScore: input.rawScore,
    maxScore: input.maxScore,
    classificationAr: input.classificationAr.slice(0, 160),
    classificationEn: input.classificationEn.slice(0, 160),
    classificationLevel: input.classificationLevel,
    cognitiveAffectiveScore: input.cognitiveAffectiveScore,
    somaticScore: input.somaticScore,
    needsReview: input.needsReview,
    alerts: input.alerts.slice(0, 10),
    aiAnalysisAr: '',
    aiAnalysisEn: '',
    status: 'completed',
    doctorNotes: '',
    reviewedByEmail: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    if (input.isNewCode) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'codeRegistry', code), {
        code,
        createdAt: serverTimestamp(),
      });
      batch.set(doc(db, 'examinees', code), {
        code,
        name: cleanName,
        age: Math.round(input.examineeAge),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'sessions', sessionId), sessionPayload);
      await batch.commit();
    } else {
      await setDoc(doc(db, 'sessions', sessionId), sessionPayload);
    }
    return {
      ...sessionPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `sessions/${sessionId}`);
  }
}

export async function fetchAllExaminees(): Promise<ExamineeRecord[]> {
  try {
    const q = query(collection(db, 'examinees'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ExamineeRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'examinees');
  }
}

export async function fetchAllSessions(): Promise<AssessmentSessionRecord[]> {
  try {
    const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AssessmentSessionRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'sessions');
  }
}

export async function fetchPublishedCustomTests(): Promise<CustomTest[]> {
  try {
    const q = query(collection(db, 'customTests'), where('status', '==', 'published'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CustomTest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customTests');
  }
}

export async function fetchAllCustomTests(): Promise<CustomTest[]> {
  try {
    const q = query(collection(db, 'customTests'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CustomTest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customTests');
  }
}

export async function recordAuditLog(
  action: string,
  targetType: string,
  targetId: string,
  details: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const logId = createSafeId('LOG');
  try {
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      actorUid: user.uid,
      actorEmail: user.email || 'unknown',
      action: action.slice(0, 80),
      targetType: targetType.slice(0, 60),
      targetId: targetId.slice(0, 128),
      details: details.slice(0, 500),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `auditLogs/${logId}`);
  }
}

export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AuditLogRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs');
  }
}

export async function saveCustomTest(test: Omit<CustomTest, 'createdAt' | 'updatedAt' | 'createdByUid' | 'createdByEmail'>, isEdit: boolean): Promise<CustomTest> {
  if (test.id === BDI_TEST_ID) {
    throw new Error('Original BDI inventory is strictly protected and cannot be modified.');
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required.');
  }
  const testId = isEdit ? test.id : createSafeId('TST');
  const path = `customTests/${testId}`;
  try {
    if (isEdit) {
      await updateDoc(doc(db, 'customTests', testId), {
        titleAr: test.titleAr.slice(0, 200),
        titleEn: test.titleEn.slice(0, 200),
        descriptionAr: test.descriptionAr.slice(0, 2000),
        descriptionEn: test.descriptionEn.slice(0, 2000),
        instructionsAr: test.instructionsAr.slice(0, 3000),
        instructionsEn: test.instructionsEn.slice(0, 3000),
        language: test.language,
        testType: test.testType.slice(0, 100),
        scoringMethod: test.scoringMethod,
        minPossibleScore: test.minPossibleScore,
        maxPossibleScore: test.maxPossibleScore,
        questions: test.questions,
        classificationBands: test.classificationBands,
        coverConfig: test.coverConfig,
        reportTemplateAr: test.reportTemplateAr.slice(0, 2000),
        reportTemplateEn: test.reportTemplateEn.slice(0, 2000),
        status: test.status,
        updatedAt: serverTimestamp(),
      });
      await recordAuditLog(
        test.status === 'published' ? 'PUBLISH_OR_UPDATE_TEST' : 'UPDATE_CUSTOM_TEST',
        'customTest',
        testId,
        `Updated custom test "${test.titleAr}" (${test.status})`
      );
    } else {
      const payload = {
        ...test,
        id: testId,
        titleAr: test.titleAr.slice(0, 200),
        titleEn: test.titleEn.slice(0, 200),
        descriptionAr: test.descriptionAr.slice(0, 2000),
        descriptionEn: test.descriptionEn.slice(0, 2000),
        instructionsAr: test.instructionsAr.slice(0, 3000),
        instructionsEn: test.instructionsEn.slice(0, 3000),
        testType: test.testType.slice(0, 100),
        reportTemplateAr: test.reportTemplateAr.slice(0, 2000),
        reportTemplateEn: test.reportTemplateEn.slice(0, 2000),
        createdByUid: user.uid,
        createdByEmail: user.email || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'customTests', testId), payload);
      await recordAuditLog(
        'CREATE_CUSTOM_TEST',
        'customTest',
        testId,
        `Created custom test "${test.titleAr}" (${test.status})`
      );
    }
    const snap = await getDoc(doc(db, 'customTests', testId));
    return snap.data() as CustomTest;
  } catch (error) {
    handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteCustomTest(testId: string, titleAr: string): Promise<void> {
  if (testId === BDI_TEST_ID) {
    throw new Error('Original BDI inventory cannot be deleted.');
  }
  try {
    await deleteDoc(doc(db, 'customTests', testId));
    await recordAuditLog('DELETE_CUSTOM_TEST', 'customTest', testId, `Deleted custom test "${titleAr}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customTests/${testId}`);
  }
}

export async function updateSessionDoctorReview(
  sessionId: string,
  status: 'completed' | 'reviewed',
  doctorNotes: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  try {
    await updateDoc(doc(db, 'sessions', sessionId), {
      status,
      doctorNotes: doctorNotes.slice(0, 2000),
      reviewedByEmail: user.email || '',
      updatedAt: serverTimestamp(),
    });
    await recordAuditLog(
      'UPDATE_SESSION_REVIEW',
      'session',
      sessionId,
      `Marked session ${sessionId} as ${status}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sessions/${sessionId}`);
  }
}

export async function cacheSessionAiAnalysis(
  sessionId: string,
  aiAnalysisAr: string,
  aiAnalysisEn: string
): Promise<void> {
  if (!auth.currentUser) return;
  try {
    await updateDoc(doc(db, 'sessions', sessionId), {
      aiAnalysisAr: aiAnalysisAr.slice(0, 8000),
      aiAnalysisEn: aiAnalysisEn.slice(0, 8000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sessions/${sessionId}`);
  }
}

export async function deleteSessionWithAudit(sessionId: string, examineeCode: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
    await recordAuditLog(
      'DELETE_SESSION',
      'session',
      sessionId,
      `Deleted assessment session ${sessionId} for code ${examineeCode}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `sessions/${sessionId}`);
  }
}

export async function deleteExamineeWithAudit(code: string, sessionIds: string[]): Promise<void> {
  try {
    for (const sid of sessionIds) {
      await deleteDoc(doc(db, 'sessions', sid));
    }
    await deleteDoc(doc(db, 'examinees', code));
    await deleteDoc(doc(db, 'codeRegistry', code));
    await recordAuditLog(
      'DELETE_EXAMINEE_CASCADE',
      'examinee',
      code,
      `Deleted examinee ${code} and ${sessionIds.length} associated session(s)`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `examinees/${code}`);
  }
}

export async function fetchPublicPlatformSettings(): Promise<PlatformSetting | null> {
  try {
    const snap = await getDoc(doc(db, 'platformSettings', 'publicConfig'));
    return snap.exists() ? (snap.data() as PlatformSetting) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'platformSettings/publicConfig');
  }
}

export async function savePublicPlatformSettings(
  setting: Pick<PlatformSetting, 'platformSubtitleAr' | 'platformSubtitleEn' | 'showCopyrightNotice' | 'bdiCoverAccent'>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  const docRef = doc(db, 'platformSettings', 'publicConfig');
  try {
    const existing = await getDoc(docRef);
    const payload = {
      id: 'publicConfig',
      platformSubtitleAr: setting.platformSubtitleAr.slice(0, 300),
      platformSubtitleEn: setting.platformSubtitleEn.slice(0, 300),
      showCopyrightNotice: setting.showCopyrightNotice,
      bdiCoverAccent: setting.bdiCoverAccent.slice(0, 30),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    };
    if (existing.exists()) {
      await updateDoc(docRef, {
        platformSubtitleAr: payload.platformSubtitleAr,
        platformSubtitleEn: payload.platformSubtitleEn,
        showCopyrightNotice: payload.showCopyrightNotice,
        bdiCoverAccent: payload.bdiCoverAccent,
        updatedByUid: payload.updatedByUid,
        updatedAt: payload.updatedAt,
      });
    } else {
      await setDoc(docRef, payload);
    }
    await recordAuditLog(
      'UPDATE_PLATFORM_SETTINGS',
      'platformSetting',
      'publicConfig',
      'Updated public cover presentation settings (BDI test content remains locked)'
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platformSettings/publicConfig');
  }
}
