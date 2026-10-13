import type { Lang } from '../types';

export type Group = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
type L = { ar: string; en: string };
type LL = { ar: string[]; en: string[] };

export type Exercise = {
  id: string;
  name: L;
  group: Group;
  muscles: L;
  equipment: L;
  cues: LL;
  mistakes: LL;
};

export const EXERCISES: Exercise[] = [
  {
    id: 'benchBB', group: 'chest',
    name: { en: 'Bench Press (Barbell)', ar: 'بنش برس بالبار' },
    muscles: { en: 'Chest, triceps, front delts', ar: 'الصدر، الترايسبس، الكتف الأمامي' },
    equipment: { en: 'Barbell, flat bench', ar: 'بار ومقعد مستوي' },
    cues: {
      en: ['Lie with your eyes under the bar, feet flat, shoulder blades pulled back and down.', 'Grip a little wider than your shoulders and unrack with straight arms.', 'Lower the bar to mid-chest with elbows about 45° from your body.', 'Press up and slightly back over your shoulders.'],
      ar: ['انسدح وعيونك تحت البار، رجولك ثابتة على الأرض، ولوحي الكتف مسحوبة لورا وتحت.', 'امسك أعرض من كتوفك شوي، وشيل البار وذراعك مفرودة.', 'نزّل البار لنص صدرك والكوع تقريباً ٤٥ درجة عن جسمك.', 'ادفع لفوق ولورا شوي فوق كتوفك.'],
    },
    mistakes: {
      en: ['Bouncing the bar off your chest', 'Flaring the elbows out to 90°', 'Lifting your hips off the bench'],
      ar: ['ترتيد البار على صدرك', 'فتح الكوع ٩٠ درجة', 'رفع الحوض عن المقعد'],
    },
  },
  {
    id: 'inclineBB', group: 'chest',
    name: { en: 'Incline Bench Press (Barbell)', ar: 'بنش عالي بالبار' },
    muscles: { en: 'Upper chest, front delts, triceps', ar: 'أعلى الصدر، الكتف الأمامي، الترايسبس' },
    equipment: { en: 'Barbell, 30–45° incline bench', ar: 'بار ومقعد مائل ٣٠–٤٥°' },
    cues: {
      en: ['Set the bench to 30–45°.', 'Pull your shoulder blades back and keep your feet planted.', 'Lower the bar to your upper chest under control.', 'Press straight up over your shoulders.'],
      ar: ['خل المقعد على ٣٠–٤٥ درجة.', 'اسحب لوحي الكتف لورا وثبّت رجولك.', 'نزّل البار لأعلى صدرك بهدوء.', 'ادفع مستقيم لفوق فوق كتوفك.'],
    },
    mistakes: {
      en: ['Bench too steep, so it turns into a shoulder press', 'Bar landing on your neck or mid-chest', 'Half reps'],
      ar: ['المقعد عالي زيادة فيصير تمرين أكتاف', 'البار ينزل على الرقبة أو نص الصدر', 'نص حركة'],
    },
  },
  {
    id: 'pecDeck', group: 'chest',
    name: { en: 'Pec Deck (Machine)', ar: 'تفتيح صدر بالجهاز' },
    muscles: { en: 'Chest, front delts', ar: 'الصدر، الكتف الأمامي' },
    equipment: { en: 'Pec deck machine', ar: 'جهاز البيك دك' },
    cues: {
      en: ['Set the seat so the handles are at chest height.', 'Keep a slight bend in your elbows.', 'Bring the handles together in front of your chest and squeeze for a second.', 'Open slowly until you feel a stretch.'],
      ar: ['عدّل الكرسي بحيث المقابض على مستوى صدرك.', 'خل الكوع منثني شوي.', 'ضم المقابض قدام صدرك واعصر ثانية.', 'افتح ببطء لين تحس بتمدد.'],
    },
    mistakes: {
      en: ['Shrugging your shoulders', 'Letting the weight slam back', 'Using momentum'],
      ar: ['رفع الكتوف', 'ترك الوزن يرجع بقوة', 'الاعتماد على الدفعة'],
    },
  },
  {
    id: 'inclineFlyDB', group: 'chest',
    name: { en: 'Incline Chest Fly (Dumbbell)', ar: 'تفتيح صدر علوي بالدمبل' },
    muscles: { en: 'Upper chest', ar: 'أعلى الصدر' },
    equipment: { en: 'Dumbbells, incline bench', ar: 'دمبل ومقعد مائل' },
    cues: {
      en: ['Lie on a 30° incline with the dumbbells over your chest, palms facing.', 'Keep a soft bend in your elbows.', 'Open your arms in a wide arc until you feel a stretch.', 'Bring them back together over your chest, like hugging a tree.'],
      ar: ['انسدح على مقعد ٣٠ درجة والدمبل فوق صدرك والكفوف مقابلة.', 'خل الكوع منثني شوي.', 'افتح ذراعك بقوس واسع لين تحس بتمدد.', 'رجّعهم فوق صدرك كأنك تحضن شجرة.'],
    },
    mistakes: {
      en: ['Bending the elbows a lot, turning it into a press', 'Going too deep with heavy weight', 'Clanking the dumbbells at the top'],
      ar: ['تثني الكوع كثير فيصير بنش', 'تنزل زيادة بوزن ثقيل', 'تخبط الدمبلات فوق'],
    },
  },
  {
    id: 'shoulderPressM', group: 'shoulders',
    name: { en: 'Shoulder Press (Machine)', ar: 'ضغط أكتاف بالجهاز' },
    muscles: { en: 'Front and side delts, triceps', ar: 'الكتف الأمامي والجانبي، الترايسبس' },
    equipment: { en: 'Shoulder press machine', ar: 'جهاز ضغط الأكتاف' },
    cues: {
      en: ['Set the seat so the handles start at shoulder height.', 'Keep your back flat against the pad.', 'Press up until your arms are nearly locked.', 'Lower until your hands reach shoulder height.'],
      ar: ['عدّل الكرسي بحيث المقابض تبدأ عند كتوفك.', 'ظهرك لاصق بالمسند.', 'ادفع لفوق لين ذراعك تقريباً تنفرد.', 'نزّل لين يدك توصل مستوى كتفك.'],
    },
    mistakes: {
      en: ['Arching off the back pad', 'Slamming into lockout', 'Seat too high, so the range is short'],
      ar: ['تبعد ظهرك عن المسند', 'قفل الكوع بقوة', 'الكرسي عالي فتصير الحركة قصيرة'],
    },
  },
  {
    id: 'ohpCable', group: 'shoulders',
    name: { en: 'Overhead Press (Cable)', ar: 'ضغط أكتاف بالكيبل' },
    muscles: { en: 'Front and side delts, triceps', ar: 'الكتف الأمامي والجانبي، الترايسبس' },
    equipment: { en: 'Two low cable pulleys', ar: 'كيبلين من تحت' },
    cues: {
      en: ['Stand between the pulleys with the handles at shoulder height.', 'Brace your core and squeeze your glutes.', 'Press straight up until your arms lock overhead.', 'Lower back to shoulder height slowly.'],
      ar: ['قف بين الكيبلين والمقابض على مستوى كتوفك.', 'شد بطنك ومؤخرتك.', 'ادفع لفوق لين ذراعك تنفرد فوق راسك.', 'نزّل لمستوى الكتف ببطء.'],
    },
    mistakes: {
      en: ['Arching your lower back', 'Pressing forward instead of up', 'Partial reps'],
      ar: ['تقويس أسفل الظهر', 'الدفع لقدام بدل لفوق', 'نص حركة'],
    },
  },
  {
    id: 'lateralCable', group: 'shoulders',
    name: { en: 'Lateral Raise (Cable)', ar: 'رفرفة جانبي بالكيبل' },
    muscles: { en: 'Side delts', ar: 'الكتف الجانبي' },
    equipment: { en: 'Low cable pulley', ar: 'كيبل من تحت' },
    cues: {
      en: ['Stand side-on to the pulley with the handle in your far hand.', 'Keep a slight bend in the elbow and lean slightly away.', 'Raise your arm out to the side up to shoulder height.', 'Lower slowly across your body.'],
      ar: ['قف بجنبك للكيبل والمقبض باليد البعيدة.', 'كوعك منثني شوي ومِل شوي بعيد عن الجهاز.', 'ارفع ذراعك للجنب لين مستوى كتفك.', 'نزّل ببطء.'],
    },
    mistakes: {
      en: ['Going above shoulder height and shrugging', 'Swinging your torso', 'Leading with the hand instead of the elbow'],
      ar: ['رفع أعلى من الكتف مع رفع الترابيس', 'هز الجسم', 'ترفع باليد بدل الكوع'],
    },
  },
  {
    id: 'rearDeltCable', group: 'shoulders',
    name: { en: 'Rear Delt Reverse Fly (Cable)', ar: 'كتف خلفي بالكيبل' },
    muscles: { en: 'Rear delts, upper back', ar: 'الكتف الخلفي، أعلى الظهر' },
    equipment: { en: 'Two cable pulleys at shoulder height', ar: 'كيبلين على مستوى الكتف' },
    cues: {
      en: ['Cross the cables: left handle in your right hand and right handle in your left.', 'Keep your arms almost straight at shoulder height.', 'Pull your arms out wide until they line up with your shoulders.', 'Return slowly.'],
      ar: ['خالف الكيبلات: المقبض اليسار باليد اليمين والعكس.', 'ذراعك تقريباً مفرودة على مستوى الكتف.', 'افتح ذراعك للجنب لين تصير على خط كتوفك.', 'رجّع ببطء.'],
    },
    mistakes: {
      en: ['Bending the elbows into a row', 'Shrugging', 'Using momentum'],
      ar: ['تثني الكوع فيصير تجديف', 'رفع الكتوف', 'الاعتماد على الدفعة'],
    },
  },
  {
    id: 'shrugM', group: 'shoulders',
    name: { en: 'Shrug (Machine)', ar: 'ترابيس بالجهاز' },
    muscles: { en: 'Upper traps', ar: 'الترابيس العلوية' },
    equipment: { en: 'Shrug machine', ar: 'جهاز الترابيس' },
    cues: {
      en: ['Stand tall holding the handles with straight arms.', 'Lift your shoulders straight up toward your ears.', 'Hold for a second at the top.', 'Lower until you feel a stretch.'],
      ar: ['قف مستقيم وامسك المقابض وذراعك مفرودة.', 'ارفع كتوفك مستقيم لفوق باتجاه أذونك.', 'ثبّت ثانية فوق.', 'نزّل لين تحس بتمدد.'],
    },
    mistakes: {
      en: ['Rolling your shoulders', 'Bending your elbows', 'Bouncing'],
      ar: ['لف الكتوف', 'ثني الكوع', 'الترتيد'],
    },
  },
  {
    id: 'widePullup', group: 'back',
    name: { en: 'Wide Pull Up', ar: 'عقلة قبضة واسعة' },
    muscles: { en: 'Lats, upper back, biceps', ar: 'اللاتس، أعلى الظهر، البايسبس' },
    equipment: { en: 'Pull-up bar (plus weight belt)', ar: 'عقلة (وحزام أوزان)' },
    cues: {
      en: ['Grip wider than your shoulders and start from a dead hang.', 'Pull your shoulder blades down first.', 'Drive your elbows down toward your ribs until your chin passes the bar.', 'Lower all the way under control.'],
      ar: ['امسك أعرض من كتوفك وابدأ وأنت معلّق ذراعك مفرودة.', 'نزّل لوحي الكتف أول.', 'اسحب الكوع لتحت باتجاه الضلوع لين ذقنك يعدّي البار.', 'انزل للآخر بتحكم.'],
    },
    mistakes: {
      en: ['Kipping or swinging', 'Half reps without a full hang', 'Craning your neck to reach the bar'],
      ar: ['التأرجح', 'نص حركة بدون ما تفرد ذراعك', 'مد الرقبة عشان توصل البار'],
    },
  },
  {
    id: 'pulldownClose', group: 'back',
    name: { en: 'Lat Pulldown - Close Grip (Cable)', ar: 'سحب عالي قبضة ضيقة' },
    muscles: { en: 'Lats, biceps', ar: 'اللاتس، البايسبس' },
    equipment: { en: 'Lat pulldown, close-grip handle', ar: 'جهاز السحب مع مقبض ضيق' },
    cues: {
      en: ['Lock your thighs under the pad and lean back slightly.', 'Pull your shoulder blades down.', 'Drive your elbows down to bring the handle to your upper chest.', 'Let it rise until your arms are straight.'],
      ar: ['ثبّت فخذك تحت المسند ومِل لورا شوي.', 'نزّل لوحي الكتف.', 'اسحب الكوع لتحت لين المقبض يوصل أعلى صدرك.', 'خله يطلع لين ذراعك تنفرد.'],
    },
    mistakes: {
      en: ['Leaning far back', 'Pulling with the arms only', 'Not letting the arms straighten'],
      ar: ['الميلان لورا كثير', 'السحب بالذراع بس', 'ما تفرد ذراعك فوق'],
    },
  },
  {
    id: 'seatedRowM', group: 'back',
    name: { en: 'Seated Row (Machine)', ar: 'سحب أرضي بالجهاز' },
    muscles: { en: 'Mid back, lats, rear delts, biceps', ar: 'وسط الظهر، اللاتس، الكتف الخلفي، البايسبس' },
    equipment: { en: 'Seated row machine', ar: 'جهاز السحب الجالس' },
    cues: {
      en: ['Chest against the pad, arms reaching forward.', 'Pull the handles toward your stomach with your elbows close.', 'Squeeze your shoulder blades together.', 'Return slowly until your arms are straight.'],
      ar: ['صدرك على المسند وذراعك ممدودة لقدام.', 'اسحب المقابض باتجاه بطنك والكوع قريب.', 'اضغط لوحي الكتف على بعض.', 'رجّع ببطء لين ذراعك تنفرد.'],
    },
    mistakes: {
      en: ['Pulling your chest off the pad', 'Shrugging', 'Short reps'],
      ar: ['تبعد صدرك عن المسند', 'رفع الكتوف', 'حركة قصيرة'],
    },
  },
  {
    id: 'pendlayRow', group: 'back',
    name: { en: 'Pendlay Row (Barbell)', ar: 'تجديف بندلي بالبار' },
    muscles: { en: 'Upper back, lats, rear delts, biceps', ar: 'أعلى الظهر، اللاتس، الكتف الخلفي، البايسبس' },
    equipment: { en: 'Barbell', ar: 'بار' },
    cues: {
      en: ['Hinge until your torso is nearly parallel to the floor, back flat.', 'The bar starts on the floor every rep.', 'Pull explosively to your lower chest.', 'Lower the bar back to the floor and reset.'],
      ar: ['انحني لين ظهرك تقريباً موازي للأرض وهو مستقيم.', 'البار يبدأ من الأرض كل عدّة.', 'اسحب بقوة لأسفل صدرك.', 'رجّع البار للأرض وثبّت قبل العدّة الجاية.'],
    },
    mistakes: {
      en: ['Rounding your lower back', 'Standing up as you pull', 'Going too heavy with jerky reps'],
      ar: ['تقويس أسفل الظهر', 'ترفع جسمك وأنت تسحب', 'وزن ثقيل بحركة ناقصة'],
    },
  },
  {
    id: 'backExt', group: 'back',
    name: { en: 'Back Extension (Weighted Hyperextension)', ar: 'ظهر سفلي (هايبر بوزن)' },
    muscles: { en: 'Lower back, glutes, hamstrings', ar: 'أسفل الظهر، المؤخرة، الفخذ الخلفي' },
    equipment: { en: '45° hyperextension bench, plate', ar: 'مقعد هايبر ٤٥° وطارة' },
    cues: {
      en: ['Hip bone just above the pad, plate held to your chest.', 'Hinge down at the hips with a flat back.', 'Rise until your body forms a straight line.', 'Squeeze your glutes at the top without over-arching.'],
      ar: ['عظمة الحوض فوق المسند بشوي والطارة على صدرك.', 'انزل من الحوض وظهرك مستقيم.', 'اطلع لين جسمك يصير خط مستقيم.', 'اعصر مؤخرتك فوق بدون تقويس زيادة.'],
    },
    mistakes: {
      en: ['Over-arching at the top', 'Rounding quickly at the bottom', 'Pad set too high, blocking the hinge'],
      ar: ['تقويس زيادة فوق', 'تقويس الظهر تحت بسرعة', 'المسند عالي فيمنع الانحناء'],
    },
  },
  {
    id: 'curlCable', group: 'arms',
    name: { en: 'Bicep Curl (Cable)', ar: 'بايسبس بالكيبل' },
    muscles: { en: 'Biceps', ar: 'البايسبس' },
    equipment: { en: 'Low cable pulley with a bar', ar: 'كيبل من تحت مع بار' },
    cues: {
      en: ['Stand tall with your elbows pinned at your sides.', 'Curl the bar up by bending only at the elbow.', 'Squeeze at the top.', 'Lower slowly until your arms are straight.'],
      ar: ['قف مستقيم والكوع ثابت على جنبك.', 'ارفع البار بثني الكوع بس.', 'اعصر فوق.', 'نزّل ببطء لين تنفرد ذراعك.'],
    },
    mistakes: {
      en: ['Elbows drifting forward', 'Swinging your back', 'Cutting the bottom of the rep'],
      ar: ['الكوع يطلع لقدام', 'هز الظهر', 'ما تنزل للآخر'],
    },
  },
  {
    id: 'hammerCable', group: 'arms',
    name: { en: 'Hammer Curl (Cable)', ar: 'هامر بالكيبل' },
    muscles: { en: 'Brachialis, forearms, biceps', ar: 'البراكياليس، الساعد، البايسبس' },
    equipment: { en: 'Low cable pulley with a rope', ar: 'كيبل من تحت مع حبل' },
    cues: {
      en: ['Hold the rope with your palms facing each other.', 'Keep your elbows at your sides.', 'Curl up until your forearms are vertical.', 'Lower under control.'],
      ar: ['امسك الحبل والكفوف مقابلة بعض.', 'الكوع ثابت على جنبك.', 'ارفع لين الساعد يصير عمودي.', 'نزّل بتحكم.'],
    },
    mistakes: {
      en: ['Swinging', 'Elbows moving forward', 'Rushing the lowering'],
      ar: ['هز الجسم', 'الكوع يتحرك لقدام', 'تنزل بسرعة'],
    },
  },
  {
    id: 'preacherM', group: 'arms',
    name: { en: 'Preacher Curl (Machine)', ar: 'بايسبس بريتشر بالجهاز' },
    muscles: { en: 'Biceps', ar: 'البايسبس' },
    equipment: { en: 'Preacher curl machine', ar: 'جهاز البريتشر' },
    cues: {
      en: ['Set the seat so your armpits sit on top of the pad.', 'Keep the backs of your arms flat on the pad.', 'Curl up and squeeze.', 'Lower until your arms are almost straight.'],
      ar: ['عدّل الكرسي بحيث إبطك فوق المسند.', 'خل ظهر ذراعك لاصق بالمسند.', 'ارفع واعصر.', 'نزّل لين ذراعك تقريباً مفرودة.'],
    },
    mistakes: {
      en: ['Lifting your elbows off the pad', 'Dropping the weight fast', 'Seat too low'],
      ar: ['رفع الكوع عن المسند', 'تنزل الوزن بسرعة', 'الكرسي واطي'],
    },
  },
  {
    id: 'tricepsExtCable', group: 'arms',
    name: { en: 'Triceps Extension (Cable)', ar: 'ترايسبس بالكيبل' },
    muscles: { en: 'Triceps', ar: 'الترايسبس' },
    equipment: { en: 'High cable pulley, bar or rope', ar: 'كيبل من فوق مع بار أو حبل' },
    cues: {
      en: ['Stand close to the pulley and lean slightly forward.', 'Pin your elbows to your sides.', 'Push down until your arms are fully straight.', 'Let the handle rise to chest height slowly.'],
      ar: ['قف قريب من الكيبل ومِل لقدام شوي.', 'ثبّت الكوع على جنبك.', 'ادفع لتحت لين ذراعك تنفرد.', 'خل المقبض يطلع لمستوى صدرك ببطء.'],
    },
    mistakes: {
      en: ['Elbows moving or flaring', 'Leaning over to push with bodyweight', 'Short range'],
      ar: ['الكوع يتحرك أو ينفتح', 'تدفع بوزن جسمك', 'حركة قصيرة'],
    },
  },
  {
    id: 'kickbackCable', group: 'arms',
    name: { en: 'Cable Kickback', ar: 'ترايسبس كيك باك بالكيبل' },
    muscles: { en: 'Triceps', ar: 'الترايسبس' },
    equipment: { en: 'Low cable pulley', ar: 'كيبل من تحت' },
    cues: {
      en: ['Hinge forward with a flat back, upper arm parallel to the floor and pinned.', 'Extend your forearm back until the arm is straight.', 'Squeeze for a second.', 'Return slowly without moving the upper arm.'],
      ar: ['انحني لقدام وظهرك مستقيم، والعضد موازي للأرض وثابت.', 'افرد الساعد لورا لين ذراعك تنفرد.', 'اعصر ثانية.', 'رجّع ببطء بدون ما تحرك العضد.'],
    },
    mistakes: {
      en: ['Swinging the upper arm', 'Rounding your back', 'Going too heavy'],
      ar: ['تحريك العضد', 'تقويس الظهر', 'وزن ثقيل'],
    },
  },
  {
    id: 'legPress', group: 'legs',
    name: { en: 'Leg Press', ar: 'دفع رجل' },
    muscles: { en: 'Quads, glutes', ar: 'الفخذ الأمامي، المؤخرة' },
    equipment: { en: 'Leg press machine', ar: 'جهاز دفع الرجل' },
    cues: {
      en: ['Feet shoulder-width in the middle of the platform.', 'Lower the sled until your knees reach about 90° without your hips lifting.', 'Push through your whole foot.', 'Stop just short of locking your knees.'],
      ar: ['رجولك بعرض الكتف في نص المنصة.', 'نزّل لين الركبة تقريباً ٩٠ درجة بدون ما يرتفع حوضك.', 'ادفع بكامل القدم.', 'وقّف قبل ما تقفل الركبة.'],
    },
    mistakes: {
      en: ['Locking your knees at the top', 'Hips rolling off the seat at the bottom', 'Knees caving in'],
      ar: ['قفل الركبة فوق', 'الحوض يرتفع عن الكرسي تحت', 'الركب تدخل لداخل'],
    },
  },
  {
    id: 'bssDB', group: 'legs',
    name: { en: 'Bulgarian Split Squat (Dumbbell)', ar: 'بلغاري سكوات بالدمبل' },
    muscles: { en: 'Quads, glutes', ar: 'الفخذ الأمامي، المؤخرة' },
    equipment: { en: 'Dumbbells, bench', ar: 'دمبل ومقعد' },
    cues: {
      en: ['Rear foot on a bench, front foot far enough forward.', 'Dumbbells at your sides, torso tall.', 'Lower straight down until the back knee nearly touches the floor.', 'Drive up through your front heel.'],
      ar: ['رجلك الخلفية على المقعد والأمامية بعيدة لقدام بما يكفي.', 'الدمبل على جنبك وجسمك مستقيم.', 'انزل لتحت لين الركبة الخلفية تقرب من الأرض.', 'اطلع بالدفع من كعب الرجل الأمامية.'],
    },
    mistakes: {
      en: ['Front foot too close to the bench', 'Front knee caving in', 'Pushing off the back leg'],
      ar: ['الرجل الأمامية قريبة زيادة', 'الركبة الأمامية تدخل لداخل', 'تدفع بالرجل الخلفية'],
    },
  },
  {
    id: 'legExt', group: 'legs',
    name: { en: 'Leg Extension (Machine)', ar: 'رجل أمامي' },
    muscles: { en: 'Quads', ar: 'الفخذ الأمامي' },
    equipment: { en: 'Leg extension machine', ar: 'جهاز الرجل الأمامي' },
    cues: {
      en: ['Line your knees up with the pivot, pad on your lower shins.', 'Extend your legs until straight.', 'Squeeze your quads for a second.', 'Lower slowly.'],
      ar: ['ركبتك على خط المحور والمسند على أسفل الساق.', 'افرد رجلك لين تنفرد.', 'اعصر الفخذ ثانية.', 'نزّل ببطء.'],
    },
    mistakes: {
      en: ['Kicking the weight up', 'Lifting your hips', 'Dropping the weight'],
      ar: ['ترفس الوزن', 'ترفع الحوض', 'تنزّل الوزن بسرعة'],
    },
  },
  {
    id: 'seatedLegCurl', group: 'legs',
    name: { en: 'Seated Leg Curl (Machine)', ar: 'رجل خلفي جالس' },
    muscles: { en: 'Hamstrings', ar: 'الفخذ الخلفي' },
    equipment: { en: 'Seated leg curl machine', ar: 'جهاز الرجل الخلفي الجالس' },
    cues: {
      en: ['Line your knees up with the pivot, thigh pad snug.', 'Curl your heels down and back as far as you can.', 'Pause and squeeze.', 'Return slowly to nearly straight.'],
      ar: ['ركبتك على خط محور الجهاز ومسند الفخذ مثبّت.', 'اسحب كعبك لتحت ولورا لآخر شي.', 'ثبّت واعصر.', 'رجّع ببطء لين تقريباً تنفرد.'],
    },
    mistakes: {
      en: ['Lifting your hips', 'Fast negatives', 'Partial range'],
      ar: ['رفع الحوض', 'ترجع بسرعة', 'حركة ناقصة'],
    },
  },
  {
    id: 'lyingLegCurl', group: 'legs',
    name: { en: 'Lying Leg Curl (Machine)', ar: 'رجل خلفي منبطح' },
    muscles: { en: 'Hamstrings', ar: 'الفخذ الخلفي' },
    equipment: { en: 'Lying leg curl machine', ar: 'جهاز الرجل الخلفي المنبطح' },
    cues: {
      en: ['Lie face down with your knees just off the pad, roller above your heels.', 'Keep your hips pressed into the bench.', 'Curl your heels toward your glutes.', 'Lower slowly.'],
      ar: ['انبطح وركبتك طالعة شوي عن طرف المسند، والمسند فوق كعبك.', 'خل حوضك لاصق بالمقعد.', 'اسحب كعبك باتجاه مؤخرتك.', 'نزّل ببطء.'],
    },
    mistakes: {
      en: ['Hips lifting off the pad', 'Jerking the weight', 'Not extending fully'],
      ar: ['الحوض يرتفع', 'تسحب بقوة مفاجئة', 'ما تفرد للآخر'],
    },
  },
  {
    id: 'hipAbd', group: 'legs',
    name: { en: 'Hip Abduction (Machine)', ar: 'أبدكتور (فتح الحوض)' },
    muscles: { en: 'Glute medius, outer hips', ar: 'المؤخرة الجانبية، الحوض الخارجي' },
    equipment: { en: 'Hip abduction machine', ar: 'جهاز الأبدكتور' },
    cues: {
      en: ['Sit with your back against the pad, pads on the outside of your knees.', 'Push your knees out as wide as you can.', 'Pause at the end.', 'Return slowly without letting the weights touch.'],
      ar: ['اجلس وظهرك على المسند والمساند على الجهة الخارجية لركبك.', 'افتح ركبك لآخر شي.', 'ثبّت ثانية.', 'رجّع ببطء بدون ما تلمس الأوزان بعض.'],
    },
    mistakes: {
      en: ['Using momentum', 'Rocking forward and back', 'Short range'],
      ar: ['الاعتماد على الدفعة', 'تتحرك لقدام ولورا', 'حركة قصيرة'],
    },
  },
  {
    id: 'calfPress', group: 'legs',
    name: { en: 'Calf Press (Machine)', ar: 'سمانة بجهاز الدفع' },
    muscles: { en: 'Calves', ar: 'السمانة' },
    equipment: { en: 'Leg press machine', ar: 'جهاز دفع الرجل' },
    cues: {
      en: ['Sit in the leg press with straight legs, balls of your feet on the bottom edge of the platform.', 'Let your heels drop for a deep stretch.', 'Push through the balls of your feet as far as you can.', 'Pause, then lower slowly.'],
      ar: ['اجلس بجهاز الدفع ورجلك مفرودة، ومقدمة القدم على طرف المنصة.', 'خل كعبك ينزل لين تحس بتمدد.', 'ادفع بمقدمة القدم لآخر شي.', 'ثبّت ثانية ثم نزّل ببطء.'],
    },
    mistakes: {
      en: ['Bouncing', 'Bending your knees', 'Short range'],
      ar: ['الترتيد', 'ثني الركبة', 'حركة قصيرة'],
    },
  },
  {
    id: 'cableCrunch', group: 'core',
    name: { en: 'Cable Crunch', ar: 'بطن بالكيبل' },
    muscles: { en: 'Abs', ar: 'البطن' },
    equipment: { en: 'High cable pulley with a rope', ar: 'كيبل من فوق مع حبل' },
    cues: {
      en: ['Kneel facing the pulley with the rope beside your head.', 'Keep your hips still.', 'Crunch down by curling your ribs toward your hips.', 'Return slowly without letting the stack pull you up.'],
      ar: ['اركع مقابل الكيبل والحبل جنب راسك.', 'خل حوضك ثابت.', 'انحني بلف ضلوعك باتجاه حوضك.', 'ارجع ببطء بدون ما يسحبك الوزن.'],
    },
    mistakes: {
      en: ['Sitting back with your hips instead of crunching', 'Pulling with your arms', 'Going too heavy'],
      ar: ['تجلس على كعبك بدل ما تنحني بالبطن', 'تسحب بذراعك', 'وزن ثقيل'],
    },
  },
  {
    id: 'hangingLegRaise', group: 'core',
    name: { en: 'Hanging Leg Raise', ar: 'رفع رجلين معلّق' },
    muscles: { en: 'Abs, hip flexors', ar: 'البطن، عضلات الحوض الأمامية' },
    equipment: { en: 'Pull-up bar', ar: 'عقلة' },
    cues: {
      en: ['Hang with straight arms and active shoulders.', 'Raise your legs by curling your pelvis up, not just lifting your legs.', 'Bring your legs to at least hip height.', 'Lower slowly without swinging.'],
      ar: ['تعلّق وذراعك مفرودة وكتوفك مشدودة.', 'ارفع رجولك بلف الحوض لفوق مو بس رفع الرجل.', 'وصّل رجولك لمستوى الحوض على الأقل.', 'نزّل ببطء بدون تأرجح.'],
    },
    mistakes: {
      en: ['Swinging', 'Dropping your legs fast', 'Lifting with the hip flexors only, no pelvic curl'],
      ar: ['التأرجح', 'تنزّل رجولك بسرعة', 'ترفع بالحوض بس بدون لف'],
    },
  },
];

export const EX_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function exName(id: string, lang: Lang, custom: Record<string, string>): string {
  const e = EX_BY_ID[id];
  if (e) return e.name[lang];
  return custom[id] ?? id.replace(/^c:/, '');
}

/** English name, used as a secondary label and for video search */
export function exNameEn(id: string, custom: Record<string, string>): string {
  const e = EX_BY_ID[id];
  return e ? e.name.en : custom[id] ?? id.replace(/^c:/, '');
}

export function videoSearchUrl(id: string, custom: Record<string, string>): string {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(exNameEn(id, custom) + ' proper form');
}

export const GROUP_ORDER: Group[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'];
