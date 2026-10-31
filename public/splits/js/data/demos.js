// Demo images: start and end position photos from free-exercise-db
// (https://github.com/yuhonas/free-exercise-db, public domain / Unlicense),
// served by jsDelivr from a pinned commit so they never change underneath us.
// Maps our exercise id → the dataset's exercise folder.
(function (WS) {
  const BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/';

  const MAP = {
    // Chest
    'bench-press': 'Barbell_Bench_Press_-_Medium_Grip', 'db-bench-press': 'Dumbbell_Bench_Press', 'machine-chest-press': 'Machine_Bench_Press',
    'push-up': 'Pushups', 'chest-dip': 'Dips_-_Chest_Version', 'db-floor-press': 'Dumbbell_Floor_Press',
    'neutral-grip-db-press': 'Dumbbell_Bench_Press_with_Neutral_Grip', 'smith-bench-press': 'Smith_Machine_Bench_Press',
    'plate-loaded-chest-press': 'Leverage_Chest_Press', 'decline-bench-press': 'Decline_Barbell_Bench_Press',
    'decline-db-press': 'Decline_Dumbbell_Bench_Press', 'wide-grip-bench': 'Wide-Grip_Barbell_Bench_Press',
    'decline-machine-press': 'Leverage_Decline_Chest_Press', 'cable-chest-press': 'Standing_Cable_Chest_Press',
    'incline-db-press': 'Incline_Dumbbell_Press', 'incline-bench-press': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
    'incline-machine-press': 'Leverage_Incline_Chest_Press', 'feet-elevated-push-up': 'Push-Ups_With_Feet_Elevated',
    'smith-incline-press': 'Smith_Machine_Incline_Bench_Press', 'incline-neutral-db-press': 'Incline_Dumbbell_Bench_With_Palms_Facing_In',
    'incline-cable-press': 'Incline_Cable_Chest_Press',
    'cable-fly': 'Cable_Crossover', 'pec-deck': 'Butterfly', 'db-fly': 'Dumbbell_Flyes', 'band-fly': 'Cross_Over_-_With_Bands',
    'slider-fly': 'Bodyweight_Flyes', 'incline-db-fly': 'Incline_Dumbbell_Flyes', 'low-cable-crossover': 'Low_Cable_Crossover',
    'flat-cable-fly': 'Flat_Bench_Cable_Flyes', 'incline-cable-fly': 'Incline_Cable_Flye',
    // Shoulders
    'db-shoulder-press': 'Dumbbell_Shoulder_Press', 'overhead-press': 'Standing_Military_Press', 'machine-shoulder-press': 'Machine_Shoulder_Military_Press',
    'band-overhead-press': 'Shoulder_Press_-_With_Bands', 'arnold-press': 'Arnold_Dumbbell_Press', 'seated-barbell-press': 'Seated_Barbell_Military_Press',
    'smith-shoulder-press': 'Smith_Machine_Overhead_Shoulder_Press', 'plate-loaded-shoulder-press': 'Leverage_Shoulder_Press',
    'standing-db-press': 'Standing_Dumbbell_Press', 'cable-shoulder-press': 'Seated_Cable_Shoulder_Press',
    'cable-lateral-raise': 'Standing_Low-Pulley_Deltoid_Raise', 'db-lateral-raise': 'Side_Lateral_Raise', 'band-lateral-raise': 'Lateral_Raise_-_With_Bands',
    'seated-db-lateral': 'Seated_Side_Lateral_Raise', 'incline-lateral-raise': 'One-Arm_Incline_Lateral_Raise',
    'cable-upright-row': 'Upright_Cable_Row', 'db-upright-row': 'Standing_Dumbbell_Upright_Row',
    'reverse-pec-deck': 'Reverse_Machine_Flyes', 'face-pull': 'Face_Pull', 'db-rear-delt-fly': 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
    'band-pull-apart': 'Band_Pull_Apart', 'cable-rear-delt-fly': 'Cable_Rear_Delt_Fly', 'seated-rear-delt-raise': 'Seated_Bent-Over_Rear_Delt_Raise',
    'rope-rear-delt-row': 'Cable_Rope_Rear-Delt_Rows', 'barbell-rear-delt-row': 'Barbell_Rear_Delt_Row',
    // Back
    'pull-up': 'Pullups', 'lat-pulldown': 'Wide-Grip_Lat_Pulldown', 'chin-up': 'Chin-Up', 'assisted-pull-up': 'Band_Assisted_Pull-Up',
    'close-grip-pulldown': 'V-Bar_Pulldown', 'underhand-pulldown': 'Underhand_Cable_Pulldowns', 'single-arm-pulldown': 'One_Arm_Lat_Pulldown',
    'plate-loaded-high-row': 'Leverage_High_Row', 'weighted-pull-up': 'Weighted_Pull_Ups',
    'chest-supported-row': 'Dumbbell_Incline_Row', 'seated-cable-row': 'Seated_Cable_Rows', 'barbell-row': 'Bent_Over_Barbell_Row',
    'one-arm-db-row': 'One-Arm_Dumbbell_Row', 'machine-row': 'Leverage_Iso_Row', 'inverted-row': 'Inverted_Row',
    'chest-supported-t-bar': 'Lying_T-Bar_Row', 't-bar-row': 'T-Bar_Row_with_Handle', 'seal-row': 'Lying_Cambered_Barbell_Row',
    'meadows-row': 'One-Arm_Long_Bar_Row', 'single-arm-cable-row': 'Seated_One-arm_Cable_Pulley_Rows', 'smith-row': 'Smith_Machine_Bent_Over_Row',
    'reverse-grip-row': 'Reverse_Grip_Bent-Over_Rows', 'two-db-row': 'Bent_Over_Two-Dumbbell_Row',
    'straight-arm-pulldown': 'Straight-Arm_Pulldown', 'db-pullover': 'Straight-Arm_Dumbbell_Pullover',
    'rope-straight-arm-pulldown': 'Rope_Straight-Arm_Pulldown', 'barbell-pullover': 'Bent-Arm_Barbell_Pullover',
    // Quads
    'back-squat': 'Barbell_Full_Squat', 'hack-squat': 'Hack_Squat', 'leg-press': 'Leg_Press', 'front-squat': 'Front_Barbell_Squat',
    'goblet-squat': 'Goblet_Squat', 'bodyweight-squat': 'Bodyweight_Squat', 'pistol-squat': 'Kettlebell_Pistol_Squat',
    'lever-squat': 'Lying_Machine_Squat', 'smith-squat': 'Smith_Machine_Squat', 'box-squat': 'Box_Squat', 'db-squat': 'Dumbbell_Squat',
    'narrow-leg-press': 'Narrow_Stance_Leg_Press', 'plie-db-squat': 'Plie_Dumbbell_Squat', 'zercher-squat': 'Zercher_Squats',
    'bulgarian-split-squat': 'Split_Squat_with_Dumbbells', 'reverse-lunge': 'Dumbbell_Rear_Lunge', 'walking-lunge': 'Dumbbell_Lunges',
    'step-up': 'Dumbbell_Step_Ups', 'split-squat': 'Split_Squats', 'smith-split-squat': 'Smith_Single-Leg_Split_Squat',
    'deficit-reverse-lunge': 'Elevated_Back_Lunge', 'barbell-lunge': 'Barbell_Lunge', 'barbell-step-up': 'Barbell_Step_Ups',
    'barbell-side-split-squat': 'Barbell_Side_Split_Squat',
    'leg-extension': 'Leg_Extensions', 'sissy-squat': 'Weighted_Sissy_Squat', 'single-leg-extension': 'Single-Leg_Leg_Extension',
    // Hamstrings & glutes
    'romanian-deadlift': 'Romanian_Deadlift', 'db-rdl': 'Stiff-Legged_Dumbbell_Deadlift', 'deadlift': 'Barbell_Deadlift',
    'back-extension': 'Hyperextensions_Back_Extensions', 'single-leg-rdl': 'Kettlebell_One-Legged_Deadlift', 'good-morning': 'Good_Morning',
    'band-pull-through': 'Band_Good_Morning_Pull_Through', 'trap-bar-deadlift': 'Trap_Bar_Deadlift', 'stiff-leg-deadlift': 'Stiff-Legged_Barbell_Deadlift',
    'smith-rdl': 'Smith_Machine_Stiff-Legged_Deadlift', 'cable-pull-through': 'Pull_Through', 'reverse-hyper': 'Reverse_Hyperextension',
    'sumo-deadlift': 'Sumo_Deadlift', 'rack-pull': 'Rack_Pulls',
    'seated-leg-curl': 'Seated_Leg_Curl', 'lying-leg-curl': 'Lying_Leg_Curls', 'nordic-curl': 'Natural_Glute_Ham_Raise',
    'slider-leg-curl': 'Platform_Hamstring_Slides', 'band-leg-curl': 'Seated_Band_Hamstring_Curl', 'standing-leg-curl': 'Standing_Leg_Curl',
    'glute-ham-raise': 'Glute_Ham_Raise', 'ball-leg-curl': 'Ball_Leg_Curl',
    'barbell-hip-thrust': 'Barbell_Hip_Thrust', 'machine-hip-thrust': 'Smith_Machine_Hip_Raise', 'single-leg-hip-thrust': 'Single_Leg_Glute_Bridge',
    'glute-bridge': 'Butt_Lift_Bridge', 'barbell-glute-bridge': 'Barbell_Glute_Bridge',
    'hip-abduction-machine': 'Thigh_Abductor', 'cable-kickback': 'One-Legged_Cable_Kickback', 'banded-lateral-walk': 'Monster_Walk',
    'side-lying-abduction': 'Side_Leg_Raises', 'quadruped-kickback': 'Glute_Kickback',
    // Calves
    'standing-calf-raise': 'Standing_Calf_Raises', 'single-leg-db-calf-raise': 'Standing_Dumbbell_Calf_Raise', 'seated-calf-raise': 'Seated_Calf_Raise',
    'leg-press-calf-raise': 'Calf_Press_On_The_Leg_Press_Machine', 'step-calf-raise': 'Rocking_Standing_Calf_Raise',
    'smith-calf-raise': 'Smith_Machine_Calf_Raise', 'donkey-calf-raise': 'Donkey_Calf_Raises', 'barbell-calf-raise': 'Standing_Barbell_Calf_Raise',
    'db-seated-calf-raise': 'Dumbbell_Seated_One-Leg_Calf_Raise',
    // Arms
    'incline-db-curl': 'Incline_Dumbbell_Curl', 'bayesian-curl': 'Standing_One-Arm_Cable_Curl', 'ez-bar-curl': 'EZ-Bar_Curl',
    'preacher-curl': 'Machine_Preacher_Curls', 'hammer-curl': 'Hammer_Curls', 'barbell-curl': 'Barbell_Curl',
    'db-alternating-curl': 'Dumbbell_Alternate_Bicep_Curl', 'db-preacher-curl': 'One_Arm_Dumbbell_Preacher_Curl', 'cable-curl': 'Standing_Biceps_Cable_Curl',
    'machine-curl': 'Machine_Bicep_Curl', 'concentration-curl': 'Concentration_Curls', 'spider-curl': 'Spider_Curl',
    'rope-hammer-curl': 'Cable_Hammer_Curls_-_Rope_Attachment', 'reverse-ez-curl': 'Reverse_Barbell_Curl', 'zottman-curl': 'Zottman_Curl',
    'overhead-cable-extension': 'Cable_Rope_Overhead_Triceps_Extension', 'overhead-db-extension': 'Standing_Dumbbell_Triceps_Extension',
    'skull-crusher': 'EZ-Bar_Skullcrusher', 'rope-pushdown': 'Triceps_Pushdown_-_Rope_Attachment', 'close-grip-bench': 'Close-Grip_Barbell_Bench_Press',
    'triceps-dip': 'Dips_-_Triceps_Version', 'diamond-push-up': 'Push-Ups_-_Close_Triceps_Position',
    'overhead-ez-extension': 'Standing_Overhead_Barbell_Triceps_Extension', 'db-skull-crusher': 'Lying_Dumbbell_Tricep_Extension',
    'machine-triceps-extension': 'Machine_Triceps_Extension', 'machine-dip': 'Dip_Machine', 'v-bar-pushdown': 'Triceps_Pushdown_-_V-Bar_Attachment',
    'single-arm-cable-extension': 'Cable_One_Arm_Tricep_Extension', 'db-kickback': 'Tricep_Dumbbell_Kickback',
    'close-grip-db-press': 'Close-Grip_Dumbbell_Press', 'jm-press': 'JM_Press',
    // Core
    'hanging-leg-raise': 'Hanging_Leg_Raise', 'cable-crunch': 'Cable_Crunch', 'ab-wheel': 'Ab_Roller', 'pallof-press': 'Pallof_Press',
    'band-pallof-press': 'Pallof_Press', 'dead-bug': 'Dead_Bug', 'plank': 'Plank', 'machine-crunch': 'Ab_Crunch_Machine',
    'decline-crunch': 'Decline_Crunch', 'barbell-rollout': 'Barbell_Ab_Rollout_-_On_Knees', 'cable-woodchop': 'Standing_Cable_Wood_Chop',
    'landmine-rotation': 'Landmine_180s', 'russian-twist': 'Russian_Twist', 'side-plank': 'Side_Bridge',
    // Functional
    'farmers-carry': 'Farmers_Walk', 'kb-swing': 'One-Arm_Kettlebell_Swings', 'box-jump': 'Front_Box_Jump', 'broad-jump': 'Standing_Long_Jump',
    'hang-power-clean': 'Hang_Clean', 'sit-to-stand': 'Chair_Squat', 'push-press': 'Push_Press', 'power-clean': 'Power_Clean', 'db-clean': 'Dumbbell_Clean',
    'bike-intervals': 'Bicycling_Stationary', 'rower-intervals': 'Rowing_Stationary', 'sled-push': 'Sled_Push', 'incline-walk': 'Walking_Treadmill',
    'jump-rope': 'Rope_Jumping', 'battle-ropes': 'Battling_Ropes', 'stair-climber': 'Stairmaster', 'elliptical': 'Elliptical_Trainer',
  };

  // [start image, end image] for an exercise, or null if there is no demo.
  WS.demoFor = (id) => (MAP[id] ? [BASE + MAP[id] + '/0.jpg', BASE + MAP[id] + '/1.jpg'] : null);
  WS.DEMO_COUNT = Object.keys(MAP).length;

  const google = (tbm, q) => 'https://www.google.com/search?' + (tbm ? 'tbm=' + tbm + '&' : '') + 'q=' + encodeURIComponent(q);
  WS.googleImages = (name) => google('isch', name + ' exercise form');
  WS.googleVideos = (name) => google('vid', name + ' how to');
})(window.WS = window.WS || {});
