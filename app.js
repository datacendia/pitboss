(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  function hash(s) { var h = 5381, i = s.length; while (i) h = (h * 33) ^ s.charCodeAt(--i); return (h >>> 0).toString(36); }

  var views = $$('section.view');
  var trackable = views.filter(function (v) { return !v.getAttribute('data-nonote'); });
  var state = { done: {}, notes: {}, quiz: { right: 0, total: 0, topics: {}, q: {} } };
  var db = null, saveTimer = null;

  /* ---------------- persistence ---------------- */
  var LS = 'pitboss.v1';
  function readLocal() { try { var r = localStorage.getItem(LS); if (r) return JSON.parse(r); } catch (e) { } return null; }
  function writeLocal() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { } }
  function save() {
    writeLocal();
    if (!db) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { db.doc('progress/state').set({ done: state.done, notes: state.notes, quiz: state.quiz, updated: Date.now() }); } catch (e) { }
    }, 900);
  }
  function applyState(s) {
    if (!s) return;
    state.done = s.done || {};
    state.notes = s.notes || {};
    var q = s.quiz || {};
    state.quiz = { right: q.right || 0, total: q.total || 0, topics: q.topics || {}, q: q.q || {} };
    renderRailTicks(); renderProgress(); restoreNotes(); renderScore(); renderMastery();
  }
  applyState(readLocal());

  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('db').then(function (d) {
      if (!d) return;
      db = d;
      return db.doc('progress/state').get().then(function (snap) {
        if (snap && snap.exists) {
          var remote = snap.data();
          if (Object.keys(remote.done || {}).length >= Object.keys(state.done).length) applyState(remote); else save();
        } else { save(); }
      });
    }).catch(function () { });
  }

  /* ---------------- nav ---------------- */
  var rail = $('#rail');
  function buildRail() {
    var html = '', part = null, n = 0;
    views.forEach(function (v) {
      var p = v.getAttribute('data-part') || 'Other';
      if (p !== part) { part = p; html += '<div class="railhead" role="presentation">' + p + '</div>'; }
      var name = v.getAttribute('data-nav');
      var num = /^Orientation/.test(p) ? '' : '<span class="nnum">' + (++n) + '</span>';
      v.setAttribute('data-num', n || '');
      html += '<button class="navitem" type="button" data-target="' + v.id + '">' +
        '<span class="tick" aria-hidden="true"></span>' + num + '<span>' + name + '</span></button>';
    });
    html += '<div class="railfoot">Progress and notes save to this page.<br>' +
      'Search <kbd>/</kbd> &nbsp; Move <kbd>&larr;</kbd> <kbd>&rarr;</kbd></div>';
    rail.innerHTML = html;
    $$('.navitem', rail).forEach(function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-target')); });
    });
  }
  function renderRailTicks() {
    $$('.navitem', rail).forEach(function (b) {
      var done = !!state.done[b.getAttribute('data-target')];
      b.classList.toggle('done', done);
      var label = b.textContent.trim();
      b.setAttribute('aria-label', label + (done ? ' — completed' : ''));
    });
  }
  function renderProgress() {
    var d = 0;
    trackable.forEach(function (v) { if (state.done[v.id]) d++; });
    var pct = trackable.length ? Math.round(d / trackable.length * 100) : 0;
    $('#pbar').style.width = pct + '%';
    $('#ptext').textContent = pct + '%';
    var chip = $('.progchip');
    if (chip) chip.setAttribute('aria-label', d + ' of ' + trackable.length + ' modules completed');
  }

  /* Hash is "#view", or "#view~term" to deep-link into a filtered list.
     Module navigation PUSHES history, so Back walks back through the
     modules instead of leaving the site. */
  function parseHash() {
    var h = (location.hash || '').replace(/^#/, ''), i = h.indexOf('~');
    if (i < 0) return { id: h, find: '' };
    var find = h.slice(i + 1);
    try { find = decodeURIComponent(find); } catch (e) { }
    return { id: h.slice(0, i), find: find };
  }
  function hashFor(id, find) { return '#' + id + (find ? '~' + encodeURIComponent(find) : ''); }

  function go(id, opts) {
    opts = opts || {};
    var v = document.getElementById(id);
    if (!v) return;
    views.forEach(function (s) { s.classList.toggle('active', s === v); });
    $$('.navitem', rail).forEach(function (b) {
      var on = b.getAttribute('data-target') === id;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (!opts.keepScroll) window.scrollTo(0, 0);
    var hash = hashFor(id, opts.find);
    if (opts.replace) history.replaceState({ v: id }, '', hash);
    else if (location.hash !== hash) history.pushState({ v: id }, '', hash);
    closeRail();
    var active = $('.navitem.active', rail);
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    var h = $('h1.vt', v);
    if (h) { h.setAttribute('tabindex', '-1'); if (opts.focus) h.focus(); }
    announce(v.getAttribute('data-nav'));
  }

  /* Apply a deep-linked term to whichever filtered list the view owns. */
  function applyFind(viewId, term) {
    if (!term) return;
    if (viewId === 'v-kpis') { $('#k-search').value = term; kCat = 'all'; setChips('data-kfilter', 'all'); filterKpis(); }
    else if (viewId === 'v-requirements') { $('#r-search').value = term; reqTheme = 'all'; setChips('data-rfilter', 'all'); filterReqs(); }
    else if (viewId === 'v-glossary') { $('#g-search').value = term; gCat = 'all'; setChips('data-gfilter', 'all'); filterGloss(); }
  }

  function applyHash() {
    var p = parseHash();
    if (!document.getElementById(p.id)) p.id = views[0].id;
    go(p.id, { replace: true, find: p.find });
    applyFind(p.id, p.find);
  }
  window.addEventListener('popstate', applyHash);

  var live = document.createElement('div');
  live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true');
  document.body.appendChild(live);
  function announce(msg) { live.textContent = msg; }

  /* ---------------- per-view footer ---------------- */
  function addFooters() {
    views.forEach(function (v, i) {
      var next = views[i + 1];
      var foot = document.createElement('div');
      foot.className = 'viewfoot';
      var html = '';
      if (!v.getAttribute('data-nonote')) html += '<button class="btn" type="button" data-complete="' + v.id + '"></button>';
      if (next) html += '<button class="btn ghost" type="button" data-goto="' + next.id + '">Next: ' + next.getAttribute('data-nav') + ' &rarr;</button>';
      if (!html) return;
      foot.innerHTML = html;
      v.appendChild(foot);
      if (v.getAttribute('data-nonote')) return;
      var notes = document.createElement('div');
      notes.className = 'notes';
      notes.innerHTML = '<label for="note-' + v.id + '">Your notes &mdash; client specifics, questions, things to verify</label>' +
        '<textarea id="note-' + v.id + '" data-note="' + v.id + '"></textarea>' +
        '<p class="savestate" data-savestate="' + v.id + '" aria-live="polite"></p>';
      v.appendChild(notes);
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var g = e.target.closest('[data-goto]');
      if (g) { e.preventDefault(); go(g.getAttribute('data-goto'), { focus: true }); return; }
      var c = e.target.closest('[data-complete]');
      if (c) {
        var id = c.getAttribute('data-complete');
        state.done[id] = !state.done[id];
        setCompleteLabel(c);
        renderRailTicks(); renderProgress(); save();
        announce(state.done[id] ? 'Module marked complete' : 'Module marked incomplete');
      }
    });

    $$('[data-note]').forEach(function (ta) {
      ta.addEventListener('input', function () {
        state.notes[ta.getAttribute('data-note')] = ta.value;
        var s = $('[data-savestate="' + ta.getAttribute('data-note') + '"]');
        if (s) { s.textContent = 'Saved'; clearTimeout(ta._t); ta._t = setTimeout(function () { s.textContent = ''; }, 1600); }
        save();
      });
    });
  }
  function setCompleteLabel(b) {
    var on = !!state.done[b.getAttribute('data-complete')];
    b.textContent = on ? 'Completed ✓ — undo' : 'Mark module complete';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function restoreNotes() {
    $$('[data-note]').forEach(function (ta) { ta.value = state.notes[ta.getAttribute('data-note')] || ''; });
    $$('[data-complete]').forEach(setCompleteLabel);
  }

  /* ---------------- requirements ---------------- */
  function reqCard(r) {
    return '<details class="req" data-theme-tag="' + r.theme + '" data-text="' + esc((r.t + ' ' + r.q + ' ' + r.means + ' ' + r.kpi + ' ' + r.del + ' ' + r.got).toLowerCase()) + '">' +
      '<summary><span class="rnum">' + (r.n < 10 ? '0' : '') + r.n + '</span><span class="rq">' + esc(r.t) +
      '<em>&ldquo;' + esc(r.q) + '&rdquo;</em></span><span class="tag b">' + r.theme + '</span></summary>' +
      '<div class="reqgrid">' +
      '<div><p class="flabel">What it really means</p><p>' + r.means + '</p></div>' +
      '<div><p class="flabel">How you build it</p><ul>' + r.fs.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
      '<div><p class="flabel">KPI it moves</p><p>' + r.kpi + '</p></div>' +
      '<div><p class="flabel">Deliverable</p><p>' + r.del + '</p></div>' +
      '<div style="grid-column:1/-1"><p class="flabel">The gotcha</p><p>' + r.got + '</p></div>' +
      '</div></details>';
  }
  function renderReqs() { $('#r-list').innerHTML = window.REQS.map(reqCard).join(''); filterReqs(); }
  var reqTheme = 'all';
  function filterReqs() {
    var q = ($('#r-search').value || '').toLowerCase().trim(), shown = 0;
    $$('#r-list .req').forEach(function (el) {
      var ok = (reqTheme === 'all' || el.getAttribute('data-theme-tag') === reqTheme) &&
        (!q || el.getAttribute('data-text').indexOf(q) > -1);
      el.hidden = !ok; if (ok) shown++;
    });
    $('#r-count').textContent = shown + ' of ' + window.REQS.length;
  }

  /* ---------------- KPIs ---------------- */
  var PATTERN = {
    funnel: ['funnel', 'Ordered rate — a funnel from denominator to numerator'],
    rate: ['rate', 'Share of a population — build the denominator first'],
    seg: ['segment', 'A population over time, usually user scope'],
    time: ['duration', 'Median and P90 of a numeric property'],
    dist: ['breakdown', 'Event counts split by a property'],
    signal: ['signal', 'Fullstory’s derived frustration and error signals'],
    perf: ['performance', 'Autocaptured performance or journey analysis'],
    wh: ['warehouse', 'Needs a warehouse join — Fullstory alone cannot see it'],
    ext: ['external', 'Lives in another system; Fullstory supplies the explanation']
  };
  function confOf(name) {
    var t = (window.KPI_CONF || {})[name] || 'est';
    return (window.KPI_CONF_TIERS || {})[t] || { label: t, cls: '', d: '' };
  }
  function kpiCard(k) {
    var b = (window.KPI_BUILD || {})[k.n] || null;
    var pat = b && PATTERN[b.p] ? PATTERN[b.p] : null;
    var cf = confOf(k.n);
    var txt = (k.n + ' ' + k.f + ' ' + k.fs + ' ' + k.c + ' ' + (b ? b.pre + ' ' + b.steps.join(' ') + ' ' + (b.note || '') + ' ' + (b.cut || '') : '')).toLowerCase().replace(/<[^>]+>/g, '');
    return '<details class="kpi" data-text="' + esc(txt) + '">' +
      '<summary aria-label="' + esc(k.n + '. Formula: ' + k.f + '. Indicative range: ' + k.b + '. Confidence: ' + cf.label + '.') + '">' +
      '<span class="kname">' + esc(k.n) + '</span>' +
      '<span class="kformula">' + esc(k.f) + '</span>' +
      '<span class="kbench">' + esc(k.b) + ' <span class="tag ' + cf.cls + '" title="' + esc(cf.d) + '">' + cf.label + '</span></span>' +
      (pat ? '<span class="tag a">' + pat[0] + '</span>' : '<span></span>') + '</summary>' +
      '<div class="kbody">' +
      (pat ? '<p class="kpat"><strong>Pattern &mdash; ' + pat[0] + '.</strong> ' + pat[1] + '</p>' : '') +
      '<div class="kcols">' +
      '<div><p class="flabel">Instrumentation needed first</p><p>' + (b ? b.pre : '&mdash;') + '</p>' +
      (b && b.cut ? '<p class="flabel" style="margin-top:14px">Always split by</p><p>' + esc(b.cut) + '</p>' : '') +
      '<p class="flabel" style="margin-top:14px">Benchmark confidence</p><p><span class="tag ' + cf.cls + '">' + cf.label + '</span> ' + cf.d + '</p></div>' +
      '<div><p class="flabel">Build it</p>' + (b ? '<ol class="ksteps">' + b.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' : '<p>&mdash;</p>') + '</div>' +
      '</div>' +
      '<div class="knote"><p class="flabel">In practice</p><p>' + (b && b.note ? b.note : k.fs) + '</p></div>' +
      '</div></details>';
  }
  function renderKpis() {
    var cats = [];
    window.KPIS.forEach(function (k) { if (cats.indexOf(k.c) < 0) cats.push(k.c); });
    $('#k-list').innerHTML = cats.map(function (cat) {
      var rows = window.KPIS.filter(function (k) { return k.c === cat; });
      return '<div class="kgroup" data-cat="' + esc(cat) + '"><h2 class="st">' + cat +
        ' <span class="kcnt">' + rows.length + '</span></h2>' +
        '<div class="khead" aria-hidden="true"><span>KPI</span><span>Formula</span><span>Indicative range</span><span>Pattern</span></div>' +
        rows.map(kpiCard).join('') + '</div>';
    }).join('');
    filterKpis();
  }
  var kCat = 'all';
  function filterKpis() {
    var q = ($('#k-search').value || '').toLowerCase().trim(), shown = 0;
    $$('#k-list .kgroup').forEach(function (g) {
      var catOk = kCat === 'all' || g.getAttribute('data-cat') === kCat, any = 0;
      $$('details.kpi', g).forEach(function (d) {
        var ok = catOk && (!q || d.getAttribute('data-text').indexOf(q) > -1);
        d.hidden = !ok;
        if (ok) { any++; shown++; if (q.length > 2) d.open = true; } else { d.open = false; }
      });
      g.hidden = !any;
    });
    $('#k-count').textContent = shown + ' of ' + window.KPIS.length;
  }

  /* ---------------- glossary ---------------- */
  function renderGloss() {
    var g = window.GLOSSARY.slice().sort(function (a, b) { return a.t.localeCompare(b.t); });
    $('#g-list').innerHTML = '<dl class="deflist" id="g-dl">' + g.map(function (x) {
      var t = esc((x.t + ' ' + x.d).toLowerCase().replace(/<[^>]+>/g, ''));
      return '<dt data-gc="' + x.c + '" data-text="' + t + '">' + esc(x.t) + '</dt>' +
        '<dd data-gc="' + x.c + '" data-text="' + t + '">' + x.d + '</dd>';
    }).join('') + '</dl>';
    filterGloss();
  }
  var gCat = 'all';
  function filterGloss() {
    var q = ($('#g-search').value || '').toLowerCase().trim(), shown = 0;
    $$('#g-dl dt, #g-dl dd').forEach(function (el) {
      var ok = (gCat === 'all' || el.getAttribute('data-gc') === gCat) && (!q || el.getAttribute('data-text').indexOf(q) > -1);
      el.hidden = !ok;
      if (ok && el.tagName === 'DT') shown++;
    });
    $('#g-count').textContent = shown + ' of ' + window.GLOSSARY.length;
  }

  /* ---------------- drills: spaced repetition ---------------- */
  var qFilter = 'all', qCurrent = null;
  function qid(q) { return hash(q.q); }
  function pool() { return window.QUIZ.filter(function (q) { return qFilter === 'all' || q.c === qFilter; }); }
  function pickQuestion() {
    var p = pool(); if (!p.length) return null;
    var now = Date.now(), best = null, bestScore = -1e9;
    p.forEach(function (q) {
      var rec = state.quiz.q[qid(q)] || { seen: 0, wrong: 0, last: 0 };
      var score = 0;
      if (!rec.seen) score += 60;                                  // never seen
      score += rec.wrong * 40;                                     // got it wrong before
      if (rec.seen && !rec.wrong) score -= 25;                      // already mastered
      var hours = rec.last ? (now - rec.last) / 3600000 : 999;
      score += Math.min(hours, 72) * 0.6;                           // let time pass
      if (qCurrent && qid(qCurrent) === qid(q)) score -= 500;        // never twice running
      score += Math.random() * 18;                                  // keep it unpredictable
      if (score > bestScore) { bestScore = score; best = q; }
    });
    return best;
  }
  var KIND = { flaw: 'Spot the flaw', next: 'What do you ask next?', mcq: '' };
  function nextQ() {
    qCurrent = pickQuestion();
    var box = $('#quizbox');
    if (!qCurrent) { box.innerHTML = '<p>No questions in this topic.</p>'; return; }
    var rec = state.quiz.q[qid(qCurrent)] || { seen: 0, wrong: 0 };
    var kind = KIND[qCurrent.k || 'mcq'];
    box.innerHTML =
      '<div class="qmeta"><span class="tag b">' + qCurrent.c + '</span>' +
      (kind ? '<span class="tag i">' + kind + '</span>' : '') +
      (rec.wrong ? '<span class="tag c">missed before</span>' : (rec.seen ? '<span class="tag">seen</span>' : '<span class="tag p">new</span>')) +
      '<span style="margin-left:auto">' + pool().length + ' in scope</span></div>' +
      '<div class="qtext">' + esc(qCurrent.q) + '</div>' +
      (qCurrent.code ? '<pre class="qcode"><code>' + esc(qCurrent.code) + '</code></pre>' : '') +
      '<div class="qopts" role="group" aria-label="Answer options">' + qCurrent.o.map(function (o, i) {
        return '<button class="qopt" type="button" data-i="' + i + '">' + esc(o) + '</button>';
      }).join('') + '</div>' +
      '<div class="qwhy" role="status" aria-live="polite" hidden></div>';
    $$('#quizbox .qopt').forEach(function (b) { b.addEventListener('click', answer); });
    $('#q-count').textContent = pool().length + ' questions';
  }
  function answer(e) {
    var i = +e.currentTarget.getAttribute('data-i');
    var opts = $$('#quizbox .qopt');
    if (opts[0].disabled) return;
    var correct = i === qCurrent.a;
    opts.forEach(function (b, j) {
      b.disabled = true;
      if (j === qCurrent.a) b.classList.add('right');
      else if (j === i) b.classList.add('wrong');
    });
    state.quiz.total++; if (correct) state.quiz.right++;
    var id = qid(qCurrent);
    var rec = state.quiz.q[id] || { seen: 0, wrong: 0, last: 0 };
    rec.seen++; if (!correct) rec.wrong++; else if (rec.wrong) rec.wrong--;
    rec.last = Date.now();
    state.quiz.q[id] = rec;
    var t = state.quiz.topics[qCurrent.c] || { seen: 0, right: 0 };
    t.seen++; if (correct) t.right++;
    state.quiz.topics[qCurrent.c] = t;
    var why = $('#quizbox .qwhy');
    why.innerHTML = '<strong>' + (correct ? 'Correct. ' : 'Not quite. ') + '</strong>' + qCurrent.w;
    why.hidden = false;
    renderScore(); renderMastery(); save();
  }
  function renderScore() {
    var s = state.quiz;
    $('#q-score').textContent = s.total ? s.right + ' / ' + s.total + ' correct (' + Math.round(s.right / s.total * 100) + '%)' : 'No answers yet';
  }
  function renderMastery() {
    var el = $('#q-mastery'); if (!el) return;
    var topics = {};
    window.QUIZ.forEach(function (q) { topics[q.c] = topics[q.c] || 0; topics[q.c]++; });
    var weakest = null, weakestPct = 101;
    el.innerHTML = Object.keys(topics).sort().map(function (c) {
      var t = state.quiz.topics[c] || { seen: 0, right: 0 };
      var pct = t.seen ? Math.round(t.right / t.seen * 100) : 0;
      var cov = Math.round(Math.min(t.seen, topics[c]) / topics[c] * 100);
      if (t.seen >= 3 && pct < weakestPct) { weakestPct = pct; weakest = c; }
      var cls = !t.seen ? '' : pct >= 80 ? 'good' : pct >= 55 ? 'mid' : 'bad';
      return '<div class="mrow"><span class="mname">' + c + '</span>' +
        '<span class="mbar"><i class="' + cls + '" style="width:' + pct + '%"></i></span>' +
        '<span class="mpct">' + (t.seen ? pct + '%' : '—') + '</span>' +
        '<span class="mcov">' + t.seen + '/' + topics[c] + ' seen</span></div>';
    }).join('') +
      (weakest ? '<p class="savestate" style="margin-top:10px">Weakest topic: <strong>' + weakest + '</strong> at ' + weakestPct + '%. Questions you have missed are weighted to come back.</p>' : '');
  }

  /* ---------------- builder ---------------- */
  var lastPlan = '';
  function runBuilder() {
    var c = {
      vertical: $('#b-vertical').value, scale: $('#b-scale').value, platform: $('#b-platform').value,
      dev: $('#b-dev').value, surface: $('#b-surface').value, market: $('#b-market').value,
      goal: $('#b-goal').value, bi: $('#b-bi').value
    };
    var p = window.BUILDER.run(c);
    var reqTitles = p.reqs.map(function (n) {
      var r = window.REQS.filter(function (x) { return x.n === n; })[0];
      return r ? '<li><strong>' + esc(r.t) + '</strong> &mdash; ' + esc(r.kpi) + '</li>' : '';
    }).join('');

    $('#b-out').innerHTML =
      (p.conflicts && p.conflicts.length ?
        '<div class="phase conflict"><h3><span class="wk">Check</span>This profile contains contradictions</h3><div class="pb"><ul>' +
        p.conflicts.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>' : '') +
      '<div class="phase"><h3><span class="wk">Overall</span>Plan shape</h3><div class="pb">' +
      '<p style="margin-top:0"><strong>Time to embedded: ' + p.weeks + '.</strong> Six phases, adapted to this profile. Everything below is a starting point to argue with, not a script.</p></div></div>' +
      p.phases.map(function (ph) {
        return '<div class="phase"><h3><span class="wk">' + ph.w + '</span>' + ph.t + '</h3><div class="pb"><ul>' +
          ph.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div></div>';
      }).join('') +
      '<div class="phase"><h3><span class="wk">Scope</span>Instrumentation to specify</h3><div class="pb"><ul>' +
      p.instr.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="phase"><h3><span class="wk">Measure</span>KPI set for this client</h3><div class="pb"><ul>' +
      p.kpis.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div></div>' +
      (reqTitles ? '<div class="phase"><h3><span class="wk">Expect</span>Requirements most likely to come up</h3><div class="pb"><ul>' + reqTitles + '</ul></div></div>' : '') +
      '<div class="phase"><h3><span class="wk">Raise early</span>Risks for the kick-off</h3><div class="pb"><ul>' +
      p.risks.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div></div>';
    lastPlan = $('#b-out').innerText;
  }

  /* ---------------- downloads ---------------- */
  var dl = null;
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (d) { if (d) dl = d; setDlLabels(); }).catch(function () { });
  }
  function setDlLabels() {
    var t = $('#tpl-download'), l = $('#lab-download');
    if (t) t.textContent = dl ? 'Download all nine as Markdown' : 'Show all nine as one Markdown block';
    if (l) l.textContent = dl ? 'Download lab.html' : 'Show lab.html source to copy';
  }
  function offer(filename, text, fallbackEl) {
    if (dl) {
      dl.save({ filename: filename, data: text }).then(function () { announce('Saved ' + filename); })
        .catch(function () { showFallback(filename, text, fallbackEl); });
    } else { showFallback(filename, text, fallbackEl); }
  }
  function showFallback(filename, text, fallbackEl) {
    var host = fallbackEl || $('#dl-fallback');
    if (!host) return;
    host.hidden = false;
    host.innerHTML = '<p class="savestate">Saving is not available in this view. Copy the block below and save it as <strong>' +
      esc(filename) + '</strong>.</p><pre><code></code></pre>';
    $('code', host).textContent = text;
    addCopy(host);
    host.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function templatesMarkdown() {
    var v = $('#v-templates'); if (!v) return '';
    var out = ['# Fullstory onboarding — deliverable templates', '',
      'Replace everything in square brackets. Delete rows that do not apply.', ''];
    var cur = '';
    $$('h2.st, pre code', v).forEach(function (el) {
      if (el.tagName === 'H2') { cur = el.textContent.trim(); out.push('', '## ' + cur, ''); }
      else { out.push('```', el.innerText.replace(/\s+$/, ''), '```', ''); }
    });
    return out.join('\n');
  }

  /* ---------------- coach ---------------- */
  var SCEN = {
    dpo: 'You are the Data Protection Officer of a UK-licensed online casino. You are sceptical about installing a session-capture tool and you are worried about card data, KYC documents, player names and balances, and about your obligations for erasure requests. Press hard on specifics.',
    sceptic: 'You are a Head of Digital at a sportsbook. You already have GA4 and Amplitude. You think session replay is a toy for UX designers and you resent the licence cost. Be direct and slightly dismissive but fair.',
    platform: 'You are an account manager at a white-label casino platform provider. The operator wants a third-party script added to the cashier and registration pages that you control. You are protective, risk-averse, and inclined to quote for the work.',
    cfo: 'You are the CFO of a mid-size gambling operator. You want to know in hard numbers what this tool returns against its cost, and you distrust soft UX arguments. Ask for the calculation.',
    compliance: 'You are a Commercial Director. You want a segment of players with high loss velocity so that CRM can send them a reload bonus. You do not see the problem and you will push back if refused.',
    badnews: 'You are a senior BI analyst. The Fullstory deposit funnel shows 68% and your own warehouse report shows 61%. You suspect the new tool is wrong and you are protective of your team’s numbers.',
    qbr: 'You are a newly appointed Chief Digital Officer at a gambling operator, three weeks into the role. You inherited this Fullstory engagement, you did not choose it, and you are deciding what to cut. You want to know what it has actually delivered.'
  };
  var sampleFn = null, coachCtl = null;
  function coachAvail(ok) {
    var b = $('#c-run'); if (!b) return;
    b.disabled = !ok;
    $('#c-note').textContent = ok ? '' : 'The coach needs the assistant capability, which is not available in this view. Everything else on the page works normally.';
  }
  coachAvail(false);
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('sample').then(function (s) { if (s) { sampleFn = s; coachAvail(true); } }).catch(function () { });
  }
  function runCoach() {
    if (!sampleFn) return;
    var sc = $('#c-scenario').value, mode = $('#c-mode').value, txt = $('#c-input').value.trim();
    var sys = 'You are a training coach for an optimisation analyst at a UK CRO consultancy (LeanConvert) who teaches Fullstory to gaming, gambling and casino clients. Be concrete, British English, and never waffle. Use the vocabulary of the industry correctly (GGR, NGR, FTD, hold, RTP, KYC, PAM, PSP, wagering requirement). Keep replies under 300 words.';
    var task;
    if (sc === 'freeform') {
      task = sys + '\n\nAnswer this question directly and practically:\n' + (txt || 'Explain how Fullstory session capture works and why game canvases do not replay.');
    } else if (mode === 'roleplay') {
      task = sys + '\n\nRole-play this character and stay in character. ' + SCEN[sc] +
        '\n\nThe analyst said: "' + (txt || '(they have not spoken yet — open the conversation with your challenge)') +
        '"\n\nRespond in character in 2-4 short paragraphs. Push on the weakest point. End with a pointed follow-up question. Then, after a line containing only "---", give one short line of private coaching starting with "Coach:" on what the analyst should have covered.';
    } else if (mode === 'model') {
      task = sys + '\n\nThe situation: ' + SCEN[sc] + '\n\nWrite the model answer the analyst should give. Be specific about Fullstory configuration, the exact controls or API calls involved, and the commercial or regulatory framing. Then add three bullet points headed "Watch for:" covering the traps.';
    } else {
      task = sys + '\n\nThe situation: ' + SCEN[sc] + '\n\nThe analyst answered:\n"' + (txt || '(empty)') +
        '"\n\nGrade it out of 10 and explain. Give: what landed, what was missing or wrong (be specific and unsparing about factual errors), and a rewritten version of their strongest paragraph.';
    }
    var out = $('#c-out');
    out.hidden = false; out.textContent = 'Thinking…';
    coachCtl = new AbortController();
    $('#c-run').disabled = true; $('#c-stop').disabled = false;
    sampleFn(task, {
      signal: coachCtl.signal, cache: false, modelTier: 'default',
      onText: function (u) { out.textContent = u.text; }
    }).then(function (r) { out.textContent = r.text; })
      .catch(function (e) {
        if (e && e.code === 'cancelled') { if (out.textContent === 'Thinking…') out.textContent = 'Stopped.'; return; }
        if (e && e.text) { out.textContent = e.text; return; }
        out.textContent = 'The coach could not answer just now' + (e && e.code ? ' (' + e.code + ')' : '') + '. Try again, or use the model-answer mode.';
        if (e && e.code === 'not_granted') coachAvail(false);
      })
      .then(function () { $('#c-run').disabled = !sampleFn; $('#c-stop').disabled = true; });
  }

  /* ---------------- search (full text) ---------------- */
  var index = [];
  var BLOCK = 'h2.st, h3, h4, p, li, dt, dd, td, summary, pre';
  function buildIndex() {
    views.forEach(function (v) {
      var title = v.getAttribute('data-nav'), part = v.getAttribute('data-part');
      index.push({ kind: part, label: title, sub: ($('h1.vt', v) || {}).textContent || '', view: v.id, w: 100 });
      $$('h2.st, h3', v).forEach(function (h) {
        index.push({ kind: part + ' · ' + title, label: h.textContent.trim(), sub: '', view: v.id, el: h, w: 60 });
      });
      if (v.id === 'v-kpis' || v.id === 'v-requirements' || v.id === 'v-glossary') return;
      $$(BLOCK, v).forEach(function (el) {
        if (el.closest('.viewfoot') || el.closest('.notes') || el.closest('.rail')) return;
        if (el.tagName === 'H2' || el.tagName === 'H3') return;
        var t = (el.innerText || '').trim().replace(/\s+/g, ' ');
        if (t.length < 25 || t.length > 900) return;
        index.push({ kind: title, label: t, sub: '', view: v.id, el: el, w: 10, prose: true });
      });
    });
    window.KPIS.forEach(function (k) { index.push({ kind: 'KPI · ' + k.c, label: k.n, sub: k.f, view: 'v-kpis', find: k.n, w: 80 }); });
    (window.KPI_BUILD ? Object.keys(window.KPI_BUILD) : []).forEach(function (n) {
      var b = window.KPI_BUILD[n];
      index.push({ kind: 'Build recipe', label: n, sub: b.steps.join(' ').replace(/<[^>]+>/g, ''), view: 'v-kpis', find: n, w: 20, prose: true });
    });
    window.REQS.forEach(function (r) { index.push({ kind: 'Requirement', label: r.t, sub: r.q, view: 'v-requirements', find: r.t, w: 80 }); });
    window.GLOSSARY.forEach(function (g) { index.push({ kind: 'Glossary', label: g.t, sub: g.d.replace(/<[^>]+>/g, ''), view: 'v-glossary', find: g.t, w: 80 }); });
    index.forEach(function (i) { i._h = (i.label + ' ' + (i.sub || '')).toLowerCase(); });
  }

  var resBox = $('#results'), searchEl = $('#search'), selIdx = -1, hits = [];
  function snippet(text, tokens) {
    var lc = text.toLowerCase(), m = firstMatch(lc, tokens);
    if (m.at < 0) return esc(text.slice(0, 130)) + (text.length > 130 ? '…' : '');
    var from = Math.max(0, m.at - 45), to = Math.min(text.length, m.at + m.tok.length + 90);
    return (from ? '…' : '') + esc(text.slice(from, m.at)) +
      '<mark>' + esc(text.slice(m.at, m.at + m.tok.length)) + '</mark>' +
      esc(text.slice(m.at + m.tok.length, to)) + (to < text.length ? '…' : '');
  }
  /* A token matches a haystack either outright, or on a trimmed stem so
     "suppression" still finds "suppressing" and "funnels" finds "funnel". */
  function stem(t) { return t.length > 5 ? t.slice(0, Math.max(5, t.length - 3)) : t; }
  function tokenIn(hay, t) { return hay.indexOf(t) > -1 || (t.length > 5 && hay.indexOf(stem(t)) > -1); }
  function firstMatch(hay, tokens) {
    var best = -1, tok = '';
    tokens.forEach(function (t) {
      var at = hay.indexOf(t);
      if (at < 0 && t.length > 5) { t = stem(t); at = hay.indexOf(t); }
      if (at > -1 && (best < 0 || t.length > tok.length)) { best = at; tok = t; }
    });
    return { at: best, tok: tok };
  }

  function doSearch() {
    var q = searchEl.value.toLowerCase().trim();
    if (q.length < 2) { resBox.hidden = true; return; }
    var tokens = q.split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!tokens.length) tokens = [q];
    hits = index.filter(function (i) {
      return tokens.every(function (t) { return tokenIn(i._h, t); });
    });
    hits.sort(function (a, b) {
      var as = a.w, bs = b.w;
      if (a._h.indexOf(q) > -1) as += 25;
      if (b._h.indexOf(q) > -1) bs += 25;
      if (a.label.toLowerCase().indexOf(tokens[0]) === 0) as += 30;
      if (b.label.toLowerCase().indexOf(tokens[0]) === 0) bs += 30;
      return bs - as;
    });
    hits._tokens = tokens;
    hits = hits.slice(0, 40);
    hits._tokens = tokens;
    if (!hits.length) {
      resBox.innerHTML = '<button type="button" disabled style="color:var(--ink-3);cursor:default">No matches</button>';
      resBox.hidden = false; return;
    }
    resBox.innerHTML = hits.map(function (h, i) {
      return '<button type="button" role="option" aria-selected="false" data-i="' + i + '">' +
        '<span class="rkind">' + esc(h.kind) + '</span>' +
        (h.prose ? '<span class="rsnip">' + snippet(h.label + (h.sub ? ' — ' + h.sub : ''), tokens) + '</span>'
          : esc(h.label) + (h.sub ? '<span class="rsub">' + esc(h.sub.slice(0, 110)) + '</span>' : '')) +
        '</button>';
    }).join('');
    selIdx = -1; resBox.hidden = false;
    announce(hits.length + ' results');
    $$('button[data-i]', resBox).forEach(function (b) {
      b.addEventListener('click', function () { openHit(hits[+b.getAttribute('data-i')]); });
    });
  }
  function openHit(h) {
    if (!h) return;
    resBox.hidden = true; searchEl.blur();
    go(h.view, { find: h.find });
    if (h.find) { applyFind(h.view, h.find); return; }
    if (h.el) {
      setTimeout(function () {
        var d = h.el.closest('details'); if (d) d.open = true;
        h.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        h.el.classList.add('hit');
        setTimeout(function () { h.el.classList.remove('hit'); }, 2600);
      }, 70);
    }
  }
  function setChips(attr, val) {
    $$('[' + attr + ']').forEach(function (c) { c.classList.toggle('on', c.getAttribute(attr) === val); });
  }

  /* ---------------- copy buttons ---------------- */
  function addCopy(root) {
    $$('pre', root || document).forEach(function (p) {
      if (p._copy) return; p._copy = true;
      var b = document.createElement('button');
      b.className = 'copybtn'; b.type = 'button'; b.textContent = 'Copy';
      b.addEventListener('click', function () {
        var t = p.querySelector('code') ? p.querySelector('code').innerText : p.innerText;
        try {
          navigator.clipboard.writeText(t);
          b.textContent = 'Copied'; announce('Copied to clipboard');
          setTimeout(function () { b.textContent = 'Copy'; }, 1400);
        } catch (e) { b.textContent = 'Select manually'; }
      });
      p.appendChild(b);
    });
  }

  /* ---------------- rail open/close ---------------- */
  function openRail() { rail.classList.add('open'); $('#scrim').classList.add('on'); $('#menubtn').setAttribute('aria-expanded', 'true'); }
  function closeRail() { rail.classList.remove('open'); $('#scrim').classList.remove('on'); $('#menubtn').setAttribute('aria-expanded', 'false'); }

  /* ---------------- wire up ---------------- */
  buildRail(); addFooters(); restoreNotes(); renderRailTicks(); renderProgress();
  renderReqs(); renderKpis(); renderGloss(); nextQ(); renderScore(); renderMastery();
  runBuilder(); buildIndex(); addCopy();
  if ($('#lab-code') && window.LAB_SANDBOX) $('#lab-code').textContent = window.LAB_SANDBOX;
  setDlLabels();

  $('#s-lessons').textContent = trackable.length;
  $('#s-kpis').textContent = window.KPIS.length;
  $('#s-reqs').textContent = window.REQS.length;
  var sq = $('#s-quiz'); if (sq) sq.textContent = window.QUIZ.length;

  [['data-rfilter', function (v) { reqTheme = v; filterReqs(); }],
  ['data-kfilter', function (v) { kCat = v; filterKpis(); }],
  ['data-gfilter', function (v) { gCat = v; filterGloss(); }],
  ['data-qfilter', function (v) { qFilter = v; nextQ(); }]].forEach(function (pair) {
    $$('[' + pair[0] + ']').forEach(function (c) {
      c.addEventListener('click', function () {
        setChips(pair[0], c.getAttribute(pair[0]));
        pair[1](c.getAttribute(pair[0]));
      });
    });
  });
  $('#r-search').addEventListener('input', filterReqs);
  $('#k-search').addEventListener('input', filterKpis);
  $('#g-search').addEventListener('input', filterGloss);

  $('#q-next').addEventListener('click', nextQ);
  $('#q-reset').addEventListener('click', function () {
    state.quiz = { right: 0, total: 0, topics: {}, q: {} };
    renderScore(); renderMastery(); nextQ(); save();
  });

  $('#b-run').addEventListener('click', runBuilder);
  $('#b-copy').addEventListener('click', function () {
    try {
      navigator.clipboard.writeText(lastPlan);
      $('#b-copy').textContent = 'Copied to clipboard';
      setTimeout(function () { $('#b-copy').textContent = 'Copy plan as text'; }, 1600);
    } catch (e) { }
  });
  $$('.bform select').forEach(function (s) { s.addEventListener('change', runBuilder); });

  if ($('#c-run')) {
    $('#c-run').addEventListener('click', runCoach);
    $('#c-stop').addEventListener('click', function () { if (coachCtl) coachCtl.abort(); });
  }
  if ($('#tpl-download')) $('#tpl-download').addEventListener('click', function () {
    offer('fullstory-onboarding-templates.md', templatesMarkdown(), $('#tpl-fallback'));
  });
  if ($('#lab-download')) $('#lab-download').addEventListener('click', function () {
    offer('lab.html', window.LAB_SANDBOX || '', $('#lab-fallback'));
  });
  if ($('#lab-toggle')) $('#lab-toggle').addEventListener('click', function () {
    var w = $('#lab-codewrap'); w.hidden = !w.hidden;
    this.textContent = w.hidden ? 'Show the source' : 'Hide the source';
    this.setAttribute('aria-expanded', w.hidden ? 'false' : 'true');
    if (!w.hidden) addCopy(w);
  });

  searchEl.addEventListener('input', doSearch);
  searchEl.addEventListener('keydown', function (e) {
    if (resBox.hidden) return;
    var btns = $$('button[data-i]', resBox);
    if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, btns.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); openHit(hits[selIdx < 0 ? 0 : selIdx]); return; }
    else if (e.key === 'Escape') { resBox.hidden = true; searchEl.blur(); return; }
    else return;
    btns.forEach(function (b, i) {
      b.classList.toggle('sel', i === selIdx);
      b.setAttribute('aria-selected', i === selIdx ? 'true' : 'false');
    });
    if (btns[selIdx]) btns[selIdx].scrollIntoView({ block: 'nearest' });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.searchwrap')) resBox.hidden = true;
  });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === '/' && !typing) { e.preventDefault(); searchEl.focus(); searchEl.select(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    var ids = views.map(function (v) { return v.id; });
    var idx = ids.indexOf($('.view.active').id);
    if (e.key === 'ArrowRight' && idx < views.length - 1) go(ids[idx + 1], { focus: true });
    if (e.key === 'ArrowLeft' && idx > 0) go(ids[idx - 1], { focus: true });
  });

  $('#menubtn').addEventListener('click', function () {
    if (rail.classList.contains('open')) closeRail(); else openRail();
  });
  $('#scrim').addEventListener('click', closeRail);

  var themeBtn = $('#themebtn');
  function syncTheme() {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  try { var t = localStorage.getItem('pitboss.theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) { }
  syncTheme();
  themeBtn.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('pitboss.theme', next); } catch (e) { }
    syncTheme();
  });

  applyHash();

  /* Keep the address bar pointing at whatever card is open, so the URL is
     always shareable. replaceState, so browsing cards does not fill history. */
  ['#k-list', '#r-list'].forEach(function (sel) {
    var host = $(sel); if (!host) return;
    host.addEventListener('toggle', function (e) {
      var d = e.target; if (!d || d.tagName !== 'DETAILS' || !d.open) return;
      var label = $('.kname', d) || $('.rq', d);
      if (!label) return;
      var term = (label.childNodes[0] && label.childNodes[0].textContent || label.textContent).trim();
      history.replaceState({ v: $('.view.active').id }, '', hashFor($('.view.active').id, term));
    }, true);
  });
})();
