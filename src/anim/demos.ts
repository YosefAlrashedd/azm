import type { Demo, FrontPose, Prop, SidePose, V2 } from './rig';

/** Ground is y = 171. Standing: ankle y 167, hip y 89, shoulder y 43. Figure faces right. */
const ANK = 167;

const floorBench = (x: number, y: number, w: number, h = 7): Prop[] => [
  { t: 'rect', x, y, w, h, r: 3 },
  { t: 'line', a: [x + 8, y + h], b: [x + 8, 171], w: 4 },
  { t: 'line', a: [x + w - 8, y + h], b: [x + w - 8, 171], w: 4 },
];
const seat = (x: number, w: number, y = 127): Prop[] => [
  { t: 'rect', x, y, w, h: 6, r: 3 },
  { t: 'line', a: [x + w / 2, y + 6], b: [x + w / 2, 171], w: 4 },
];
const stand = (over: Partial<SidePose> = {}): SidePose => ({
  hip: [100, 89], torso: 0, armN: { fk: [0, 0] }, legN: { ik: [100, ANK] }, legF: { ik: [100, ANK] }, ...over,
});
// standard timings: lift, pause, lower, rest
const T = (lift: number, top: number, lower: number, bottom: number) => [lift, top, lower, bottom];

const front = (o: Partial<FrontPose>): FrontPose => ({
  cx: 110, hipY: 89,
  armL: { abd: 6 }, armR: { abd: 6 }, legL: { abd: 5 }, legR: { abd: 5 }, ...o,
});

// ---------- chest ----------
const benchTop: SidePose = { hip: [112, 117], torso: -90, armN: { ik: [68, 66] }, legN: { ik: [146, ANK] }, legF: { ik: [146, ANK] } };
const benchBot: SidePose = { ...benchTop, armN: { ik: [77, 100] } };

const incHip: V2 = [114, 119];
const incTop: SidePose = { hip: incHip, torso: -55, armN: { ik: [80, 41] }, legN: { ik: [152, ANK] }, legF: { ik: [152, ANK] } };
const incBot: SidePose = { ...incTop, armN: { ik: [88, 81] } };

const pecOpen = front({ hipY: 118, seated: true, armL: { abd: 90, hz: 0, elbow: 90 }, armR: { abd: 90, hz: 0, elbow: 90 } });
const pecClosed = front({ hipY: 118, seated: true, armL: { abd: 90, hz: 80, elbow: 90 }, armR: { abd: 90, hz: 80, elbow: 90 } });

const flyOpen = front({ hipY: 104, seated: true, armL: { abd: 96, elbow: 10 }, armR: { abd: 96, elbow: 10 } });
const flyClosed = front({ hipY: 104, seated: true, armL: { abd: 168, elbow: 4 }, armR: { abd: 168, elbow: 4 } });

// ---------- shoulders ----------
const spHip: V2 = [93, 121];
const spBot: SidePose = { hip: spHip, torso: -4, armN: { ik: [104, 72] }, legN: { ik: [132, ANK] }, legF: { ik: [132, ANK] } };
const spTop: SidePose = { ...spBot, armN: { ik: [97, 23] } };

const ohpBot = stand({ torso: -3, armN: { ik: [111, 41] } });
const ohpTop = stand({ torso: -3, armN: { ik: [101, -10] } });

const latDown = front({ armL: { abd: 25, elbow: -50 }, armR: { abd: 10, elbow: 6 } });
const latUp = front({ armL: { abd: 25, elbow: -50 }, armR: { abd: 88, elbow: 8 } });

const rdIn = front({ legL: { abd: 7 }, legR: { abd: 7 }, armL: { abd: 90, hz: 112, elbow: 4 }, armR: { abd: 90, hz: 112, elbow: 4 } });
const rdOut = front({ legL: { abd: 7 }, legR: { abd: 7 }, armL: { abd: 90, hz: 0, elbow: 4 }, armR: { abd: 90, hz: 0, elbow: 4 } });

const shrugDown = front({ armL: { abd: 9 }, armR: { abd: 9 }, shrug: 0 });
const shrugUp = front({ armL: { abd: 9 }, armR: { abd: 9 }, shrug: 8 });

// ---------- back ----------
const puDown = front({ hipY: 83.8, legL: { abd: 3 }, legR: { abd: 3 }, armL: { abd: 160, elbow: 0 }, armR: { abd: 160, elbow: 0 } });
const puUp = front({ hipY: 44.2, legL: { abd: 3 }, legR: { abd: 3 }, armL: { abd: 60, elbow: 134.4 }, armR: { abd: 60, elbow: 134.4 } });

const pdHip: V2 = [92, 121];
const pdTop: SidePose = { hip: pdHip, torso: -15, armN: { ik: [90, 24] }, legN: { ik: [138, ANK] }, legF: { ik: [138, ANK] } };
const pdBot: SidePose = { ...pdTop, torso: -18, armN: { ik: [93, 84] } };

const rowHip: V2 = [88, 121];
const rowOut: SidePose = { hip: rowHip, torso: 4, armN: { ik: [142, 88] }, legN: { ik: [138, ANK] }, legF: { ik: [138, ANK] } };
const rowIn: SidePose = { ...rowOut, torso: 0, armN: { ik: [104, 92] } };

const pendBot: SidePose = { hip: [86, 108], torso: 80, head: -12, armN: { ik: [134, 154] }, legN: { ik: [106, ANK] }, legF: { ik: [102, ANK] } };
const pendTop: SidePose = { ...pendBot, armN: { ik: [122, 112] } };

const beHip: V2 = [112, 100];
const beArms = { fk: [10, 165] as [number, number], rel: true };
const beTop: SidePose = { hip: beHip, torso: 42, armN: beArms, legN: { ik: [60, 152] }, legF: { ik: [60, 152] }, footN: 110 };
const beBot: SidePose = { ...beTop, torso: 160 };

// ---------- arms ----------
const curlDown = stand({ armN: { fk: [4, 6] } });
const curlUp = stand({ armN: { fk: [6, 145] } });
const hamUp = stand({ armN: { fk: [6, 132] } });

const prHip: V2 = [86, 121];
const prDown: SidePose = { hip: prHip, torso: 12, armN: { fk: [48, 64] }, legN: { ik: [124, ANK] }, legF: { ik: [124, ANK] } };
const prUp: SidePose = { ...prDown, armN: { fk: [48, 172] } };

const teTop = stand({ hip: [96, 89], torso: 10, armN: { fk: [2, 120] }, legN: { ik: [100, ANK] }, legF: { ik: [100, ANK] } });
const teBot = stand({ hip: [96, 89], torso: 10, armN: { fk: [2, 4] }, legN: { ik: [100, ANK] }, legF: { ik: [100, ANK] } });

const kbDown: SidePose = { hip: [88, 96], torso: 72, head: -10, armN: { fk: [-62, 0] }, armF: { fk: [28, 18] }, legN: { ik: [118, ANK] }, legF: { ik: [80, ANK] } };
const kbBack: SidePose = { ...kbDown, armN: { fk: [-62, -64] } };

// ---------- legs ----------
const lpHip: V2 = [82, 128];
const lpDir: V2 = [Math.cos((-40 * Math.PI) / 180), Math.sin((-40 * Math.PI) / 180)];
const lpAt = (d: number): V2 => [lpHip[0] + lpDir[0] * d, lpHip[1] + lpDir[1] * d];
const lpOut: SidePose = { hip: lpHip, torso: -55, armN: { fk: [22, 64] }, legN: { ik: lpAt(75) }, legF: { ik: lpAt(75) }, footN: -130, footF: -130 };
const lpIn: SidePose = { ...lpOut, legN: { ik: lpAt(52) }, legF: { ik: lpAt(52) } };

const bssTop: SidePose = { hip: [99, 94], torso: 8, armN: { fk: [0, 0] }, legN: { ik: [126, ANK] }, legF: { ik: [66, 116] }, footF: 160 };
const bssBot: SidePose = { ...bssTop, hip: [92, 122], torso: 10 };

const leHip: V2 = [90, 121];
const leDown: SidePose = { hip: leHip, torso: -8, armN: { fk: [8, 40] }, legN: { fk: [90, 5] }, legF: { fk: [90, 5] }, footN: 0, footF: 0 };
const leUp: SidePose = { ...leDown, legN: { fk: [90, 84] }, legF: { fk: [90, 84] }, footN: -80, footF: -80 };

const slcHip: V2 = [88, 121];
const slcOut: SidePose = { hip: slcHip, torso: -10, armN: { fk: [10, 55] }, legN: { fk: [90, 72] }, legF: { fk: [90, 72] }, footN: -70, footF: -70 };
const slcIn: SidePose = { ...slcOut, legN: { fk: [90, -25] }, legF: { fk: [90, -25] }, footN: -10, footF: -10 };

const llcHip: V2 = [114, 112];
const llcOut: SidePose = { hip: llcHip, torso: -90, head: -8, flip: true, armN: { ik: [52, 138] }, legN: { fk: [90, 90] }, legF: { fk: [90, 90] }, footN: 80, footF: 80, far: [-3, -2] };
const llcIn: SidePose = { ...llcOut, legN: { fk: [90, 172] }, legF: { fk: [90, 172] }, footN: 10, footF: 10 };

const abdIn = front({ hipY: 118, seated: true, armL: { abd: 18, elbow: 25 }, armR: { abd: 18, elbow: 25 }, legL: { abd: 0, spread: 4 }, legR: { abd: 0, spread: 4 } });
const abdOut = front({ hipY: 118, seated: true, armL: { abd: 18, elbow: 25 }, armR: { abd: 18, elbow: 25 }, legL: { abd: 0, spread: 42 }, legR: { abd: 0, spread: 42 } });

const cpHip: V2 = [84, 126];
const cpDir: V2 = [Math.cos((-35 * Math.PI) / 180), Math.sin((-35 * Math.PI) / 180)];
const cpAnk: V2 = [cpHip[0] + cpDir[0] * 76, cpHip[1] + cpDir[1] * 76];
const cpDown: SidePose = { hip: cpHip, torso: -60, armN: { fk: [12, 52] }, legN: { ik: cpAnk }, legF: { ik: cpAnk }, footN: -128, footF: -128 };
const cpUp: SidePose = { ...cpDown, footN: -100, footF: -100 };

// ---------- core ----------
const ccArms = { fk: [150, -20] as [number, number], rel: true };
const ccUp: SidePose = { hip: [112, 127], torso: 5, armN: ccArms, legN: { fk: [0, -90] }, legF: { fk: [0, -90] }, footN: 180, footF: 180 };
const ccDown: SidePose = { ...ccUp, torso: 72 };

const hlrDown: SidePose = { hip: [100, 77], torso: 0, armN: { ik: [100, -22] }, legN: { fk: [0, 0] }, legF: { fk: [0, 0] }, footN: 62, footF: 62 };
const hlrUp: SidePose = { ...hlrDown, torso: -8, legN: { fk: [92, 86] }, legF: { fk: [92, 86] }, footN: -10, footF: -10 };

export const DEMOS: Record<string, Demo> = {
  benchBB: {
    view: 'side', frames: [benchTop, benchBot, benchBot, benchTop], durs: T(1300, 200, 900, 400),
    back: floorBench(36, 124, 102), front: [{ t: 'barbell', at: 'handN', r: 12 }], hl: ['chest', 'triceps', 'shoulders'],
  },
  inclineBB: {
    view: 'side', frames: [incTop, incBot, incBot, incTop], durs: T(1300, 200, 900, 400),
    back: [{ t: 'line', a: [110, 131], b: [62, 98], w: 8, tone: 'propSoft' }, { t: 'rect', x: 104, y: 127, w: 32, h: 6 }, { t: 'line', a: [92, 118], b: [92, 171], w: 4 }, { t: 'line', a: [128, 133], b: [128, 171], w: 4 }],
    front: [{ t: 'barbell', at: 'handN', r: 12 }], hl: ['chest', 'shoulders', 'triceps'],
  },
  pecDeck: {
    view: 'front', frames: [pecOpen, pecClosed, pecClosed, pecOpen], durs: T(1000, 300, 1300, 300),
    back: [{ t: 'rect', x: 94, y: 60, w: 32, h: 62 }, { t: 'rect', x: 92, y: 122, w: 36, h: 6 }, { t: 'line', a: [110, 128], b: [110, 171], w: 4 }],
    front: [{ t: 'grip', at: 'handL' }, { t: 'grip', at: 'handR' }], hl: ['chest'],
  },
  inclineFlyDB: {
    view: 'front', frames: [flyOpen, flyClosed, flyClosed, flyOpen], durs: T(1100, 200, 1400, 300),
    back: [{ t: 'rect', x: 93, y: 40, w: 34, h: 70 }, { t: 'rect', x: 92, y: 108, w: 36, h: 6 }, { t: 'line', a: [110, 114], b: [110, 171], w: 4 }],
    front: [{ t: 'dumbbell', at: 'handL' }, { t: 'dumbbell', at: 'handR' }], hl: ['chest'],
  },
  shoulderPressM: {
    view: 'side', frames: [spBot, spTop, spTop, spBot], durs: T(1000, 200, 1300, 300),
    back: [{ t: 'line', a: [80, 126], b: [76, 62], w: 8, tone: 'propSoft' }, ...seat(74, 36)],
    front: [{ t: 'grip', at: 'handN' }], hl: ['shoulders', 'triceps'],
  },
  ohpCable: {
    view: 'side', frames: [ohpBot, ohpTop, ohpTop, ohpBot], durs: T(1000, 200, 1300, 300),
    back: [], front: [{ t: 'cable', from: [116, 164], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['shoulders', 'triceps'],
  },
  lateralCable: {
    view: 'front', frames: [latDown, latUp, latUp, latDown], durs: T(1000, 250, 1400, 300),
    back: [], front: [{ t: 'cable', from: [40, 164], to: 'handR' }, { t: 'grip', at: 'handR' }], hl: ['shoulders'],
  },
  rearDeltCable: {
    view: 'front', frames: [rdIn, rdOut, rdOut, rdIn], durs: T(1000, 250, 1400, 300),
    back: [], front: [{ t: 'cable', from: [12, 43], to: 'handR' }, { t: 'cable', from: [208, 43], to: 'handL' }], hl: ['rearDelt'],
  },
  shrugM: {
    view: 'front', frames: [shrugDown, shrugUp, shrugUp, shrugDown], durs: T(700, 500, 900, 300),
    back: [], front: [{ t: 'grip', at: 'handL' }, { t: 'grip', at: 'handR' }], hl: ['traps'],
  },
  widePullup: {
    view: 'front', frames: [puDown, puUp, puUp, puDown], durs: T(1100, 250, 1500, 300),
    back: [{ t: 'line', a: [62, -12], b: [158, -12], w: 4 }], hl: ['lats', 'biceps'],
  },
  pulldownClose: {
    view: 'side', frames: [pdTop, pdBot, pdBot, pdTop], durs: T(1000, 250, 1400, 300),
    back: [...seat(76, 34), { t: 'circle', c: [124, 112], r: 6, tone: 'propSoft' }, { t: 'line', a: [124, 112], b: [150, 112], w: 4 }, { t: 'line', a: [150, -22], b: [150, 171], w: 5, tone: 'propSoft' }],
    front: [{ t: 'cable', from: [98, -18], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['lats', 'biceps'],
  },
  seatedRowM: {
    view: 'side', frames: [rowOut, rowIn, rowIn, rowOut], durs: T(1000, 300, 1400, 300),
    back: [...seat(68, 38), { t: 'rect', x: 99, y: 80, w: 7, h: 38, tone: 'propSoft' }, { t: 'line', a: [102, 118], b: [102, 171], w: 4 }],
    front: [{ t: 'lever', from: [152, 30], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['midBack', 'lats', 'rearDelt', 'biceps'],
  },
  pendlayRow: {
    view: 'side', frames: [pendBot, pendTop, pendBot, pendBot], durs: [450, 900, 400, 400],
    back: [], front: [{ t: 'barbell', at: 'handN', r: 14 }], hl: ['midBack', 'lats', 'rearDelt', 'biceps'],
  },
  backExt: {
    view: 'side', frames: [beBot, beTop, beTop, beBot], durs: T(1200, 300, 1400, 300),
    back: [{ t: 'line', a: [52, 166], b: [124, 108], w: 4 }, { t: 'line', a: [124, 108], b: [128, 171], w: 4 }, { t: 'circle', c: [118, 107], r: 7, tone: 'propSoft' }, { t: 'circle', c: [57, 157], r: 6, tone: 'propSoft' }],
    front: [{ t: 'plate', at: 'handN' }], hl: ['lowerBack', 'glutes', 'hamstrings'],
  },
  curlCable: {
    view: 'side', frames: [curlDown, curlUp, curlUp, curlDown], durs: T(900, 250, 1300, 300),
    back: [], front: [{ t: 'cable', from: [148, 163], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['biceps'],
  },
  hammerCable: {
    view: 'side', frames: [curlDown, hamUp, hamUp, curlDown], durs: T(900, 250, 1300, 300),
    back: [], front: [{ t: 'cable', from: [148, 163], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['biceps', 'forearms'],
  },
  preacherM: {
    view: 'side', frames: [prDown, prUp, prUp, prDown], durs: T(900, 250, 1400, 300),
    back: [...seat(64, 38), { t: 'line', a: [97, 87], b: [121, 107], w: 8, tone: 'propSoft' }, { t: 'line', a: [112, 104], b: [112, 171], w: 4 }],
    front: [{ t: 'lever', from: [116, 95], to: 'handN', w: 4 }, { t: 'grip', at: 'handN' }], hl: ['biceps'],
  },
  tricepsExtCable: {
    view: 'side', frames: [teTop, teBot, teBot, teTop], durs: T(900, 250, 1300, 300),
    back: [], front: [{ t: 'cable', from: [124, -20], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['triceps'],
  },
  kickbackCable: {
    view: 'side', frames: [kbDown, kbBack, kbBack, kbDown], durs: T(800, 300, 1200, 300),
    back: [], front: [{ t: 'cable', from: [152, 163], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['triceps'],
  },
  legPress: {
    view: 'side', frames: [lpOut, lpIn, lpIn, lpOut], durs: T(1400, 200, 1000, 300),
    back: [{ t: 'line', a: [108, 152], b: [204, 71], w: 3, tone: 'propSoft' }, { t: 'line', a: [84, 137], b: [36, 106], w: 8, tone: 'propSoft' }, ...seat(58, 40, 133)],
    front: [{ t: 'platform', at: 'ankleN', angle: -130, len: 46, off: [0, -8] }], hl: ['quads', 'glutes'],
  },
  bssDB: {
    view: 'side', frames: [bssTop, bssBot, bssBot, bssTop], durs: T(1400, 200, 1000, 300),
    back: floorBench(34, 121, 42), front: [{ t: 'dumbbell', at: 'handN' }], hl: ['quads', 'glutes'],
  },
  legExt: {
    view: 'side', frames: [leDown, leUp, leUp, leDown], durs: T(900, 300, 1400, 300),
    back: [{ t: 'line', a: [66, 126], b: [60, 78], w: 8, tone: 'propSoft' }, ...seat(62, 46)],
    front: [{ t: 'lever', from: [130, 121], to: 'ankleN', w: 4 }, { t: 'roller', at: 'ankleN', r: 6.5 }], hl: ['quads'],
  },
  seatedLegCurl: {
    view: 'side', frames: [slcOut, slcIn, slcIn, slcOut], durs: T(900, 300, 1400, 300),
    back: [{ t: 'line', a: [64, 126], b: [56, 80], w: 8, tone: 'propSoft' }, ...seat(60, 44), { t: 'rect', x: 106, y: 105, w: 24, h: 7 }],
    front: [{ t: 'lever', from: [128, 121], to: 'ankleN', w: 4 }, { t: 'roller', at: 'ankleN', r: 6.5 }], hl: ['hamstrings'],
  },
  lyingLegCurl: {
    view: 'side', frames: [llcOut, llcIn, llcIn, llcOut], durs: T(900, 300, 1400, 300),
    back: floorBench(46, 119, 98), front: [{ t: 'lever', from: [154, 112], to: 'ankleN', w: 4 }, { t: 'roller', at: 'ankleN', r: 6.5 }], hl: ['hamstrings', 'glutes'],
  },
  hipAbd: {
    view: 'front', frames: [abdIn, abdOut, abdOut, abdIn], durs: T(900, 300, 1300, 300),
    back: [{ t: 'rect', x: 94, y: 62, w: 32, h: 60 }, { t: 'rect', x: 90, y: 122, w: 40, h: 6 }, { t: 'line', a: [110, 128], b: [110, 171], w: 4 }],
    front: [{ t: 'roller', at: 'kneeL', r: 5 }, { t: 'roller', at: 'kneeR', r: 5 }], hl: ['abductors', 'glutes'],
  },
  calfPress: {
    view: 'side', frames: [cpDown, cpUp, cpUp, cpDown], durs: T(700, 400, 1000, 400),
    back: [{ t: 'line', a: [104, 146], b: [190, 86], w: 3, tone: 'propSoft' }, { t: 'line', a: [84, 134], b: [38, 108], w: 8, tone: 'propSoft' }, ...seat(60, 40, 131)],
    front: [{ t: 'platform', at: 'toeN', angle: -125, len: 42, off: [0, 0] }], hl: ['calves'],
  },
  cableCrunch: {
    view: 'side', frames: [ccUp, ccDown, ccDown, ccUp], durs: T(1000, 300, 1300, 300),
    back: [], front: [{ t: 'cable', from: [150, -20], to: 'handN' }, { t: 'grip', at: 'handN' }], hl: ['abs'],
  },
  hangingLegRaise: {
    view: 'side', frames: [hlrDown, hlrUp, hlrUp, hlrDown], durs: T(1100, 300, 1500, 300),
    back: [{ t: 'rect', x: 62, y: -26, w: 76, h: 4, tone: 'prop' }], hl: ['abs'],
  },
};
