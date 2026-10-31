// Recommendation engine: scores every split for a profile, then turns the
// chosen split into a full week (exercises, sets, reps, effort, rest).
(function (WS) {
  const P = WS.PATTERNS;

  const EQUIP = {
    gym: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band', 'kettlebell'],
    home: ['dumbbell', 'kettlebell', 'bodyweight', 'band'],
    bodyweight: ['bodyweight', 'band'],
  };
  const TIER = { S: 3, A: 2, B: 1 };
  const MAJOR = ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes'];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function ageGroup(age) {
    if (age < 18) return 'youth';
    if (age < 40) return 'adult';
    if (age < 60) return 'master';
    return 'senior';
  }

  function focusMuscles(focus) {
    return focus && WS.FOCUS[focus] ? WS.FOCUS[focus].muscles : [];
  }

  // Weekly direct-set targets per muscle (Schoenfeld 2017; Pelland 2024).
  function weeklyTargets(p) {
    const base = { beginner: 10, intermediate: 14, advanced: 18 }[p.level];
    const goalMul = { muscle: 1, recomp: 0.9, strength: 0.8, athletic: 0.7, fatloss: 0.75, general: 0.6 }[p.goal];
    const ageMul = { youth: 0.7, adult: 1, master: 0.9, senior: 0.7 }[ageGroup(p.age)];
    const t = base * goalMul * ageMul;
    const focus = focusMuscles(p.focus);
    const out = {};
    for (const m of Object.keys(WS.MUSCLES)) {
      let v = m === 'core' || m === 'calves' ? t * 0.7 : t;
      if (focus.length) v = focus.includes(m) ? t * 1.4 : v * 0.85;
      out[m] = Math.max(4, Math.round(v));
    }
    return out;
  }

  // ---------- exercise selection ----------

  const rankExercises = (pattern, p, used, mode) => scoreExercises(pattern, p, used, mode).map((x) => x.e);

  function scoreExercises(pattern, p, used, mode) {
    const allowed = EQUIP[p.equipment];
    const ag = ageGroup(p.age);
    const maxSkill = p.level === 'beginner' || ag === 'youth' ? 2 : 3;
    const strengthy = p.goal === 'strength' || mode === 'strength' || mode === '5x5';
    return WS.EXERCISES
      .filter((e) => e.pattern === pattern && allowed.includes(e.eq))
      .map((e, i) => {
        let s = TIER[e.tier] - i * 0.01;
        if (e.skill > maxSkill && mode !== '5x5') s -= 3;
        if (ag === 'senior') {
          if (e.axial) s -= 1.5;
          if (e.skill === 3) s -= 3;
          if (e.impact) s -= 2;
          if (e.senior) s += 4;
        }
        if (p.bodyType === 'higher' && e.impact) s -= 1.5;
        if (strengthy && e.main) s += 2;
        if (mode === '5x5' && e.eq === 'barbell') s += 3;
        if (p.goal === 'athletic' && e.main) s += 0.5;
        const n = used[e.id] || 0;
        if (n && !(strengthy && e.main)) s -= 2 * n;
        // `fit` = safe to pick at random: right skill level, no senior red flags.
        const fit = (e.skill <= maxSkill || mode === '5x5') && !(ag === 'senior' && (e.skill === 3 || e.impact));
        return { e, s, fit };
      })
      .sort((a, b) => b.s - a.s);
  }

  // ---------- variety ----------
  // every: weeks between exercise rotations. pool/spread: how many of the
  // ranked options, and how far below the best score, a pick may come from.
  const VARIETY = {
    nil: { label: 'Nil', every: Infinity, pool: 1, spread: 0 },
    low: { label: 'Low', every: 8, pool: 2, spread: 1.05 },
    medium: { label: 'Medium', every: 4, pool: 3, spread: 1.5 },
    high: { label: 'High', every: 2, pool: 4, spread: 2.5 },
    extreme: { label: 'Extreme', every: 1, pool: 99, spread: 4 },
  };

  // Small seeded PRNG (mulberry32) so a week's plan is reproducible.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function blockOf(p) {
    const v = VARIETY[p.variety] || VARIETY.nil;
    return v.every === Infinity ? 0 : Math.floor(((p.week || 1) - 1) / v.every);
  }

  // Moves a randomly chosen near-best option to the front of the ranking.
  function varyPick(scored, p, mode, rand) {
    const v = VARIETY[p.variety] || VARIETY.nil;
    if (v.pool < 2 || scored.length < 2) return scored;
    const strengthy = p.goal === 'strength' || mode === 'strength' || mode === '5x5';
    const mainLift = strengthy && scored[0].e.main;
    if (mainLift && p.variety !== 'extreme') return scored;
    const best = scored[0].s;
    // Even at Extreme, a strength main lift only rotates among barbell variants.
    const pool = scored.slice(0, v.pool).filter((x) => x.s >= best - v.spread && x.fit
      && (!mainLift || x.e.eq === scored[0].e.eq));
    if (!pool.length) return scored;
    const pick = pool[Math.floor(rand() * pool.length)];
    return [pick].concat(scored.filter((x) => x !== pick));
  }

  // ---------- prescriptions ----------

  function scheme(kind, p, mode, isMain) {
    const ag = ageGroup(p.age);
    const female = p.gender === 'female';
    const isoRest = female ? '60–90 s' : '1–2 min';
    if (kind === 'power') return { reps: ag === 'senior' ? '6–8 fast' : '3–5 explosive', rir: 'Stop before speed drops', rest: '2 min' };
    if (kind === 'balance') return { reps: '30–45 s / side', rir: 'Near a wall', rest: '30 s' };
    if (kind === 'conditioning') return { reps: '10–15 min', rir: mode === 'circuit' ? 'Hard but steady' : 'Zone 2 or intervals', rest: '—' };
    if (kind === 'carry') return { reps: '30–40 m', rir: 'Heavy, tall posture', rest: '90 s' };

    if (mode === '5x5') return { reps: '5', rir: '1–2 (add 2.5 kg next time)', rest: '3–5 min' };
    if (mode === 'circuit') return { reps: kind === 'compound' ? '8–12' : '12–15', rir: '2', rest: 'Next exercise; 2 min between rounds' };

    if (ag === 'youth') return { reps: kind === 'compound' ? '8–12' : '10–15', rir: '2–3 (technique first)', rest: '90 s' };
    if (ag === 'senior') return { reps: kind === 'compound' ? '8–12 (lift fast, lower slow)' : '10–15', rir: '2–3', rest: kind === 'compound' ? '2 min' : '90 s' };

    const beginner = p.level === 'beginner';
    const rir = (compound) => (beginner ? '2–3' : compound ? '1–2' : '0–1');
    if (kind === 'core') return { reps: '10–15 or 20–40 s', rir: rir(false), rest: '60 s' };

    const goal = mode === 'strength' ? 'strength' : mode === 'hypertrophy' ? 'muscle' : p.goal;
    if (goal === 'strength' || goal === 'athletic') {
      if (kind === 'compound' && isMain) return { reps: '3–5', rir: '2', rest: '3–5 min' };
      if (kind === 'compound') return { reps: '6–8', rir: rir(true), rest: '2–3 min' };
      return { reps: '8–12', rir: rir(false), rest: isoRest };
    }
    if (goal === 'general') {
      return kind === 'compound' ? { reps: '8–12', rir: '2–3', rest: '90 s–2 min' } : { reps: '10–15', rir: '2', rest: isoRest };
    }
    if (goal === 'fatloss') {
      return kind === 'compound' ? { reps: '6–12', rir: rir(true), rest: '90 s–2 min' } : { reps: '12–20', rir: rir(false), rest: '60 s (superset OK)' };
    }
    // muscle / recomp
    return kind === 'compound' ? { reps: '6–10', rir: rir(true), rest: '2–3 min' } : { reps: '10–15', rir: rir(false), rest: isoRest };
  }

  const MIN_PER_SET = { compound: 3, iso: 2, core: 1.5, power: 2, balance: 1.5, carry: 2 };

  function itemMinutes(it, mode) {
    if (it.kind === 'conditioning') return 12;
    if (mode === 'circuit') return it.sets * 1.5;
    const per = (mode === 'strength' || mode === '5x5') && it.kind === 'compound' ? 4 : MIN_PER_SET[it.kind];
    return it.sets * per;
  }

  const dayMinutes = (day) => 8 + day.items.reduce((t, it) => t + itemMinutes(it, day.mode), 0);

  // ---------- plan building ----------

  // Adds age/goal-specific slots on top of the split template.
  function personalize(days, split, p) {
    const ag = ageGroup(p.age);
    if (ag === 'senior' && split.id !== 'active-aging') {
      days.slice(0, 3).forEach((d) => { if (!d.slots.includes('balance')) d.slots.unshift('balance'); });
    }
    if (p.goal === 'athletic' && split.id !== 'athletic') {
      days.slice(0, 2).forEach((d) => { if (!d.slots.includes('power')) d.slots.unshift('power'); });
    }
    const wantsFinisher = p.goal === 'fatloss' || (p.bodyType === 'higher' && (p.goal === 'recomp' || p.goal === 'general'));
    if (wantsFinisher && split.id !== 'circuit') {
      days.slice(0, 2).forEach((d) => { if (!d.slots.includes('conditioning')) d.slots.push('conditioning'); });
    }
  }

  function allocateSets(days, p) {
    const targets = weeklyTargets(p);
    const direct = {};
    days.forEach((d) => d.slots.forEach((s) => { const m = P[s].muscle; if (m) direct[m] = (direct[m] || 0) + 1; }));

    const maxSets = p.level === 'beginner' || ageGroup(p.age) === 'senior' ? 4 : 5;
    let perSlot = {};
    for (let pass = 0; pass < 2; pass++) {
      const indirect = {};
      days.forEach((d) => d.slots.forEach((s) => {
        const sets = pass === 0 ? 3 : perSlot[P[s].muscle] || 3;
        for (const [m, f] of Object.entries(P[s].also || {})) indirect[m] = (indirect[m] || 0) + sets * f;
      }));
      const next = {};
      for (const m of Object.keys(direct)) next[m] = clamp(Math.round((targets[m] - (indirect[m] || 0)) / direct[m]), 2, maxSets);
      perSlot = next;
    }
    return { targets, perSlot };
  }

  function buildPlan(split, p) {
    const days = split.build(p.days, p).map((d) => Object.assign({}, d, { slots: d.slots.slice() }));
    personalize(days, split, p);
    const { targets, perSlot } = allocateSets(days, p);
    const used = {};
    const warnings = [];
    const block = blockOf(p);
    const rand = rng(((p.seed || 1) * 7919 + block * 104729) >>> 0);

    days.forEach((d) => {
      const dayUsed = new Set();
      let mainSet = false;
      d.items = [];
      d.slots.forEach((slot) => {
        const pat = P[slot];
        // Only suitable options (skill level, senior safety); skip the slot if none are left.
        const scored = scoreExercises(slot, p, used, d.mode).filter((x) => x.fit && !dayUsed.has(x.e.id));
        const ranked = varyPick(scored, p, d.mode, rand).map((x) => x.e);
        if (!ranked.length) return;
        const ex = ranked[0];
        dayUsed.add(ex.id);
        used[ex.id] = (used[ex.id] || 0) + 1;
        const isMain = pat.kind === 'compound' && !mainSet;
        if (isMain) mainSet = true;

        let sets;
        if (pat.kind === 'power' || pat.kind === 'carry') sets = 3;
        else if (pat.kind === 'balance') sets = 2;
        else if (pat.kind === 'conditioning') sets = 1;
        else if (d.mode === 'circuit') sets = 3;
        else if (d.mode === '5x5') sets = slot === 'hinge' ? 1 : pat.kind === 'compound' ? 5 : 3;
        else sets = perSlot[pat.muscle] || 3;
        if (d.focusSlot === slot) sets = Math.min(sets + 1, 5);

        d.items.push(Object.assign({ slot, kind: pat.kind, ex, alts: ranked, sets, focus: d.focusSlot === slot },
          scheme(pat.kind, p, d.mode, isMain)));
      });

      // Fit the session into the time available: trim isolation sets, then
      // compound sets, then drop trailing isolation exercises.
      const budget = p.minutes;
      const trim = (kinds, floor) => {
        for (let guard = 0; dayMinutes(d) > budget && guard < 40; guard++) {
          const it = d.items.slice().reverse().find((x) => kinds.includes(x.kind) && x.sets > floor && !x.focus);
          if (!it) break;
          it.sets--;
        }
      };
      if (d.mode !== '5x5') {
        trim(['iso', 'core'], 2);
        trim(['compound'], 2);
        while (dayMinutes(d) > budget && d.items.length > 4) {
          const idx = d.items.map((x) => x.kind).lastIndexOf('iso');
          if (idx < 0) break;
          d.items.splice(idx, 1);
        }
      }
      d.minutes = Math.round(dayMinutes(d));
      if (d.minutes > budget * 1.15) warnings.push(`${d.name} runs about ${d.minutes} min, over your ${budget}-min window. Superset the isolation work or pick more days.`);
    });

    return { split, days, targets, volume: weeklyVolume(days), warnings, schedule: schedule(p.days), block };
  }

  function weeklyVolume(days) {
    const v = {};
    Object.keys(WS.MUSCLES).forEach((m) => (v[m] = 0));
    days.forEach((d) => d.items.forEach((it) => {
      const pat = P[it.slot];
      if (pat.muscle) v[pat.muscle] += it.sets;
      for (const [m, f] of Object.entries(pat.also || {})) v[m] += it.sets * f;
    }));
    Object.keys(v).forEach((m) => (v[m] = Math.round(v[m] * 2) / 2));
    return v;
  }

  // How many days per week each major muscle gets meaningful work.
  function frequency(days) {
    const per = MAJOR.map((m) => days.filter((d) => d.slots.some((s) => P[s].muscle === m || (P[s].also || {})[m] >= 0.5 && m !== 'shoulders')).length);
    return per.reduce((a, b) => a + b, 0) / per.length;
  }

  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const LAYOUT = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5] };
  function schedule(n) {
    const on = LAYOUT[n];
    return DAY_NAMES.map((name, i) => ({ name, train: on.indexOf(i) }));
  }

  // ---------- split recommendation ----------

  function scoreSplit(split, p) {
    const reasons = [];
    const cautions = [];
    if (!split.days.includes(p.days)) return null;
    if (split.needs === 'barbell' && p.equipment !== 'gym') return null;

    const ag = ageGroup(p.age);
    const days = split.build(p.days, p);
    const freq = frequency(days);
    const goalFit = split.fit.goals[p.goal];
    const levelFit = split.fit.level[p.level];
    let score = goalFit * 3 + levelFit * 2;

    if (goalFit >= 5) reasons.push('Excellent match for your goal.');
    else if (goalFit <= 2) cautions.push('Not designed around your goal.');
    if (levelFit >= 5) reasons.push(`Built for ${p.level}s.`);
    else if (levelFit <= 1) cautions.push(`Usually too demanding or not suited to a ${p.level}.`);

    if (['muscle', 'strength', 'recomp', 'general'].includes(p.goal)) {
      if (freq >= 1.8) { score += 3; reasons.push(`Trains each major muscle about ${freq.toFixed(1)}× per week; 2× beats 1× for growth (Schoenfeld 2016).`); }
      else if (freq < 1.3) { score -= 2; cautions.push('Each muscle is trained about once a week. Workable, but 2× per week is modestly better on average.'); }
    }

    if (ag === 'senior') {
      if (split.id === 'active-aging') score += 1;
      if (['full-body', 'active-aging'].includes(split.id)) { score += 5; reasons.push('Full-body work 2–3×/week with balance and power, as NSCA recommends for 60+ (Fragala 2019).'); }
      if (split.id === 'strength-5x5') { score -= 4; cautions.push('Heavy barbell 5×5 is a big jump after 60; build up with machines and dumbbells first.'); }
      if (['bro-split', 'arnold'].includes(split.id) || p.days >= 6) { score -= 4; cautions.push('High per-muscle fatigue and frequency demands are harder to recover from after 60.'); }
    } else if (ag === 'youth') {
      if (split.id === 'full-body') { score += 3; reasons.push('Full body 2–3×/week with technique focus matches NSCA youth guidance (Faigenbaum 2009).'); }
      if (['bro-split', 'arnold', 'specialization'].includes(split.id)) { score -= 3; cautions.push('Too specialised for teens; build an all-round base first.'); }
    } else if (ag === 'master' && p.days >= 6) {
      score -= 1; cautions.push('6 days a week needs very good sleep and recovery in your 40s and 50s.');
    }
    if (split.id === 'active-aging' && ag !== 'senior') score -= 4;

    if (p.bodyType === 'higher' && split.id === 'circuit') { score += 2; reasons.push('Built-in conditioning helps with fat loss and heart health.'); }
    if (p.bodyType === 'lean') {
      if (split.id === 'circuit') score -= 2;
      if (['strength-5x5', 'full-body', 'upper-lower', 'phul'].includes(split.id)) { score += 1; reasons.push('Compound-heavy, which suits someone building their first layer of size.'); }
    }

    if (p.focus) {
      if (split.id === 'specialization') { score += 7; reasons.push(`Puts ${WS.FOCUS[p.focus].label.toLowerCase()} first in almost every session.`); }
      if (split.id === 'bro-split') score += 1;
    } else if (split.id === 'specialization') {
      score -= 10;
      cautions.push('Pick a focus area to use this split.');
    }

    if (p.minutes <= 45 && ['full-body', 'circuit', 'upper-lower', 'ulf'].includes(split.id)) score += 0.5;
    if (p.minutes <= 30 && ['bro-split', 'arnold'].includes(split.id)) { score -= 1; cautions.push('Sessions are hard to fit into 30 minutes.'); }
    if (split.id === 'strength-5x5' && p.goal === 'strength' && p.level === 'beginner') reasons.push('Beginners can add weight almost every session; this cashes in on that.');

    return { split, score, freq, reasons, cautions };
  }

  function recommend(p) {
    const ranked = WS.SPLITS.map((s) => scoreSplit(s, p)).filter(Boolean).sort((a, b) => b.score - a.score);
    const top = ranked.length ? ranked[0].score : 1;
    ranked.forEach((r) => (r.match = clamp(Math.round((r.score / Math.max(top, 1)) * 100), 5, 100)));
    // Splits that would fit with a different number of days.
    const otherDays = WS.SPLITS.filter((s) => !s.days.includes(p.days)).map((s) => ({ split: s, days: s.days }));
    return { ranked, otherDays };
  }

  // Yoga / Pilates / HIIT suggestions for the profile.
  function suggest(list, p) {
    const ag = ageGroup(p.age);
    return list
      .map((r) => ({ r, s: (r.tags[p.goal] || 0) + (r.tags[p.level] || 0) + (r.tags[ag] || 0) + (r.tags[p.bodyType] || 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map((x) => x.r);
  }

  WS.engine = { recommend, buildPlan, weeklyTargets, ageGroup, frequency, rankExercises, suggest, EQUIP, VARIETY };
})(window.WS = window.WS || {});
