// Yoga: routines matched to goals/age, and a pose library.
// Videos open a search on the Yoga With Adriene channel.
(function (WS) {
  WS.YOGA_ROUTINES = [
    {
      id: 'beginners', name: 'Yoga for Complete Beginners', minutes: 20, when: 'Rest day',
      purpose: 'Learn the basic shapes and breathing. Start here if you have never done yoga.',
      poses: ['Cat-Cow', "Child's Pose", 'Downward Dog', 'Low Lunge', 'Mountain Pose', 'Supine Twist'],
      why: 'Builds general flexibility and body awareness with no prior experience.',
      refs: [], query: 'yoga for complete beginners', tags: { general: 3, beginner: 3 },
    },
    {
      id: 'athletes', name: 'Yoga for Athletes & Lifters', minutes: 25, when: 'Rest day or after training',
      purpose: 'Opens the hips, hamstrings, thoracic spine and shoulders, which heavy lifting tends to tighten.',
      poses: ['Downward Dog', 'Low Lunge', 'Pigeon', 'Thread the Needle', 'Seated Forward Fold', 'Bridge'],
      why: 'More mobility through the hips and upper back makes deep squats, overhead pressing and hinging easier to do well.',
      refs: [], query: 'yoga for athletes', tags: { muscle: 3, strength: 3, athletic: 3, recomp: 2 },
    },
    {
      id: 'low-back', name: 'Yoga for Lower Back Pain', minutes: 20, when: 'Any day',
      purpose: 'Gentle mobility and core control for a stiff or sore lower back.',
      poses: ['Cat-Cow', "Child's Pose", 'Sphinx', 'Supine Twist', 'Bridge', 'Happy Baby'],
      why: 'Cochrane review: yoga modestly improves pain and function in chronic non-specific low back pain compared with no exercise.',
      refs: ['wieland2017'], query: 'yoga for lower back pain', tags: { general: 2, higher: 2, master: 2 },
    },
    {
      id: 'hips', name: 'Yoga for Tight Hips', minutes: 20, when: 'Rest day',
      purpose: 'Undo long hours of sitting; helps squat depth.',
      poses: ['Low Lunge', 'Lizard', 'Pigeon', 'Happy Baby', 'Supine Figure-Four', 'Bridge'],
      why: 'Hip flexor and external-rotator mobility for desk workers and lifters chasing deeper squats.',
      refs: [], query: 'yoga for hips', tags: { muscle: 2, strength: 2, general: 2 },
    },
    {
      id: 'neck-shoulders', name: 'Yoga for Neck & Shoulders', minutes: 15, when: 'Any day',
      purpose: 'Releases upper-back and neck tension; good on upper-body days off.',
      poses: ['Thread the Needle', 'Eagle Arms', 'Puppy Pose', 'Cat-Cow', 'Seated Neck Release'],
      why: 'Thoracic and shoulder mobility supports overhead pressing and posture.',
      refs: [], query: 'yoga for neck and shoulders', tags: { muscle: 1, general: 2 },
    },
    {
      id: 'balance', name: 'Gentle Yoga for Balance', minutes: 20, when: '2–3× per week',
      purpose: 'Standing balance, ankle stability and confidence on your feet.',
      poses: ['Mountain Pose', 'Tree Pose', 'Chair Pose', 'Warrior II', 'Supported Warrior III'],
      why: 'Yoga-based exercise improves balance and mobility in people aged 60 and over.',
      refs: ['youkhana2016', 'who2020'], query: 'yoga for balance', tags: { senior: 5, master: 2, general: 1 },
    },
    {
      id: 'chair', name: 'Chair Yoga', minutes: 15, when: 'Any day',
      purpose: 'Seated yoga for limited mobility, joint pain or a heavier body. Every pose can be done from a chair.',
      poses: ['Seated Cat-Cow', 'Seated Twist', 'Seated Forward Fold', 'Seated Figure-Four', 'Eagle Arms'],
      why: 'Lets you start moving with no floor transitions, so it is accessible at any fitness level.',
      refs: ['youkhana2016'], query: 'chair yoga', tags: { senior: 4, higher: 3 },
    },
    {
      id: 'sore', name: 'Yoga for Sore Muscles', minutes: 20, when: 'Day after a hard session',
      purpose: 'Easy movement and breathing on a recovery day.',
      poses: ["Child's Pose", 'Downward Dog', 'Low Lunge', 'Supine Twist', 'Legs Up the Wall'],
      why: 'Stretching does not meaningfully cut soreness, but gentle movement feels good and keeps you moving on rest days.',
      refs: [], query: 'yoga for sore muscles', tags: { muscle: 2, fatloss: 2, recomp: 2 },
    },
    {
      id: 'morning', name: 'Morning Yoga Flow', minutes: 15, when: 'Mornings',
      purpose: 'A quick wake-up flow to loosen up before the day.',
      poses: ['Cat-Cow', 'Downward Dog', 'Sun Salutation A', 'Low Lunge', 'Mountain Pose'],
      why: 'Easy daily movement that adds to your weekly activity minutes.',
      refs: ['who2020'], query: 'morning yoga', tags: { fatloss: 2, general: 2, higher: 1 },
    },
    {
      id: 'bedtime', name: 'Bedtime Yoga', minutes: 15, when: 'Evenings',
      purpose: 'Slow, floor-based poses and long exhales to wind down.',
      poses: ["Child's Pose", 'Supine Twist', 'Happy Baby', 'Legs Up the Wall', 'Corpse Pose'],
      why: 'Sleep is when you recover from training; a calming routine can help you switch off.',
      refs: [], query: 'bedtime yoga', tags: { general: 1, muscle: 1, strength: 1 },
    },
  ];

  const Y = (name, sanskrit, targets, cue, query) => ({ name, sanskrit, targets, cue, query: query || name });

  WS.YOGA_POSES = [
    Y('Downward Dog', 'Adho Mukha Svanasana', 'Hamstrings, calves, shoulders', 'Hips high, bend the knees as much as you need to keep the spine long.'),
    Y('Cat-Cow', 'Marjaryasana-Bitilasana', 'Spine mobility', 'Move with the breath: inhale to arch, exhale to round.'),
    Y("Child's Pose", 'Balasana', 'Low back, hips, lats', 'Knees wide, arms long, breathe into the back ribs.', 'childs pose'),
    Y('Low Lunge', 'Anjaneyasana', 'Hip flexors, quads', 'Back knee down, tuck the tailbone to feel the front of the hip.'),
    Y('Lizard', 'Utthan Pristhasana', 'Hips, groin', 'Both hands inside the front foot; drop to forearms if open.', 'lizard pose'),
    Y('Pigeon', 'Eka Pada Rajakapotasana', 'Glutes, hip rotators', 'Front shin angled, hips square; use a block under the hip.', 'pigeon pose'),
    Y('Supine Figure-Four', 'Supta Kapotasana', 'Glutes, hip rotators', 'A gentler pigeon on your back; pull the thigh toward you.', 'figure four stretch'),
    Y('Thread the Needle', 'Parsva Balasana', 'Upper back, rear shoulders', 'From all fours, slide one arm under and rest the shoulder down.'),
    Y('Puppy Pose', 'Uttana Shishosana', 'Lats, shoulders, thoracic spine', 'Hips over knees, melt the chest toward the floor.', 'puppy pose'),
    Y('Eagle Arms', 'Garudasana (arms)', 'Upper back, rear delts', 'Cross the arms, lift the elbows, breathe into the shoulder blades.', 'eagle arms'),
    Y('Sphinx', 'Salamba Bhujangasana', 'Spinal extension, abs', 'Forearms down, gentle lift of the chest, relax the glutes.', 'sphinx pose'),
    Y('Bridge', 'Setu Bandha Sarvangasana', 'Glutes, hip flexors', 'Press through the heels, lift the hips, keep the knees parallel.', 'bridge pose'),
    Y('Supine Twist', 'Supta Matsyendrasana', 'Spine rotation, glutes', 'Knees to one side, shoulders stay down.', 'supine twist'),
    Y('Happy Baby', 'Ananda Balasana', 'Hips, groin, low back', 'Hold the feet, draw the knees toward the armpits.', 'happy baby'),
    Y('Seated Forward Fold', 'Paschimottanasana', 'Hamstrings, low back', 'Hinge from the hips; bent knees are fine.', 'forward fold'),
    Y('Warrior II', 'Virabhadrasana II', 'Legs, hips, standing stamina', 'Front knee over the ankle, arms long, gaze past the front hand.', 'warrior 2'),
    Y('Tree Pose', 'Vrksasana', 'Balance, ankles, glute medius', 'Foot on the calf or thigh (not the knee); use a wall if needed.', 'tree pose'),
    Y('Chair Pose', 'Utkatasana', 'Quads, glutes, posture', 'Sit back, weight in the heels, arms up.', 'chair pose'),
    Y('Mountain Pose', 'Tadasana', 'Posture, alignment', 'Feet grounded, crown of the head lifts.', 'mountain pose'),
    Y('Legs Up the Wall', 'Viparita Karani', 'Relaxation', 'Hips near the wall, let the legs rest, breathe slowly.', 'legs up the wall'),
  ];
})(window.WS = window.WS || {});
