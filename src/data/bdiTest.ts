import type { BdiClassificationRange, BdiItem } from '../types/platform';

export const INSTITUTIONAL_LOGOS = Object.freeze({
  university: '/assets/aistudio/WhatsApp_Image_2026-11-16_at_9.04.54_PM_815498e2.jpeg',
  specificEducation: '/assets/aistudio/WhatsApp_Image_2026-11-16_at_9.04.54_PM__1__80919587.jpeg',
  arts: '/assets/aistudio/WhatsApp_Image_2026-11-16_at_9.04.53_PM_2acdca6c.jpeg',
});

export const BDI_TEST_ID = 'bdi-1971-ar' as const;

export const BDI_METADATA = Object.freeze({
  id: BDI_TEST_ID,
  titleAr: 'قائمة "بيك" للاكتئاب',
  titleEn: 'Beck Depression Inventory – BDI (Revised 1971)',
  authorsAr: 'آرون بيك، و روبرت ستير',
  authorsEn: 'Aaron T. Beck & Robert A. Steer',
  translatorAr: 'د. أحمد عبد الخالق',
  translatorEn: 'Dr. Ahmed Abdel Khalek (Arabic Translation)',
  overviewParagraph1:
    'أعد بيك وزملاؤه عام ١٩٦١ مقياسه الأصلى لتشخيص الاكتئاب ونشره بعنوان قائمة لقياس الاكتئاب An Inventory For Measuring Depression ونشرها في سجلات الطب النفسي العام. وفي عام ١٩٧١ بدأ بيك وستير في مركز العلاج المعرفي بجامعة "بنسلفانيا" باستخدام صيغة معدلة من قائمة " بيك للاكتئاب وهي التي بين أيدينا، وقام بترجمتها للعربية د.أحمد عبد الخالق.',
  objectives: Object.freeze([
    'قياس عمق وشدة الاكتئاب.',
    'تقديم تشخيص سريع لمريض الاكتئاب.',
  ]),
  designNote:
    'اعتمد في تصميم قائمة "بيك" للاكتئاب على المشاهدات الإكلينيكية و على أوصاف الأعراض التي يعطيها مرضى الاكتئاب بشكل متكرر في مجال الطب النفسي، واندمجت المشاهدات الإكلينيكية و أوصاف المرضى بشكل متسق في واحد وعشرين عَرَض وهي التي سبق ذكرها. ويمكن تقدير كل منها من خلال أربعة نقاط تتراوح بين (صفر – ٣ ) على أساس الشدة. والدرجة الكلية القصوى هي ٦٣ .',
  examineeHeader: '( بيك للاكتئاب )',
  examineeInstructions:
    'تتضمن هذه القائمة مجموعات من الجمل تصف مشاعرك وأحاسيسك في نواحي متعددة . يرجى القيام بقراءة كل مجموعة من الجمل واختيار جملة واحدة تعطي أدق وصف لحالتك النفسية وللشعور السائد لديك خلال السبعة أيام الماضية بما فيها هذا اليوم . وبعد أن تحدد الجملة التي تصف مشاعرك ضع دائرة حول الرقم الذي يسبقها . أما إذا وجدت في مجموعة ما أن هنالك عدة جمل تنطبق بصورة متساوية على حالتك فضع دائرة حول رقم جملة واحدة منها فقط ترجح أنها الأكثر انطباقاً على حالتك .',
  examineeClosing: '" وشكراً لحسن تعاونكم "',
  applicationNotes: Object.freeze([
    'تهيئة البيئة الفيزيقية التي يتم فيها الاختبار بإضاءة كافية للقراءة، و أن تكون هذه البيئة هادئة إلى الدرجة التي تجعله قادراً على التركيز.',
    'يمكن أن تطبق القائمة بطريقة فردية أو جمعية.',
    'يستغرق وقت التطبيق زمن يتراوح بين ٥ – ١٠ دقائق تقريباً عندما يطبقها المفحوص على نفسه، أما التطبيق الشفهي فيمكن أن يستغرق ١٥ دقيقة، وقد يستغرق بعض المرضى الوسواسيين بدرجة مفرطة نصف ساعة.',
    'إذا حدد المفحوص أن هناك عبارتين أو أكثر تعبران عن الحالة التي يشعر بها، عندئذ سجل أعلى التقديرين.',
    'إذا قام أحد المفحوصين بإعطاء التقدير نفسه لكل البنود الإحدى والعشرين، فإن الفاحص يجب أن يخبره أن الناس نادراً ما يستجيبون بالطريقة ذاتها بالنسبة لكل عَرَض، و أنه ربما يريد أن يعيد النظر في بعض التقديرات.',
  ]),
  scoreInterpretationNotes: Object.freeze([
    'من خلال التصنيف السابق ذكره لمستويات شدة الاكتئاب يمكن معرفة في أى مستوى تقع درجة العميل.',
    'وبما أن الدرجة الكلية على قائمة "بيك" للاكتئاب تمدنا بشدة الاكتئاب بشكل عام، فإنه من المهم أن ننتبه إلى محتوى بنود معينة، فيجب أن نعطى اهتماماً خاصاً بالأعراض المتصلة بالتفكير في الانتحار. فقد كشفت الدراسات أن البند الثاني الخاص بالتشاؤم في قائمة "بيك" للاكتئاب منبئ بالانتحار الفعلي. و أن المرضى الذين يعترفون بالأفكار الانتحارية ( البند رقم ٩) وبالتشاؤم في (البند رقم ٢) يجب أن يُفحصوا جيداً بخصوص احتمال انتحارهم.',
    'ومن الأهمية بمكان أيضا أن نفحص النمط العام لأعراض الاكتئاب التي يصفها المريض، فإن قائمة "بيك" للاكتئاب لا تعكس الأعراض المعرفية و الوجدانية فحسب، بل أيضا الأعراض البدنية و الجسمية، مثال ذلك أن بعض المرضى المنتحرين لن يعبروا عن أفكارهم الانتحارية ولكنهم يتوقفون فعلاً عن الأكل و النوم. إن كل مريض يكشف الأعراض الاكتئابية المميزة له و التي يتعين أن تواجه بطريقة فردية.',
  ]),
});

export const BDI_CLASSIFICATION_RANGES: readonly BdiClassificationRange[] = Object.freeze([
  Object.freeze({
    level: 'minimal',
    min: 0,
    max: 9,
    labelAr: 'تعد داخل المدى الأقل (أى في حده الأدنى)',
    labelEn: 'Minimal Range (0–9)',
    officialDescriptionAr: 'الدرجات من صفر – ٩ تعد داخل المدى الأقل (أى في حده الأدنى)',
  }),
  Object.freeze({
    level: 'mild',
    min: 10,
    max: 16,
    labelAr: 'اكتئاب معتدل',
    labelEn: 'Mild Depression (10–16)',
    officialDescriptionAr: 'وتشير الدرجات من ١٠ – ١٦ إلى اكتئاب معتدل',
  }),
  Object.freeze({
    level: 'moderate',
    min: 17,
    max: 29,
    labelAr: 'اكتئاب متوسط',
    labelEn: 'Moderate Depression (17–29)',
    officialDescriptionAr: 'على حين تدل الدرجات من ١٧ – ٢٩ على اكتئاب متوسط',
  }),
  Object.freeze({
    level: 'severe',
    min: 30,
    max: 63,
    labelAr: 'اكتئاب شديد',
    labelEn: 'Severe Depression (30–63)',
    officialDescriptionAr: 'وتشير الدرجات من ٣٠ – ٦٣ إلى اكتئاب شديد',
  }),
]);

export const BDI_ITEMS: readonly BdiItem[] = Object.freeze([
  Object.freeze({
    number: 1,
    arabicNumber: '١',
    symptomName: 'المزاج',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'إنني لا اشعر بالحزن .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'إنني اشعر بالحزن في بعض الأوقات .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اشعر بالحزن طيلة الوقت ولا استطيع التخلص من هذا الشعور .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'إنني اشعر بالحزن والتعاسة لدرجة لا استطيع احتمالها .' }),
    ]),
  }),
  Object.freeze({
    number: 2,
    arabicNumber: '٢',
    symptomName: 'التشاؤم',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'إنني لست متشائماً بشأن المستقبل .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'اشعر بالتشاؤم بشأن المستقبل .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اشعر انه لا يوجد لدي ما اطمح للوصول إليه .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'اشعر بأن المستقبل لا أمل فيه وان هذا الوضع من غير الممكن تغييره .' }),
    ]),
  }),
  Object.freeze({
    number: 3,
    arabicNumber: '٣',
    symptomName: 'الشعور بالفشل',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا اشعر بأنني شخص فاشل بشكل عام .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'اشعر بأنني أواجه من الفشل أكثر مما يواجهه الإنسان العادي .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'عندما انظر إلى حياتي الماضية ، فإن كل ما أراه الكثير من الفشل .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'اشعر بأنني إنسان فاشل فشلاً تاماً .' }),
    ]),
  }),
  Object.freeze({
    number: 4,
    arabicNumber: '٤',
    symptomName: 'عدم الرضا بالنفس',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'ما زالت الأشياء تعطيني شعوراً بالرضا كما كانت عادة .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'لا اشعر بمتعة في الأشياء على النحو الذي كنت اشعر به عادة .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'لم اعد اشعر بأية متعة حقيقية في أي شيء على الإطلاق .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'لدي شعور بعدم الرضا والملل من كل الأشياء .' }),
    ]),
  }),
  Object.freeze({
    number: 5,
    arabicNumber: '٥',
    symptomName: 'الشعور بالذنب',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا يوجد لدي أي شعور بالذنب .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'اشعر بالذنب في بعض الأوقات .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اشعر بالذنب في معظم الأوقات .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'اشعر بالذنب في كافة الأوقات .' }),
    ]),
  }),
  Object.freeze({
    number: 6,
    arabicNumber: '٦',
    symptomName: 'العقاب',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا اشعر بأنني استحق عقاباً من أي نوع .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'اشعر بأنني استحق العقاب أحيانا .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'كثيرا ما اشعر بأنني استحق العقاب .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'أحس بأنني أعاقب وأعذب في حياتي وإنني استحق ذلك' }),
    ]),
  }),
  Object.freeze({
    number: 7,
    arabicNumber: '٧',
    symptomName: 'كره الذات',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا اشعر بخيبة الأمل في نفسي .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'اشعر بخيبة الأمل في نفسي .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اشعر أحيانا بأنني اكره نفسي .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'إنني اكره نفسي في كل الأوقات .' }),
    ]),
  }),
  Object.freeze({
    number: 8,
    arabicNumber: '٨',
    symptomName: 'اتهام النفس',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا اشعر بأنني أسوا من الآخرين .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'إنني انتقد نفسي بسبب ما لدي من أخطاء وضعف .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'ألوم نفسي طيلة الوقت بسبب أخطائي .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'ألوم نفسي على كل شيء يحدث حتى لو لم يكن لي علاقة مباشرة بذلك .' }),
    ]),
  }),
  Object.freeze({
    number: 9,
    arabicNumber: '٩',
    symptomName: 'الأفكار الإنتحارية',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا يوجد لدي أية أفكار انتحارية .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'توجد لدي بعض الأفكار الانتحارية ولكني لن أقوم بتنفيذها .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'ارغب في قتل نفسي .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'سأقتل نفسي إذا توفرت لي الفرصة السانحة لذلك .' }),
    ]),
  }),
  Object.freeze({
    number: 10,
    arabicNumber: '١٠',
    symptomName: 'البكاء',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا ابكي أكثر من المعتاد .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'ابكي في هذه الأيام أكثر من المعتاد .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'إنني ابكي طيلة الوقت هذه الأيام .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'لقد كانت لدي قدرة على البكاء ولكنني في هذه الأيام لا استطيع البكاء مع أنني أريد ذلك' }),
    ]),
  }),
  Object.freeze({
    number: 11,
    arabicNumber: '١١',
    symptomName: 'التهيج',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا اشعر في هذه الأيام بأنني سريع الغضب أكثر من المعتاد .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'أصبح غضبي يستثار بسهولة أكثر من المعتاد هذه الأيام .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اشعر بسرعة الاستثارة طيلة الوقت في هذه الأيام .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'أحس بان مشاعري قد تبدلت ولم يعد شيء يغضبني .' }),
    ]),
  }),
  Object.freeze({
    number: 12,
    arabicNumber: '١٢',
    symptomName: 'الانسحاب الإجتماعي',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا اشعر بأنني قد فقدت اهتمامي بالناس الآخرين .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'أصبحت اقل اهتماما بالناس الآخرين مما كنت عليه .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'فقدت معظم اهتمامي بالناس الآخرين .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'فقدت كل اهتمام لي بالناس الآخرين .' }),
    ]),
  }),
  Object.freeze({
    number: 13,
    arabicNumber: '١٣',
    symptomName: 'عدم الحسم',
    domain: 'cognitive_affective',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'أقوم باتخاذ قراراتي على أفضل ما استطيع القيام به .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'أميل إلى تأجيل اتخاذ القرارات أكثر مما كنت افعل عادة .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'أصبحت أجد صعوبة كبيرة في اتخاذ القرارات عما قبل .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'لم تعد لدي أية قدرة على اتخاذ قرارات في هذه الأيام .' }),
    ]),
  }),
  Object.freeze({
    number: 14,
    arabicNumber: '١٤',
    symptomName: 'تغير صورة الجسم',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'اشعر بان مظهري مناسب كما كان عادة .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'يزعجني الشعور بأنني كهلاً أو غير جذاب .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اشعر أن هنالك تغيرات دائمة تطرأ على مظهري تجعلني أبدو غير جذاب .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'اعتقد بأنني أبدو قبيحاً' }),
    ]),
  }),
  Object.freeze({
    number: 15,
    arabicNumber: '١٥',
    symptomName: 'صعوبات في العمل',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'استطيع العمل بنفس الكفاءة كما كنت افعل عادة .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'احتاج إلى جهد إضافي كي أبدء العمل في أي شيء .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'علي أن أحث نفسي بشدة كي أقوم بعمل أي شيء .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'لا استطيع عمل أو إنجاز أي شيء على الإطلاق .' }),
    ]),
  }),
  Object.freeze({
    number: 16,
    arabicNumber: '١٦',
    symptomName: 'الأرق',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'استطيع النوم جيدا كالمعتاد .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'لا أنام جيدا كالمعتاد .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'استيقظ من النوم أبكر بساعة أو ساعتين من المعتاد ولا استطيع العودة ثانية إلى النوم .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'استيقظ من النوم أبكر بساعات عديدة من المعتاد ولا استطيع العودة ثانية إلى النوم .' }),
    ]),
  }),
  Object.freeze({
    number: 17,
    arabicNumber: '١٧',
    symptomName: 'سرعة التعب',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لا أجد أنني أصبحت أكثر تعباً من المعتاد .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'أصبحت اتعب أكثر من المعتاد .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'أصبحت اتعب من عمل أي شيء تقريباً .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'انا متعب جدا لدرجة لا استطيع معها عمل أي شيء .' }),
    ]),
  }),
  Object.freeze({
    number: 18,
    arabicNumber: '١٨',
    symptomName: 'فقد الشهية',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'شهيتي للطعام هي كالمعتاد .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'شهيتي للطعام ليست جيدة كما هي عادة .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'شهيتي للطعام سيئة جدا هذه الأيام .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'ليس لدي شهية للطعام على الإطلاق هذه الأيام .' }),
    ]),
  }),
  Object.freeze({
    number: 19,
    arabicNumber: '١٩',
    symptomName: 'فقد الوزن',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لم افقد كثيرا من وزني مؤخرا أو بقي وزني كما هو .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'فقدت من وزني حوالي ٢ كغم .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'فقدت من وزني حوالي ٤ كغم .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'فقدت من وزني أكثر من ٦ كغم .' }),
    ]),
  }),
  Object.freeze({
    number: 20,
    arabicNumber: '٢٠',
    symptomName: 'الانشغال بالجسم',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'ليس لدي انزعاج يتعلق بصحتي أكثر من المعتاد .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'إنني منزعج بشأن المشكلات الصحية مثل الم المعدة أو الإمساك أو الآلام والأوجاع الجسمية عامة .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'إنني متضايق من المشكلات الصحية ومن الصعب أن أفكر في شيء أخر .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'إنني قلق للغاية بسبب وضعي الصحي بحيث لا استطيع التفكير في أي شي أخر .' }),
    ]),
  }),
  Object.freeze({
    number: 21,
    arabicNumber: '٢١',
    symptomName: 'فقد الليبدو',
    domain: 'somatic',
    options: Object.freeze([
      Object.freeze({ score: 0, arabicNumeral: '٠', text: 'لم ألاحظ أية تغيرات تتعلق في اهتماماتي الجنسية .' }),
      Object.freeze({ score: 1, arabicNumeral: '١', text: 'أصبحت اقل اهتماما بالأمور الجنسية مما كنت عليه من قبل .' }),
      Object.freeze({ score: 2, arabicNumeral: '٢', text: 'اهتمامي قليل جدا بالأمور الجنسية في هذه الأيام .' }),
      Object.freeze({ score: 3, arabicNumeral: '٣', text: 'فقدت اهتمامي بالأمور الجنسية تماماً .' }),
    ]),
  }),
]);
