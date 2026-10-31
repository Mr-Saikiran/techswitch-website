// Sleep and meditation content: age-group sleep needs, nap types, tips,
// breathing patterns, sound presets and video links (YouTube searches).
(function (WS) {
  // National Sleep Foundation recommendations (Hirshkowitz 2015).
  WS.SLEEP_AGES = [
    { label: 'Newborn', range: '0–3 months', min: 0, max: 0.25, hours: [14, 17] },
    { label: 'Infant', range: '4–11 months', min: 0.25, max: 1, hours: [12, 15] },
    { label: 'Toddler', range: '1–2 years', min: 1, max: 3, hours: [11, 14] },
    { label: 'Preschool', range: '3–5 years', min: 3, max: 6, hours: [10, 13] },
    { label: 'School age', range: '6–13 years', min: 6, max: 14, hours: [9, 11] },
    { label: 'Teen', range: '14–17 years', min: 14, max: 18, hours: [8, 10] },
    { label: 'Young adult', range: '18–25 years', min: 18, max: 26, hours: [7, 9] },
    { label: 'Adult', range: '26–64 years', min: 26, max: 65, hours: [7, 9] },
    { label: 'Older adult', range: '65+ years', min: 65, max: 200, hours: [7, 8] },
  ];
  WS.sleepGroupFor = (age) => WS.SLEEP_AGES.find((g) => age >= g.min && age < g.max) || WS.SLEEP_AGES[7];

  WS.NAPS = [
    { id: 'power', name: 'Power nap', minutes: 10, range: '10–20 min',
      why: '10 minutes gave the best boost in alertness straight away, with no grogginess, after a short night.',
      when: 'Early afternoon (1–3 pm)', refs: ['brooks2006'] },
    { id: 'nasa', name: 'NASA nap', minutes: 26, range: '26 min',
      why: 'Pilots on long-haul flights who napped about 26 minutes improved performance by 34% and alertness by 54%.',
      when: 'Mid-shift or early afternoon', refs: ['rosekind1995'] },
    { id: 'coffee', name: 'Coffee nap', minutes: 20, range: '20 min after a coffee',
      why: 'Drinking a coffee right before a 15–20 minute nap cut sleepiness more than either alone; the caffeine kicks in as you wake.',
      when: 'Before 2 pm, so the caffeine is gone by bedtime', refs: ['reyner1997', 'drake2013'] },
    { id: 'cycle', name: 'Full-cycle nap', minutes: 90, range: '90 min',
      why: 'One full sleep cycle, including deep sleep and REM, so you wake at the end of a cycle rather than in deep sleep.',
      when: 'Only when short on sleep; avoid after 3 pm', refs: ['sleepStages'] },
  ];

  WS.SLEEP_TIPS = [
    { title: 'Same wake time every day', text: 'A fixed wake-up time, weekends included, anchors your body clock more than anything else.', refs: ['irish2015'] },
    { title: 'Caffeine cut-off', text: 'A strong dose of caffeine (400 mg) even 6 hours before bed cut sleep by more than an hour. Keep coffee to the morning and early afternoon.', refs: ['drake2013'] },
    { title: 'Sleep builds muscle', text: 'Deep sleep is when growth hormone peaks and muscle repairs; short sleep shifts the body toward breaking muscle down.', refs: ['dattilo2011'] },
    { title: 'Sleep for fat loss', text: 'Dieters sleeping 5.5 h instead of 8.5 h lost the same weight but 55% less of it was fat, and 60% more was lean mass.', refs: ['nedeltcheva2010'] },
    { title: 'Cool, dark, quiet', text: 'A cool room (around 18 °C), blackout curtains and no screens in the last 30–60 minutes help you fall asleep.', refs: ['irish2015'] },
    { title: 'Train earlier if you can', text: 'Hard training is fine in the evening for most people, but finish 1–2 hours before bed and avoid big meals right before sleep.', refs: ['irish2015'] },
  ];

  WS.SLEEP_LINKS = [
    { title: 'Yoga nidra for sleep', q: 'yoga nidra for sleep', kind: 'Guided relaxation' },
    { title: 'Guided sleep meditation', q: 'guided sleep meditation', kind: 'Guided relaxation' },
    { title: 'Body scan for sleep', q: 'body scan meditation for sleep', kind: 'Guided relaxation' },
    { title: 'Bedtime yoga', q: 'bedtime yoga', kind: 'Yoga With Adriene', channel: 'adriene' },
    { title: 'Sleep manifestation affirmations', q: 'sleep manifestation affirmations', kind: 'Manifestation' },
    { title: 'Law of attraction sleep meditation', q: 'law of attraction sleep meditation', kind: 'Manifestation' },
    { title: 'Rain sounds for sleeping', q: 'rain sounds for sleeping 8 hours', kind: 'Calm sounds' },
    { title: 'Brown noise', q: 'brown noise for sleep', kind: 'Calm sounds' },
    { title: 'Deep sleep music (delta waves)', q: 'deep sleep music delta waves', kind: 'Calm sounds' },
  ];

  WS.MEDITATION_LINKS = [
    { title: 'UCLA free guided meditations', url: 'https://www.uclahealth.org/programs/marc/free-guided-meditations', kind: 'UCLA Mindful Awareness Research Center' },
    { title: '10-minute guided meditation', q: '10 minute guided meditation', kind: 'Guided' },
    { title: 'Body scan meditation', q: 'body scan meditation', kind: 'Guided' },
    { title: 'Loving-kindness meditation', q: 'loving kindness meditation', kind: 'Guided' },
    { title: 'Box breathing', q: 'box breathing guided', kind: 'Breathing' },
    { title: 'Om chanting 108 times', q: 'om chanting 108 times', kind: 'Om' },
    { title: 'Tibetan singing bowls', q: 'tibetan singing bowls meditation', kind: 'Sounds' },
    { title: 'Meditation for anxiety', q: 'guided meditation for anxiety', kind: 'Guided' },
  ];

  // Breathing patterns: [phase, seconds] repeated.
  WS.BREATHING = {
    box: { label: 'Box breathing (4-4-4-4)', steps: [['Breathe in', 4], ['Hold', 4], ['Breathe out', 4], ['Hold', 4]],
      why: 'Slow, even breathing calms the nervous system.', refs: ['zaccaro2018'] },
    relax: { label: '4-7-8 relaxing breath', steps: [['Breathe in', 4], ['Hold', 7], ['Breathe out', 8]],
      why: 'A long exhale slows the heart; good for falling asleep.', refs: ['zaccaro2018'] },
    sigh: { label: 'Cyclic sighing (5 min)', steps: [['Breathe in', 3], ['Top up', 1], ['Long breathe out', 6]],
      why: 'Five minutes a day improved mood and lowered breathing rate more than mindfulness meditation in a 2023 trial.', refs: ['balban2023'] },
    slow: { label: 'Slow breathing (6 / min)', steps: [['Breathe in', 5], ['Breathe out', 5]],
      why: 'About six breaths a minute maximises heart-rate variability.', refs: ['zaccaro2018'] },
  };

  WS.SOUNDS = {
    pad: 'Soft ambient pad',
    rain: 'Gentle rain',
    ocean: 'Ocean waves',
    bowls: 'Singing bowls',
    om: 'Om chant',
    silence: 'Silence (timer only)',
  };
})(window.WS = window.WS || {});
