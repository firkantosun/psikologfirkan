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

  var NEUTRAL = ['Akşam ne yesem acaba?', 'Bugün hava güzelmiş.', 'Şu şarkı ne güzeldi.', 'Telefonun şarjı azalmış.', 'Çay demlemeyi unutmayayım.'];
  function cycleGame(root, scenarios) {
    var cur = 0, step = 0, level = 0, user = 0, pts = 0;
    var tabs = el('div', 'cg-tabs');
    if (scenarios.length > 1) {
      scenarios.forEach(function (s, i) {
        var b = el('button', 'cg-tab', s.tab || s.title); b.type = 'button';
        b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        b.addEventListener('click', function () { cur = i; Array.prototype.forEach.call(tabs.children, function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); show(0); });
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
    var mid = el('div', 'cg-mid'); var midE = el('span', 'cg-mid-e'); var midT = el('small', null, ''); mid.appendChild(midE); mid.appendChild(midT); ring.appendChild(mid);
    var card = el('div', 'cg-card'); card.setAttribute('aria-live', 'polite');
    var top = el('div', 'cg-top'); var prog = el('div', 'cg-prog'); var score = el('span', 'cg-pts'); top.appendChild(prog); top.appendChild(score);
    var meter = el('div', 'cg-meter'); var mLab = el('span', 'cg-mlab'); var mBar = el('div', 'cg-mbar'); var mFill = el('i'); mBar.appendChild(mFill); var mVal = el('b', 'cg-mval', '0');
    meter.appendChild(mLab); meter.appendChild(mBar); meter.appendChild(mVal);
    var body = el('div', 'cg-body');
    card.appendChild(top); card.appendChild(meter); card.appendChild(body);
    stage.appendChild(ring); stage.appendChild(card);
    root.appendChild(stage);

    function setLevel(v, label) { level = v; mLab.textContent = label; mFill.style.width = v + '%'; mVal.textContent = v; meter.style.setProperty('--h', Math.round(120 - v * 1.2)); meter.hidden = false; }
    function animLevel(from, to, label, ms) {
      if (reduce) { setLevel(to, label); return; }
      var t0 = null; ms = ms || 900;
      function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / ms); var e = 1 - Math.pow(1 - p, 3); setLevel(Math.round(from + (to - from) * e), label); if (p < 1) requestAnimationFrame(f); }
      requestAnimationFrame(f);
    }
    function lightNodes(n, cls) { nodeEls.forEach(function (d, i) { d.classList.toggle('on', i <= n); d.classList.toggle('now', i === n); d.classList.remove('good', 'warn'); if (cls && i <= n) d.classList.add(cls); }); }
    function dots(n) { clear(prog); for (var i = 0; i < 7; i++) { var s = el('span'); if (i <= n) s.className = 'on'; prog.appendChild(s); } }
    function addPts(n) { pts += n; score.textContent = '⭐ ' + pts; score.classList.remove('bump'); void score.offsetWidth; score.classList.add('bump'); }
    function pop(node) { node.classList.remove('pop'); void node.offsetWidth; node.classList.add('pop'); }
    function btn(txt, cls, fn) { var b = el('button', 'btn ' + (cls || 'primary dark') + ' cg-btn', txt); b.type = 'button'; b.addEventListener('click', fn); return b; }
    function frame(i, tag, q) {
      clear(body); var box = el('div', 'cg-step'); step = i; dots(i);
      if (tag) box.appendChild(el('span', 'cg-tag', tag));
      if (q) box.appendChild(el('p', 'cg-q', q));
      body.appendChild(box); pop(box); return box;
    }
    function node(i) { var n = NODES[i]; lightNodes(i); midE.textContent = n.e; midT.textContent = n.n; }

    function show(i) {
      var s = scenarios[cur];
      if (i === 0) {
        pts = 0; score.textContent = '⭐ 0'; ring.classList.remove('spinning', 'broken'); meter.hidden = true; node(0);
        var b0 = frame(0, s.title);
        b0.appendChild(el('span', 'cg-big', s.scene.emoji)); b0.appendChild(el('p', 'cg-lead', s.scene.text));
        b0.appendChild(btn('Bu ana gir →', null, function () { show(1); }));
      }
      if (i === 1) {
        node(1);
        var b1 = frame(1, '1 · Düşünceyi yakala', 'Aklından geçenlerden hangisi seni en çok sarsar? Yakala!');
        var pool = el('div', 'cg-pool'); var opts = shuffle([s.thought].concat(shuffle(NEUTRAL).slice(0, 2)));
        var msg = el('p', 'cg-hint');
        opts.forEach(function (o, k) {
          var bb = el('button', 'cg-float', o); bb.type = 'button'; bb.style.animationDelay = (k * -1.3) + 's';
          bb.addEventListener('click', function () {
            if (o === s.thought) {
              Array.prototype.forEach.call(pool.children, function (x) { x.disabled = true; if (x !== bb) x.classList.add('gone'); });
              bb.classList.add('caught'); addPts(10); msg.textContent = 'Yakaladın! Buna otomatik düşünce diyoruz: o kadar hızlı gelir ki çoğu zaman fark etmeyiz.';
              b1.appendChild(btn('Devam →', null, function () { show(2); }));
            } else { bb.classList.add('nope'); msg.textContent = 'Bu seni pek sarsmazdı. Bir daha bak 👀'; setTimeout(function () { bb.classList.remove('nope'); }, 450); }
          });
          pool.appendChild(bb);
        });
        b1.appendChild(pool); b1.appendChild(msg);
      }
      if (i === 2) {
        node(2);
        var b2 = frame(2, '2 · Duygu', 'Bu düşünceyle ne kadar ' + s.emotion.name.toLocaleLowerCase('tr') + ' hissederdin?');
        var face = el('span', 'cg-big cg-face', s.emotion.emoji); b2.appendChild(face);
        var r = el('input', 'cg-range'); r.type = 'range'; r.min = 0; r.max = 100; r.value = 50; r.setAttribute('aria-label', s.emotion.name + ' yoğunluğu');
        var out = el('b', 'cg-rout', '50');
        r.addEventListener('input', function () { out.textContent = r.value; face.style.transform = 'scale(' + (0.8 + r.value / 160) + ')'; setLevel(+r.value, s.emotion.name); });
        var rw = el('div', 'cg-rwrap'); rw.appendChild(r); rw.appendChild(out); b2.appendChild(rw); setLevel(50, s.emotion.name);
        b2.appendChild(btn('Bu kadar', null, function () {
          user = +r.value; addPts(10);
          var b2b = frame(2, '2 · Duygu');
          b2b.appendChild(el('span', 'cg-big', s.emotion.emoji));
          b2b.appendChild(el('p', 'cg-lead', 'Sen ' + user + ' dedin. Bu anda çoğu kişi yaklaşık ' + s.emotion.level + ' civarında hisseder; düşünce ne kadar inandırıcıysa duygu o kadar yükselir.'));
          b2b.appendChild(btn('Devam →', null, function () { show(3); }));
        }));
      }
      if (i === 3) {
        node(3);
        var b3 = frame(3, '3 · Beden', 'Bedeninde neler olur? Hissettiklerine dokun.');
        var ul = el('div', 'cg-taps'); var nb = btn('Devam →', null, function () { show(4); }); nb.disabled = true;
        s.body.forEach(function (x, k) {
          var c = el('button', 'cg-tap', x); c.type = 'button'; c.style.animationDelay = (k * .12) + 's';
          c.addEventListener('click', function () { var on = c.classList.toggle('on'); if (on) { addPts(5); nodeEls[3].classList.remove('beat'); void nodeEls[3].offsetWidth; nodeEls[3].classList.add('beat'); } nb.disabled = !ul.querySelector('.on'); });
          ul.appendChild(c);
        });
        b3.appendChild(ul); b3.appendChild(el('p', 'cg-hint', 'Beden, zihnin alarmına eşlik eder. Bu duyumlar tehlikeli değil ama gerçekten hissedilir.')); b3.appendChild(nb);
      }
      if (i === 4) {
        node(4);
        var b4 = frame(4, '4 · Davranış', 'O anda ne yapmak isterdin?');
        var ch = el('div', 'cg-choices');
        [[s.behavior, true], ['Hiçbir şey yapmadan, olduğu yerde kalmak', false]].forEach(function (o) {
          var bb = el('button', 'cg-choice', o[0]); bb.type = 'button';
          bb.addEventListener('click', function () {
            addPts(5); var b4b = frame(4, '4 · Davranış');
            b4b.appendChild(el('p', 'cg-lead', o[1] ? 'Çoğumuz böyle yaparız. Kısa vadede: ' + s.short : 'Zor ama cesur bir seçim. Çoğu kişi ilk anda şunu yapar: ' + s.behavior));
            b4b.appendChild(btn('Sonra ne olur? →', null, function () { show(5); }));
          });
          ch.appendChild(bb);
        });
        b4.appendChild(ch);
      }
      if (i === 5) {
        lightNodes(4); ring.classList.add('spinning'); midE.textContent = '🔁'; midT.textContent = 'Döngü';
        var b5 = frame(5, '🔁 Döngü'); b5.appendChild(el('p', 'cg-lead', s.long));
        b5.appendChild(el('p', 'cg-hint', 'Davranış, bir sonraki seferde aynı düşünceyi daha inandırıcı yapar. Şimdi döngüyü kırma sırası sende.'));
        b5.appendChild(btn('Döngüyü kır ✋', null, function () { show(6); }));
      }
      if (i === 6) {
        ring.classList.remove('spinning'); lightNodes(4); midE.textContent = '✋'; midT.textContent = 'Senin seçimin';
        setLevel(user || s.emotion.level, s.emotion.name);
        var b6 = frame(6, '✋ Döngüyü kır', 'Aynı anda kendine ne söylerdin ya da ne yapardın?');
        var cc = el('div', 'cg-choices');
        s.choices.forEach(function (c) { var bb = el('button', 'cg-choice', c.label); bb.type = 'button'; bb.addEventListener('click', function () { choose(c); }); cc.appendChild(bb); });
        b6.appendChild(cc);
      }
    }
    function choose(c) {
      var s = scenarios[cur], good = c.type === 'dengeli';
      var base = user || s.emotion.level, to = Math.max(5, Math.round(base * c.level / s.emotion.level));
      ring.classList.toggle('broken', good); lightNodes(4, good ? 'good' : 'warn');
      midE.textContent = good ? '🌱' : (c.type === 'kacinma' ? '⏳' : '🤔'); midT.textContent = good ? 'Döngü kırıldı' : 'Döngü sürüyor';
      if (good) addPts(20);
      var box = frame(6, good ? 'Döngü gevşedi 🎉' : (c.type === 'kacinma' ? 'Kısa vadeli rahatlama' : 'Pek inandırıcı değil'));
      box.querySelector('.cg-tag').classList.add(good ? 'ok' : 'wa');
      box.appendChild(el('p', 'cg-quote', '“' + c.label + '”'));
      box.appendChild(el('p', 'cg-lead', c.feedback));
      animLevel(level, to, s.emotion.name, 1200);
      if (good) { box.appendChild(el('p', 'cg-hint', s.takeaway)); if (!reduce) confetti(card); }
      var row = el('div', 'cg-row');
      row.appendChild(btn(good ? 'Diğer seçenekler' : 'Başka bir yol dene', 'ghost-dark', function () { show(6); }));
      if (good) { var a = el('a', 'btn primary dark', 'Randevu al'); a.href = '/randevu/'; row.appendChild(a); row.appendChild(btn('Baştan oyna', 'ghost-dark', function () { show(0); })); }
      box.appendChild(row);
    }
    show(0);
  }
  function confetti(host) {
    var c = el('div', 'cg-conf'); var cols = ['#e4b062', '#7fd1a1', '#e8735a', '#8fb8ff', '#fff'];
    for (var i = 0; i < 26; i++) { var p = el('i'); p.style.left = (Math.random() * 100) + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = (Math.random() * .3) + 's'; p.style.setProperty('--x', (Math.random() * 120 - 60) + 'px'); c.appendChild(p); }
    host.appendChild(c); setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1800);
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


  /* galeri: data-full olan her öğe tam boy açılır, ok/kaydırma ile gezilir */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
  if (items.length) {
    var ov = el('div', 'gal'); ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Fotoğraf');
    var im = el('img'); var cap = el('p', 'gal-cap'); var cnt = el('span', 'gal-cnt');
    var pv = el('button', 'gal-b gal-p', '‹'); var nx = el('button', 'gal-b gal-n', '›'); var x = el('button', 'gal-x', '✕');
    [pv, nx, x].forEach(function (b) { b.type = 'button'; });
    pv.setAttribute('aria-label', 'Önceki'); nx.setAttribute('aria-label', 'Sonraki'); x.setAttribute('aria-label', 'Kapat');
    var fig = el('figure', 'gal-f'); fig.appendChild(im); fig.appendChild(cap); fig.appendChild(cnt);
    ov.appendChild(fig); ov.appendChild(pv); ov.appendChild(nx); ov.appendChild(x); document.body.appendChild(ov);
    var gi = 0;
    function openG(i) { gi = (i + items.length) % items.length; var it = items[gi]; im.src = it.getAttribute('data-full'); im.alt = it.getAttribute('data-cap') || ''; cap.textContent = it.getAttribute('data-cap') || ''; cnt.textContent = (gi + 1) + ' / ' + items.length; ov.hidden = false; document.body.style.overflow = 'hidden'; im.classList.remove('pop'); void im.offsetWidth; im.classList.add('pop'); }
    function closeG() { ov.hidden = true; document.body.style.overflow = ''; }
    items.forEach(function (it, i) { it.addEventListener('click', function (e) { e.preventDefault(); openG(i); }); });
    pv.addEventListener('click', function () { openG(gi - 1); }); nx.addEventListener('click', function () { openG(gi + 1); }); x.addEventListener('click', closeG);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeG(); });
    document.addEventListener('keydown', function (e) { if (ov.hidden) return; if (e.key === 'Escape') closeG(); if (e.key === 'ArrowLeft') openG(gi - 1); if (e.key === 'ArrowRight') openG(gi + 1); });
    var sx = null; ov.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    ov.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) openG(gi + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* sekmeler */
  document.querySelectorAll('.ca-tabs').forEach(function (tb) {
    var bs = tb.querySelectorAll('[role="tab"]');
    Array.prototype.forEach.call(bs, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(bs, function (x) { var on = x === b; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
      });
    });
  });

  /* videolar: görünür olunca sessiz oynat */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting && !reduce) { v.play().catch(function () {}); } else { v.pause(); } }); }, { threshold: .4 });
    document.querySelectorAll('video[data-auto]').forEach(function (v) { io.observe(v); });
  }
})();
