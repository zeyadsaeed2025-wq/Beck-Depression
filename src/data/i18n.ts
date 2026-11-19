import type { Language } from '../types/platform';

export const UI_TEXT: Record<
  Language,
  {
    platformName: string;
    universityName: string;
    developingFaculty: string;
    collaboratingFaculty: string;
    collaborationLine: string;
    navCover: string;
    navStartSession: string;
    navDoctorPortal: string;
    langSwitch: string;
    startAssessmentBtn: string;
    startScaleBtn: string;
    backToHome: string;
    intakeTitle: string;
    intakeSubtitle: string;
    codeLabel: string;
    codeHint: string;
    generateNewCode: string;
    copyCode: string;
    copiedCode: string;
    newCodeNotice: string;
    existingCodeNotice: string;
    nameLabel: string;
    nameOptionalTag: string;
    ageLabel: string;
    dateLabel: string;
    privacyConsentLabel: string;
    privacyPolicySummary: string;
    copyrightNoticeTitle: string;
    copyrightNoticeBody: string;
    itemProgressPrefix: string;
    itemProgressOf: string;
    previousItem: string;
    nextItem: string;
    finishTest: string;
    incompleteWarning: string;
    completionHeading: string;
    completionSubheading: string;
    viewReportOptional: string;
    startAnotherSession: string;
    reportTitle: string;
    printPdfBtn: string;
    rawScoreLabel: string;
    classificationLabel: string;
    cognitiveAffectiveLabel: string;
    somaticLabel: string;
    alertsHeading: string;
    aiSectionHeading: string;
    aiLoading: string;
    aiUnavailable: string;
    responsesTableHeading: string;
    disclaimerHeading: string;
    disclaimerBody: string;
    doctorLoginTitle: string;
    doctorLoginDesc: string;
    doctorSignInGoogle: string;
    doctorPrivacyWarningTitle: string;
    doctorPrivacyWarningBody: string;
    signOut: string;
  }
> = {
  ar: {
    platformName: 'المنصة الأكاديمية الإلكترونية للاختبارات النفسية',
    universityName: 'جامعة المنوفية',
    developingFaculty: 'كلية التربية النوعية – قسم الحاسب الآلي لذوي الاحتياجات الخاصة',
    collaboratingFaculty: 'كلية الآداب – قسم علم النفس',
    collaborationLine:
      'التطوير البرمجي مقدم من كلية التربية النوعية – قسم الحاسب الآلي لذوي الاحتياجات الخاصة، بالتعاون مع كلية الآداب – قسم علم النفس – جامعة المنوفية.',
    navCover: 'الغلاف الرئيسي',
    navStartSession: 'بدء جلسة',
    navDoctorPortal: 'لوحة تحكم الدكتور',
    langSwitch: 'English',
    startAssessmentBtn: 'ابدأ الجلسة التقييمية',
    startScaleBtn: 'بدء القائمة',
    backToHome: 'العودة للغلاف',
    intakeTitle: 'بيانات المفحوص والجلسة',
    intakeSubtitle:
      'لا يتطلب دخول المفحوص إنشاء حساب. يُستخدم الكود التعريفي لربط الجلسات دون كشف أي نتائج سابقة.',
    codeLabel: 'الكود التعريفي للمفحوص',
    codeHint: 'أدخل كودًا مسبقًا لبدء جلسة جديدة أو أنشئ كودًا جديدًا وفريدًا واحتفظ به.',
    generateNewCode: 'إنشاء كود جديد فريد',
    copyCode: 'نسخ الكود',
    copiedCode: 'تم النسخ',
    newCodeNotice: 'يرجى نسخ الكود والاحتفاظ به لاستخدامه في الجلسات اللاحقة.',
    existingCodeNotice:
      'كود مسجل مسبقًا: سيتم ربط هذه الجلسة الجديدة به دون عرض أي سجلات أو تقارير سابقة حفاظًا على الخصوصية.',
    nameLabel: 'اسم المفحوص',
    nameOptionalTag: 'اختياري',
    ageLabel: 'العمر',
    dateLabel: 'تاريخ التطبيق',
    privacyConsentLabel:
      'أوافق على سياسة الخصوصية ومعالجة استجاباتي للأغراض الأكاديمية والتقييمية وفق الضوابط المعتمدة.',
    privacyPolicySummary:
      'تُحفظ البيانات لأغراض التقييم والمتابعة الأكاديمية والإكلينيكية بسرية تامة، ولا تُكشف نتائجك عبر روابط عامة أو بمجرد إدخال الكود. كما لا يُرسل اسمك إلى خدمة التحليل المساعد بالذكاء الاصطناعي.',
    copyrightNoticeTitle: 'تنويه أكاديمي وحقوق النشر',
    copyrightNoticeBody:
      'قائمة "بيك" للاكتئاب (صيغة ١٩٧١ المعدلة، آرون بيك وروبرت ستير، ترجمة د. أحمد عبد الخالق) محمية بحقوق النشر والترجمة المعتمدة؛ ويتطلب الإطلاق العام المفتوح التحقق من الأذون المؤسسية المعتمدة.',
    itemProgressPrefix: 'البند',
    itemProgressOf: 'من',
    previousItem: 'السؤال السابق',
    nextItem: 'السؤال التالي',
    finishTest: 'إنهاء القائمة وحفظ الاستجابات',
    incompleteWarning: 'يرجى الإجابة عن جميع البنود قبل إنهاء الاختبار.',
    completionHeading: 'تم إتمام الاختبار بنجاح.',
    completionSubheading:
      'تم حفظ استجاباتك وتوثيق الجلسة في النظام بنجاح. يمكنك مغادرة الصفحة أو عرض تقرير الجلسة الحالية اختياريًا.',
    viewReportOptional: 'عرض التقرير النفسي',
    startAnotherSession: 'بدء جلسة جديدة',
    reportTitle: 'التقرير النفسي التقييمي',
    printPdfBtn: 'طباعة التقرير / Export PDF',
    rawScoreLabel: 'الدرجة الكلية',
    classificationLabel: 'التصنيف المعتمد',
    cognitiveAffectiveLabel: 'الأعراض المعرفية والوجدانية (البنود ١–١٣)',
    somaticLabel: 'الأعراض البدنية والجسمية (البنود ١٤–٢١)',
    alertsHeading: 'التنبيهات والمؤشرات الإكلينيكية للمراجعة المتخصصة',
    aiSectionHeading: 'التحليل المساعد بالذكاء الاصطناعي (قراءة استرشادية غير تشخيصية)',
    aiLoading: 'جارٍ إعداد القراءة التحليلية المساعدة...',
    aiUnavailable:
      'خدمة التحليل المساعد بالذكاء الاصطناعي غير متاحة حاليًا؛ وتظل الدرجة الرسمية والتصنيف وجميع استجابات البنود مكتملة ومعتمدة أدناه.',
    responsesTableHeading: 'تفصيل استجابات البنود',
    disclaimerHeading: 'التنبيه الطبي والأكاديمي',
    disclaimerBody:
      'يمثل هذا الاختبار أداة تقييم لشدة الأعراض وفق الإصدار المعتمد، ولا يُعد تشخيصًا طبيًا نهائيًا، ولا يغني بأي حال عن التقييم الإكلينيكي المباشر من المختص النفسي أو الطبيب.',
    doctorLoginTitle: 'بوابة الدكتور وأعضاء هيئة التدريس',
    doctorLoginDesc:
      'سجّل الدخول باستخدام حساب Google لإدارة سجلات المفحوصين، مراجعة التقارير الإكلينيكية، مقارنة الجلسات، وبناء الاختبارات الأكاديمية.',
    doctorSignInGoogle: 'تسجيل الدخول عبر Google',
    doctorPrivacyWarningTitle: 'تنويه أمني وخصوصية البيانات النفسية',
    doctorPrivacyWarningBody:
      'وفق إعدادات المرحلة الحالية، يسمح النظام بدخول أي حساب Google مصادق عليه إلى لوحة التحكم. يرفع هذا القرار مخاطر الخصوصية، لذا يجب عدم تشغيل المنصة ببيانات مرضى حقيقية قبل تقييد الوصول بقائمة صلاحيات معتمدة لأعضاء هيئة التدريس والأخصائيين.',
    signOut: 'تسجيل الخروج',
  },
  en: {
    platformName: 'Academic Electronic Psychological Assessment Platform',
    universityName: 'Menoufia University',
    developingFaculty: 'Faculty of Specific Education – Dept. of Computer Science for Special Needs',
    collaboratingFaculty: 'Faculty of Arts – Dept. of Psychology',
    collaborationLine:
      'Developed by Faculty of Specific Education (Computer Science for Special Needs) in collaboration with Faculty of Arts (Department of Psychology) – Menoufia University.',
    navCover: 'Academic Cover',
    navStartSession: 'Start Session',
    navDoctorPortal: 'Doctor Dashboard',
    langSwitch: 'العربية',
    startAssessmentBtn: 'Start Assessment Session',
    startScaleBtn: 'Start Inventory',
    backToHome: 'Back to Cover',
    intakeTitle: 'Examinee & Session Registration',
    intakeSubtitle:
      'No examinee account is required. Identification codes link sessions securely without exposing prior results.',
    codeLabel: 'Examinee Identification Code',
    codeHint: 'Enter an existing code for a follow-up session, or generate a new unique code and save it.',
    generateNewCode: 'Generate Unique Code',
    copyCode: 'Copy Code',
    copiedCode: 'Copied',
    newCodeNotice: 'Please copy and store this code safely for future assessment sessions.',
    existingCodeNotice:
      'Existing code verified: this new session will be linked securely without revealing any prior records or reports.',
    nameLabel: 'Examinee Name',
    nameOptionalTag: 'Optional',
    ageLabel: 'Age',
    dateLabel: 'Application Date',
    privacyConsentLabel:
      'I agree to the academic privacy policy and consent to processing my responses under institutional confidentiality guidelines.',
    privacyPolicySummary:
      'Responses are stored strictly for academic and clinical evaluation. Reports are never exposed through public URLs or code lookups alone, and your name is never sent to external AI services.',
    copyrightNoticeTitle: 'Academic & Copyright Notice',
    copyrightNoticeBody:
      'Beck Depression Inventory (1971 revised version by Aaron Beck & Robert Steer, Arabic translation by Dr. Ahmed Abdel Khalek) is subject to copyright and translation permissions; institutional licensing must be verified prior to open public deployment.',
    itemProgressPrefix: 'Item',
    itemProgressOf: 'of',
    previousItem: 'Previous Item',
    nextItem: 'Next Item',
    finishTest: 'Complete & Save Responses',
    incompleteWarning: 'Please answer all items before completing the assessment.',
    completionHeading: 'Assessment completed successfully.',
    completionSubheading:
      'Your responses have been recorded securely. You may close this screen or optionally view your psychological report for this session.',
    viewReportOptional: 'View Psychological Report',
    startAnotherSession: 'Start New Session',
    reportTitle: 'Psychological Assessment Report',
    printPdfBtn: 'Print Report / Export PDF',
    rawScoreLabel: 'Total Score',
    classificationLabel: 'Official Classification',
    cognitiveAffectiveLabel: 'Cognitive & Affective Items (1–13)',
    somaticLabel: 'Somatic & Vegetative Items (14–21)',
    alertsHeading: 'Clinical Indicators Requiring Specialist Review',
    aiSectionHeading: 'AI-Assisted Analytical Narrative (Non-Diagnostic Guidance)',
    aiLoading: 'Generating assistive analytical overview...',
    aiUnavailable:
      'AI-assisted narrative is currently unavailable; deterministic scores, official classification, and all item responses remain complete below.',
    responsesTableHeading: 'Item-by-Item Response Record',
    disclaimerHeading: 'Clinical & Academic Disclaimer',
    disclaimerBody:
      'This inventory is a symptom-severity assessment tool based on the authorized version. It does NOT represent a definitive medical diagnosis and does not replace direct evaluation by a qualified psychologist or psychiatrist.',
    doctorLoginTitle: 'Faculty & Clinician Portal',
    doctorLoginDesc:
      'Sign in with Google to review examinee records, inspect clinical alerts, compare longitudinal sessions, and build custom academic tests.',
    doctorSignInGoogle: 'Sign in with Google',
    doctorPrivacyWarningTitle: 'Privacy & Access Governance Advisory',
    doctorPrivacyWarningBody:
      'Per current configuration, any authenticated Google account can access the Doctor Dashboard. Because psychological records are sensitive, do NOT deploy with real patient data until role allowlisting is enforced.',
    signOut: 'Sign Out',
  },
};
