// UI: tabs, planner form, results and the browsable libraries.
(function (WS) {
  const E = WS.engine;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const GOALS = { muscle: 'Build muscle', strength: 'Strength', fatloss: 'Fat loss', recomp: 'Recomposition', general: 'Health & longevity', athletic: 'Athletic' };
  const BODY = { lean: 'Lean build', average: 'Average build', higher: 'Higher body fat' };
  const EQUIP = { gym: 'Full gym', home: 'Home gym', bodyweight: 'Bodyweight' };
  const EQ_LABEL = { barbell: 'Barbell', dumbbell: 'Dumbbell', machine: 'Machine', cable: 'Cable', bodyweight: 'Bodyweight', band: 'Band', kettlebell: 'Kettlebell' };

  // ---------- shared bits ----------

  function cite(keys) {
    if (!keys || !keys.length) return '';
    return '<span class="cite">' + keys.map((k) => {
      const r = WS.REFS[k];
      return r ? `<a href="${r.url}" target="_blank" rel="noopener" title="${esc(r.citation)}">${esc(r.short)}</a>` : '';
    }).join(', ') + '</span>';
  }

  const vid = (channel, query) =>
    `<a class="vid" href="${WS.yt(channel, query)}" target="_blank" rel="noopener">${esc(WS.CHANNELS[channel].name)}</a>`;

  function exerciseVideos(ex) {
    const q = ex.yt || ex.name;
    const out = [vid('jeremy', q), vid('athlean', q)];
    if (ex.eq === 'bodyweight' || ['power', 'conditioning'].includes(ex.pattern)) out.push(vid('thenx', q));
    return '<div class="vids">' + out.join('') + '</div>';
  }

  function exerciseCard(ex) {
    const pat = WS.PATTERNS[ex.pattern];
    return `<article class="card">
      <div class="ex-head"><span class="tier ${ex.tier}" title="Evidence tier">${ex.tier}</span>
        <div class="ex-name" style="cursor:default">${esc(ex.name)}<small>${esc(pat.label)} · ${EQ_LABEL[ex.eq]} · skill ${'●'.repeat(ex.skill)}${'○'.repeat(3 - ex.skill)}</small></div></div>
      <p class="small">${esc(ex.why)} ${cite(ex.refs)}</p>
      <p class="small muted"><b>Cues:</b> ${esc(ex.cues)}</p>
      ${exerciseVideos(ex)}
    </article>`;
  }

  // ---------- tabs ----------

  const TABS = ['planner', 'splits', 'exercises', 'hiit', 'yoga', 'pilates', 'longevity', 'science'];
  const rendered = {};
  const RENDER = { splits: renderSplits, exercises: renderExercises, hiit: renderHiit, yoga: renderYoga, pilates: renderPilates, longevity: renderLongevity, science: renderScience };

  function showTab() {
    const id = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'planner';
    TABS.forEach((t) => { $('#tab-' + t).hidden = t !== id; });
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === id));
    if (RENDER[id] && !rendered[id]) { RENDER[id](); rendered[id] = true; }
    window.scrollTo(0, 0);
  }

  // ---------- planner ----------

  const state = { profile: null, rec: null, splitId: null, plan: null, week: 1, seed: newSeed() };
  const STORE = 'workout-splits:profile';

  function readProfile() {
    const f = new FormData($('#profile-form'));
    const num = (k, d) => (f.get(k) ? Number(f.get(k)) : d);
    return {
      age: Math.min(95, Math.max(13, num('age', 28))),
      gender: f.get('gender'), bodyType: f.get('bodyType'), goal: f.get('goal'), level: f.get('level'),
      days: num('days', 4), minutes: num('minutes', 60), equipment: f.get('equipment'),
      focus: f.get('focus') || '', weight: num('weight', 0),
      variety: f.get('variety') || 'medium', weeks: num('weeks', 12),
    };
  }

  function newSeed() {
    return Math.floor(Math.random() * 1e9) + 1;
  }

  function loadProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!saved) return;
      const form = $('#profile-form');
      Object.entries(saved).forEach(([k, v]) => { if (form.elements[k] && v) form.elements[k].value = v; });
      if (saved.seed) state.seed = saved.seed;
    } catch (e) { /* storage unavailable */ }
  }

  function run(splitId) {
    const p = readProfile();
    state.week = Math.min(state.week, p.weeks);
    p.week = state.week;
    p.seed = state.seed;
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* ignore */ }
    state.profile = p;
    state.rec = E.recommend(p);
    const ids = state.rec.ranked.map((r) => r.split.id);
    state.splitId = splitId && ids.includes(splitId) ? splitId : ids[0];
    state.plan = E.buildPlan(WS.SPLIT_BY_ID[state.splitId], p);
    renderResults();
  }

  function varietyHtml(p, plan) {
    const v = E.VARIETY[p.variety];
    const blocks = v.every === Infinity ? 1 : Math.ceil(p.weeks / v.every);
    const desc = v.every === Infinity ? 'Same exercises for the whole program.'
      : v.every === 1 ? 'A fresh mix of exercises every week.'
      : `Exercises rotate every ${v.every} weeks: block ${plan.block + 1} of ${blocks}.`;
    return `<div class="variety no-print">
      <button class="btn small" data-week="${p.week - 1}" ${p.week <= 1 ? 'disabled' : ''} aria-label="Previous week">‹</button>
      <select id="week-select" aria-label="Program week">${Array.from({ length: p.weeks }, (_, i) =>
        `<option value="${i + 1}"${i + 1 === p.week ? ' selected' : ''}>Week ${i + 1} of ${p.weeks}</option>`).join('')}</select>
      <button class="btn small" data-week="${p.week + 1}" ${p.week >= p.weeks ? 'disabled' : ''} aria-label="Next week">›</button>
      <span class="chip accent">Variety: ${v.label}</span>
      ${p.variety !== 'nil' ? '<button class="btn small" id="reshuffle" title="New random exercise mix">🎲 Reshuffle</button>' : ''}
      <span class="small muted">${desc}</span>
    </div>`;
  }

  function renderResults() {
    const { profile: p, rec, plan } = state;
    const top = rec.ranked.slice(0, 3);
    if (!top.some((r) => r.split.id === state.splitId)) top.push(rec.ranked.find((r) => r.split.id === state.splitId));
    const rest = rec.ranked.filter((r) => !top.includes(r));
    const otherDays = rec.otherDays.map((o) => `${esc(o.split.name)} (${o.days.join('/')} days)`).join(', ');

    $('#results').innerHTML = `
      <div class="chips">
        <span class="chip accent">${p.age} yrs</span><span class="chip">${p.gender === 'other' ? 'Any gender' : p.gender[0].toUpperCase() + p.gender.slice(1)}</span>
        <span class="chip">${BODY[p.bodyType]}</span><span class="chip">${GOALS[p.goal]}</span><span class="chip">${p.level}</span>
        <span class="chip">${p.days} days × ${p.minutes} min</span><span class="chip">${EQUIP[p.equipment]}</span>
        ${p.focus ? `<span class="chip accent">Focus: ${WS.FOCUS[p.focus].label}</span>` : ''}
      </div>

      <div>
        <div class="section-title"><h2>Best splits for you</h2><span class="muted small">Click one to see its program</span></div>
        <div class="recs">${top.map((r, i) => recCard(r, rec.ranked.indexOf(r) + 1, i)).join('')}</div>
        ${rest.length ? `<p class="more-splits">Also possible on ${p.days} days: ${rest.map((r) => `<button data-split="${r.split.id}">${esc(r.split.name)}</button>`).join(' · ')}</p>` : ''}
        ${otherDays ? `<p class="more-splits">Needs a different number of days: ${otherDays}.</p>` : ''}
      </div>

      ${planHtml(plan, p)}
    `;
  }

  function recCard(r, rank) {
    const sel = r.split.id === state.splitId ? ' selected' : '';
    const items = r.reasons.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).concat(r.cautions.slice(0, 2).map((t) => `<li class="caution">${esc(t)}</li>`));
    return `<button class="card rec${sel}" data-split="${r.split.id}">
      <span class="rank">#${rank}</span>
      <div class="match">${r.match}%</div>
      <h3>${esc(r.split.name)}</h3>
      <div class="muted small">${esc(r.split.category)} · ~${r.freq.toFixed(1)}× / muscle / week</div>
      <ul>${items.join('')}</ul>
    </button>`;
  }

  function planHtml(plan, p) {
    const s = plan.split;
    const restDays = 7 - p.days;
    return `
      <div class="card">
        <div class="section-title"><h2>${esc(s.name)}</h2>
          <div class="no-print"><button class="btn small" id="copy-plan">Copy as text</button> <button class="btn small" onclick="window.print()">Print / PDF</button></div></div>
        <p class="muted">${esc(s.summary)}</p>
        <p class="small"><b>Why it works:</b> ${esc(s.evidence)} ${cite(s.refs)}</p>
        ${varietyHtml(p, plan)}
        <div class="week">${plan.schedule.map((d) => d.train >= 0
          ? `<div class="on"><b>${d.name}</b>${esc(plan.days[d.train].name.split(' + ')[0])}</div>`
          : `<div><b>${d.name}</b>Rest / recovery</div>`).join('')}</div>
        ${plan.warnings.map((w) => `<p class="warn">${esc(w)}</p>`).join('')}
      </div>

      <div class="days">${plan.days.map((d, di) => dayHtml(d, di)).join('')}</div>

      <div class="card">
        <div class="section-title"><h2>Weekly sets per muscle</h2><span class="muted small">Bar = your plan · line = your target · synergists count half</span></div>
        <div class="bars">${Object.keys(WS.MUSCLES).map((m) => {
          const v = plan.volume[m], t = plan.targets[m], max = 26;
          return `<div class="bar-row"><span>${WS.MUSCLES[m]}</span><div class="bar"><span style="width:${Math.min(100, (v / max) * 100)}%"></span><i style="left:${Math.min(100, (t / max) * 100)}%"></i></div><span class="num">${v} / ${t}</span></div>`;
        }).join('')}</div>
        <p class="small muted" style="margin-top:10px">More weekly sets build more muscle with diminishing returns; about 10–20 hard sets per muscle per week is the well-supported range for most people. ${cite(['volume2017', 'pelland2024'])}</p>
      </div>

      ${recoveryHtml(p, restDays)}

      <div>
        <h2>Personalised for you</h2>
        <div class="notes">${personalNotes(p).map((n) => `<div class="card note"><h4>${esc(n.title)}</h4>${n.html} ${cite(n.refs)}</div>`).join('')}</div>
      </div>
    `;
  }

  function dayHtml(d, di) {
    return `<div class="card day">
      <h3>${esc(d.name)} <small>~${d.minutes} min</small></h3>
      ${d.items.map((it, ii) => `
        <div class="ex-row">
          <div class="ex-head">
            <span class="tier ${it.ex.tier}">${it.ex.tier}</span>
            <div class="ex-name" data-toggle="${di}-${ii}">${esc(it.ex.name)}${it.focus ? '<span class="focus-tag">focus</span>' : ''}
              <small>${esc(WS.PATTERNS[it.slot].label)}</small></div>
            ${it.alts.length > 1 ? `<button class="swap no-print" data-swap="${di}-${ii}" title="Swap for another evidence-ranked option">↻ swap</button>` : ''}
          </div>
          <div class="ex-presc"><b>${it.sets} × ${esc(it.reps)}</b> · effort: ${esc(it.rir)}${/^\d/.test(it.rir) ? ' reps in reserve' : ''} · rest ${esc(it.rest)}</div>
          <div class="ex-detail" id="detail-${di}-${ii}" hidden>
            <p>${esc(it.ex.why)} ${cite(it.ex.refs)}</p>
            <p class="muted"><b>Cues:</b> ${esc(it.ex.cues)}</p>
            ${exerciseVideos(it.ex)}
          </div>
        </div>`).join('')}
    </div>`;
  }

  function recoveryHtml(p, restDays) {
    const ag = E.ageGroup(p.age);
    const yoga = E.suggest(WS.YOGA_ROUTINES, p);
    const pilates = E.suggest(WS.PILATES_ROUTINES, p);
    let hiit = E.suggest(WS.HIIT, p);
    if (ag === 'senior' || p.level === 'beginner') hiit = WS.HIIT.filter((h) => h.id === 'beginner-30-30');
    if (ag === 'youth') hiit = [];
    const z2 = { fatloss: '150–300', general: '150', recomp: '120–150', muscle: '60–90', strength: '60–90', athletic: '90–120' }[p.goal];
    const card = (title, r, channel, extra) => `<div class="card note"><h4>${title}: ${esc(r.name)}</h4>
      <p class="small">${r.minutes} min · ${esc(r.when || r.level)}</p><p>${esc(r.purpose || r.protocol)}</p>
      <div class="vids">${vid(channel, r.query)}</div>${extra || ''}</div>`;
    return `<div>
      <div class="section-title"><h2>Cardio, mobility &amp; recovery</h2><span class="muted small">${restDays} non-lifting day${restDays === 1 ? '' : 's'} a week</span></div>
      <div class="notes">
        <div class="card note"><h4>Zone 2 cardio: ${z2} min / week</h4>
          <p>Easy, conversational pace: walking, cycling, rowing. A 10-minute walk after meals counts. Keep hard cardio away from leg days if you are chasing leg growth.</p>
          ${cite(['who2020', 'wilson2012', 'buffey2022'])}</div>
        ${hiit.map((h) => card('Intervals', h, 'thenx', cite(h.refs))).join('')}
        ${yoga.map((y) => card('Yoga', y, 'adriene', cite(y.refs))).join('')}
        ${pilates.slice(0, 1).map((r) => card('Pilates', r, 'blogilates', cite(r.refs))).join('')}
      </div>
      <p class="small muted" style="margin-top:8px">Framework (strength + Zone 2 + intervals + balance/mobility) credit: Bryan Johnson. See the <a href="#longevity">Longevity</a> tab.</p>
    </div>`;
  }

  function personalNotes(p) {
    const ag = E.ageGroup(p.age);
    const notes = [];

    if (ag === 'youth') notes.push({ title: 'Training as a teen', refs: ['faigenbaum2009'],
      html: '<p>Strength training is safe and beneficial for young people when supervised; it does not stunt growth. Master technique with moderate loads first, and only test maximal lifts once form is solid.</p>' });
    if (ag === 'master') notes.push({ title: 'Training in your 40s–50s', refs: ['fragala2019', 'liftmor2018'],
      html: '<p>Keep lifting heavy; strength and muscle loss speed up from here, and resistance training is the best counter. Use a longer warm-up (8–10 min plus ramp-up sets), sleep 7–9 h, and take an extra rest day when joints are achy.</p>' });
    if (ag === 'senior') notes.push({ title: 'Training after 60', refs: ['fragala2019', 'peterson2010', 'who2020'],
      html: '<ul><li>Balance work is added at the start of sessions; WHO recommends it 3×/week for 65+.</li><li><b>Power matters:</b> lift fast (safely), lower slowly. Power declines faster than strength.</li><li>Stop 2–3 reps short of failure. Machines are great: stable and joint-friendly.</li></ul>' });

    if (p.gender === 'female') notes.push({ title: 'For women', refs: ['roberts2020', 'hunter2014', 'mcnulty2020', 'liftmor2018'],
      html: '<ul><li>Women gain muscle and strength at the same <i>relative</i> rate as men, so train with the same intensity. Light weights don\'t "tone" better.</li><li>Women tend to be more fatigue-resistant, so slightly shorter rests on isolation work are fine.</li><li>Cycle phase has only a trivial average effect on performance; adjust by how you feel rather than a fixed rule.</li>' + (p.age >= 40 ? '<li>Heavy lifting plus impact work improved bone density in post-menopausal women (LIFTMOR).</li>' : '') + '</ul>' });
    else if (p.gender === 'male') notes.push({ title: 'For men', refs: ['roberts2020'],
      html: '<p>Men and women respond to training similarly in relative terms. The same principles apply: progressive overload, enough weekly sets, and effort close to failure.</p>' });

    if (p.bodyType === 'lean') notes.push({ title: 'Lean / hard-gainer build', refs: ['morton2018'],
      html: '<p>The bottleneck is usually food, not the program. Eat in a small surplus (+250–500 kcal/day), aim for 0.25–0.5% bodyweight gain per week, and keep cardio moderate. Body type labels describe where you start, not your potential.</p>' });
    if (p.bodyType === 'higher') notes.push({ title: 'Higher body fat', refs: ['helms2014', 'who2020'],
      html: '<p>Lift to keep (and even build) muscle while you lose fat. A moderate deficit (about 0.5–1% bodyweight per week) works best. Low-impact cardio (bike, incline walk, rower) is kind to joints; daily steps add up. Beginners can often build muscle while losing fat.</p>' });
    if (p.bodyType === 'average') notes.push({ title: 'Average / athletic build', refs: [],
      html: '<p>You respond well to most programs, so consistency and progressive overload will drive results more than the split you pick.</p>' });

    const w = p.weight;
    const protein = w ? `<b>${Math.round(w * 1.6)}–${Math.round(w * 2.2)} g protein/day</b>` : '<b>1.6–2.2 g protein per kg/day</b>';
    const kcal = { muscle: 'a small surplus (+250–500 kcal)', strength: 'maintenance or a small surplus', fatloss: 'a moderate deficit (−300 to −500 kcal)', recomp: 'around maintenance', general: 'around maintenance', athletic: 'enough to fuel training' }[p.goal];
    notes.push({ title: 'Nutrition basics', refs: ['morton2018', 'helms2014'],
      html: `<p>Eat ${protein}, spread over 3–5 meals, with ${kcal}. Protein benefits level off around 1.6 g/kg for most people.</p>` });

    notes.push({ title: 'How to progress', refs: ['failure2023', 'load2017'],
      html: '<ul><li><b>Double progression:</b> when you hit the top of the rep range on all sets, add load (2.5–5%).</li><li>"Reps in reserve" = how many more reps you could have done. Go closer to failure on isolation exercises than on heavy compounds.</li><li>Take an easier deload week every 6–8 weeks or when progress stalls.</li><li>Log every workout; what gets measured improves.</li></ul>' });

    if (p.focus) notes.push({ title: `Prioritising ${WS.FOCUS[p.focus].label.toLowerCase()}`, refs: ['nunes2021', 'bickel2011'],
      html: '<p>The focus muscle is trained first in the session, when you are freshest, and gets about 40% more weekly volume. Other muscles drop to maintenance volume. Run it for 8–12 weeks, then rotate to a balanced block.</p>' });

    return notes;
  }

  function planText() {
    const { plan, profile: p } = state;
    const lines = [`${plan.split.name}: ${p.days} days/week (${GOALS[p.goal]}, ${p.level}), week ${p.week} of ${p.weeks}`, ''];
    plan.days.forEach((d) => {
      lines.push(`== ${d.name} (~${d.minutes} min) ==`);
      d.items.forEach((it) => lines.push(`- ${it.ex.name}: ${it.sets} x ${it.reps}, RIR ${it.rir}, rest ${it.rest}`));
      lines.push('');
    });
    lines.push('Generated with Workout Splits: https://github.com/Mr-Saikiran/workout-splits');
    return lines.join('\n');
  }

  function onResultsClick(e) {
    const t = e.target.closest('[data-split],[data-swap],[data-toggle],[data-week],#copy-plan,#reshuffle');
    if (!t) return;
    if (t.dataset.split) { run(t.dataset.split); return; }
    if (t.dataset.week) { state.week = Number(t.dataset.week); run(state.splitId); return; }
    if (t.id === 'reshuffle') { state.seed = newSeed(); run(state.splitId); return; }
    if (t.id === 'copy-plan') {
      const done = () => { t.textContent = 'Copied ✓'; setTimeout(() => (t.textContent = 'Copy as text'), 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(planText()).then(done, () => {});
      return;
    }
    if (t.dataset.toggle) { const d = $('#detail-' + t.dataset.toggle); d.hidden = !d.hidden; return; }
    if (t.dataset.swap) {
      const [di, ii] = t.dataset.swap.split('-').map(Number);
      const it = state.plan.days[di].items[ii];
      it.ex = it.alts[(it.alts.indexOf(it.ex) + 1) % it.alts.length];
      const open = !$('#detail-' + di + '-' + ii).hidden;
      const card = t.closest('.day');
      card.outerHTML = dayHtml(state.plan.days[di], di);
      if (open) $('#detail-' + di + '-' + ii).hidden = false;
    }
  }

  // ---------- splits library ----------

  function renderSplits() {
    const sample = { age: 28, gender: 'other', bodyType: 'average', goal: 'muscle', level: 'intermediate', minutes: 75, equipment: 'gym', focus: '' };
    const cats = ['All'].concat([...new Set(WS.SPLITS.map((s) => s.category))]);
    const panel = $('#tab-splits');
    panel.innerHTML = `
      <div class="hero"><h1>Every split, explained.</h1>
        <p>From the classic Bro Split to Push/Pull/Legs, Arnold, PHUL, specialization and Active Aging, with the research for and against each one.</p></div>
      <div class="pill-group">${cats.map((c, i) => `<button class="pill${i ? '' : ' active'}" data-cat="${c}">${c}</button>`).join('')}</div>
      <div class="grid" id="split-grid"></div>`;
    const draw = (cat) => {
      $('#split-grid').innerHTML = WS.SPLITS.filter((s) => cat === 'All' || s.category === cat).map((s) => {
        const days = s.days[s.days.length > 1 && s.days.includes(4) ? s.days.indexOf(4) : 0];
        const week = s.build(days, Object.assign({ days, focus: 'glutes' }, sample));
        const freq = E.frequency(week);
        return `<article class="card split-card">
          <h3>${esc(s.name)} <span class="chip">${esc(s.category)}</span></h3>
          <div class="chips"><span class="chip accent">${s.days.join(' / ')} days</span><span class="chip">~${freq.toFixed(1)}× per muscle at ${days} days</span></div>
          <p>${esc(s.summary)}</p>
          <p class="small"><b>Best for:</b> ${esc(s.bestFor)}</p>
          <div class="pros-cons"><div><h4>Pros</h4><ul>${s.pros.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div><h4>Cons</h4><ul>${s.cons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
          <div class="week-plan">${week.map((d) => `<div><b>${esc(d.name)}:</b> ${d.slots.map((x) => WS.PATTERNS[x].label).join(', ')}</div>`).join('')}</div>
          <p class="small"><b>Evidence:</b> ${esc(s.evidence)} ${cite(s.refs)}</p>
          <button class="btn small" data-use="${s.id}" data-days="${days}">Build this in the planner →</button>
        </article>`;
      }).join('');
    };
    draw('All');
    panel.addEventListener('click', (e) => {
      const pill = e.target.closest('[data-cat]');
      if (pill) {
        panel.querySelectorAll('.pill').forEach((b) => b.classList.toggle('active', b === pill));
        draw(pill.dataset.cat);
      }
      const use = e.target.closest('[data-use]');
      if (use) {
        const form = $('#profile-form');
        if (!WS.SPLIT_BY_ID[use.dataset.use].days.includes(Number(form.elements.days.value))) form.elements.days.value = use.dataset.days;
        if (use.dataset.use === 'specialization' && !form.elements.focus.value) form.elements.focus.value = 'glutes';
        location.hash = 'planner';
        run(use.dataset.use);
      }
    });
  }

  // ---------- exercise library ----------

  function renderExercises() {
    const panel = $('#tab-exercises');
    panel.innerHTML = `
      <div class="hero"><h1>Top exercises by body area.</h1>
        <p>Ranked by evidence: <span class="tier S">S</span> top pick · <span class="tier A">A</span> excellent · <span class="tier B">B</span> good alternative. Favours exercises that load muscles in a stretched position, are stable enough to push hard, and are easy to progress.</p></div>
      <div class="pill-group" id="area-pills">${['all'].concat(Object.keys(WS.AREAS)).map((a, i) => `<button class="pill${i ? '' : ' active'}" data-area="${a}">${a === 'all' ? 'All' : WS.AREAS[a]}</button>`).join('')}</div>
      <div class="filters">
        <input type="search" id="ex-search" placeholder="Search exercises…">
        <select id="ex-eq"><option value="">Any equipment</option>${Object.entries(EQ_LABEL).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
      </div>
      <div class="grid" id="ex-grid"></div>`;
    let area = 'all';
    const draw = () => {
      const q = $('#ex-search').value.trim().toLowerCase();
      const eq = $('#ex-eq').value;
      const list = WS.EXERCISES.filter((ex) => {
        const m = WS.PATTERNS[ex.pattern].muscle || 'functional';
        const exArea = ex.pattern === 'carry' ? 'functional' : m;
        return (area === 'all' || exArea === area) && (!eq || ex.eq === eq) && (!q || ex.name.toLowerCase().includes(q));
      });
      $('#ex-grid').innerHTML = list.map(exerciseCard).join('') || '<p class="muted">No exercises match.</p>';
    };
    draw();
    $('#area-pills').addEventListener('click', (e) => {
      const b = e.target.closest('[data-area]');
      if (!b) return;
      area = b.dataset.area;
      panel.querySelectorAll('#area-pills .pill').forEach((x) => x.classList.toggle('active', x === b));
      draw();
    });
    $('#ex-search').addEventListener('input', draw);
    $('#ex-eq').addEventListener('change', draw);
  }

  // ---------- HIIT, yoga, pilates, longevity ----------

  const channelCard = (c) => `<div class="card"><h4>${esc(WS.CHANNELS[c].name)}</h4><p class="small muted">${esc(WS.CHANNELS[c].blurb)}</p>
    <a class="vid" href="https://www.youtube.com/${WS.CHANNELS[c].handle}" target="_blank" rel="noopener">Open channel</a></div>`;

  function renderHiit() {
    $('#tab-hiit').innerHTML = `
      <div class="hero"><h1>HIIT &amp; Calisthenics</h1>
        <p>Interval protocols that raise VO2max, and bodyweight skill progressions you can train anywhere. Video demos from THENX.</p></div>
      <div class="channel-row">${channelCard('thenx')}</div>
      <h2>Interval protocols</h2>
      <div class="grid">${WS.HIIT.map((h) => `<article class="card">
        <h3>${esc(h.name)}</h3><div class="chips"><span class="chip accent">${h.minutes} min</span><span class="chip">${h.level}</span></div>
        <p><b>Protocol:</b> ${esc(h.protocol)}</p><p class="small"><b>Modes:</b> ${esc(h.modes)}</p>
        <p class="small">${esc(h.why)} ${cite(h.refs)}</p><div class="vids">${vid('thenx', h.query)}</div></article>`).join('')}</div>
      <h2 style="margin-top:28px">Calisthenics skill progressions</h2>
      <p class="muted">Move to the next step when you hit the target for 3 sets with clean form.</p>
      <div class="grid">${WS.CALISTHENICS.map((c) => `<article class="card">
        <h3>${esc(c.skill)}</h3><div class="steps">${c.steps.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
        <p class="small muted">Target: ${esc(c.target)}</p><div class="vids">${vid('thenx', c.query)}</div></article>`).join('')}</div>`;
  }

  function routineCard(r, channel) {
    return `<article class="card">
      <h3>${esc(r.name)}</h3><div class="chips"><span class="chip accent">${r.minutes} min</span><span class="chip">${esc(r.when)}</span></div>
      <p>${esc(r.purpose)}</p>
      <div class="pose-list">${(r.poses || r.moves).map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
      <p class="small">${esc(r.why)} ${cite(r.refs)}</p>
      <div class="vids">${vid(channel, r.query)}</div></article>`;
  }

  function renderYoga() {
    $('#tab-yoga').innerHTML = `
      <div class="hero"><h1>Yoga</h1>
        <p>Mobility, balance, back health and recovery to go with your lifting. Videos from Yoga With Adriene.</p></div>
      <div class="channel-row">${channelCard('adriene')}</div>
      <p class="small muted">What the evidence says: yoga modestly helps chronic low back pain and improves balance in older adults. Stretching does <i>not</i> meaningfully reduce soreness or prevent most injuries; do it because it feels good and improves mobility. ${cite(['wieland2017', 'youkhana2016'])}</p>
      <h2>Routines</h2>
      <div class="grid">${WS.YOGA_ROUTINES.map((r) => routineCard(r, 'adriene')).join('')}</div>
      <h2 style="margin-top:28px">Pose library</h2>
      <div class="grid">${WS.YOGA_POSES.map((y) => `<article class="card"><h4>${esc(y.name)} <span class="muted small">${esc(y.sanskrit)}</span></h4>
        <p class="small"><b>Targets:</b> ${esc(y.targets)}</p><p class="small muted">${esc(y.cue)}</p><div class="vids">${vid('adriene', y.query)}</div></article>`).join('')}</div>`;
  }

  function renderPilates() {
    $('#tab-pilates').innerHTML = `
      <div class="hero"><h1>Pilates</h1>
        <p>Core control, posture and back care, a great complement to heavy lifting. Free mat workouts from Blogilates.</p></div>
      <div class="channel-row">${channelCard('blogilates')}</div>
      <p class="small muted">What the evidence says: Pilates reduces pain and disability in chronic low back pain, and ranked among the most effective exercise options in a 2022 network meta-analysis. It won't replace heavy lifting for muscle and bone, so use it alongside. ${cite(['yamato2015', 'fernandez2022'])}</p>
      <div class="grid">${WS.PILATES_ROUTINES.map((r) => routineCard(r, 'blogilates')).join('')}</div>`;
  }

  function renderLongevity() {
    const L = WS.LONGEVITY;
    $('#tab-longevity').innerHTML = `
      <div class="hero"><h1>Training for longevity</h1>
        <p>Four pillars of exercise for a longer, healthier life, each backed by peer-reviewed research.</p></div>
      <div class="credit"><b>Credit: Bryan Johnson.</b> ${esc(L.credit)}. <a href="${L.video}" target="_blank" rel="noopener">Watch the video ▶</a><br>
        <span class="small">We added peer-reviewed sources for each claim below.</span></div>
      <div class="principles">${L.pillars.map((x, i) => `<article class="card"><h3>${i + 1}. ${esc(x.name)}</h3>
        <div class="chips"><span class="chip accent">${esc(x.target)}</span></div>
        <p>${esc(x.how)}</p><div class="stat">${esc(x.stat)} ${cite(x.refs)}</div></article>`).join('')}</div>
      <h2>Self-tests to track</h2>
      <div class="grid">${L.tests.map((t) => `<article class="card"><h4>${esc(t.name)}</h4><p class="small">${esc(t.how)}</p>
        <p class="small"><b>Goal:</b> ${esc(t.goal)} ${cite(t.refs)}</p></article>`).join('')}</div>
      <h2 style="margin-top:28px">How this app covers each pillar</h2>
      <div class="grid">
        <div class="card"><h4>Strength</h4><p class="small">The <a href="#planner">Planner</a> builds your lifting program.</p></div>
        <div class="card"><h4>Zone 2 &amp; intervals</h4><p class="small">Targets in your plan's recovery section; protocols in <a href="#hiit">HIIT</a>.</p></div>
        <div class="card"><h4>Balance &amp; mobility</h4><p class="small">Auto-added for 60+; daily options in <a href="#yoga">Yoga</a> and <a href="#pilates">Pilates</a>.</p></div>
      </div>
      <p class="warn" style="margin-top:20px">${esc(L.caveat)}</p>`;
  }

  function renderScience() {
    const principles = [
      ['Train each muscle 2× per week or more', 'Higher frequency produced more hypertrophy than once a week when volume was similar, and helps strength.', ['freq2016', 'strengthFreq2018']],
      ['About 10–20 hard sets per muscle per week', 'Growth rises with weekly sets, with diminishing returns at the high end. Beginners need less.', ['volume2017', 'pelland2024']],
      ['Take sets close to failure', 'Stopping 0–3 reps short of failure is where most growth happens; going further adds fatigue more than results.', ['failure2023']],
      ['A wide rep range works for muscle; heavy is best for strength', 'From about 6 to 30 reps builds similar muscle when effort is high. Heavy loads (1–5 reps) win for maximal strength.', ['load2017', 'lopez2021']],
      ['Rest long enough', 'Two to three minutes between heavy compound sets beat 1 minute for both strength and size.', ['rest2016']],
      ['Train muscles at long lengths', 'Exercises that load the stretched position (seated leg curls, overhead triceps, deep calf raises) produced more growth.', ['maeoHam2021', 'maeoTri2023', 'pedrosa2022', 'kassiano2023']],
      ['Exercise order matters for priorities', 'Exercises done first in a session gain more strength, so the planner puts focus muscles first.', ['nunes2021']],
      ['Some exercise variety helps; too much can blunt strength', 'Rotating exercises built muscle at least as well as fixed exercises and improved motivation, and varied exercises improved strength more than varied loads. Strength is skill-specific, so the planner keeps main barbell lifts fixed below Extreme variety.', ['bazValle2019', 'fonseca2014']],
      ['Maintenance takes far less', 'About one third of normal volume maintains muscle, which is how specialization blocks work.', ['bickel2011']],
      ['Sex and age change the details, not the principles', 'Men and women gain at similar relative rates. Older adults still respond strongly and benefit most from adding power and balance work.', ['roberts2020', 'peterson2010', 'fragala2019']],
      ['Protein and energy', 'About 1.6 g/kg/day of protein maximises training gains for most people.', ['morton2018']],
    ];
    const all = Object.values(WS.REFS).sort((a, b) => a.citation.localeCompare(b.citation));
    $('#tab-science').innerHTML = `
      <div class="hero"><h1>The science</h1><p>The principles the planner is built on, and every source we cite.</p></div>
      <div class="principles">${principles.map(([t, d, r]) => `<div class="card"><h4>${esc(t)}</h4><p class="small">${esc(d)}</p>${cite(r)}</div>`).join('')}</div>
      <div class="card" style="margin-bottom:24px"><h3>A note on body types</h3>
        <p class="small">"Ectomorph / mesomorph / endomorph" comes from 1940s somatotyping and does not predict how you respond to training. We ask about body type only as a shorthand for your current body composition, which changes calorie, cardio and exercise advice, not to put you in a box.</p></div>
      <div class="channel-row">${['jeremy', 'athlean', 'thenx', 'adriene', 'blogilates'].map(channelCard).join('')}</div>
      <h2>References</h2>
      <ol class="refs-list">${all.map((r) => `<li>${esc(r.citation)} <a href="${r.url}" target="_blank" rel="noopener">link</a></li>`).join('')}</ol>`;
  }

  // ---------- boot ----------

  $('#footer-channels').textContent = Object.values(WS.CHANNELS).map((c) => c.name).join(', ');
  loadProfile();
  $('#profile-form').addEventListener('submit', (e) => { e.preventDefault(); run(); $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#results').addEventListener('click', onResultsClick);
  $('#results').addEventListener('change', (e) => {
    if (e.target.id === 'week-select') { state.week = Number(e.target.value); run(state.splitId); }
  });
  window.addEventListener('hashchange', showTab);
  showTab();
  run();
})(window.WS = window.WS || {});
