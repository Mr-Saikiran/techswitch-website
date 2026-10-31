// Recipes, Sleep and Meditation tabs. Uses the shared helpers app.js puts on WS.ui.
(function (WS) {
  const ui = () => WS.ui;
  const two = (n) => String(n).padStart(2, '0');
  const mmss = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${two(s % 60)}`; };
  const clock = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const options = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${v}</option>`).join('');

  // Countdown that survives timer throttling (it reads the clock each tick).
  function countdown(endMs, onTick, onDone) {
    const id = setInterval(tick, 500);
    function tick() {
      const left = endMs - Date.now();
      onTick(Math.max(0, left));
      if (left <= 0) { clearInterval(id); if (onDone) onDone(); }
    }
    tick();
    return () => clearInterval(id);
  }

  const baseTitle = document.title;
  const setTitle = (prefix) => { document.title = prefix ? `${prefix} · ${baseTitle}` : baseTitle; };

  // ---------- Recipes ----------

  function recipeCard(r) {
    const { esc } = ui();
    const cal = { p: r.p * 4, c: r.c * 4, f: r.f * 9 };
    const tot = cal.p + cal.c + cal.f || 1;
    return `<article class="card recipe">
      <div class="food-head"><h4>${esc(r.name)}</h4><span class="diet-badge diet-${r.diet}">${WS.DIETS[r.diet].short}</span></div>
      <div class="chips">${r.goal.map((g) => `<span class="chip goal-${g}">${g === 'bulk' ? 'Bulking' : 'Lean'}</span>`).join('')}
        <span class="chip">${WS.CUISINES[r.cuisine]}</span><span class="chip">${WS.MEALS[r.meal]}</span><span class="chip">⏱ ${r.mins} min</span></div>
      <div class="macro-bar" title="Share of calories: protein / carbs / fat"><span class="mb-p" style="width:${(cal.p / tot) * 100}%"></span><span class="mb-c" style="width:${(cal.c / tot) * 100}%"></span><span class="mb-f" style="width:${(cal.f / tot) * 100}%"></span></div>
      <p class="macros"><span><b>${r.kcal}</b> kcal</span><span class="hl"><i class="dot mb-p"></i>${r.p} g protein</span>
        <span><i class="dot mb-c"></i>${r.c} g carbs</span><span><i class="dot mb-f"></i>${r.f} g fat</span><span class="muted">per serving</span></p>
      <h5>Ingredients</h5>
      <ul class="ingredients">${r.ingredients.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      ${r.tip ? `<p class="small muted">${esc(r.tip)}</p>` : ''}
      <a class="btn small yt-btn" href="${WS.ytSearch(r.name + ' recipe')}" target="_blank" rel="noopener">▶ Watch on YouTube</a>
    </article>`;
  }

  WS.renderRecipes = function renderRecipes() {
    const { $, cite } = ui();
    const panel = $('#tab-recipes');
    panel.innerHTML = `
      <div class="hero"><h1>High-protein recipes.</h1>
        <p>${WS.RECIPES.length} recipes for bulking or getting lean, mostly eggs and chicken, with the ingredients you need. Each one links to cooking videos on YouTube.</p></div>
      <div class="notes" style="margin-bottom:16px">
        <div class="card note"><h4>Bulking</h4><p>Eat about 250–500 kcal above maintenance and aim for 0.25–0.5% bodyweight gain a week, with 1.6–2.2 g protein per kg. Pick calorie-dense meals with plenty of carbs around training.</p> ${cite(['iraki2019', 'morton2018'])}</div>
        <div class="card note"><h4>Getting lean</h4><p>Eat 300–500 kcal below maintenance, lose 0.5–1% bodyweight a week, and push protein higher (up to about 2.3–3.1 g per kg of lean mass) to keep muscle. Pick meals with lots of protein per calorie.</p> ${cite(['helms2014'])}</div>
      </div>
      <div class="filters diet-filters">
        <label>Goal<select id="rc-goal"><option value="">Bulking or lean</option><option value="bulk">Bulking</option><option value="lean">Getting lean</option></select></label>
        <label>I eat<select id="rc-diet">${options(Object.fromEntries(Object.entries(WS.DIETS).map(([k, v]) => [k, v.label])), 'nonveg')}</select></label>
        <label>Main protein<select id="rc-main"><option value="">Any</option>${options(WS.RECIPE_MAINS)}</select></label>
        <label>Meal<select id="rc-meal"><option value="">Any meal</option>${options(WS.MEALS)}</select></label>
        <label>Cuisine<select id="rc-cuisine"><option value="">Any cuisine</option>${options(WS.CUISINES)}</select></label>
        <label>Time<select id="rc-time"><option value="">Any time</option><option value="15">15 min or less</option><option value="30">30 min or less</option><option value="45">45 min or less</option></select></label>
        <label>Sort by<select id="rc-sort">${options(Object.fromEntries(Object.entries(WS.RECIPE_SORTS).map(([k, v]) => [k, v.label])), 'protein')}</select></label>
        <label>Search<input type="search" id="rc-search" placeholder="e.g. curry, rice, wrap"></label>
      </div>
      <div class="pill-group" id="rc-quick">
        <button class="pill" data-set="main=egg">🥚 Egg recipes</button>
        <button class="pill" data-set="main=chicken">🍗 Chicken recipes</button>
        <button class="pill" data-set="goal=bulk">Bulking</button>
        <button class="pill" data-set="goal=lean;sort=lean">Lean</button>
        <button class="pill" data-set="time=15;sort=quick">Under 15 min</button>
        <button class="pill" data-set="meal=breakfast">Breakfast</button>
        <button class="pill" data-set="reset">Show all</button>
      </div>
      <p class="more-splits" id="rc-count"></p>
      <div class="grid" id="rc-grid"></div>
      <p class="cite" style="margin-top:12px">Macros are estimates per serving from USDA values for the listed ingredients; brands and portions change them.</p>`;

    const val = (id) => $('#rc-' + id).value;
    const draw = () => {
      const goal = val('goal'), main = val('main'), meal = val('meal'), cuisine = val('cuisine');
      const time = Number(val('time')) || Infinity, q = val('search').trim().toLowerCase();
      const allowed = WS.DIETS[val('diet')].includes;
      const key = WS.RECIPE_SORTS[val('sort')].key;
      const list = WS.RECIPES.filter((r) => (!goal || r.goal.includes(goal)) && allowed.includes(r.diet)
        && (!main || r.main.includes(main)) && (!meal || r.meal === meal) && (!cuisine || r.cuisine === cuisine)
        && r.mins <= time && (!q || (r.name + ' ' + r.ingredients.join(' ')).toLowerCase().includes(q)))
        .sort((a, b) => key(a) - key(b));
      $('#rc-count').textContent = `${list.length} recipe${list.length === 1 ? '' : 's'}`;
      $('#rc-grid').innerHTML = list.map(recipeCard).join('') || '<p class="muted">No recipes match. Try fewer filters.</p>';
    };
    panel.addEventListener('change', (e) => { if (e.target.matches('select')) draw(); });
    $('#rc-search').addEventListener('input', draw);
    $('#rc-quick').addEventListener('click', (e) => {
      const b = e.target.closest('[data-set]');
      if (!b) return;
      ['goal', 'main', 'meal', 'cuisine', 'time', 'search'].forEach((k) => ($('#rc-' + k).value = ''));
      $('#rc-sort').value = 'protein';
      if (b.dataset.set !== 'reset') b.dataset.set.split(';').forEach((kv) => { const [k, v] = kv.split('='); $('#rc-' + k).value = v; });
      draw();
    });
    draw();
  };

  // ---------- Sleep ----------

  const CYCLE = 90;
  const REM_MIN = [10, 20, 25, 30, 40, 45];
  const DEEP_MIN = [40, 30, 15, 5, 0, 0];

  // Approximate stage layout of one night: light, deep, light, then REM, per cycle.
  function nightPlan(sleepStart, cycles) {
    const segs = [], rem = [];
    for (let i = 0; i < cycles; i++) {
      const r = REM_MIN[Math.min(i, 5)], d = DEEP_MIN[Math.min(i, 5)], light = CYCLE - r - d;
      segs.push(['light', light * 0.7], ['deep', d], ['light', light * 0.3], ['rem', r]);
      const cycleStart = sleepStart.getTime() + i * CYCLE * 60000;
      rem.push([new Date(cycleStart + (CYCLE - r) * 60000), new Date(cycleStart + CYCLE * 60000)]);
    }
    return { segs: segs.filter((s) => s[1] > 0), rem };
  }

  let nap = null; // { cancelTick, alarm, wake, endMs }

  function stopNap(message) {
    const { $ } = ui();
    if (!nap) return;
    nap.cancelTick();
    nap.alarm.stop();
    if (nap.wake) nap.wake.release().catch(() => {});
    nap = null;
    setTitle('');
    const box = $('#nap-timer');
    if (box) box.innerHTML = message ? `<p class="muted">${message}</p>` : '';
  }

  function startNap(minutes, label) {
    const { $ } = ui();
    stopNap();
    const buffer = $('#nap-buffer').checked ? 5 : 0;
    const total = (minutes + buffer) * 60;
    const endMs = Date.now() + total * 1000;
    const current = { endMs, alarm: WS.audio.alarm(total, 180), cancelTick: () => {}, wake: null };
    nap = current;
    WS.audio.keepAwake().then((lock) => { if (nap === current) current.wake = lock; else if (lock) lock.release().catch(() => {}); });
    const box = $('#nap-timer');
    box.innerHTML = `<div class="timer-box"><div class="timer-label">${label}${buffer ? ' (+5 min to fall asleep)' : ''}</div>
      <div class="timer-big" id="nap-left">--:--</div><div class="timer-sub">Alarm at ${clock(new Date(endMs))}</div>
      <div><button class="btn" id="nap-stop">Stop</button> <button class="btn" id="nap-snooze" hidden>Snooze 5 min</button></div></div>`;
    nap.cancelTick = countdown(endMs, (left) => {
      const el = $('#nap-left');
      if (el) el.textContent = left ? mmss(left) : 'Wake up! ⏰';
      setTitle(left ? `😴 ${mmss(left)}` : '⏰ Wake up');
    }, () => { const s = $('#nap-snooze'); if (s) s.hidden = false; box.querySelector('.timer-box').classList.add('ringing'); });
  }

  WS.renderSleep = function renderSleep() {
    const { $, cite, esc, state } = ui();
    const panel = $('#tab-sleep');
    const age = (state.profile && state.profile.age) || 28;
    panel.innerHTML = `
      <div class="hero"><h1>Sleep is training too.</h1>
        <p>How much you need for your age, when to go to bed, where your REM sleep falls, and nap timers with an alarm.</p></div>

      <div class="card" style="margin-bottom:18px">
        <div class="section-title"><h2>How much sleep you need</h2><label class="inline">Age <input type="number" id="sl-age" min="0" max="110" value="${age}"></label></div>
        <div class="age-table" id="sl-ages"></div>
        <p class="small muted" style="margin-top:8px">Recommended hours per night from the US National Sleep Foundation; the AASM advises 7 or more for adults. ${cite(['hirshkowitz2015', 'watson2015'])}</p>
      </div>

      <div class="card" style="margin-bottom:18px">
        <h2>Sleep-cycle calculator</h2>
        <p class="small muted">Sleep runs in cycles of roughly 90 minutes. Waking at the end of a cycle, rather than from deep sleep, helps you feel less groggy. ${cite(['sleepStages'])}</p>
        <div class="filters diet-filters">
          <label>I want to<select id="sl-mode"><option value="wake">wake up at…</option><option value="now">go to bed now</option></select></label>
          <label id="sl-wake-wrap">Wake-up time<input type="time" id="sl-wake" value="06:30"></label>
          <label>Time to fall asleep<select id="sl-latency"><option value="5">5 min</option><option value="10">10 min</option><option value="15" selected>15 min</option><option value="20">20 min</option><option value="30">30 min</option></select></label>
        </div>
        <div class="cycle-options" id="sl-options"></div>
        <div id="sl-night"></div>
      </div>

      <h2>Naps</h2>
      <p class="small muted">Starting a nap plays a beeping alarm when time is up. Keep this page open and your volume up; on phones, keep the screen on (we ask the browser to). <label class="inline"><input type="checkbox" id="nap-buffer" checked> Add 5 min to fall asleep</label>
        <button class="btn small" id="nap-test">🔊 Test alarm</button></p>
      <div id="nap-timer"></div>
      <div class="grid">${WS.NAPS.map((n) => `<article class="card">
        <h3>${esc(n.name)} <span class="chip accent">${esc(n.range)}</span></h3>
        <p class="small">${esc(n.why)} ${cite(n.refs)}</p><p class="small muted"><b>Best time:</b> ${esc(n.when)}</p>
        <button class="btn primary small" data-nap="${n.minutes}" data-label="${esc(n.name)}">Start ${n.minutes}-min nap</button></article>`).join('')}
        <article class="card"><h3>Custom nap</h3><p class="small">Any length up to 2 hours.</p>
          <label class="inline">Minutes <input type="number" id="nap-custom" min="1" max="120" value="15"></label>
          <button class="btn primary small" id="nap-custom-go">Start</button></article>
      </div>

      <h2 style="margin-top:28px">Sleep better, recover better</h2>
      <div class="notes">${WS.SLEEP_TIPS.map((t) => `<div class="card note"><h4>${esc(t.title)}</h4><p>${esc(t.text)}</p> ${cite(t.refs)}</div>`).join('')}</div>

      <h2 style="margin-top:28px">Wind down: calm sleep &amp; manifestation videos</h2>
      <p class="small muted">Relaxing audio can help you switch off. Manifestation itself isn't backed by research, but if affirmations calm you down, they can still help you fall asleep.</p>
      <div class="link-grid">${WS.SLEEP_LINKS.map((l) => `<a class="card link-card" href="${l.channel ? WS.yt(l.channel, l.q) : WS.ytSearch(l.q)}" target="_blank" rel="noopener">
        <span class="small muted">${esc(l.kind)}</span><b>${esc(l.title)}</b><span class="small">▶ YouTube</span></a>`).join('')}</div>`;

    // Age table
    const drawAges = () => {
      const a = Number($('#sl-age').value) || 0;
      const g = WS.sleepGroupFor(a);
      $('#sl-ages').innerHTML = WS.SLEEP_AGES.map((x) => `<div class="age-row${x === g ? ' current' : ''}">
        <span>${x.label} <small>${x.range}</small></span><span class="age-bar"><i style="left:${(x.hours[0] / 18) * 100}%;width:${((x.hours[1] - x.hours[0]) / 18) * 100}%"></i></span><b>${x.hours[0]}–${x.hours[1]} h</b></div>`).join('');
      drawCalc();
    };

    // Calculator
    const drawCalc = () => {
      const g = WS.sleepGroupFor(Number($('#sl-age').value) || 0);
      const latency = Number($('#sl-latency').value);
      const mode = $('#sl-mode').value;
      $('#sl-wake-wrap').hidden = mode !== 'wake';
      const opts = [6, 5, 4, 3].map((n) => {
        let sleepStart, wake, bed;
        if (mode === 'wake') {
          const [h, m] = $('#sl-wake').value.split(':').map(Number);
          wake = new Date(); wake.setHours(h, m, 0, 0);
          if (wake <= new Date()) wake.setDate(wake.getDate() + 1);
          sleepStart = new Date(wake.getTime() - n * CYCLE * 60000);
          bed = new Date(sleepStart.getTime() - latency * 60000);
        } else {
          bed = new Date();
          sleepStart = new Date(bed.getTime() + latency * 60000);
          wake = new Date(sleepStart.getTime() + n * CYCLE * 60000);
        }
        const hours = (n * CYCLE) / 60;
        return { n, bed, sleepStart, wake, hours, good: hours >= g.hours[0] && hours <= g.hours[1] + 0.5 };
      });
      const now = new Date();
      $('#sl-options').innerHTML = opts.map((o, i) => `<button class="cycle-opt${o.good ? ' good' : ''}" data-opt="${i}">
        <b>${clock(mode === 'wake' ? o.bed : o.wake)}</b>
        <span>${mode === 'wake' ? 'go to bed' : 'wake up'} · ${o.n} cycles · ${o.hours} h sleep${mode === 'wake' && o.bed < now ? ' · already passed' : ''}</span>
        ${o.good ? '<span class="chip accent">Fits your age</span>' : ''}</button>`).join('');
      const pick = (i) => {
        const o = opts[i];
        const { segs, rem } = nightPlan(o.sleepStart, o.n);
        const total = segs.reduce((t, s) => t + s[1], 0);
        $('#sl-options').querySelectorAll('.cycle-opt').forEach((b, j) => b.classList.toggle('selected', j === i));
        $('#sl-night').innerHTML = `<h3>Your night: bed ${clock(o.bed)} → asleep ~${clock(o.sleepStart)} → wake ${clock(o.wake)}</h3>
          <div class="hypno">${segs.map(([s, m]) => `<span class="st-${s}" style="width:${(m / total) * 100}%" title="${s === 'rem' ? 'REM' : s === 'deep' ? 'Deep sleep' : 'Light sleep'}: ${Math.round(m)} min"></span>`).join('')}</div>
          <div class="hypno-legend"><span><i class="st-light"></i>Light</span><span><i class="st-deep"></i>Deep (most early in the night)</span><span><i class="st-rem"></i>REM (dreaming; longer toward morning)</span></div>
          <p class="small"><b>Approximate REM windows:</b> ${rem.map(([a, b]) => `${clock(a)}–${clock(b)}`).join(' · ')}</p>
          <p class="small muted">An estimate: real cycles run 80–110 minutes and vary night to night. Most deep sleep comes in the first half of the night and most REM in the last third, so cutting sleep short costs REM first. ${cite(['sleepStages'])}</p>`;
      };
      $('#sl-options').onclick = (e) => { const b = e.target.closest('[data-opt]'); if (b) pick(Number(b.dataset.opt)); };
      pick(Math.max(0, opts.findIndex((o) => o.good)));
    };

    panel.addEventListener('input', (e) => { if (e.target.id === 'sl-age') drawAges(); });
    panel.addEventListener('change', (e) => { if (['sl-mode', 'sl-wake', 'sl-latency'].includes(e.target.id)) drawCalc(); });
    panel.addEventListener('click', (e) => {
      const n = e.target.closest('[data-nap]');
      if (n) startNap(Number(n.dataset.nap), n.dataset.label);
      if (e.target.id === 'nap-custom-go') startNap(Math.min(120, Math.max(1, Number($('#nap-custom').value) || 15)), 'Custom nap');
      if (e.target.id === 'nap-stop') stopNap('Nap stopped.');
      if (e.target.id === 'nap-snooze') { stopNap(); $('#nap-buffer').checked = false; startNap(5, 'Snooze'); }
      if (e.target.id === 'nap-test') WS.audio.alarm(0, 2);
    });
    drawAges();
  };

  // ---------- Meditation ----------

  let session = null; // { sound, cancelTick, wake, root }

  function stopSession(message) {
    if (!session) return;
    session.sound.stop();
    session.cancelTick();
    if (session.wake) session.wake.release().catch(() => {});
    const root = session.root;
    session = null;
    setTitle('');
    root.querySelector('[data-go]').textContent = 'Start';
    root.querySelector('.timer-big').textContent = message || 'Ready';
    const count = root.querySelector('.chant-count');
    if (count) count.textContent = '';
  }

  function startSession(root) {
    if (session) stopSession();
    const kind = root.querySelector('[data-kind]').value;
    const minutes = Math.min(60, Number(root.querySelector('[data-min]').value));
    const volume = Number(root.querySelector('[data-vol]').value) / 100;
    const sound = WS.audio.soundscape(kind, volume, minutes);
    const endMs = Date.now() + minutes * 60000;
    const current = { sound, root, cancelTick: () => {}, wake: null };
    session = current;
    WS.audio.keepAwake().then((lock) => { if (session === current) current.wake = lock; else if (lock) lock.release().catch(() => {}); });
    root.querySelector('[data-go]').textContent = 'Stop';
    const big = root.querySelector('.timer-big');
    const count = root.querySelector('.chant-count');
    session.cancelTick = countdown(endMs, (left) => {
      big.textContent = mmss(left);
      setTitle(`🧘 ${mmss(left)}`);
      if (count) count.textContent = `Chant ${sound.count()}`;
    }, () => setTimeout(() => { if (session && session.sound === sound) stopSession('Session complete 🙏'); }, 4000));
  }

  const playerCard = (id, title, intro, kinds, kind, minutes, extra) => `
    <article class="card player" id="${id}">
      <h3>${title}</h3><p class="small">${intro}</p>
      <div class="filters diet-filters">
        <label>Sound<select data-kind>${options(kinds, kind)}</select></label>
        <label>Timer<select data-min>${[5, 10, 15, 20, 30, 45, 60].map((m) => `<option value="${m}"${m === minutes ? ' selected' : ''}>${m} min</option>`).join('')}</select></label>
        <label>Volume<input type="range" data-vol min="5" max="100" value="45"></label>
      </div>
      <div class="timer-box"><div class="timer-big">Ready</div>${extra || ''}<button class="btn primary" data-go>Start</button></div>
    </article>`;

  let breathTimer = null;

  function stopBreathing() {
    clearTimeout(breathTimer);
    breathTimer = null;
    const { $ } = ui();
    const circle = $('#breath-circle');
    if (!circle) return;
    circle.style.transition = 'transform 1s ease';
    circle.style.transform = 'scale(0.55)';
    $('#breath-phase').textContent = 'Ready';
    $('#breath-go').textContent = 'Start';
  }

  function startBreathing() {
    const { $ } = ui();
    const steps = WS.BREATHING[$('#breath-pattern').value].steps;
    const circle = $('#breath-circle');
    let i = 0;
    $('#breath-go').textContent = 'Stop';
    const next = () => {
      const [phase, secs] = steps[i % steps.length];
      const grow = /in|Top up/i.test(phase);
      const shrink = /out/i.test(phase);
      circle.style.transition = `transform ${secs}s ease-in-out`;
      if (grow) circle.style.transform = phase === 'Top up' ? 'scale(1.05)' : 'scale(0.95)';
      if (shrink) circle.style.transform = 'scale(0.55)';
      let left = secs;
      const label = () => { $('#breath-phase').textContent = `${phase} · ${left}`; };
      label();
      const tick = () => { left--; if (left > 0) { label(); breathTimer = setTimeout(tick, 1000); } else { i++; next(); } };
      breathTimer = setTimeout(tick, 1000);
    };
    next();
  }

  WS.renderMeditation = function renderMeditation() {
    const { $, cite, esc } = ui();
    const panel = $('#tab-meditation');
    const { om, ...ambient } = WS.SOUNDS;
    panel.innerHTML = `
      <div class="hero"><h1>Meditate, breathe, reset.</h1>
        <p>Soothing sounds and an Om chant that loop on a timer of up to 60 minutes, a breathing guide, and guided meditations. All sounds are generated in your browser.</p></div>
      <p class="small muted">Meditation programmes moderately reduce anxiety, depression and stress. ${cite(['goyal2014'])} Tip: on iPhone, turn off silent mode to hear the sounds.</p>
      <div class="grid">
        ${playerCard('med-sounds', 'Soothing sounds', 'Plays on a loop until the timer ends, then fades out with a soft bowl.', ambient, 'pad', 15)}
        ${playerCard('med-om', 'Om chant meditation', 'A slow A–U–M with a soft drone. Breathe in during each pause and chant along, letting the M hum resonate. ' + cite(['kalyani2011']), { om: 'Om chant' }, 'om', 10, '<div class="chant-count"></div>')}
        <article class="card player">
          <h3>Breathing guide</h3>
          <div class="filters diet-filters"><label>Pattern<select id="breath-pattern">${options(Object.fromEntries(Object.entries(WS.BREATHING).map(([k, v]) => [k, v.label])), 'box')}</select></label></div>
          <div class="breath-wrap"><div class="breath-circle" id="breath-circle"></div><div class="breath-phase" id="breath-phase">Ready</div></div>
          <p class="small" id="breath-why"></p>
          <button class="btn primary" id="breath-go">Start</button>
        </article>
      </div>
      <h2 style="margin-top:28px">Guided meditations &amp; chants</h2>
      <div class="link-grid">${WS.MEDITATION_LINKS.map((l) => `<a class="card link-card" href="${l.url || WS.ytSearch(l.q)}" target="_blank" rel="noopener">
        <span class="small muted">${esc(l.kind)}</span><b>${esc(l.title)}</b><span class="small">${l.url ? '↗ Open' : '▶ YouTube'}</span></a>`).join('')}</div>`;

    const why = () => { const b = WS.BREATHING[$('#breath-pattern').value]; $('#breath-why').innerHTML = `${esc(b.why)} ${cite(b.refs)}`; };
    why();
    panel.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go]');
      if (go) { const root = go.closest('.player'); if (session && session.root === root) stopSession('Stopped'); else startSession(root); }
      if (e.target.id === 'breath-go') { if (breathTimer) stopBreathing(); else startBreathing(); }
    });
    panel.addEventListener('input', (e) => {
      if (e.target.matches('[data-vol]') && session && session.root === e.target.closest('.player')) session.sound.setVolume(Number(e.target.value) / 100);
    });
    panel.addEventListener('change', (e) => { if (e.target.id === 'breath-pattern') { why(); if (breathTimer) { stopBreathing(); startBreathing(); } } });
  };
})(window.WS = window.WS || {});
