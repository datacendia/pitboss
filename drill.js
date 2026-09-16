/* Segment composition drills — the interactive builder.
   Deliberately NOT a mock of Fullstory's interface: the UI steps in this
   platform are reasoned rather than verified, so a replica would teach a
   layout that may not exist. This drills the logic instead. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  if (!$('#drillbox') || !window.DRILLS) return;

  var idx = 0, solved = {};
  var LS = 'pitboss.drills';
  try { solved = JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { }
  function persist() { try { localStorage.setItem(LS, JSON.stringify(solved)); } catch (e) { } }
  function winLabel(v) {
    var m = window.DRILL_WINDOWS.filter(function (w) { return w.v === v; })[0];
    return m ? m.label : v;
  }
  function opts(list, sel) {
    return list.map(function (o) {
      var v = o.v !== undefined ? o.v : o, l = o.label !== undefined ? o.label : o;
      return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('');
  }

  function rowHtml(i, row) {
    row = row || {};
    var props = window.DRILL_PROPS[row.event] || [];
    return '<div class="drow" data-i="' + i + '">' +
      '<span class="dnum" aria-hidden="true">' + (i + 1) + '</span>' +
      '<select class="d-op" aria-label="Operator, condition ' + (i + 1) + '">' + opts(window.DRILL_OPS, row.op || 'did') + '</select>' +
      '<select class="d-ev" aria-label="Event, condition ' + (i + 1) + '"><option value="">Choose an event&hellip;</option>' +
      opts(window.DRILL_EVENTS, row.event || '') + '</select>' +
      '<input class="d-n" type="number" min="2" max="20" value="' + (row.n || 3) +
      '" aria-label="Minimum count, condition ' + (i + 1) + '"' + (row.op === 'count' ? '' : ' hidden') + '>' +
      '<select class="d-prop" aria-label="Property filter, condition ' + (i + 1) + '"' + (props.length ? '' : ' hidden') + '>' +
      '<option value="">no property filter</option>' + opts(props, row.prop || '') + '</select>' +
      '<button class="drm" type="button" aria-label="Remove condition ' + (i + 1) + '">&times;</button></div>';
  }

  /* Raw read keeps half-finished rows, so adding or removing a condition
     never silently discards a row whose event has not been chosen yet.
     readRows() is the filtered view used for marking. */
  function readRowsRaw() {
    return $$('#d-rows .drow').map(function (el) {
      var op = $('.d-op', el).value, ev = $('.d-ev', el).value;
      var p = $('.d-prop', el), n = $('.d-n', el);
      var r = { op: op, event: ev };
      if (op === 'count') r.n = +n.value || 2;
      if (p && !p.hidden && p.value) r.prop = p.value;
      return r;
    });
  }
  function readRows() {
    return readRowsRaw().filter(function (r) { return r.event; });
  }
  function renderRows(rows) {
    $('#d-rows').innerHTML = (rows && rows.length ? rows : [{}]).map(function (r, i) { return rowHtml(i, r); }).join('');
  }
  function scoreLine() {
    $('#d-score').textContent = Object.keys(solved).length + ' of ' + window.DRILLS.length + ' solved';
  }
  function renderDrill() {
    var d = window.DRILLS[idx];
    $('#d-level').textContent = d.level;
    $('#d-progress').textContent = 'Drill ' + (idx + 1) + ' of ' + window.DRILLS.length + (solved[d.id] ? '  ·  solved' : '');
    $('#d-brief').textContent = d.brief;
    $('#d-context').textContent = d.context;
    $('#d-window').innerHTML = opts(window.DRILL_WINDOWS, 'session');
    $('#d-scope').value = 'session';
    renderRows(null);
    $('#d-feedback').hidden = true;
    $('#d-prev').disabled = idx === 0;
    $('#d-next').disabled = idx === window.DRILLS.length - 1;
    scoreLine();
  }

  /* Mark the attempt, explaining issues in the order that matters:
     scope first, then ordering, then structure, then window. */
  function check() {
    var d = window.DRILLS[idx];
    var got = { scope: $('#d-scope').value, window: $('#d-window').value, rows: readRows() };
    var issues = [];
    if (!got.rows.length) { show(false, ['Add at least one condition before checking.']); return; }

    if (got.scope !== d.scope) {
      issues.push(d.scope === 'user'
        ? '<strong>Scope.</strong> This brief asks about people across all their sessions &mdash; "never", "has ever" and "first-ever" are the tells. Session scope would only tell you which individual visits lacked the event, which answers a different question and produces a plausible-looking wrong number.'
        : '<strong>Scope.</strong> This brief asks about the shape of a single visit, so it is session scope. User scope sweeps in anyone who ever did this on any visit, which inflates the population.');
    }

    var wantSeq = d.rows.some(function (r) { return r.op === 'then'; });
    var gotSeq = got.rows.some(function (r) { return r.op === 'then'; });
    if (wantSeq && !gotSeq) issues.push('<strong>Sequence.</strong> The brief says <em>then</em>, so order carries the claim. Co-occurrence is not sequence &mdash; as written this also matches sessions where the events happened the other way round, which is usually a completely different story.');
    if (!wantSeq && gotSeq) issues.push('<strong>Sequence.</strong> Nothing in this brief requires an order. Adding one narrows the population for no reason and will under-report.');

    d.rows.forEach(function (w) {
      var exact = got.rows.filter(function (g) { return g.event === w.event && (g.prop || '') === (w.prop || ''); });
      var sameEvent = got.rows.filter(function (g) { return g.event === w.event; });
      if (!exact.length) {
        if (sameEvent.length && w.prop) {
          issues.push('<strong>Property filter.</strong> <span class="mono">' + esc(w.event) + '</span> needs <span class="mono">' + esc(w.prop) + '</span>. Without it you catch every occurrence of that event, and the filter is usually where the entire meaning of the segment lives.');
        } else if (!sameEvent.length) {
          issues.push('<strong>Missing condition.</strong> You need <span class="mono">' + (w.op === 'didnot' ? 'did NOT ' : '') + esc(w.event) + '</span>' + (w.prop ? ' where <span class="mono">' + esc(w.prop) + '</span>' : '') + '.');
        }
      } else if (exact[0].op !== w.op) {
        if (w.op === 'didnot') issues.push('<strong>Negation.</strong> <span class="mono">' + esc(w.event) + '</span> should be a <em>did NOT</em>. This brief asks who is missing the event, not who has it &mdash; nearly every valuable gambling segment is a negative.');
        else if (w.op === 'count') issues.push('<strong>Count.</strong> <span class="mono">' + esc(w.event) + '</span> needs a count of at least ' + w.n + ', not a plain "did". The repetition is the finding.');
        else if (w.op === 'then') issues.push('<strong>Ordering.</strong> <span class="mono">' + esc(w.event) + '</span> must come <em>after</em> the condition above it.');
        else issues.push('<strong>Operator.</strong> <span class="mono">' + esc(w.event) + '</span> should be a plain "did".');
      } else if (w.op === 'count' && (exact[0].n || 0) !== w.n) {
        issues.push('<strong>Threshold.</strong> The count for <span class="mono">' + esc(w.event) + '</span> should be ' + w.n + '.');
      }
    });

    got.rows.forEach(function (g) {
      if (!d.rows.some(function (w) { return w.event === g.event; })) {
        issues.push('<strong>Extra condition.</strong> <span class="mono">' + esc(g.event) + '</span> is not needed. Every additional filter shrinks the population, and at some point you are describing eleven people.');
      }
    });

    if (!issues.length && got.window !== d.window) {
      issues.push('<strong>Window.</strong> The logic is right but the window is not &mdash; this should be <em>' + esc(winLabel(d.window)) + '</em>. The window moves the number more than almost anything else, and it is the first thing a BI team will challenge.');
    }

    var norm = function (r) { return r.op + '|' + r.event + '|' + (r.prop || '') + '|' + (r.n || ''); };
    var ok = !issues.length && d.rows.map(norm).sort().join() === got.rows.map(norm).sort().join();
    if (ok) { solved[d.id] = true; persist(); }
    show(ok, issues);
  }

  function answerHtml(d) {
    var txt = 'Scope:  ' + d.scope + '\nWindow: ' + winLabel(d.window) + '\n\n' +
      d.rows.map(function (r, i) {
        return (i + 1) + '. ' + (r.op === 'didnot' ? 'did NOT ' : r.op === 'then' ? 'THEN ' :
          r.op === 'count' ? 'did at least ' + r.n + ' times ' : 'did ') +
          r.event + (r.prop ? '   where ' + r.prop : '');
      }).join('\n');
    return '<p class="flabel">The answer</p><pre><code>' + esc(txt) + '</code></pre><p>' + d.why + '</p>';
  }

  function show(ok, issues) {
    var d = window.DRILLS[idx], f = $('#d-feedback');
    f.className = 'dfeedback ' + (ok ? 'ok' : 'no');
    f.innerHTML = '<p class="dverdict">' + (ok ? 'Correct.' : issues.length + (issues.length === 1 ? ' thing to fix' : ' things to fix')) + '</p>' +
      (issues.length ? '<ul>' + issues.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' : '') +
      (ok ? '<p>' + d.why + '</p>' : '');
    f.hidden = false;
    scoreLine();
    $('#d-progress').textContent = 'Drill ' + (idx + 1) + ' of ' + window.DRILLS.length + (solved[d.id] ? '  ·  solved' : '');
  }

  $('#d-rows').addEventListener('change', function (e) {
    var row = e.target.closest && e.target.closest('.drow'); if (!row) return;
    if (e.target.classList.contains('d-ev')) {
      var props = window.DRILL_PROPS[e.target.value] || [], sel = $('.d-prop', row);
      sel.innerHTML = '<option value="">no property filter</option>' + opts(props, '');
      sel.hidden = !props.length;
    }
    if (e.target.classList.contains('d-op')) $('.d-n', row).hidden = e.target.value !== 'count';
  });
  $('#d-rows').addEventListener('click', function (e) {
    if (!e.target.classList.contains('drm')) return;
    var rows = readRowsRaw(), i = +e.target.closest('.drow').getAttribute('data-i');
    rows.splice(i, 1); renderRows(rows);
  });
  $('#d-add').addEventListener('click', function () {
    var rows = readRowsRaw(); rows.push({}); renderRows(rows);
    var all = $$('#d-rows .drow'), last = all[all.length - 1];
    if (last) $('.d-ev', last).focus();
  });
  $('#d-check').addEventListener('click', check);
  $('#d-reveal').addEventListener('click', function () {
    var f = $('#d-feedback'); f.className = 'dfeedback'; f.innerHTML = answerHtml(window.DRILLS[idx]); f.hidden = false;
  });
  $('#d-reset').addEventListener('click', function () { renderRows(null); $('#d-feedback').hidden = true; });
  $('#d-prev').addEventListener('click', function () { if (idx > 0) { idx--; renderDrill(); } });
  $('#d-next').addEventListener('click', function () { if (idx < window.DRILLS.length - 1) { idx++; renderDrill(); } });

  renderDrill();
})();
