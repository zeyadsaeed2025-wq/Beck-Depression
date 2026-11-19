export type GlossaryCategory =
  | 'foundations'
  | 'mood-cognitive'
  | 'behavioral-social'
  | 'somatic-vegetative';

export interface GlossarySourceRef {
  nameAr: string;
  nameEn: string;
  url: string;
}

export interface GlossaryTerm {
  id: string;
  category: GlossaryCategory;
  pdfReference: {
    ar: string;
    en: string;
  };
  termAr: string;
  termEn: string;
  simpleAr: string;
  simpleEn: string;
  scientificAr: string;
  scientificEn: string;
  exampleAr: string;
  exampleEn: string;
  /** Natural Cairo Egyptian colloquial Arabic script exclusively for ar-EG TTS */
  spokenArTerm: string;
  spokenArExplanation: string;
  /** Natural English script exclusively for en-US TTS */
  spokenEnTerm: string;
  spokenEnExplanation: string;
  relatedIds: string[];
  source: GlossarySourceRef;
}

export const GLOSSARY_CATEGORIES: Array<{
  id: GlossaryCategory;
  labelAr: string;
  labelEn: string;
}> = [
  {
    id: 'foundations',
    labelAr: 'مفاهيم التقييم والقياس',
    labelEn: 'Assessment Foundations',
  },
  {
    id: 'mood-cognitive',
    labelAr: 'الأعراض الوجدانية والمعرفية',
    labelEn: 'Mood & Cognitive',
  },
  {
    id: 'behavioral-social',
    labelAr: 'الأعراض السلوكية والاجتماعية',
    labelEn: 'Behavioral & Social',
  },
  {
    id: 'somatic-vegetative',
    labelAr: 'الأعراض الجسدية والحيوية',
    labelEn: 'Somatic & Vegetative',
  },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // --- Foundations (Pages 1-2 of BDI PDF) ---
  {
    id: 'depression',
    category: 'foundations',
    pdfReference: {
      ar: 'مقدمة قائمة بيك للاكتئاب – ص ١',
      en: 'Beck Depression Inventory Manual – Page 1',
    },
    termAr: 'الاكتئاب',
    termEn: 'Depression',
    simpleAr:
      'حالة نفسية يمر فيها الإنسان بانخفاض ملحوظ ومستمر في المزاج والطاقة والرغبة في الأنشطة اليومية، وتؤثر على طريقة تفكيره ونومه ونظرته لنفسه.',
    simpleEn:
      'A mood condition marked by persistent sadness, lower energy, and reduced enjoyment of daily life, affecting thoughts, sleep, and self-perception.',
    scientificAr:
      'مجموعة من الأعراض الوجدانية والمعرفية والدافعية والجسدية التي تتضمن انخفاض المزاج وفقدان الاهتمام واضطراب النوم والشهية وتدني تقدير الذات، وتُقاس شدتها عبر أدوات التقييم الإكلينيكي المقننة.',
    scientificEn:
      'A clinical syndrome involving persistent depressed mood or loss of pleasure alongside cognitive, affective, motivational, and somatic symptoms evaluated through standardized psychometric tools and clinical interviews.',
    exampleAr:
      'مثل أن يشعر الشخص بثقل نفسي وتعب عام يمتد لأسابيع ويجعل مهامه الدراسية أو اليومية أصعب من المعتاد، ولا يعني مجرد ضيق عابر ليوم واحد.',
    exampleEn:
      'For example, feeling persistently weighed down and fatigued over weeks so routine academic or daily tasks feel noticeably harder—not merely having one bad day.',
    spokenArTerm: 'الاكتئاب',
    spokenArExplanation:
      'الاكتئاب معناه إن مزاج الشخص وطاقته ورغبته في الحاجات اللي بيعملها كل يوم بتقل بشكل مستمر لفترة، وده ممكن يأثر على نومه وأكله ونظرته لنفسه. وجود المقياس هنا بيساعد نفهم شدة الأعراض، لكن التشخيص النهائي دايمًا بيكون من مختص.',
    spokenEnTerm: 'Depression',
    spokenEnExplanation:
      'Depression involves a persistent drop in mood, energy, and everyday motivation that can affect sleep, appetite, and how a person views themselves. Standardized scales help estimate symptom severity, while formal diagnosis always requires a qualified clinician.',
    relatedIds: ['depressive-symptom', 'cognitive-affective-symptoms', 'somatic-symptoms'],
    source: {
      nameAr: 'المعهد الوطني للصحة النفسية (NIMH) – الاكتئاب',
      nameEn: 'National Institute of Mental Health (NIMH) – Depression',
      url: 'https://www.nimh.nih.gov/health/topics/depression',
    },
  },
  {
    id: 'depressive-symptom',
    category: 'foundations',
    pdfReference: {
      ar: 'ملاحظات التطبيق – البند التمهيدي ص ٢',
      en: 'Administration Notes – Page 2',
    },
    termAr: 'العَرَض النفسي الاكتئابي',
    termEn: 'Depressive Symptom',
    simpleAr:
      'إشارة أو تجربة فردية قد يمر بها الشخص مثل التعب أو الضيق أو اضطراب النوم، ولا يكفي ظهور عرض واحد بمفرده للحكم بوجود اضطراب نفسي.',
    simpleEn:
      'An individual experience such as tiredness, sadness, or trouble sleeping. Having a single symptom on its own does not mean someone has a clinical disorder.',
    scientificAr:
      'وحدة قياس نوعية في الفحص النفسي تعبّر عن مظهر وجداني أو معرفي أو فسيولوجي محدد (مثل التشاؤم أو الأرق)، ويُقيَّم مجموعها وسياقها الزمني إكلينيكيًا.',
    scientificEn:
      'A distinct affective, cognitive, behavioral, or physiological indicator assessed within psychometric inventories; clinical interpretation relies on overall symptom clusters, duration, and functional impact.',
    exampleAr:
      'مثل مرور طالب بأرق مؤقت ليلة الامتحان؛ فهذا عرض مفرد مرتبط بضغط ظرفي ولا يُفسَّر كاضطراب اكتئابي.',
    exampleEn:
      'For instance, a student experiencing temporary sleeplessness before an exam reflects a single situational symptom rather than a depressive disorder.',
    spokenArTerm: 'العَرَض النفسي الاكتئابي',
    spokenArExplanation:
      'العرض النفسي هو مجرد علامة أو إحساس واحد بيمر بيه الإنسان زي التعب أو الأرق أو الزعل. والمهم نعرف إن وجود عرض واحد لوحده مش معناه أبدًا إن عندك اضطراب، لازم التقييم الكامل عند المختص.',
    spokenEnTerm: 'Depressive Symptom',
    spokenEnExplanation:
      'A depressive symptom is a single indicator like fatigue, sadness, or poor sleep. Experiencing one symptom alone never establishes a diagnosis; clinicians always evaluate the broader pattern and duration.',
    relatedIds: ['depression', 'clinical-assessment'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Symptom',
      nameEn: 'APA Dictionary of Psychology – Symptom',
      url: 'https://dictionary.apa.org/symptom',
    },
  },
  {
    id: 'cognitive-therapy',
    category: 'foundations',
    pdfReference: {
      ar: 'ترويسة القائمة – جامعة بنسلفانيا / مركز العلاج المعرفي ص ١',
      en: 'Inventory Header – Center for Cognitive Therapy, Univ. of Pennsylvania',
    },
    termAr: 'العلاج المعرفي',
    termEn: 'Cognitive Therapy',
    simpleAr:
      'أسلوب علمي في المساعدة النفسية يركّز على فهم الأفكار السلبية التلقائية التي تؤثر في مشاعرنا، وتعلُّم طرق أكثر توازنًا وواقعية للتفكير.',
    simpleEn:
      'An evidence-based psychological approach focused on noticing automatic negative thought patterns and developing more balanced, realistic ways of thinking.',
    scientificAr:
      'منهج علاجي منظّم طوّره آرون بيك يدرس العلاقة التفاعلية بين المعتقدات المعرفية والمزاج والسلوك، ويستهدف تعديل التحيزات المعرفية المرتبطة بالاكتئاب.',
    scientificEn:
      'A structured, empirically supported psychotherapy developed by Aaron T. Beck that examines how maladaptive cognitive appraisals shape emotional distress and behavior.',
    exampleAr:
      'مثل مساعدة شخص يفسّر خطأً بسيطًا على أنه "فشل كامل" ليرى الموقف بموضوعية ويتعامل معه بهدوء.',
    exampleEn:
      'For example, helping someone who treats one minor mistake as "total failure" reframe the situation more realistically.',
    spokenArTerm: 'العلاج المعرفي',
    spokenArExplanation:
      'العلاج المعرفي ده أسلوب علمي طوره الدكتور آرون بيك، بيساعد الشخص يلاحظ الأفكار السلبية التلقائية اللي بتيجي في دماغه وبتأثر على مزاجه، ويتعلم إزاي يفكر بطريقة أهدى وأكثر توازن وواقعية.',
    spokenEnTerm: 'Cognitive Therapy',
    spokenEnExplanation:
      'Cognitive therapy is an evidence-based approach developed by Aaron Beck that helps people identify automatic negative thoughts and build calmer, more balanced ways of interpreting events.',
    relatedIds: ['depression', 'pessimism', 'sense-of-failure'],
    source: {
      nameAr: 'معهد بيك للعلاج المعرفي السلوكي',
      nameEn: 'Beck Institute for Cognitive Behavior Therapy',
      url: 'https://beckinstitute.org/about/understanding-cbt/',
    },
  },
  {
    id: 'clinical-assessment',
    category: 'foundations',
    pdfReference: {
      ar: 'دليل الفاحص – المشاهدات الإكلينيكية ص ١–٢',
      en: 'Examiner Guide – Clinical Observations, Pages 1–2',
    },
    termAr: 'التقييم والفحص الإكلينيكي',
    termEn: 'Clinical Assessment',
    simpleAr:
      'عملية منظمة يقوم بها المختص النفسي لجمع صورة شاملة عن حالة الشخص عبر المقابلة والملاحظة والمقاييس المعتمدة قبل تقديم أي استنتاج.',
    simpleEn:
      'A structured process in which a qualified clinician combines interviews, observation, and validated scales to understand a person’s wellbeing.',
    scientificAr:
      'تقدير مهني متعدد المصادر يدمج بين الدرجات الكمية للمقاييس السيكومترية والمقابلة التشخيصية والتاريخ الشخصي لتحديد طبيعة الأعراض ومستوى شدتها.',
    scientificEn:
      'A multi-method professional evaluation integrating standardized psychometric scores, clinical interview findings, and personal context before formulating any diagnostic impression.',
    exampleAr:
      'مثل جلوس الأخصائي النفسي مع المفحوص لمناقشة نتائج القائمة وسماع ظروفه الحالية قبل تحديد خطة الدعم المناسبة.',
    exampleEn:
      'For example, a psychologist reviewing questionnaire scores alongside a personal conversation to understand current stressors before suggesting support.',
    spokenArTerm: 'التقييم والفحص الإكلينيكي',
    spokenArExplanation:
      'التقييم الإكلينيكي معناه إن المختص النفسي مبيعتمدش على ورقة اختبار لوحدها، لكن بيجمع الصورة كاملة من المقابلة الشخصية والملاحظة والمقاييس المعتمدة عشان يفهم حالة الشخص صح.',
    spokenEnTerm: 'Clinical Assessment',
    spokenEnExplanation:
      'Clinical assessment means a qualified specialist never relies on a single questionnaire score alone, instead combining interviews, observations, and standardized measures to understand the full picture.',
    relatedIds: ['depression', 'depressive-symptom', 'obsessional-slowness'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Clinical Assessment',
      nameEn: 'APA Dictionary of Psychology – Clinical Assessment',
      url: 'https://dictionary.apa.org/clinical-assessment',
    },
  },
  {
    id: 'obsessional-slowness',
    category: 'foundations',
    pdfReference: {
      ar: 'ملاحظات التطبيق (٢) – الاستجابة لدى ذوي التردد الوسواسي ص ٢',
      en: 'Administration Note 2 – Indecisive / Obsessional Respondents, Page 2',
    },
    termAr: 'التردد الوسواسي أثناء التقييم',
    termEn: 'Obsessional Indecision in Testing',
    simpleAr:
      'حالة يجد فيها الشخص صعوبة في حسم اختيار عبارة واحدة أثناء الإجابة ويكرر المراجعة بحثًا عن الدقة التامة، وهو ما يوجّه إليه دليل الاختبار بالتيسير واللطف.',
    simpleEn:
      'Taking unusually long or hesitating repeatedly when picking a single answer out of a desire for exact accuracy, which test guidelines accommodate gently.',
    scientificAr:
      'بطء أو تردد ناتج عن النزعة الكمالية أو الوسواسية عند المفاضلة بين بدائل التقدير المتقاربة في مقاييس التقرير الذاتي، ويُراعى إكلينيكيًا عند توجيه المفحوص لاختيار أقرب وصف حالي.',
    scientificEn:
      'Marked hesitation or compulsive checking when selecting among closely worded self-report options; standardized BDI notes advise clinicians to gently assist the respondent in choosing the closest fit.',
    exampleAr:
      'مثل التوقف طويلًا بين عبارتين متقاربتين في بند واحد خوفًا من عدم إعطاء إجابة مثالية تمامًا.',
    exampleEn:
      'For instance, pausing repeatedly between two similar response statements out of worry about picking the "perfect" wording.',
    spokenArTerm: 'التردد الوسواسي أثناء التقييم',
    spokenArExplanation:
      'التردد ده بيحصل لما الشخص يقف كتير قدّام الاختيارات وميبقاش عارف يحسم إجابة واحدة عشان عايز يختار بدقة تامة. ودليل الاختبار بيوضح إن المفروض نختار أقرب عبارة بتوصف حالنا دلوقتي ببساطة.',
    spokenEnTerm: 'Obsessional Indecision in Testing',
    spokenEnExplanation:
      'This refers to lingering over self-report options because of a strong urge to be completely exact. Testing guidelines encourage simply picking the statement that feels closest to how you have been feeling.',
    relatedIds: ['indecisiveness', 'clinical-assessment'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Indecision',
      nameEn: 'APA Dictionary of Psychology – Indecisiveness',
      url: 'https://dictionary.apa.org/indecision',
    },
  },
  {
    id: 'cognitive-affective-symptoms',
    category: 'foundations',
    pdfReference: {
      ar: 'تصنيف بنود القائمة (١–١٣) – دليل التصحيح ص ٢',
      en: 'BDI Subscale (Items 1–13) – Scoring Guide, Page 2',
    },
    termAr: 'الأعراض المعرفية والوجدانية',
    termEn: 'Cognitive & Affective Symptoms',
    simpleAr:
      'المشاعر والأفكار الداخلية التي يلاحظها الشخص مثل الحزن أو التشاؤم أو لوم النفس أو صعوبة اتخاذ القرار، وتمثل البنود الثلاثة عشر الأولى في القائمة.',
    simpleEn:
      'Internal feelings and thought patterns—such as sadness, pessimism, self-criticism, or difficulty deciding—covered in the first thirteen items of the inventory.',
    scientificAr:
      'مكوّن فرعي في قائمة بيك للاكتئاب يشمل البنود (١–١٣) ويقيس البعدين الانفعالي والإدراكي كالمزاج الحزين والشعور بالفشل والذنب وكره الذات.',
    scientificEn:
      'The cognitive-affective dimension of the Beck Depression Inventory (Items 1–13), indexing negative self-schema, mood disturbance, guilt, and evaluative beliefs.',
    exampleAr:
      'مثل سيطرة أفكار نقد الذات والشعور بعدم الرضا رغم عدم وجود تغير بدني واضح في ذلك اليوم.',
    exampleEn:
      'For example, experiencing harsh self-criticism or low mood even on a day with no noticeable physical fatigue.',
    spokenArTerm: 'الأعراض المعرفية والوجدانية',
    spokenArExplanation:
      'الأعراض المعرفية والوجدانية هي الجانب المتعلق بمشاعرك وأفكارك الداخلية، زي الحزن أو التشاؤم أو لوم النفس أو الحيرة في القرارات، ودي متجمعة في أول تلاتاشر بند في القائمة.',
    spokenEnTerm: 'Cognitive and Affective Symptoms',
    spokenEnExplanation:
      'Cognitive and affective symptoms reflect internal thoughts and emotions, such as sadness, pessimism, self-blame, or trouble making decisions, measured across the first thirteen items of the inventory.',
    relatedIds: ['somatic-symptoms', 'sadness-mood', 'pessimism'],
    source: {
      nameAr: 'دراسة آرون بيك – الخصائص السيكومترية لقائمة بيك (1961 / 1971)',
      nameEn: 'Beck et al. (1961) – Archives of General Psychiatry (PubMed)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/13688369/',
    },
  },
  {
    id: 'somatic-symptoms',
    category: 'foundations',
    pdfReference: {
      ar: 'تصنيف بنود القائمة (١٤–٢١) – دليل التصحيح ص ٢',
      en: 'BDI Subscale (Items 14–21) – Scoring Guide, Page 2',
    },
    termAr: 'الأعراض البدنية والجسمية',
    termEn: 'Somatic & Vegetative Symptoms',
    simpleAr:
      'التغيرات التي تظهر على طاقة الجسم ووظائفه الحيوية مثل التعب السريع أو الأرق أو تغير الشهية والوزن، وتمثل البنود (١٤–٢١) في القائمة.',
    simpleEn:
      'Physical and bodily changes—such as low energy, disrupted sleep, appetite shifts, or weight change—covered in Items 14 to 21 of the inventory.',
    scientificAr:
      'المكوّن الفسيولوجي والأدائي في قائمة بيك للاكتئاب (البنود ١٤–٢١) الذي يرصد مظاهر الإرهاق والعمل واضطراب النوم والشهية والوزن والانشغال الجسدي والليبدو.',
    scientificEn:
      'The somatic-performance subscale of the BDI (Items 14–21) capturing vegetative regulation, work inhibition, sleep architecture, appetite, weight, and bodily preoccupation.',
    exampleAr:
      'مثل الشعور بإرهاق جسدي مستمر مع قلة النوم وفقدان الشهية خلال أسبوع مزدحم بالضغوط.',
    exampleEn:
      'For instance, feeling physically drained alongside poor sleep and reduced appetite during a demanding period.',
    spokenArTerm: 'الأعراض البدنية والجسمية',
    spokenArExplanation:
      'الأعراض البدنية هي التأثيرات اللي بتبان على جسمك وطاقتك، زي قلة النوم أو الإرهاق السريع أو قلة الشهية، ودول متغطيين في البنود من أربعتاشر لواحد وعشرين.',
    spokenEnTerm: 'Somatic and Vegetative Symptoms',
    spokenEnExplanation:
      'Somatic and vegetative symptoms describe physical shifts in energy and bodily rhythms, including sleep changes, tiredness, appetite, and work stamina, covered in Items 14 through 21.',
    relatedIds: ['cognitive-affective-symptoms', 'insomnia', 'fatigability'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Somatic Symptom',
      nameEn: 'APA Dictionary of Psychology – Somatic',
      url: 'https://dictionary.apa.org/somatic',
    },
  },

  // --- Mood & Cognitive Symptoms (Items 1-10) ---
  {
    id: 'sadness-mood',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١)',
      en: 'Beck Depression Inventory – Item 1',
    },
    termAr: 'المزاج والحزن',
    termEn: 'Mood & Sadness',
    simpleAr:
      'شعور بانقباض الصدر أو الكآبة أو الضيق العاطفي. الحزن العابر جزء طبيعي من الحياة، بينما يتم تقييم الحزن المستمر من قِبل المختص.',
    simpleEn:
      'An emotional feeling of heaviness, low spirits, or sorrow. Passing sadness is a normal human reaction, whereas lingering distress is explored with a specialist.',
    scientificAr:
      'انخفاض الوجدان أو عسر المزاج المتدرج من الضيق المؤقت إلى الشعور العميق بعدم القدرة على تحمّل الحزن وفق مؤشر البند الأول في القائمة.',
    scientificEn:
      'Affective lowering ranging from transient dysphoria to persistent, overwhelming sorrow as indexed on Item 1 of the Beck Depression Inventory.',
    exampleAr:
      'مثل الشعور بالضيق بعد فقدان فرصة مهمة أو سماع خبر حزين، والذي يخف عادة بمرور الوقت والدعم.',
    exampleEn:
      'For example, feeling down after disappointing news, which typically eases with time and support.',
    spokenArTerm: 'المزاج والحزن',
    spokenArExplanation:
      'المزاج الحزين معناه إحساس بالضيق أو الكآبة. الزعل المؤقت حاجة طبيعية كلنا بنمر بيها، لكن لما يستمر فترة طويلة، البند ده بيساعد يوضح درجته للمختص.',
    spokenEnTerm: 'Mood and Sadness',
    spokenEnExplanation:
      'Sad mood refers to feelings of low spirits or emotional heaviness. Temporary sadness is a normal human response, while ongoing distress is helpful to discuss with a professional.',
    relatedIds: ['crying', 'anhedonia-dissatisfaction'],
    source: {
      nameAr: 'التصنيف الدولي للأمراض (ICD-11) – منظمة الصحة العالمية',
      nameEn: 'WHO ICD-11 – Depressive Mood Reference',
      url: 'https://icd.who.int/browse/2024-01/mms/en',
    },
  },
  {
    id: 'pessimism',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٢)',
      en: 'Beck Depression Inventory – Item 2',
    },
    termAr: 'التشاؤم',
    termEn: 'Pessimism',
    simpleAr:
      'نظرة سلبية للمستقبل تجعل الشخص يتوقع أن الأمور لن تتحسن أو أن الفرص أمامه مغلقة، حتى دون وجود دليل واقعي كافٍ.',
    simpleEn:
      'Viewing the future through a bleak lens and expecting things will not improve, even when evidence is uncertain.',
    scientificAr:
      'اتجاه معرفي نحو توقع النتائج غير المواتية واليأس من تغير الظروف المستقبلية، ويُعد أحد أضلاع الثالوث المعرفي للاكتئاب عند بيك.',
    scientificEn:
      'A cognitive expectancy bias characterized by anticipating negative outcomes and hopelessness about the future, forming part of Beck’s cognitive triad.',
    exampleAr:
      'مثل أن يفترض شخص متعب أنه لن ينجح في أي مشروع قادم لمجرد تعثر واحد.',
    exampleEn:
      'For example, assuming future efforts will fail simply because one recent attempt was difficult.',
    spokenArTerm: 'التشاؤم',
    spokenArExplanation:
      'التشاؤم معناه إن الشخص يبص للمستقبل بنظرة ضيقة ويحس إن الدنيا مش هتتحسن، حتى لو مفيش دليل واضح على كده في الواقع.',
    spokenEnTerm: 'Pessimism',
    spokenEnExplanation:
      'Pessimism means expecting negative outcomes or feeling discouraged about the future, even when things could still improve.',
    relatedIds: ['cognitive-therapy', 'sense-of-failure'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Pessimism',
      nameEn: 'APA Dictionary of Psychology – Pessimism',
      url: 'https://dictionary.apa.org/pessimism',
    },
  },
  {
    id: 'sense-of-failure',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٣)',
      en: 'Beck Depression Inventory – Item 3',
    },
    termAr: 'الشعور بالفشل',
    termEn: 'Sense of Failure',
    simpleAr:
      'إحساس داخلي لدى الشخص بأنه لم يحقق ما ينبغي عليه أو أنه أقل إنجازًا من الآخرين، وغالبًا ما يكون قاسيًا على نفسه فيه.',
    simpleEn:
      'An inner feeling of having fallen short compared with personal expectations or peers, often involving harsh self-judgment.',
    scientificAr:
      'تقييم ذاتي سلبي يتمحور حول تضخيم الإخفاقات السابقة وإغفال الإنجازات الواقعية ضمن البنية المعرفية للاكتئاب.',
    scientificEn:
      'A negative self-evaluative schema characterized by magnifying past setbacks while discounting real accomplishments.',
    exampleAr:
      'مثل تذكّر خطأ دراسي واحد ونسيان سنوات من النجاح والجهد.',
    exampleEn:
      'For example, focusing only on one lower grade while overlooking years of consistent effort.',
    spokenArTerm: 'الشعور بالفشل',
    spokenArExplanation:
      'الشعور بالفشل هو إحساس داخلي إن الشخص مقصر أو أقل من غيره، وده غالبًا بيحصل لما نركز على غلطة واحدة وننسى كل الحاجات الكويسة اللي عملناها.',
    spokenEnTerm: 'Sense of Failure',
    spokenEnExplanation:
      'Sense of failure is an internal impression of not measuring up, often caused by magnifying setbacks while overlooking genuine achievements.',
    relatedIds: ['self-dislike', 'self-accusations'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Self-Esteem',
      nameEn: 'APA Dictionary of Psychology – Self-Deprecation',
      url: 'https://dictionary.apa.org/self-deprecation',
    },
  },
  {
    id: 'anhedonia-dissatisfaction',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٤)',
      en: 'Beck Depression Inventory – Item 4',
    },
    termAr: 'عدم الرضا وفقدان المتعة',
    termEn: 'Dissatisfaction / Anhedonia',
    simpleAr:
      'تراجع القدرة على الاستمتاع بالأنشطة والهوايات واللقاءات التي كانت تُدخل السرور على النفس سابقًا، أو الشعور بالملل المستمر.',
    simpleEn:
      'A reduced ability to feel enjoyment or satisfaction from hobbies, routines, or company that used to feel pleasant.',
    scientificAr:
      'انعدام التلذذ أو تبلّد الاستجابة للمكافآت والأنشطة السارة المعتادة، ويُعد مؤشرًا محوريًا في التقييم السيكومتري للمزاج.',
    scientificEn:
      'Anhedonia: diminished capacity to experience pleasure or reward from previously enjoyable activities, assessed alongside dissatisfaction in Item 4.',
    exampleAr:
      'مثل الجلوس لمشاهدة هواية مفضلة أو مقابلة الأصدقاء دون الشعور بالبهجة المعتادة.',
    exampleEn:
      'For example, engaging in a favorite hobby or meeting friends without feeling the usual spark of enjoyment.',
    spokenArTerm: 'عدم الرضا وفقدان المتعة',
    spokenArExplanation:
      'فقدان المتعة معناه إن الحاجات اللي كانت بتفرحك زمان، زي القعدة مع الصحاب أو الهوايات، مبقتش تحس فيها بنفس الشغف أو البهجة زي الأول.',
    spokenEnTerm: 'Dissatisfaction and Anhedonia',
    spokenEnExplanation:
      'Anhedonia refers to a reduced ability to feel pleasure or satisfaction from hobbies, routines, or social moments that used to feel rewarding.',
    relatedIds: ['sadness-mood', 'social-withdrawal'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Anhedonia',
      nameEn: 'APA Dictionary of Psychology – Anhedonia',
      url: 'https://dictionary.apa.org/anhedonia',
    },
  },
  {
    id: 'guilt-feelings',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٥)',
      en: 'Beck Depression Inventory – Item 5',
    },
    termAr: 'الشعور بالذنب',
    termEn: 'Guilt Feelings',
    simpleAr:
      'إحساس متكرر بالندم أو المسؤولية الزائدة عن أمور قد لا يكون الشخص مسؤولًا عنها أصلًا أو تكون أبسط مما يتصوره.',
    simpleEn:
      'A recurring feeling of remorse or excessive personal responsibility, sometimes over situations outside one’s control.',
    scientificAr:
      'انفعال ندمي موجّه نحو الذات يتجاوز حدود المسؤولية الموضوعية عن الحدث، وقد يصبح غير متناسب مع الواقع في حالات الضيق النفسي.',
    scientificEn:
      'Self-directed remorse or perceived moral culpability that may become disproportionate or generalized during psychological distress.',
    exampleAr:
      'مثل لوم النفس بقوة على تأخر بسيط أو سوء فهم عابر بين أفراد الأسرة.',
    exampleEn:
      'For example, blaming oneself intensely for a minor delay or an ordinary misunderstanding.',
    spokenArTerm: 'الشعور بالذنب',
    spokenArExplanation:
      'الشعور بالذنب هنا مقصود بيه إن الشخص يحس إنه غلطان ومقصر طول الوقت، ساعات حتى في مواقف ملوش ذنب حقيقي فيها.',
    spokenEnTerm: 'Guilt Feelings',
    spokenEnExplanation:
      'Guilt feelings refer to persistent self-reproach or feeling overly responsible, sometimes even for things outside your control.',
    relatedIds: ['sense-of-punishment', 'self-accusations'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Guilt',
      nameEn: 'APA Dictionary of Psychology – Guilt',
      url: 'https://dictionary.apa.org/guilt',
    },
  },
  {
    id: 'sense-of-punishment',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٦)',
      en: 'Beck Depression Inventory – Item 6',
    },
    termAr: 'الشعور بالعقاب',
    termEn: 'Sense of Punishment',
    simpleAr:
      'تفكير الشخص أو إحساسه بأن ما يمر به من متاعب هو عقاب يستحقه أو أن عقوبة ما تنتظره.',
    simpleEn:
      'A feeling or belief that current hardships are deserved punishment or that one is being punished.',
    scientificAr:
      'تفسير معرفي ذاتي يربط بين الضغوط النفسية أو الأحداث المؤلمة وبين فكرة استحقاق العقاب، وهو امتداد للشعور المفرط بالذنب.',
    scientificEn:
      'A cognitive distortion linking adverse experiences or emotional distress to a belief that one deserves or is undergoing punishment.',
    exampleAr:
      'مثل أن يفسّر شخص إرهاقه أو تعثره بأنه "عقوبة" بدلًا من رؤيته كتحدٍ إنساني يحتاج للدعم.',
    exampleEn:
      'For instance, viewing a difficult period as "deserving punishment" rather than a human challenge that calls for care.',
    spokenArTerm: 'الشعور بالعقاب',
    spokenArExplanation:
      'الشعور بالعقاب معناه إن الواحد يجيله إحساس إن الصعوبات اللي بيمر بيها دي عقاب ليه، أو إنه مستني عقوبة على حاجة عملها.',
    spokenEnTerm: 'Sense of Punishment',
    spokenEnExplanation:
      'Sense of punishment describes feeling that difficulties are a form of deserved retribution rather than ordinary life challenges.',
    relatedIds: ['guilt-feelings', 'self-accusations'],
    source: {
      nameAr: 'الموسوعة الطبية MedlinePlus – الصحة النفسية',
      nameEn: 'MedlinePlus – Depression Overview',
      url: 'https://medlineplus.gov/depression.html',
    },
  },
  {
    id: 'self-dislike',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٧)',
      en: 'Beck Depression Inventory – Item 7',
    },
    termAr: 'كره الذات وخيبة الأمل في النفس',
    termEn: 'Self-Dislike / Self-Disappointment',
    simpleAr:
      'نظرة غير راضية أو قاسية تجاه الذات، تتراوح بين خيبة الأمل في النفس والنفور من صفاتها دون تقدير للجوانب الإيجابية.',
    simpleEn:
      'Feeling disappointed in or dissatisfied with oneself, often losing sight of one’s own strengths and worth.',
    scientificAr:
      'انخفاض حاد في تقبّل الذات وتقديرها يظهر في صورة عدم رضا داخلي أو امتعاض من الذات، ويُقيَّم في البند السابع من القائمة.',
    scientificEn:
      'Marked decline in self-acceptance and self-regard ranging from mild self-disappointment to strong self-aversion.',
    exampleAr:
      'مثل عدم تقبّل الشخص لنفسه أو تقليله الدائم من قيمته أمام إنجازاته.',
    exampleEn:
      'For example, dismissing one’s own value or feeling consistently disappointed in oneself.',
    spokenArTerm: 'كره الذات وخيبة الأمل في النفس',
    spokenArExplanation:
      'المصطلح ده معناه إن الشخص مبيبقاش راضي عن نفسه أو يحس بخيبة أمل تجاه ذاته، ومبيشوفش مميزاته ونقط قوته زي ما هي في الحقيقة.',
    spokenEnTerm: 'Self-Dislike',
    spokenEnExplanation:
      'Self-dislike refers to feeling disappointed in or overly critical toward oneself while overlooking one’s genuine strengths.',
    relatedIds: ['sense-of-failure', 'body-image-change'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Self-Evaluation',
      nameEn: 'APA Dictionary of Psychology – Self-Acceptance',
      url: 'https://dictionary.apa.org/self-acceptance',
    },
  },
  {
    id: 'self-accusations',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٨)',
      en: 'Beck Depression Inventory – Item 8',
    },
    termAr: 'اتهام النفس ولوم الذات',
    termEn: 'Self-Accusations & Self-Blame',
    simpleAr:
      'انتقاد الشخص لنفسه باستمرار وتحميلها اللوم على الأخطاء أو على أي مشكلة تقع حوله، أكثر من المعتاد.',
    simpleEn:
      'Repeatedly criticizing oneself and taking excessive blame when problems or setbacks occur.',
    scientificAr:
      'نزعة معرفية إلى الإسناد الداخلي السلبي، حيث يفسّر الفرد الإخفاقات والعثرات بوصفها ناتجة حصرًا عن قصور شخصي.',
    scientificEn:
      'A cognitive pattern of excessive self-criticism and internal negative attribution when setbacks happen.',
    exampleAr:
      'مثل لوم النفس على تأخر مشروع جماعي بالكامل رغم اشتراك عدة عوامل خارجية فيه.',
    exampleEn:
      'For instance, blaming oneself entirely for a group delay even when multiple outside factors were involved.',
    spokenArTerm: 'اتهام النفس ولوم الذات',
    spokenArExplanation:
      'لوم الذات معناه إن الشخص يحاسب نفسه بقسوة طول الوقت، ويحط اللوم على نفسه في أي مشكلة تحصل حتى لو مش هو السبب الأساسي فيها.',
    spokenEnTerm: 'Self-Accusations and Self-Blame',
    spokenEnExplanation:
      'Self-accusation means frequently criticizing yourself and taking all the blame when things go wrong, even when external factors played a role.',
    relatedIds: ['guilt-feelings', 'sense-of-failure'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Self-Blame',
      nameEn: 'APA Dictionary of Psychology – Self-Blame',
      url: 'https://dictionary.apa.org/self-blame',
    },
  },
  {
    id: 'suicidal-ideation',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٩) وملاحظة المراجعة ص ٢',
      en: 'Beck Depression Inventory – Item 9 & Clinical Review Note, Page 2',
    },
    termAr: 'الأفكار الانتحارية وإيذاء النفس',
    termEn: 'Suicidal Ideation',
    simpleAr:
      'مرور أفكار تتعلق بالرغبة في إنهاء الحياة أو إيذاء النفس. وجود هذه الأفكار يستدعي دائمًا التحدث فورًا مع مختص نفسي أو طبيب أو جهة دعم موثوقة.',
    simpleEn:
      'Thoughts about self-harm or ending one’s life. Whenever these thoughts occur, reaching out promptly to a qualified clinician, doctor, or trusted support service is essential.',
    scientificAr:
      'طيف من الأفكار أو الرغبات المتعلقة بإنهاء الحياة أو إيذاء الذات؛ ويُعد البند التاسع في قائمة بيك مؤشرًا إكلينيكيًا يوجب المراجعة الفورية من المختص دون أن يُؤخذ في عزلة عن السياق الإكلينيكي.',
    scientificEn:
      'Thoughts ranging from passive wishes for death to active intent of self-harm. In clinical psychometrics, Item 9 triggers mandatory professional follow-up and safety evaluation.',
    exampleAr:
      'في التقييم الأكاديمي، لا يُفسَّر هذا البند تلقائيًا كحكم قاطع بل يُعَد إشارة تستدعي رعاية ومقابلة مهنية مباشرة للاطمئنان على سلامة الشخص.',
    exampleEn:
      'In academic assessment, an elevated rating here prompts caring professional follow-up and direct safety check-in rather than automated conclusions.',
    spokenArTerm: 'الأفكار الانتحارية وإيذاء النفس',
    spokenArExplanation:
      'الأفكار دي بتعبر عن رغبة أو تفكير في إيذاء النفس. ولو أي حد مر بأفكار زي كده، مهم جدًا ومش عيب أبدًا إنه يتكلم فورًا مع دكتور أو أخصائي نفسي أو شخص قريب بيثق فيه عشان يلاقي الدعم والرعاية المناسبة.',
    spokenEnTerm: 'Suicidal Ideation',
    spokenEnExplanation:
      'Suicidal ideation refers to thoughts of self-harm or wanting to end one’s life. Any such thought is a signal to reach out promptly to a mental health professional, doctor, or trusted support person.',
    relatedIds: ['clinical-assessment', 'depression'],
    source: {
      nameAr: 'منظمة الصحة العالمية (WHO) – الوقاية من الانتحار والدعم النفسي',
      nameEn: 'World Health Organization (WHO) – Suicide Prevention',
      url: 'https://www.who.int/health-topics/suicide',
    },
  },
  {
    id: 'crying',
    category: 'mood-cognitive',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٠)',
      en: 'Beck Depression Inventory – Item 10',
    },
    termAr: 'البكاء وتغير الاستجابة الانفعالية',
    termEn: 'Crying & Emotional Tearfulness',
    simpleAr:
      'ملاحظة زيادة القابلية للبكاء عن المعتاد عند المواقف البسيطة، أو في بعض الحالات الشعور برغبة في البكاء مع صعوبة التعبير عنها.',
    simpleEn:
      'Noticing that you cry more easily than usual, or sometimes feel the urge to cry without being able to let it out.',
    scientificAr:
      'تغيّر في عتبة التعبير الانفعالي بالدموع سواء بالزيادة الملحوظة أو بالتبلد والانحباس العاطفي كما يرصده البند العاشر.',
    scientificEn:
      'Shifts in emotional tearfulness—either increased crying frequency or emotional constriction where one wants to cry but cannot.',
    exampleAr:
      'مثل البكاء السريع عند مشاهدة موقف عادي أو أثناء ضغط يومي بسيط على غير العادة.',
    exampleEn:
      'For example, tearing up much more readily than usual over everyday frustrations.',
    spokenArTerm: 'البكاء وتغير الاستجابة الانفعالية',
    spokenArExplanation:
      'البند ده بيرصد لو بقيت تعيط أكتر من عادتك على مواقف بسيطة، أو لو أحيانًا بتبقى حاسس إنك عايز تعيط بس مش قادر تعبر عن ده.',
    spokenEnTerm: 'Crying and Emotional Tearfulness',
    spokenEnExplanation:
      'This refers to noticing changes in how easily you cry—either tearing up more often than usual or feeling unable to cry even when upset.',
    relatedIds: ['sadness-mood', 'irritability'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Affect',
      nameEn: 'APA Dictionary of Psychology – Emotional Expression',
      url: 'https://dictionary.apa.org/affect',
    },
  },

  // --- Behavioral & Social Symptoms (Items 11-15) ---
  {
    id: 'irritability',
    category: 'behavioral-social',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١١)',
      en: 'Beck Depression Inventory – Item 11',
    },
    termAr: 'التهيج وسرعة الاستثارة',
    termEn: 'Irritability',
    simpleAr:
      'سرعة الانزعاج أو الضيق من مواقف وأصوات بسيطة لم تكن تزعج الشخص سابقًا، وهو مظهر شائع للإجهاد النفسي.',
    simpleEn:
      'Becoming annoyed, snappy, or frustrated more quickly than usual over minor things.',
    scientificAr:
      'انخفاض عتبة التحمل الانفعالي وارتفاع القابلية للاستثارة والغضب المكتوم أو الظاهر عند التعرض لمثيرات يومية معتادة.',
    scientificEn:
      'Lowered threshold for frustration and heightened proneness to anger or annoyance in response to ordinary daily stressors.',
    exampleAr:
      'مثل سرعة الضيق من ضوضاء بسيطة أو سؤال عادي في البيت بعد يوم شاق.',
    exampleEn:
      'For instance, feeling unusually irritated by mild background noise or routine questions.',
    spokenArTerm: 'التهيج وسرعة الاستثارة',
    spokenArExplanation:
      'سرعة الاستثارة معناها إن خلقك يضيق بسرعة وتتنرفز من حاجات صغيرة مكنتش بتعصبك قبل كده، وده ساعات بيكون علامة إجهاد أو ضغط نفسي.',
    spokenEnTerm: 'Irritability',
    spokenEnExplanation:
      'Irritability means having a shorter fuse than normal and feeling frustrated or annoyed by small everyday things.',
    relatedIds: ['crying', 'fatigability'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Irritability',
      nameEn: 'APA Dictionary of Psychology – Irritability',
      url: 'https://dictionary.apa.org/irritability',
    },
  },
  {
    id: 'social-withdrawal',
    category: 'behavioral-social',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٢)',
      en: 'Beck Depression Inventory – Item 12',
    },
    termAr: 'الانسحاب الاجتماعي',
    termEn: 'Social Withdrawal',
    simpleAr:
      'ابتعاد الشخص تدريجيًا عن مخالطة الأهل والأصدقاء والأنشطة الجماعية وفقدان الرغبة في التواصل المعتاد.',
    simpleEn:
      'Gradually pulling back from friends, family, and social gatherings, with less interest in staying connected.',
    scientificAr:
      'انحسار التفاعل الشخصي والاهتمام بالعلاقات الاجتماعية مما يؤدي إلى العزلة وتقليص شبكة المساندة الاجتماعية.',
    scientificEn:
      'Reduced engagement and interest in interpersonal relationships and social activities, often reducing available social support.',
    exampleAr:
      'مثل الاعتذار المتكرر عن حضور تجمعات الأصدقاء وتفضيل البقاء وحيدًا لفترات طويلة.',
    exampleEn:
      'For example, repeatedly turning down invitations from close friends and preferring to stay alone.',
    spokenArTerm: 'الانسحاب الاجتماعي',
    spokenArExplanation:
      'الانسحاب الاجتماعي معناه إنك تبتدي تبعد عن الناس والصحبة، وتفقد الرغبة في القعدة مع العيلة أو الأصحاب وتفضل تفضل لوحدك.',
    spokenEnTerm: 'Social Withdrawal',
    spokenEnExplanation:
      'Social withdrawal means pulling away from friends, family, and social events because socializing feels draining or uninteresting.',
    relatedIds: ['anhedonia-dissatisfaction', 'work-inhibition'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Social Withdrawal',
      nameEn: 'APA Dictionary of Psychology – Social Withdrawal',
      url: 'https://dictionary.apa.org/social-withdrawal',
    },
  },
  {
    id: 'indecisiveness',
    category: 'behavioral-social',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٣)',
      en: 'Beck Depression Inventory – Item 13',
    },
    termAr: 'عدم الحسم وصعوبة اتخاذ القرار',
    termEn: 'Indecisiveness',
    simpleAr:
      'تردد ملحوظ وصعوبة في اختيار حتى القرارات اليومية البسيطة، مقارنةً بالقدرة المعتادة للشخص في أوقات راحته.',
    simpleEn:
      'Struggling to make even simple everyday choices compared with how easily you usually decide.',
    scientificAr:
      'بطء أو تعطّل في الوظائف التنفيذية المتعلقة بالمفاضلة واتخاذ القرار نتيجة الإرهاق الذهني والقلق من الخطأ.',
    scientificEn:
      'Impaired decisional confidence and cognitive slowing that make choosing between everyday alternatives feel unusually difficult.',
    exampleAr:
      'مثل قضاء وقت طويل في الحيرة عند اختيار وجبة يومية أو ترتيب مهام بسيطة.',
    exampleEn:
      'For example, spending an unusually long time trying to decide what to eat or which task to start first.',
    spokenArTerm: 'عدم الحسم وصعوبة اتخاذ القرار',
    spokenArExplanation:
      'صعوبة اتخاذ القرار معناها إن الواحد يحس بحيرة وتردد كبير حتى في القرارات اليومية البسيطة، على عكس ما كان متعود يحسم أموره بسهولة.',
    spokenEnTerm: 'Indecisiveness',
    spokenEnExplanation:
      'Indecisiveness refers to feeling stuck or overly hesitant when trying to make everyday decisions that used to feel straightforward.',
    relatedIds: ['obsessional-slowness', 'cognitive-affective-symptoms'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Decision Making',
      nameEn: 'APA Dictionary of Psychology – Indecision',
      url: 'https://dictionary.apa.org/indecision',
    },
  },
  {
    id: 'body-image-change',
    category: 'behavioral-social',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٤)',
      en: 'Beck Depression Inventory – Item 14',
    },
    termAr: 'تغير صورة الجسم',
    termEn: 'Body Image Change',
    simpleAr:
      'إحساس غير مريح أو نظرة سلبية مفاجئة للمظهر الخارجي تجعل الشخص يظن أنه يبدو أسوأ أو أقل جاذبية مما هو عليه.',
    simpleEn:
      'Seeing one’s physical appearance in an unusually negative or critical way compared with reality.',
    scientificAr:
      'اضطراب أو تحيز سلبي في الإدراك الذاتي لصورة الجسد والمظهر الشخصي، يرتبط بتدني تقدير الذات والتركيز على العيوب المتصورة.',
    scientificEn:
      'Negative distortion or dissatisfaction in the mental representation of one’s own physical appearance, commonly tied to low self-esteem.',
    exampleAr:
      'مثل القلق الزائد من أن الشكل العام يبدو متعبًا أو غير مقبول رغم عدم تغير المظهر فعليًا.',
    exampleEn:
      'For example, worrying intensely about looking unappealing or worn out even when others see no change.',
    spokenArTerm: 'تغير صورة الجسم',
    spokenArExplanation:
      'تغير صورة الجسم معناه إن نظرة الشخص لشكله ومظهره الخارجي تتغير للأسوأ في عينه، ويحس إنه بقى أقل جاذبية أو متعب حتى لو مفيش تغيير حقيقي.',
    spokenEnTerm: 'Body Image Change',
    spokenEnExplanation:
      'Body image change means developing an overly critical or negative view of your own physical appearance.',
    relatedIds: ['self-dislike', 'somatic-preoccupation'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Body Image',
      nameEn: 'APA Dictionary of Psychology – Body Image',
      url: 'https://dictionary.apa.org/body-image',
    },
  },
  {
    id: 'work-inhibition',
    category: 'behavioral-social',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٥)',
      en: 'Beck Depression Inventory – Item 15',
    },
    termAr: 'صعوبات وإعاقة الأداء والعمل',
    termEn: 'Work Inhibition',
    simpleAr:
      'الشعور بأن المذاكرة أو العمل أو المهام اليومية تحتاج لمجهود إضافي كبير للبدء فيها أو لإنجازها كما كان يحدث سابقًا.',
    simpleEn:
      'Finding that studying, working, or finishing routine chores takes much more effort than usual.',
    scientificAr:
      'تراجع الكفاءة الوظيفية والدافعية الإنجازية، حيث يتطلب الأداء المعتاد جهدًا ذهنيًا وبدنيًا مضاعفًا أو يتعذر إتمامه.',
    scientificEn:
      'Reduced functional productivity and task initiation requiring significantly greater effort to begin or complete daily responsibilities.',
    exampleAr:
      'مثل الحاجة لوقت طويل لإقناع النفس بالبدء في واجب بسيط أو مهمة عمل روتينية.',
    exampleEn:
      'For example, needing extra effort just to get started on a short reading assignment or routine task.',
    spokenArTerm: 'صعوبات الأداء والعمل',
    spokenArExplanation:
      'صعوبات الأداء معناها إن الشغل أو المذاكرة أو حتى مهام البيت البسيطة بقت تحتاج مجهود مضاعف عشان تبدأها أو تخلصها زي الأول.',
    spokenEnTerm: 'Work Inhibition',
    spokenEnExplanation:
      'Work inhibition means needing noticeably extra effort just to start or keep up with studying, work, or daily tasks.',
    relatedIds: ['fatigability', 'somatic-symptoms'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Functional Impairment',
      nameEn: 'APA Dictionary of Psychology – Impairment',
      url: 'https://dictionary.apa.org/impairment',
    },
  },

  // --- Somatic & Vegetative Symptoms (Items 16-21) ---
  {
    id: 'insomnia',
    category: 'somatic-vegetative',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٦)',
      en: 'Beck Depression Inventory – Item 16',
    },
    termAr: 'الأرق واضطراب النوم',
    termEn: 'Insomnia / Sleep Disturbance',
    simpleAr:
      'صعوبة الدخول في النوم، أو الاستيقاظ المتكرر ليلًا، أو الاستيقاظ مبكرًا جدًا مع عدم القدرة على العودة للنوم.',
    simpleEn:
      'Difficulty falling asleep, waking up repeatedly at night, or waking much earlier than intended without being able to sleep again.',
    scientificAr:
      'اختلال في جودة النوم أو مدته يشمل الأرق الأولي أو المتقطع أو الاستيقاظ الباكر، ويُعد من أبرز الأعراض الحيوية المصاحبة للاكتئاب.',
    scientificEn:
      'Disruption in sleep initiation, continuity, or early-morning awakening, representing a core vegetative indicator in mood assessment.',
    exampleAr:
      'مثل الاستيقاظ قبل الفجر بساعتين أو ثلاث ساعات مع بقاء الذهن متعبًا وغير قادر على استكمال النوم.',
    exampleEn:
      'For example, waking up two or three hours before your alarm and lying awake feeling unrested.',
    spokenArTerm: 'الأرق واضطراب النوم',
    spokenArExplanation:
      'الأرق معناه صعوبة في إنك تدخل في النوم، أو إن نومك يتقطع بالليل، أو تصحى بدري قوي ومش عارف ترجع تنام تاني.',
    spokenEnTerm: 'Insomnia and Sleep Disturbance',
    spokenEnExplanation:
      'Insomnia refers to persistent difficulty falling asleep, staying asleep through the night, or waking up much earlier than desired.',
    relatedIds: ['fatigability', 'somatic-symptoms'],
    source: {
      nameAr: 'الموسوعة الطبية MedlinePlus – اضطرابات النوم والأرق',
      nameEn: 'MedlinePlus – Insomnia',
      url: 'https://medlineplus.gov/insomnia.html',
    },
  },
  {
    id: 'fatigability',
    category: 'somatic-vegetative',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٧)',
      en: 'Beck Depression Inventory – Item 17',
    },
    termAr: 'سرعة التعب والإرهاق',
    termEn: 'Fatigability / Fatigue',
    simpleAr:
      'شعور بسرعة الإجهاد ونفاد الطاقة حتى بعد مجهود بسيط، أو الإحساس بالتعب في معظم الأوقات.',
    simpleEn:
      'Getting tired much more quickly than normal, or feeling low on physical energy even without heavy exertion.',
    scientificAr:
      'انخفاض الطاقة الجسدية والشعور بالوهن عند أقل جهد بدني أو ذهني، ويختلف عن الإرهاق الطبيعي الناتج عن عمل شاق.',
    scientificEn:
      'Diminished physical stamina and rapid onset of exhaustion during minimal routine activity.',
    exampleAr:
      'مثل الشعور بالتعب بعد مشوار قصير أو مهمة منزلية خفيفة لم تكن تُتعبك من قبل.',
    exampleEn:
      'For instance, feeling drained after a short walk or light chore that used to feel effortless.',
    spokenArTerm: 'سرعة التعب والإرهاق',
    spokenArExplanation:
      'سرعة التعب معناها إن طاقتك بتخلص بسرعة وتحس بالإرهاق من أقل مجهود، حتى في حاجات بسيطة مكنتش بتتعبك زمان.',
    spokenEnTerm: 'Fatigability and Fatigue',
    spokenEnExplanation:
      'Fatigability means tiring much faster than usual or feeling physically drained even from light everyday tasks.',
    relatedIds: ['insomnia', 'work-inhibition'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Fatigue',
      nameEn: 'APA Dictionary of Psychology – Fatigue',
      url: 'https://dictionary.apa.org/fatigue',
    },
  },
  {
    id: 'loss-of-appetite',
    category: 'somatic-vegetative',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٨)',
      en: 'Beck Depression Inventory – Item 18',
    },
    termAr: 'فقد الشهية',
    termEn: 'Loss of Appetite',
    simpleAr:
      'تراجع الرغبة في تناول الطعام مقارنة بالمعتاد، سواء بانخفاض الإقبال على الأكل أو غياب الشعور بالجوع تقريبًا.',
    simpleEn:
      'Noticeably less desire to eat than normal, ranging from smaller meals to rarely feeling hungry.',
    scientificAr:
      'اضطراب في تنظيم الشهية يتسم بانخفاض الدافع لتناول الطعام كأحد الأعراض الجسدية الفسيولوجية المرصودة في البند الثامن عشر.',
    scientificEn:
      'Reduced hunger drive and food intake representing a physiological vegetative change tracked in Item 18.',
    exampleAr:
      'مثل نسيان وجبات الطعام خلال اليوم أو الاكتفاء بكميات قليلة دون شعور بالرغبة في الأكل.',
    exampleEn:
      'For instance, skipping meals without noticing hunger or eating far less than usual.',
    spokenArTerm: 'فقد الشهية',
    spokenArExplanation:
      'فقد الشهية معناه إن نفسك في الأكل قلت عن طبيعتك، ومبقاش عندك رغبة في الوجبات زي الأول أو مبقتش تحس بالجوع.',
    spokenEnTerm: 'Loss of Appetite',
    spokenEnExplanation:
      'Loss of appetite means feeling noticeably less interested in eating or rarely feeling hungry compared with your normal routine.',
    relatedIds: ['weight-loss', 'somatic-symptoms'],
    source: {
      nameAr: 'الموسوعة الطبية MedlinePlus – تغيرات الشهية',
      nameEn: 'MedlinePlus – Appetite Loss',
      url: 'https://medlineplus.gov/ency/article/003121.htm',
    },
  },
  {
    id: 'weight-loss',
    category: 'somatic-vegetative',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (١٩)',
      en: 'Beck Depression Inventory – Item 19',
    },
    termAr: 'فقد الوزن غير المقصود',
    termEn: 'Unintentional Weight Loss',
    simpleAr:
      'نقصان ملحوظ في وزن الجسم خلال فترة قريبة دون أن يتبع الشخص نظامًا غذائيًا مقصودًا لإنقاص الوزن.',
    simpleEn:
      'A noticeable drop in body weight over a short period without trying to diet or lose weight.',
    scientificAr:
      'مؤشر جسدي حيوي يقيس التغير الكمي غير المقصود في كتلة الجسم خلال التقييم السيكومتري، مع استبعاد الحمية الغذائية المقصودة.',
    scientificEn:
      'A vegetative somatic indicator measuring unplanned reductions in body weight, explicitly excluding intentional dieting.',
    exampleAr:
      'مثل ملاحظة اتساع الملابس ونزول الوزن عدة كيلوجرامات نتيجة قلة الأكل والضغط دون اتباع ريجيم.',
    exampleEn:
      'For example, noticing clothes fitting looser after losing weight unexpectedly without dieting.',
    spokenArTerm: 'فقد الوزن غير المقصود',
    spokenArExplanation:
      'فقد الوزن هنا المقصود بيه إن وزن جسمك ينزل بشكل واضح في فترة قريبة من غير ما تكون عامل دايت أو قاصد تخس.',
    spokenEnTerm: 'Unintentional Weight Loss',
    spokenEnExplanation:
      'Unintentional weight loss refers to a noticeable drop in body weight without following a diet or trying to slim down.',
    relatedIds: ['loss-of-appetite', 'somatic-preoccupation'],
    source: {
      nameAr: 'الموسوعة الطبية MedlinePlus – فقدان الوزن غير المبرر',
      nameEn: 'MedlinePlus – Unintentional Weight Loss',
      url: 'https://medlineplus.gov/ency/article/003107.htm',
    },
  },
  {
    id: 'somatic-preoccupation',
    category: 'somatic-vegetative',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٢٠)',
      en: 'Beck Depression Inventory – Item 20',
    },
    termAr: 'الانشغال بالجسم والقلق الصحي',
    termEn: 'Somatic Preoccupation',
    simpleAr:
      'زيادة القلق والتركيز الذهني على الأعراض الجسدية البسيطة كالمغص أو الصداع أو الإجهاد لدرجة تعيق التركيز في الأمور الأخرى.',
    simpleEn:
      'Worrying heavily about physical aches, fatigue, or bodily sensations to the point where it crowds out other thoughts.',
    scientificAr:
      'تركيز معرفي مفرط على الإحساسات البدنية والشكاوى الجسدية والانشغال بالصحة العضوية كما يرصده البند العشرون في القائمة.',
    scientificEn:
      'Heightened attentional focus and worry directed toward bodily sensations, physical discomfort, or health concerns.',
    exampleAr:
      'مثل التفكير المتواصل في ألم بسيط بالمعدة أو صداع خفيف والانشغال به طوال اليوم.',
    exampleEn:
      'For instance, focusing constantly on a mild stomach ache or tension headache throughout the day.',
    spokenArTerm: 'الانشغال بالجسم والقلق الصحي',
    spokenArExplanation:
      'الانشغال بالجسم معناه إن الواحد يفضل قلقان ومشغول طول الوقت بأي وجع أو تعب بسيط في جسمه، لدرجة تخليه مش عارف يركز في حاجات تانية.',
    spokenEnTerm: 'Somatic Preoccupation',
    spokenEnExplanation:
      'Somatic preoccupation means feeling overly worried about physical aches, fatigue, or health complaints so it becomes hard to focus on anything else.',
    relatedIds: ['body-image-change', 'fatigability'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Somatic Preoccupation',
      nameEn: 'APA Dictionary of Psychology – Health Anxiety',
      url: 'https://dictionary.apa.org/hypochondriasis',
    },
  },
  {
    id: 'loss-of-libido',
    category: 'somatic-vegetative',
    pdfReference: {
      ar: 'قائمة بيك للاكتئاب – البند (٢١)',
      en: 'Beck Depression Inventory – Item 21',
    },
    termAr: 'فقد الليبدو والدافع الجنسي',
    termEn: 'Loss of Libido',
    simpleAr:
      'انخفاض أو تراجع في الرغبة أو الاهتمام الجسدي والعاطفي بالحياة الزوجية والحميمية مقارنةً بالمعتاد لدى الشخص البالغ.',
    simpleEn:
      'A noticeable decrease in romantic or sexual interest compared with a person’s usual baseline.',
    scientificAr:
      'تراجع الدافع الجنسي (الليبدو) بوصفه وظيفة حيوية تتأثر بالتغيرات الوجدانية والهرمونية والإرهاق النفسي في البند الحادي والعشرين.',
    scientificEn:
      'Diminished sexual drive or interest (libido), assessed as a physiological and affective indicator in Item 21.',
    exampleAr:
      'مثل ملاحظة تراجع الرغبة في القرب الزوجي خلال فترات الضغوط الشديدة أو الإرهاق النفسي.',
    exampleEn:
      'For example, noticing reduced interest in intimacy during periods of heavy stress or exhaustion.',
    spokenArTerm: 'فقد الليبدو والدافع الجنسي',
    spokenArExplanation:
      'فقد الليبدو معناه إن الرغبة أو الاهتمام بالعلاقة الزوجية بتقل عن المعتاد عند الشخص، وده بيحصل أحيانًا مع الإرهاق أو الضغوط النفسية.',
    spokenEnTerm: 'Loss of Libido',
    spokenEnExplanation:
      'Loss of libido refers to a noticeable decrease in sexual interest or drive compared with your usual level.',
    relatedIds: ['somatic-symptoms', 'anhedonia-dissatisfaction'],
    source: {
      nameAr: 'قاموس جمعية علم النفس الأمريكية (APA) – Libido',
      nameEn: 'APA Dictionary of Psychology – Libido',
      url: 'https://dictionary.apa.org/libido',
    },
  },
];
