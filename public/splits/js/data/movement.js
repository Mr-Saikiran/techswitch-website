// HIIT protocols, calisthenics skill progressions (THENX), Pilates (Blogilates)
// and the longevity framework (credit: Bryan Johnson).
(function (WS) {
  WS.HIIT = [
    {
      id: 'norwegian-4x4', name: 'Norwegian 4×4', minutes: 40, level: 'Intermediate',
      protocol: '10 min warm-up → 4 × (4 min at 85–95% max HR, 3 min easy) → 5 min cool-down',
      modes: 'Run uphill, bike, rower, ski-erg',
      why: 'Improved VO2max more than steady moderate training at the same total work. VO2max is one of the strongest predictors of lifespan.',
      refs: ['helgerud2007', 'mandsager2018'], query: 'HIIT cardio', tags: { general: 3, athletic: 3, fatloss: 3, recomp: 2 },
    },
    {
      id: 'tabata', name: 'Tabata (20/10)', minutes: 4, level: 'Advanced',
      protocol: '8 × (20 s all-out, 10 s rest). In the original study this meant about 170% of VO2max on a bike.',
      modes: 'Bike sprints (original study), burpees, jump squats',
      why: 'Brief, extremely hard intervals improved both aerobic and anaerobic capacity. True Tabata is far harder than most "Tabata classes".',
      refs: ['tabata1996'], query: 'tabata', tags: { athletic: 3, fatloss: 2 },
    },
    {
      id: 'beginner-30-30', name: 'Beginner 30/30 Intervals', minutes: 20, level: 'Beginner',
      protocol: '5 min warm-up → 10 × (30 s brisk, 30 s easy) → 5 min cool-down',
      modes: 'Brisk walk / jog, bike, elliptical, marching in place',
      why: 'A gentle introduction to intervals; builds fitness before harder protocols. Counts toward WHO vigorous-activity minutes.',
      refs: ['who2020'], query: 'beginner HIIT', tags: { general: 3, fatloss: 3, higher: 3, senior: 1 },
    },
    {
      id: 'calisthenics-hiit', name: 'Bodyweight HIIT Circuit', minutes: 20, level: 'Intermediate',
      protocol: '4 rounds of 40 s work / 20 s rest: jump squats, push-ups, mountain climbers, burpees, plank jacks',
      modes: 'No equipment; anywhere',
      why: 'Strength-endurance and conditioning with zero equipment, ideal for home and travel days.',
      refs: ['who2020'], query: 'HIIT workout', tags: { fatloss: 3, general: 2, athletic: 2 },
    },
    {
      id: 'emom', name: 'Calisthenics EMOM', minutes: 15, level: 'Intermediate',
      protocol: 'Every minute on the minute for 15 min, rotating: 5 pull-ups, 10 push-ups, 15 squats',
      modes: 'Pull-up bar',
      why: 'Builds pulling and pushing volume with built-in rest. A THENX staple for getting reps in.',
      refs: [], query: 'EMOM', tags: { muscle: 2, athletic: 2, recomp: 2 },
    },
  ];

  // Calisthenics progressions: master each step (3 × target reps) before moving on.
  WS.CALISTHENICS = [
    { skill: 'Push-up → One-arm push-up', steps: ['Incline push-up', 'Push-up', 'Diamond push-up', 'Archer push-up', 'One-arm push-up'], target: '3 × 12 (3 × 5 for archer and one-arm)', query: 'one arm push up' },
    { skill: 'Pull-up → Muscle-up', steps: ['Dead hang 30 s', 'Negative pull-up', 'Pull-up', 'Chest-to-bar pull-up', 'Muscle-up'], target: '3 × 8 (3 × 3 for muscle-ups)', query: 'muscle up' },
    { skill: 'Squat → Pistol squat', steps: ['Bodyweight squat', 'Split squat', 'Bulgarian split squat', 'Assisted pistol', 'Pistol squat'], target: '3 × 10 per leg', query: 'pistol squat' },
    { skill: 'Dip → Straight bar dip', steps: ['Bench dip', 'Negative dip', 'Parallel bar dip', 'Weighted dip', 'Straight bar dip'], target: '3 × 10', query: 'dips' },
    { skill: 'Plank → L-sit', steps: ['Plank 60 s', 'Hollow hold 30 s', 'Tuck L-sit', 'One-leg L-sit', 'L-sit 15 s'], target: 'Hold time per step', query: 'l sit' },
    { skill: 'Pike push-up → Handstand push-up', steps: ['Pike push-up', 'Elevated pike push-up', 'Wall handstand hold 30 s', 'Negative wall HSPU', 'Wall handstand push-up'], target: '3 × 8 (hold steps 3 × 30 s)', query: 'handstand push up' },
    { skill: 'Tuck → Front lever', steps: ['Hanging knee raise', 'Tuck front lever 10 s', 'Advanced tuck', 'One-leg front lever', 'Front lever'], target: '3 × 10 s holds', query: 'front lever' },
  ];

  WS.PILATES_ROUTINES = [
    {
      id: 'beginner-mat', name: 'Beginner Mat Pilates', minutes: 20, when: 'Rest day or after lifting',
      purpose: 'Learn breathing, neutral spine and core bracing. The foundation for everything else.',
      moves: ['Pelvic Curl', 'The Hundred (modified)', 'Single-Leg Stretch', 'Dead Bug', 'Side-Lying Leg Series', 'Swan Prep'],
      why: 'Pilates reduces pain and disability in chronic low back pain, and ranked among the most effective exercise options in a network meta-analysis.',
      refs: ['yamato2015', 'fernandez2022'], query: 'pilates for beginners', tags: { general: 3, beginner: 3, higher: 2 },
    },
    {
      id: 'core', name: 'Pilates Core Burner', minutes: 15, when: 'After an upper-body day',
      purpose: 'Deep core endurance: rectus abdominis, obliques and transverse abdominis.',
      moves: ['The Hundred', 'Roll-Up', 'Double-Leg Stretch', 'Criss-Cross', 'Teaser (prep)', 'Plank to Pike'],
      why: 'High-rep core endurance complements heavy lifting, where the core works mostly isometrically.',
      refs: [], query: 'pilates abs', tags: { muscle: 2, recomp: 3, fatloss: 2 },
    },
    {
      id: 'glutes', name: 'Pilates Glutes & Legs', minutes: 20, when: 'Non-leg day',
      purpose: 'Low-load, high-rep glute and hip work with no equipment.',
      moves: ['Clamshell', 'Side-Lying Leg Lift', 'Donkey Kick', 'Fire Hydrant', 'Single-Leg Bridge', 'Inner-Thigh Lift'],
      why: 'Builds hip stability and glute endurance, which supports squats, lunges and running.',
      refs: [], query: 'pilates booty', tags: { recomp: 2, fatloss: 2, general: 2 },
    },
    {
      id: 'back-care', name: 'Pilates for Back Care', minutes: 20, when: 'Any day',
      purpose: 'Spinal mobility and control for a stiff or sore back.',
      moves: ['Pelvic Tilt', 'Cat-Cow', 'Swan', 'Swimming', 'Spine Twist', "Child's Pose"],
      why: 'The best-supported reason to do Pilates: it improves pain and function in chronic low back pain.',
      refs: ['yamato2015', 'fernandez2022'], query: 'pilates back pain', tags: { general: 3, master: 3, senior: 3, higher: 2 },
    },
    {
      id: 'full-body', name: 'Full Body Pilates Flow', minutes: 30, when: 'Active recovery',
      purpose: 'Whole-body control, posture and flexibility in one flowing session.',
      moves: ['Roll-Up', 'Rolling Like a Ball', 'Saw', 'Swimming', 'Side Plank', 'Leg Pull Front'],
      why: 'Low-impact movement that adds to your weekly activity minutes while you recover from lifting.',
      refs: ['who2020'], query: 'full body pilates', tags: { general: 2, fatloss: 2, muscle: 1 },
    },
  ];

  // Credit: framework from Bryan Johnson's video "Everyone Is Wrong About
  // Exercise"; the peer-reviewed sources are added alongside each pillar.
  WS.LONGEVITY = {
    credit: 'Framework adapted from Bryan Johnson, “Everyone Is Wrong About Exercise”',
    video: 'https://youtu.be/JNuORofHhrk',
    pillars: [
      {
        name: 'Zone 2 cardio', target: '150 min / week',
        how: 'Easy, steady effort where you can still hold a conversation (the "talk test"). A 10-minute walk after meals is an easy win.',
        stat: 'Light walking that breaks up sitting improves post-meal blood sugar and insulin.',
        refs: ['who2020', 'buffey2022'],
      },
      {
        name: 'High-intensity intervals', target: '~75 min / week (e.g. Norwegian 4×4)',
        how: '4 × 4 min at 85–95% max heart rate with 3 min easy between. Bike, run, row or battle ropes.',
        stat: 'People in the lowest fitness group had around 5× the mortality of the most fit, and intervals raise VO2max more than steady cardio.',
        refs: ['mandsager2018', 'helgerud2007'],
      },
      {
        name: 'Strength training', target: '3+ sessions / week',
        how: 'Compound push, pull, squat and hinge movements with progressive overload. The Planner builds this part for you.',
        stat: 'In a cohort of one million young men, the weakest had a 20–35% higher risk of premature death.',
        refs: ['ortega2012', 'freq2016'],
      },
      {
        name: 'Balance & mobility', target: '5–10 min daily',
        how: 'Single-leg balance, plus mobility for hips, spine, ankles, hamstrings and shoulders. Yoga and Pilates count.',
        stat: 'Middle-aged and older adults who could not stand on one leg for 10 s had about 84% higher all-cause mortality.',
        refs: ['araujo2022', 'youkhana2016'],
      },
    ],
    tests: [
      { name: 'One-leg stand', how: 'Stand on one leg, other foot behind the calf, arms by your sides.', goal: '10 s or more (ages 50+); aim for 30 s+', refs: ['araujo2022'] },
      { name: 'Talk test', how: 'During Zone 2 you can speak in full sentences but would not want to sing.', goal: 'Use it to set easy-day pace', refs: [] },
      { name: 'Grip strength', how: 'Hand dynamometer, or track your farmer\'s carry weight and time.', goal: 'Stronger grip, lower mortality risk', refs: ['leong2015'] },
      { name: 'VO2max estimate', how: 'Smartwatch estimate or a 12-minute run (Cooper test).', goal: 'Move up one fitness category per year', refs: ['mandsager2018'] },
    ],
    caveat: 'Critics point out that any exercise beats none. Do not let the "perfect" plan stop you from starting. Build up to the intervals; they are the last piece to add, not the first.',
  };
})(window.WS = window.WS || {});
