/* Psikolog Firkan · etkileşimli BDT oyunları (döngü oyunu + düşünce dedektifi) */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- döngü oyunu ---------- */
  var NODES = [
    { k: 'scene', n: 'Durum', e: '📍' },
    { k: 'thought', n: 'Düşünce', e: '💭' },
    { k: 'emotion', n: 'Duygu', e: '❤️' },
    { k: 'body', n: 'Beden', e: '🫀' },
    { k: 'behavior', n: 'Davranış', e: '🏃' }
  ];

  function cycleGame(root, scenarios) {
    var cur = 0, step = -1, timer = null, level = 0;
    var tabs = el('div', 'cg-tabs');
    if (scenarios.length > 1) {
      scenarios.forEach(function (s, i) {
        var b = el('button', 'cg-tab', s.tab || s.title); b.type = 'button';
        b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        b.addEventListener('click', function () { cur = i; Array.prototype.forEach.call(tabs.children, function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); reset(); });
        tabs.appendChild(b);
      });
      root.appendChild(tabs);
    }
    var stage = el('div', 'cg-stage');
    var ring = el('div', 'cg-ring'); ring.setAttribute('aria-hidden', 'true');
    var spin = el('div', 'cg-spin'); ring.appendChild(spin);
    var nodeEls = NODES.map(function (n, i) {
      var d = el('div', 'cg-node cg-n' + i); d.appendChild(el('span', 'cg-ne', n.e)); d.appendChild(el('b', null, n.n)); ring.appendChild(d); return d;
    });
    var mid = el('div', 'cg-mid'); var midE = el('span', 'cg-mid-e'); var midT = el('small', null, 'Döngü'); mid.appendChild(midE); mid.appendChild(midT); ring.appendChild(mid);
    var card = el('div', 'cg-card'); card.setAttribute('aria-live', 'polite');
    var meter = el('div', 'cg-meter'); var mLab = el('span', 'cg-mlab'); var mBar = el('div', 'cg-mbar'); var mFill = el('i'); mBar.appendChild(mFill); var mVal = el('b', 'cg-mval', '0');
    meter.appendChild(mLab); meter.appendChild(mBar); meter.appendChild(mVal);
    var body = el('div', 'cg-body');
    var nav = el('div', 'cg-nav'); var prog = el('div', 'cg-prog'); var next = el('button', 'btn primary dark cg-next', 'Başla'); next.type = 'button';
    nav.appendChild(prog); nav.appendChild(next);
    card.appendChild(meter); card.appendChild(body); card.appendChild(nav);
    stage.appendChild(ring); stage.appendChild(card);
    root.appendChild(stage);

    function setLevel(v, label) {
      level = v; mLab.textContent = label; mFill.style.width = v + '%'; mVal.textContent = v;
      meter.style.setProperty('--h', Math.round(120 - v * 1.2));
      meter.hidden = false;
    }
    function animLevel(from, to, label, ms) {
      if (reduce) { setLevel(to, label); return; }
      var t0 = null; ms = ms || 900;
      function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / ms); var e = 1 - Math.pow(1 - p, 3); setLevel(Math.round(from + (to - from) * e), label); if (p < 1) requestAnimationFrame(f); }
      requestAnimationFrame(f);
    }
    function lightNodes(n, cls) {
      nodeEls.forEach(function (d, i) { d.classList.toggle('on', i <= n); d.classList.toggle('now', i === n); d.classList.remove('good', 'warn'); if (cls && i <= n) d.classList.add(cls); });
    }
    function dots(n, total) { clear(prog); for (var i = 0; i < total; i++) { var s = el('span'); if (i <= n) s.className = 'on'; prog.appendChild(s); } }
    function pop(node) { node.classList.remove('pop'); void node.offsetWidth; node.classList.add('pop'); }

    function reset() {
      var s = scenarios[cur]; step = -1; ring.classList.remove('spinning', 'broken'); lightNodes(-1); meter.hidden = true; clear(body);
      var h = el('div', 'cg-intro'); h.appendChild(el('span', 'cg-big', s.scene.emoji)); h.appendChild(el('h3', null, s.title));
      h.appendChild(el('p', null, 'Bir anı adım adım izle, sonra döngüyü kırmak için bir yol seç. 1 dakika sürer.'));
      body.appendChild(h); pop(h); midE.textContent = s.scene.emoji; midT.textContent = 'Döngü';
      next.textContent = 'Başla'; next.hidden = false; dots(-1, 7);
    }
    function show(i) {
      var s = scenarios[cur]; step = i; clear(body);
      var box = el('div', 'cg-step');
      if (i <= 4) {
        var n = NODES[i]; lightNodes(i); midE.textContent = n.e; midT.textContent = n.n;
        box.appendChild(el('span', 'cg-tag', (i + 1) + ' · ' + n.n));
        if (i === 0) { box.appendChild(el('span', 'cg-big', s.scene.emoji)); box.appendChild(el('p', 'cg-lead', s.scene.text)); }
        if (i === 1) { var bub = el('p', 'cg-bubble', s.thought); box.appendChild(bub); box.appendChild(el('p', 'cg-hint', 'Bu düşünce o kadar hızlı gelir ki çoğu zaman fark etmeyiz bile.')); }
        if (i === 2) { box.appendChild(el('span', 'cg-big', s.emotion.emoji)); box.appendChild(el('p', 'cg-lead', s.emotion.name + ' yükseliyor…')); animLevel(0, s.emotion.level, s.emotion.name); }
        if (i === 3) { var ul = el('ul', 'cg-chips'); s.body.forEach(function (b, j) { var li = el('li', null, b); li.style.animationDelay = (j * 0.25) + 's'; ul.appendChild(li); }); box.appendChild(ul); }
        if (i === 4) { box.appendChild(el('p', 'cg-lead', s.behavior)); var sh = el('p', 'cg-note'); sh.appendChild(el('b', null, 'Kısa vadede: ')); sh.appendChild(document.createTextNode(s.short)); box.appendChild(sh); }
        next.textContent = 'Devam';
      } else if (i === 5) {
        lightNodes(4); ring.classList.add('spinning'); midE.textContent = '🔁'; midT.textContent = 'Döngü';
        box.appendChild(el('span', 'cg-tag', 'Döngü'));
        box.appendChild(el('p', 'cg-lead', s.long));
        box.appendChild(el('p', 'cg-hint', 'Davranış, bir sonraki seferde aynı düşünceyi daha inandırıcı yapar ve döngü kendini tekrarlar.'));
        next.textContent = 'Döngüyü kır';
      } else if (i === 6) {
        ring.classList.remove('spinning'); lightNodes(4); midE.textContent = '✋'; midT.textContent = 'Senin seçimin';
        box.appendChild(el('span', 'cg-tag', 'Döngüyü kır'));
        box.appendChild(el('p', 'cg-lead', 'Aynı anda kendine ne söylerdin ya da ne yapardın?'));
        var ch = el('div', 'cg-choices');
        s.choices.forEach(function (c) { var b = el('button', 'cg-choice', c.label); b.type = 'button'; b.addEventListener('click', function () { choose(c); }); ch.appendChild(b); });
        box.appendChild(ch); next.hidden = true;
      }
      dots(Math.min(i, 6), 7);
      body.appendChild(box); pop(box);
    }
    function choose(c) {
      var s = scenarios[cur]; clear(body); var box = el('div', 'cg-step');
      var good = c.type === 'dengeli';
      ring.classList.toggle('broken', good); lightNodes(4, good ? 'good' : 'warn');
      midE.textContent = good ? '🌱' : (c.type === 'kacinma' ? '⏳' : '🤔'); midT.textContent = good ? 'Döngü kırıldı' : 'Döngü sürüyor';
      box.appendChild(el('span', 'cg-tag ' + (good ? 'ok' : 'wa'), good ? 'Döngü gevşedi' : (c.type === 'kacinma' ? 'Kısa vadeli rahatlama' : 'Pek inandırıcı değil')));
      box.appendChild(el('p', 'cg-quote', '“' + c.label + '”'));
      box.appendChild(el('p', 'cg-lead', c.feedback));
      animLevel(level, c.level, s.emotion.name, 1200);
      if (good) box.appendChild(el('p', 'cg-hint', s.takeaway));
      var row = el('div', 'cg-row');
      var again = el('button', 'btn ghost-dark', good ? 'Diğer seçenekleri gör' : 'Başka bir yol dene'); again.type = 'button'; again.addEventListener('click', function () { setLevel(s.emotion.level, s.emotion.name); show(6); });
      row.appendChild(again);
      if (good) { var a = el('a', 'btn primary dark', 'Randevu al'); a.href = '/randevu/'; row.appendChild(a); }
      box.appendChild(row); dots(6, 7); body.appendChild(box); pop(box);
    }
    next.addEventListener('click', function () { show(step + 1); });
    reset();
  }

  /* ---------- düşünce dedektifi ---------- */
  function detective(root, data) {
    var traps = data.traps, cards = shuffle(data.cards), i = 0, score = 0;
    var top = el('div', 'dd-top'); var cnt = el('span', 'dd-cnt'); var sc = el('span', 'dd-score'); top.appendChild(cnt); top.appendChild(sc);
    var card = el('div', 'dd-card'); var q = el('p', 'dd-q'); card.appendChild(el('span', 'dd-e', '🕵️')); card.appendChild(q);
    var grid = el('div', 'dd-traps'); var fb = el('div', 'dd-fb'); fb.setAttribute('aria-live', 'polite');
    var nx = el('button', 'btn primary dark dd-next', 'Sonraki düşünce'); nx.type = 'button'; nx.hidden = true;
    root.appendChild(top); root.appendChild(card); root.appendChild(grid); root.appendChild(fb); root.appendChild(nx);
    var btns = traps.map(function (t) {
      var b = el('button', 'dd-trap'); b.type = 'button'; b.appendChild(el('span', 'dd-te', t.e)); b.appendChild(el('b', null, t.n)); b.appendChild(el('small', null, t.d));
      b.addEventListener('click', function () { answer(t.k, b); }); grid.appendChild(b); return b;
    });
    function render() {
      var c = cards[i]; cnt.textContent = 'Düşünce ' + (i + 1) + ' / ' + cards.length; sc.textContent = '⭐ ' + score;
      q.textContent = '“' + c.t + '”'; clear(fb); nx.hidden = true;
      btns.forEach(function (b) { b.disabled = false; b.classList.remove('right', 'wrong'); });
      card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
    }
    function answer(k, b) {
      var c = cards[i], ok = k === c.k; if (ok) score++;
      btns.forEach(function (x, j) { x.disabled = true; if (traps[j].k === c.k) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      clear(fb);
      fb.appendChild(el('b', ok ? 'ok' : 'wa', ok ? 'Doğru tespit! 🎯' : 'Bu sefer olmadı.'));
      fb.appendChild(el('p', null, c.why));
      var r = el('p', 'dd-re'); r.appendChild(el('span', null, 'Daha dengeli hâli: ')); r.appendChild(document.createTextNode(c.re)); fb.appendChild(r);
      sc.textContent = '⭐ ' + score; nx.hidden = false; nx.textContent = i < cards.length - 1 ? 'Sonraki düşünce' : 'Sonucu gör';
    }
    nx.addEventListener('click', function () {
      if (i < cards.length - 1) { i++; render(); return; }
      clear(fb); grid.hidden = true; nx.hidden = true; q.textContent = cards.length + ' düşünceden ' + score + ' tanesini doğru yakaladın.';
      card.querySelector('.dd-e').textContent = score >= cards.length - 2 ? '🏆' : '🌱';
      fb.appendChild(el('p', null, 'Düşünce tuzaklarını fark etmek, BDT\'nin ilk adımıdır. Görüşmelerde bunu kendi düşüncelerinle, kendi hızında birlikte çalışırız.'));
      var row = el('div', 'cg-row'); var again = el('button', 'btn ghost-dark', 'Tekrar oyna'); again.type = 'button';
      again.addEventListener('click', function () { cards = shuffle(data.cards); i = 0; score = 0; grid.hidden = false; card.querySelector('.dd-e').textContent = '🕵️'; render(); });
      var a = el('a', 'btn primary dark', 'Randevu al'); a.href = '/randevu/'; row.appendChild(again); row.appendChild(a); fb.appendChild(row);
    });
    render();
  }

  document.querySelectorAll('[data-game]').forEach(function (root) {
    var src = root.querySelector('script[type="application/json"]'); if (!src) return;
    var data; try { data = JSON.parse(src.textContent); } catch (e) { return; }
    var box = root.querySelector('.game-box');
    if (root.getAttribute('data-game') === 'cycle') cycleGame(box, data);
    else if (root.getAttribute('data-game') === 'detective') detective(box, data);
  });

  /* videolar: görünür olunca sessiz oynat */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting && !reduce) { v.play().catch(function () {}); } else { v.pause(); } }); }, { threshold: .4 });
    document.querySelectorAll('video[data-auto]').forEach(function (v) { io.observe(v); });
  }
})();
