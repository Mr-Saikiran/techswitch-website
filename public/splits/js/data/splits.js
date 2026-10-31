// Training split catalog. Each split's build(days, profile) returns the week
// as a list of days, and each day is an ordered list of movement-pattern slots
// (see WS.PATTERNS). The engine then picks exercises, sets and reps.
//
// fit.goals / fit.level are 0-5 suitability scores used by the recommender.
(function (WS) {
  const D = (name, slots, mode) => ({ name, slots, mode });

  // Which patterns to add for a specialization focus.
  WS.FOCUS = {
    chest: { label: 'Chest', muscles: ['chest'], slots: ['inclinePress', 'chestFly'] },
    back: { label: 'Back / lats', muscles: ['back'], slots: ['verticalPull', 'horizontalRow'] },
    shoulders: { label: 'Shoulders', muscles: ['shoulders'], slots: ['lateralRaise', 'rearDelt'] },
    arms: { label: 'Arms', muscles: ['biceps', 'triceps'], slots: ['bicepCurl', 'tricepExt'] },
    glutes: { label: 'Glutes', muscles: ['glutes'], slots: ['hipThrust', 'gluteIso'] },
    legs: { label: 'Legs (quads & hamstrings)', muscles: ['quads', 'hamstrings'], slots: ['squat', 'legCurl'] },
    core: { label: 'Core / abs', muscles: ['core'], slots: ['core'] },
  };

  const upperLower = () => [
    D('Upper A', ['horizontalPress', 'horizontalRow', 'verticalPress', 'verticalPull', 'bicepCurl', 'tricepExt']),
    D('Lower A', ['squat', 'hinge', 'kneeExt', 'calf', 'core']),
    D('Upper B', ['inclinePress', 'verticalPull', 'horizontalRow', 'lateralRaise', 'chestFly', 'tricepExt', 'bicepCurl']),
    D('Lower B', ['squat', 'legCurl', 'hipThrust', 'lunge', 'calf', 'core']),
  ];

  const ulppl = () => [
    D('Upper', ['horizontalPress', 'horizontalRow', 'verticalPress', 'verticalPull', 'bicepCurl', 'tricepExt']),
    D('Lower', ['squat', 'hinge', 'legCurl', 'calf', 'core']),
    D('Push', ['inclinePress', 'verticalPress', 'chestFly', 'lateralRaise', 'tricepExt']),
    D('Pull', ['verticalPull', 'horizontalRow', 'pullover', 'rearDelt', 'bicepCurl']),
    D('Legs', ['lunge', 'hipThrust', 'kneeExt', 'legCurl', 'calf']),
  ];

  WS.SPLITS = [
    {
      id: 'full-body', name: 'Full Body', category: 'Classic', days: [2, 3, 4, 5],
      summary: 'Every major muscle, every session. The evidence-backed default for beginners, busy people and older lifters.',
      bestFor: 'Beginners, 2–3 days/week, busy schedules, older adults, recomposition',
      pros: ['Each muscle trained 2–5× per week', 'Missing a day costs little', 'Lots of practice on the main lifts'],
      cons: ['Sessions can run long', 'Less room for lots of exercises per muscle'],
      evidence: 'Training each muscle at least twice a week produced more hypertrophy than once a week, and frequency helps strength gains too.',
      refs: ['freq2016', 'strengthFreq2018'],
      fit: { goals: { muscle: 4, strength: 4, fatloss: 5, recomp: 5, general: 5, athletic: 4 }, level: { beginner: 5, intermediate: 4, advanced: 3 } },
      build(days) {
        const A = () => D('Full Body A', ['squat', 'horizontalPress', 'horizontalRow', 'legCurl', 'lateralRaise', 'tricepExt', 'core']);
        const B = () => D('Full Body B', ['hinge', 'verticalPull', 'inclinePress', 'lunge', 'calf', 'bicepCurl', 'core']);
        const C = () => D('Full Body C', ['squat', 'verticalPress', 'horizontalRow', 'hipThrust', 'chestFly', 'rearDelt', 'bicepCurl']);
        const week = { 2: [A(), B()], 3: [A(), B(), C()], 4: [A(), B(), C(), B()], 5: [A(), B(), C(), A(), B()] }[days];
        const letters = 'ABCDE';
        if (days > 3) week.forEach((d, i) => (d.name = 'Full Body ' + letters[i]));
        return week;
      },
    },
    {
      id: 'upper-lower', name: 'Upper / Lower', category: 'Classic', days: [2, 4],
      summary: 'Alternate upper-body and lower-body days. Each muscle twice a week with shorter, focused sessions.',
      bestFor: 'Intermediates, 4 days/week, muscle and strength',
      pros: ['2× frequency with manageable sessions', 'Easy to schedule (Mon/Tue/Thu/Fri)', 'Great balance of volume and recovery'],
      cons: ['Lower days are tiring', 'At 2 days/week each muscle is trained only once'],
      evidence: 'Hits the 2× per week frequency associated with better hypertrophy and strength, with enough room for 10–20 weekly sets per muscle.',
      refs: ['freq2016', 'volume2017'],
      fit: { goals: { muscle: 5, strength: 5, fatloss: 4, recomp: 5, general: 4, athletic: 4 }, level: { beginner: 4, intermediate: 5, advanced: 4 } },
      build(days) {
        const w = upperLower();
        return days === 2 ? [w[0], w[1]] : w;
      },
    },
    {
      id: 'ppl', name: 'Push / Pull / Legs', category: 'Classic', days: [3, 6],
      summary: 'Pushing muscles, pulling muscles, then legs. Run it once (3 days) or twice (6 days) a week.',
      bestFor: 'Intermediate to advanced lifters who enjoy training often (6 days), or a simple 3-day rotation',
      pros: ['Groups muscles that work together', 'At 6 days: 2× frequency and high volume', 'Very popular, so lots of resources'],
      cons: ['At 3 days each muscle is trained only once', '6 days needs good recovery and time'],
      evidence: 'The 6-day version meets the 2× frequency recommendation; the 3-day version is closer to a once-a-week split.',
      refs: ['freq2016', 'pelland2024'],
      fit: { goals: { muscle: 5, strength: 3, fatloss: 3, recomp: 4, general: 2, athletic: 3 }, level: { beginner: 2, intermediate: 5, advanced: 5 } },
      build(days) {
        const push = (n) => D('Push ' + n, ['horizontalPress', 'inclinePress', 'verticalPress', 'lateralRaise', 'tricepExt', 'chestFly']);
        const pull = (n) => D('Pull ' + n, ['verticalPull', 'horizontalRow', 'pullover', 'rearDelt', 'bicepCurl', 'core']);
        const legsA = D('Legs A', ['squat', 'hinge', 'legCurl', 'kneeExt', 'calf', 'core']);
        const legsB = D('Legs B', ['lunge', 'hipThrust', 'legCurl', 'squat', 'calf', 'core']);
        if (days === 3) return [D('Push', push('').slots), D('Pull', pull('').slots), D('Legs', legsA.slots)];
        return [push('A'), pull('A'), legsA, push('B'), pull('B'), legsB];
      },
    },
    {
      id: 'bro-split', name: 'Bro Split (Body-Part Split)', category: 'Bodybuilding', days: [5],
      summary: 'One muscle group per day: Chest, Back, Shoulders, Legs, Arms. The classic bodybuilding week.',
      bestFor: 'Advanced lifters who love a dedicated day per body part and train 5 days a week',
      pros: ['Lots of exercises and a big pump per muscle', 'Simple and fun', 'Each muscle gets a full week to recover'],
      cons: ['Each muscle trained only once a week', 'Lots of junk volume late in the session', 'A missed day means a muscle waits two weeks'],
      evidence: 'With equal weekly volume, once-a-week splits build muscle only slightly worse than 2×; the difference is small, but 2× is better on average. Fine if you enjoy it and keep weekly sets high.',
      refs: ['freq2016', 'pelland2024'],
      fit: { goals: { muscle: 3, strength: 2, fatloss: 2, recomp: 3, general: 1, athletic: 1 }, level: { beginner: 1, intermediate: 3, advanced: 4 } },
      build() {
        return [
          D('Chest', ['horizontalPress', 'inclinePress', 'chestFly', 'horizontalPress', 'core']),
          D('Back', ['verticalPull', 'horizontalRow', 'horizontalRow', 'pullover', 'core']),
          D('Shoulders', ['verticalPress', 'lateralRaise', 'rearDelt', 'lateralRaise', 'calf']),
          D('Legs', ['squat', 'hinge', 'lunge', 'legCurl', 'kneeExt', 'calf']),
          D('Arms', ['bicepCurl', 'tricepExt', 'bicepCurl', 'tricepExt', 'core']),
        ];
      },
    },
    {
      id: 'arnold', name: 'Arnold Split', category: 'Bodybuilding', days: [6],
      summary: 'Chest & Back, Shoulders & Arms, Legs, twice a week, as Arnold Schwarzenegger trained.',
      bestFor: 'Advanced, high-recovery lifters chasing size',
      pros: ['2× frequency with high volume', 'Antagonist pairing (chest and back) saves time with supersets'],
      cons: ['6 days a week with big sessions', 'Hard to recover from for most natural lifters'],
      evidence: 'Meets the 2× frequency recommendation and allows very high volume; extra volume has diminishing returns, so recovery is the limit.',
      refs: ['freq2016', 'pelland2024'],
      fit: { goals: { muscle: 5, strength: 2, fatloss: 2, recomp: 3, general: 1, athletic: 1 }, level: { beginner: 0, intermediate: 2, advanced: 5 } },
      build() {
        const cb = (n) => D('Chest & Back ' + n, ['horizontalPress', 'horizontalRow', 'inclinePress', 'verticalPull', 'chestFly', 'pullover']);
        const sa = (n) => D('Shoulders & Arms ' + n, ['verticalPress', 'lateralRaise', 'bicepCurl', 'tricepExt', 'rearDelt', 'core']);
        const lg = (n) => D('Legs ' + n, ['squat', 'hinge', 'legCurl', 'kneeExt', 'calf', 'core']);
        return [cb('A'), sa('A'), lg('A'), cb('B'), sa('B'), lg('B')];
      },
    },
    {
      id: 'phul', name: 'PHUL (Power Hypertrophy Upper Lower)', category: 'Powerbuilding', days: [4],
      summary: 'Two heavy power days for strength and two hypertrophy days for size, on an upper/lower layout.',
      bestFor: 'Intermediates who want to get both strong and big',
      pros: ['Trains strength (heavy) and hypertrophy (moderate) rep ranges', '2× frequency'],
      cons: ['Power days are demanding', 'Needs a barbell for the best results'],
      evidence: 'Heavy loads are best for maximal strength, while a wide range of loads builds muscle when sets go close to failure. PHUL uses both.',
      refs: ['load2017', 'lopez2021'],
      fit: { goals: { muscle: 4, strength: 5, fatloss: 3, recomp: 4, general: 2, athletic: 4 }, level: { beginner: 2, intermediate: 5, advanced: 4 } },
      build() {
        return [
          D('Upper Power', ['horizontalPress', 'horizontalRow', 'verticalPress', 'verticalPull', 'bicepCurl', 'tricepExt'], 'strength'),
          D('Lower Power', ['squat', 'hinge', 'legCurl', 'calf', 'core'], 'strength'),
          D('Upper Hypertrophy', ['inclinePress', 'horizontalRow', 'chestFly', 'lateralRaise', 'bicepCurl', 'tricepExt'], 'hypertrophy'),
          D('Lower Hypertrophy', ['squat', 'lunge', 'kneeExt', 'legCurl', 'calf'], 'hypertrophy'),
        ];
      },
    },
    {
      id: 'ulppl', name: 'Upper / Lower + Push / Pull / Legs', category: 'Hybrid', days: [5],
      summary: 'A 5-day hybrid: Upper, Lower, then Push, Pull, Legs. Each muscle about twice a week.',
      bestFor: 'Intermediate and advanced lifters with 5 days available',
      pros: ['2× frequency on 5 days', 'Variety of heavy and pump-style days'],
      cons: ['Slightly uneven: some muscles get more than others'],
      evidence: 'Keeps every muscle near 2× per week, the frequency associated with better results, while spreading 12–20 weekly sets.',
      refs: ['freq2016', 'volume2017'],
      fit: { goals: { muscle: 5, strength: 4, fatloss: 3, recomp: 4, general: 2, athletic: 3 }, level: { beginner: 2, intermediate: 5, advanced: 5 } },
      build: ulppl,
    },
    {
      id: 'torso-limbs', name: 'Torso / Limbs', category: 'Hybrid', days: [4],
      summary: 'Torso days (chest, back, shoulders) and limb days (legs and arms). An upper/lower variant that frees up arm work.',
      bestFor: 'Intermediates who want more arm volume with 4 days',
      pros: ['Arms trained fresh instead of after the big upper lifts', '2× frequency'],
      cons: ['Limb days are long', 'Less common, so fewer resources'],
      evidence: 'Same 2× frequency benefit as upper/lower; exercises done earlier in a session get stronger, so arms benefit from being trained fresh.',
      refs: ['freq2016', 'nunes2021'],
      fit: { goals: { muscle: 5, strength: 3, fatloss: 3, recomp: 4, general: 3, athletic: 3 }, level: { beginner: 2, intermediate: 5, advanced: 4 } },
      build() {
        return [
          D('Torso A', ['horizontalPress', 'horizontalRow', 'verticalPress', 'verticalPull', 'lateralRaise', 'rearDelt']),
          D('Limbs A', ['squat', 'hinge', 'bicepCurl', 'tricepExt', 'calf', 'legCurl']),
          D('Torso B', ['inclinePress', 'verticalPull', 'chestFly', 'horizontalRow', 'lateralRaise', 'core']),
          D('Limbs B', ['lunge', 'legCurl', 'kneeExt', 'bicepCurl', 'tricepExt', 'calf']),
        ];
      },
    },
    {
      id: 'anterior-posterior', name: 'Anterior / Posterior', category: 'Hybrid', days: [4],
      summary: 'Front of the body (quads, chest, front delts, biceps, abs) versus back of the body (back, hamstrings, glutes, triceps, calves).',
      bestFor: 'Intermediates; people who want posture balance and glute/hamstring emphasis',
      pros: ['Balanced front and back development', '2× frequency', 'Spreads lower-body fatigue across days'],
      cons: ['Some days pair big leg and upper lifts'],
      evidence: 'Another 2× frequency layout; good for posterior-chain work such as hip thrusts and leg curls.',
      refs: ['freq2016', 'plotkin2023'],
      fit: { goals: { muscle: 4, strength: 4, fatloss: 3, recomp: 4, general: 4, athletic: 4 }, level: { beginner: 3, intermediate: 5, advanced: 4 } },
      build() {
        return [
          D('Anterior A', ['squat', 'horizontalPress', 'verticalPress', 'kneeExt', 'bicepCurl', 'core']),
          D('Posterior A', ['hinge', 'verticalPull', 'horizontalRow', 'legCurl', 'tricepExt', 'calf']),
          D('Anterior B', ['lunge', 'inclinePress', 'chestFly', 'lateralRaise', 'bicepCurl', 'core']),
          D('Posterior B', ['hipThrust', 'horizontalRow', 'pullover', 'legCurl', 'rearDelt', 'tricepExt']),
        ];
      },
    },
    {
      id: 'strength-5x5', name: '5×5 Strength (A/B)', category: 'Strength', days: [3],
      summary: 'Alternate two short barbell workouts, 5 sets of 5, adding a little weight every session (StrongLifts/Starting Strength style).',
      bestFor: 'Beginners focused on getting strong with a barbell',
      pros: ['Very fast early strength gains', 'Simple: few exercises, clear progression'],
      cons: ['Little arm, shoulder and calf work', 'Progress stalls after a few months', 'Needs a barbell and rack'],
      evidence: 'Heavy loads (around 85% of 1RM or more) give the biggest strength gains, and beginners can add load almost every session.',
      refs: ['load2017', 'strengthFreq2018'],
      needs: 'barbell',
      fit: { goals: { muscle: 3, strength: 5, fatloss: 2, recomp: 3, general: 2, athletic: 3 }, level: { beginner: 5, intermediate: 2, advanced: 0 } },
      build() {
        return [
          D('Workout A', ['squat', 'horizontalPress', 'horizontalRow', 'core'], '5x5'),
          D('Workout B', ['squat', 'verticalPress', 'hinge', 'verticalPull'], '5x5'),
          D('Workout A', ['squat', 'horizontalPress', 'horizontalRow', 'core'], '5x5'),
        ];
      },
    },
    {
      id: 'ulf', name: 'Upper / Lower / Full Body', category: 'Hybrid', days: [3],
      summary: 'Three days: Upper, Lower, then a Full Body day, so every muscle gets about twice a week.',
      bestFor: 'People who like split days but only have 3 days',
      pros: ['2× frequency on 3 days', 'Shorter sessions than 3× full body'],
      cons: ['The full body day is long'],
      evidence: 'Reaches the evidence-supported 2× frequency on only 3 training days.',
      refs: ['freq2016'],
      fit: { goals: { muscle: 4, strength: 4, fatloss: 4, recomp: 5, general: 4, athletic: 3 }, level: { beginner: 4, intermediate: 5, advanced: 3 } },
      build() {
        return [
          D('Upper', ['horizontalPress', 'horizontalRow', 'verticalPress', 'verticalPull', 'bicepCurl', 'tricepExt']),
          D('Lower', ['squat', 'hinge', 'kneeExt', 'calf', 'core']),
          D('Full Body', ['lunge', 'inclinePress', 'verticalPull', 'legCurl', 'lateralRaise', 'hipThrust']),
        ];
      },
    },
    {
      id: 'specialization', name: 'Body-Part Specialization', category: 'Specialization', days: [4, 5],
      summary: 'Pick one body area (glutes, arms, chest...) and train it first in almost every session, while keeping everything else at maintenance volume.',
      bestFor: 'Intermediate and advanced lifters bringing up a lagging body part (choose a focus area)',
      pros: ['Focus muscle trained 3–5× per week, fresh', 'Rest of the body keeps its gains on less volume'],
      cons: ['Run it for 8–12 weeks, then rotate', 'Other muscles grow slower meanwhile'],
      evidence: 'Exercises done first in a session gain more strength, about one third of normal volume maintains muscle, and more weekly volume means more growth for the focus muscle.',
      refs: ['nunes2021', 'bickel2011', 'volume2017'],
      fit: { goals: { muscle: 5, strength: 2, fatloss: 2, recomp: 4, general: 2, athletic: 2 }, level: { beginner: 1, intermediate: 4, advanced: 5 } },
      build(days, profile) {
        const week = days === 5 ? ulppl() : upperLower();
        const focus = WS.FOCUS[(profile && profile.focus) || 'glutes'] || WS.FOCUS.glutes;
        week.forEach((d, i) => {
          const slot = focus.slots[i % focus.slots.length];
          d.slots = [slot].concat(d.slots.filter((s) => s !== slot));
          d.name += ' + ' + focus.label;
          d.focusSlot = slot;
        });
        return week;
      },
    },
    {
      id: 'circuit', name: 'Strength Circuit (Metabolic)', category: 'Fat loss', days: [3, 4],
      summary: 'Full-body strength moves done back-to-back in circuits with short rests, plus a conditioning finisher.',
      bestFor: 'Fat loss, busy people, general fitness, heavier beginners',
      pros: ['Time-efficient: strength and cardio in one', 'Keeps heart rate up'],
      cons: ['Lower loads limit maximal strength', 'Busy gyms make circuits hard'],
      evidence: 'Lifting while in a calorie deficit preserves muscle, and pairing it with conditioning helps you reach WHO activity targets in less time.',
      refs: ['who2020', 'helms2014'],
      fit: { goals: { muscle: 2, strength: 1, fatloss: 5, recomp: 3, general: 5, athletic: 3 }, level: { beginner: 4, intermediate: 4, advanced: 2 } },
      build(days) {
        const A = D('Circuit A', ['squat', 'horizontalPress', 'horizontalRow', 'hinge', 'core', 'conditioning'], 'circuit');
        const B = D('Circuit B', ['lunge', 'verticalPress', 'verticalPull', 'hipThrust', 'carry', 'conditioning'], 'circuit');
        const C = D('Circuit C', ['squat', 'inclinePress', 'horizontalRow', 'legCurl', 'core', 'conditioning'], 'circuit');
        return days === 3 ? [A, B, C] : [A, B, C, D('Circuit D', B.slots, 'circuit')];
      },
    },
    {
      id: 'athletic', name: 'Athletic Performance', category: 'Functional', days: [3, 4],
      summary: 'Jumps and throws for power, heavy compounds for strength, single-leg work and conditioning.',
      bestFor: 'Athletes, weekend sports players, anyone who wants to move fast and well',
      pros: ['Trains power, strength, stability and fitness together', 'Includes injury-prevention work (Nordics, single-leg)'],
      cons: ['Less pure hypertrophy volume', 'Power moves need good technique'],
      evidence: 'Includes Nordic curls, which roughly halve hamstring injury rates; heavy loads drive strength, and power work trains speed.',
      refs: ['vanDyk2019', 'load2017'],
      fit: { goals: { muscle: 2, strength: 4, fatloss: 3, recomp: 3, general: 4, athletic: 5 }, level: { beginner: 2, intermediate: 5, advanced: 5 } },
      build(days) {
        const w = [
          D('Lower Power', ['power', 'squat', 'lunge', 'legCurl', 'core']),
          D('Upper Strength', ['power', 'horizontalPress', 'verticalPull', 'verticalPress', 'horizontalRow', 'carry']),
          D('Full Body + Conditioning', ['power', 'hinge', 'lunge', 'horizontalRow', 'core', 'conditioning']),
          D('Upper Volume + Conditioning', ['inclinePress', 'horizontalRow', 'lateralRaise', 'bicepCurl', 'tricepExt', 'conditioning']),
        ];
        return w.slice(0, days);
      },
    },
    {
      id: 'active-aging', name: 'Active Aging Full Body', category: 'Health', days: [2, 3],
      summary: 'Full body strength plus balance and power work, built around NSCA guidance for older adults.',
      bestFor: 'Adults 60+, returning after a long break, anyone prioritising independence and longevity',
      pros: ['Balance and power, the qualities that prevent falls', 'Joint-friendly, machine-based exercise choices', 'Short sessions'],
      cons: ['Not designed for maximal size or strength'],
      evidence: 'Resistance training reliably increases strength in older adults; NSCA recommends 2–3 days per week including power and balance, and WHO adds balance work for 65+.',
      refs: ['fragala2019', 'peterson2010', 'who2020'],
      fit: { goals: { muscle: 2, strength: 3, fatloss: 3, recomp: 3, general: 5, athletic: 1 }, level: { beginner: 5, intermediate: 4, advanced: 2 } },
      build(days) {
        const A = D('Session A', ['balance', 'power', 'squat', 'horizontalPress', 'horizontalRow', 'carry']);
        const B = D('Session B', ['balance', 'lunge', 'verticalPull', 'verticalPress', 'hinge', 'core']);
        const C = D('Session C', ['balance', 'power', 'squat', 'horizontalRow', 'calf', 'core']);
        return days === 2 ? [A, B] : [A, B, C];
      },
    },
  ];

  WS.SPLIT_BY_ID = Object.fromEntries(WS.SPLITS.map((s) => [s.id, s]));
})(window.WS = window.WS || {});
