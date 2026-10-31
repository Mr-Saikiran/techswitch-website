// Sound engine (Web Audio, all synthesised, no audio files): the nap alarm,
// meditation soundscapes and the Om chant.
//
// Events are scheduled on the audio clock ahead of time, so alarms and fades
// still fire on time when the browser throttles timers in a background tab.
(function (WS) {
  let ctx = null;

  // Must first be called from a click or tap (browsers block audio until then).
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(c, color) {
    const len = c.sampleRate * 4;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (color === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else { b0 = 0.997 * b0 + 0.029591 * w; b1 = 0.985 * b1 + 0.032534 * w; b2 = 0.95 * b2 + 0.048056 * w; d[i] = (b0 + b1 + b2 + w * 0.05) * 0.6; }
    }
    return buf;
  }

  function loopNoise(c, color, dest) {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, color);
    src.loop = true;
    src.connect(dest);
    src.start();
    return src;
  }

  // A slow sine LFO driving an AudioParam around its current value.
  function lfo(c, param, rate, depth) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = rate;
    g.gain.value = depth;
    o.connect(g).connect(param);
    o.start();
    return o;
  }

  // ---------- alarm ----------

  // Beep-beep-beep every second for `ringFor` seconds, starting `delay` seconds from now.
  function alarm(delay, ringFor) {
    const c = audio();
    const t0 = c.currentTime + Math.max(0, delay);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    g.gain.setValueAtTime(0, c.currentTime);
    for (let t = 0; t < ringFor; t++) {
      for (const k of [0, 0.2, 0.4]) {
        g.gain.setValueAtTime(0.16, t0 + t + k);
        g.gain.setValueAtTime(0, t0 + t + k + 0.1);
      }
    }
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(t0 + ringFor);
    return { stop() { try { osc.stop(); } catch (e) { /* already stopped */ } g.disconnect(); } };
  }

  // ---------- singing bowl and Om voices ----------

  function bowl(c, dest, when, base, level) {
    const out = c.createGain();
    out.connect(dest);
    [[1, 1], [2.76, 0.45], [5.4, 0.2], [8.9, 0.08]].forEach(([ratio, amp]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.value = base * ratio;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(level * amp, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 9 / Math.sqrt(ratio));
      o.connect(g).connect(out);
      o.start(when);
      o.stop(when + 10);
    });
    return out;
  }

  const OM_F0 = 136.1; // C#3, traditionally used for Om
  const OM_LEN = 9;    // seconds of chant, then a breath
  const OM_GAP = 2.5;

  // One "A-U-M": a buzzy voice through moving vowel formants, closing into a hum.
  function omChant(c, dest, t) {
    const src = c.createOscillator();
    src.type = 'sawtooth';
    src.frequency.value = OM_F0;
    const vib = c.createOscillator();
    const vibAmt = c.createGain();
    vib.frequency.value = 4.5;
    vibAmt.gain.value = 0.6;
    vib.connect(vibAmt).connect(src.frequency);

    const env = c.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.8);
    env.gain.setValueAtTime(1, t + OM_LEN - 1.2);
    env.gain.linearRampToValueAtTime(0, t + OM_LEN);
    src.connect(env);

    // Vowel path: A (aa) → U (oo) → closes for M.
    const vowel = c.createGain();
    vowel.gain.setValueAtTime(1, t);
    vowel.gain.setValueAtTime(1, t + 4.8);
    vowel.gain.linearRampToValueAtTime(0.03, t + 6);
    [[730, 320, 300, 1], [1100, 870, 600, 0.5], [2450, 2240, 2200, 0.15]].forEach(([a, u, m, amp]) => {
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 9;
      f.frequency.setValueAtTime(a, t);
      f.frequency.setValueAtTime(a, t + 2.6);
      f.frequency.linearRampToValueAtTime(u, t + 3.6);
      f.frequency.linearRampToValueAtTime(m, t + 5.5);
      const g = c.createGain();
      g.gain.value = amp * 1.6;
      env.connect(f).connect(g).connect(vowel);
    });
    vowel.connect(dest);

    // Hum path (M): mouth closed, only the low end gets through.
    const hum = c.createBiquadFilter();
    hum.type = 'lowpass';
    hum.frequency.value = 380;
    const humGain = c.createGain();
    humGain.gain.setValueAtTime(0, t);
    humGain.gain.setValueAtTime(0, t + 4.6);
    humGain.gain.linearRampToValueAtTime(0.55, t + 6);
    env.connect(hum).connect(humGain).connect(dest);

    for (const o of [src, vib]) { o.start(t); o.stop(t + OM_LEN + 0.1); }
  }

  // ---------- soundscapes ----------

  // Plays `kind` at `volume` (0–1) until `endsAt` (audio-clock seconds), then fades out.
  // Returns { stop(), setVolume(v), count() } — count() = Om chants started so far.
  function soundscape(kind, volume, minutes) {
    const c = audio();
    const start = c.currentTime;
    const end = start + minutes * 60;
    const master = c.createGain();
    master.gain.setValueAtTime(0, start);
    master.gain.linearRampToValueAtTime(volume, start + 4);
    master.gain.setValueAtTime(volume, end - 10);
    master.gain.linearRampToValueAtTime(0, end);
    master.connect(c.destination);
    const sources = [];
    let scheduler = null;
    let nextEvent = start + 1;
    const chantTimes = [];

    if (kind === 'pad') {
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      filter.connect(master);
      // A-minor add9 voicing, each note slowly breathing in and out.
      [110, 164.81, 220, 246.94, 329.63].forEach((f, i) => {
        for (const [type, detune] of [['sine', 0], ['triangle', 6]]) {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = type;
          o.frequency.value = f;
          o.detune.value = detune;
          g.gain.value = 0.05;
          sources.push(lfo(c, g.gain, 0.04 + i * 0.013, 0.04));
          o.connect(g).connect(filter);
          o.start();
          sources.push(o);
        }
      });
      sources.push(lfo(c, filter.frequency, 0.02, 300));
    } else if (kind === 'rain') {
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 500;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 7000;
      const g = c.createGain();
      g.gain.value = 0.9;
      hp.connect(lp).connect(g).connect(master);
      sources.push(loopNoise(c, 'pink', hp));
      const rumble = c.createGain();
      rumble.gain.value = 0.35;
      rumble.connect(master);
      sources.push(loopNoise(c, 'brown', rumble));
    } else if (kind === 'ocean') {
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      const swell = c.createGain();
      swell.gain.value = 0.55;
      lp.connect(swell).connect(master);
      sources.push(loopNoise(c, 'brown', lp));
      sources.push(lfo(c, swell.gain, 0.09, 0.45));
      sources.push(lfo(c, lp.frequency, 0.09, 350));
    }

    // Bowls and Om are discrete events, scheduled 90 s ahead in batches.
    if (kind === 'bowls' || kind === 'om') {
      if (kind === 'om') {
        // A soft drone underneath, like a tanpura.
        [OM_F0 / 2, (OM_F0 * 3) / 4].forEach((f) => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.frequency.value = f;
          g.gain.value = 0.05;
          o.connect(g).connect(master);
          o.start();
          sources.push(o);
        });
      }
      const notes = [196, 220, 261.63, 293.66];
      const plan = () => {
        const horizon = Math.min(c.currentTime + 90, end - (kind === 'om' ? OM_LEN : 4));
        while (nextEvent < horizon) {
          if (kind === 'om') {
            omChant(c, master, nextEvent);
            chantTimes.push(nextEvent);
            nextEvent += OM_LEN + OM_GAP;
          } else {
            bowl(c, master, nextEvent, notes[Math.floor(Math.random() * notes.length)], 0.22);
            nextEvent += 9 + Math.random() * 6;
          }
        }
      };
      plan();
      scheduler = setInterval(plan, 5000);
    }

    // A gentle bowl marks the end of the session.
    const endBell = bowl(c, c.destination, end + 0.2, 220, 0.15 + 0.25 * volume);

    const stopAll = () => {
      clearInterval(scheduler);
      sources.forEach((s) => { try { s.stop(); } catch (e) { /* already stopped */ } });
      master.disconnect();
    };
    const timer = setTimeout(stopAll, (end - start + 12) * 1000);

    return {
      end,
      stop() {
        clearTimeout(timer);
        endBell.disconnect();
        const now = c.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 1.5);
        setTimeout(stopAll, 1700);
      },
      setVolume(v) {
        const now = c.currentTime;
        if (now > end - 10) return;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(v, now);
        master.gain.setValueAtTime(v, end - 10);
        master.gain.linearRampToValueAtTime(0, end);
      },
      count() { return chantTimes.filter((t) => t <= c.currentTime).length; },
    };
  }

  // Keep the screen awake while a timer runs, where the browser supports it.
  async function keepAwake() {
    try { return navigator.wakeLock ? await navigator.wakeLock.request('screen') : null; } catch (e) { return null; }
  }

  WS.audio = { audio, alarm, soundscape, keepAwake, now: () => audio().currentTime };
})(window.WS = window.WS || {});
