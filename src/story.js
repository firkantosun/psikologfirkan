/* Psikolog Firkan · kaydırdıkça akan anlatım */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LV = function (d, s) { return [12, 28, 58, d.level, d.level - 6, d.level, d.low][s]; };
  document.querySelectorAll('.sx').forEach(function (sx) {
    var d; try { d = JSON.parse(sx.querySelector('script[type="application/json"]').textContent); } catch (e) { return; }
    var stage = sx.querySelector('.sx-stage'), steps = sx.querySelectorAll('.sx-step');
    var bub = stage.querySelector('.sx-bub p'), fill = stage.querySelector('.sx-meter i'), val = stage.querySelector('.sx-meter b');
    var cap = stage.querySelector('.sx-cap'), dots = stage.querySelectorAll('.sx-dots span');
    var cur = -1, shown = 0;
    function setStep(s) {
      if (s === cur) return; cur = s; stage.setAttribute('data-s', s);
      bub.textContent = s >= 6 ? d.alt : d.thought;
      cap.textContent = steps[s].querySelector('h3').textContent;
      Array.prototype.forEach.call(dots, function (x, i) { x.className = i <= s ? 'on' : ''; });
      Array.prototype.forEach.call(steps, function (x, i) { x.classList.toggle('on', i === s); });
    }
    function tick() {
      var vh = window.innerHeight, mid = vh * (window.innerWidth < 861 ? .78 : .55), s = 0, f = 0;
      for (var i = 0; i < steps.length; i++) { var r = steps[i].getBoundingClientRect(); if (r.top < mid) { s = i; f = Math.min(1, (mid - r.top) / Math.max(1, r.height)); } }
      setStep(s);
      var a = LV(d, s), b = LV(d, Math.min(6, s + 1)), lv = Math.round(a + (b - a) * Math.max(0, f - .6) / .4 * (s < 6 ? 1 : 0));
      if (lv !== shown) { shown = lv; fill.style.width = lv + '%'; fill.style.background = 'hsl(' + Math.round(120 - lv * 1.2) + ',60%,55%)'; val.textContent = lv; stage.style.setProperty('--dark', (lv / 100).toFixed(2)); }
      var tot = sx.getBoundingClientRect(); stage.style.setProperty('--p', Math.min(1, Math.max(0, -tot.top / Math.max(1, tot.height - vh))).toFixed(3));
    }
    var raf = 0; window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
    window.addEventListener('resize', tick); tick();
  });

  /* yolculuk haritası: fotoğraflar arasında kamera gezintisi */
  document.querySelectorAll('.jr').forEach(function (jr) {
    var D; try { D = JSON.parse(jr.querySelector('script[type="application/json"]').textContent); } catch (e) { return; }
    var world = jr.querySelector('.jr-world'), svg = jr.querySelector('.jr-links'), NS = 'http://www.w3.org/2000/svg';
    var N = D.n.length, H0 = 360, nodes = [], bonds = [];
    var pos = D.n.map(function (n, i) { return { x: 320 + i * 520 + (i % 2 ? 70 : -50), y: 700 + Math.sin(i * 1.1) * 330 + (i % 3 - 1) * 80 }; });
    var WW = pos[N - 1].x + 800, WH = 1500;
    world.style.width = WW + 'px'; world.style.height = WH + 'px';
    svg.setAttribute('width', WW); svg.setAttribute('height', WH); svg.setAttribute('viewBox', '0 0 ' + WW + ' ' + WH);
    function curve(a, b) { var mx = (a.x + b.x) / 2; return 'M' + a.x + ' ' + a.y + ' C' + mx + ' ' + a.y + ' ' + mx + ' ' + b.y + ' ' + b.x + ' ' + b.y; }
    for (var i = 0; i + 2 < N; i++) { var f = document.createElementNS(NS, 'path'); f.setAttribute('class', 'faint'); f.setAttribute('d', curve(pos[i], pos[i + 2])); svg.appendChild(f); }
    for (i = 0; i < N - 1; i++) { var pth = document.createElementNS(NS, 'path'); pth.setAttribute('class', 'bond'); pth.setAttribute('d', curve(pos[i], pos[i + 1])); svg.appendChild(pth); var L = pth.getTotalLength(); pth.style.strokeDasharray = L; pth.style.strokeDashoffset = L; bonds.push([pth, L]); }
    D.n.forEach(function (n, i) {
      var h = H0, w = H0 * n.r; if (w > 560) { w = 560; h = w / n.r; }
      var dot = document.createElementNS(NS, 'circle'); dot.setAttribute('class', 'dot'); dot.setAttribute('cx', pos[i].x); dot.setAttribute('cy', pos[i].y); dot.setAttribute('r', 8); svg.appendChild(dot);
      var b = document.createElement('figure'); b.className = 'jr-node';
      b.style.left = (pos[i].x - w / 2) + 'px'; b.style.top = (pos[i].y - h / 2) + 'px'; b.style.width = w + 'px'; b.style.height = h + 'px';
      var img = document.createElement('img'); img.src = n.src; img.alt = n.cap; img.loading = i < 3 ? 'eager' : 'lazy'; b.appendChild(img);
      world.appendChild(b); nodes.push({ el: b, w: w, h: h });
    });
    var stage = jr.querySelector('.jr-stage'), cap = jr.querySelector('.jr-cap'), chips = jr.querySelectorAll('.jr-chips span');
    var cNum = jr.querySelector('.jr-num'), cT = jr.querySelector('.jr-t'), cS = jr.querySelector('.jr-s'), cP = jr.querySelector('.jr-p'), cL = jr.querySelector('.jr-loc'), cPh = jr.querySelector('.jr-ph');
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function fit(k, vw, vh) { var mob = vw < 861, availH = vh * (mob ? .42 : .56), availW = vw * (mob ? .86 : .5); return Math.min(availH / nodes[k].h, availW / nodes[k].w); }
    var lastK = -1, lastC = -1;
    function tick() {
      var vw = window.innerWidth, vh = window.innerHeight, r = jr.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - vh)), q = clamp((p - .03) / .94), fl = q * (N - 1), k = Math.min(N - 2, Math.floor(fl));
      var t = ease(clamp((fl - k) * 1.25 - .125));
      var cx = pos[k].x + (pos[k + 1].x - pos[k].x) * t, cy = pos[k].y + (pos[k + 1].y - pos[k].y) * t;
      var s = fit(k, vw, vh) + (fit(k + 1, vw, vh) - fit(k, vw, vh)) * t; s *= 1 - .45 * Math.sin(Math.PI * t);
      var mob = vw < 861, tx = (mob ? vw / 2 : vw * .66), ty = mob ? vh * .40 : vh * .52;
      world.style.transform = 'translate(' + (tx - cx * s).toFixed(1) + 'px,' + (ty - cy * s).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      bonds.forEach(function (b, i) { b[0].style.strokeDashoffset = (b[1] * (1 - clamp(fl - i))).toFixed(1); });
      stage.classList.toggle('started', p > .01);
      var cur = Math.round(fl);
      if (cur !== lastK) {
        lastK = cur; nodes.forEach(function (n, i) { n.el.classList.toggle('on', i === cur); n.el.classList.toggle('seen', i < cur); });
        cPh.textContent = D.n[cur].cap;
        var c = D.n[cur].c;
        if (c !== lastC) {
          lastC = c; var C = D.ch[c];
          cNum.textContent = String(c + 1).padStart(2, '0') + ' / ' + String(D.ch.length).padStart(2, '0');
          cT.textContent = C.t; cS.textContent = C.s; cP.textContent = C.p; cL.textContent = '📍 ' + C.l;
          Array.prototype.forEach.call(chips, function (x, i) { x.className = i < c ? 'seen' : i === c ? 'on' : ''; });
          cap.classList.remove('pop'); void cap.offsetWidth; cap.classList.add('pop');
        }
      }
    }
    var raf = 0; window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
    window.addEventListener('resize', tick); tick();
  });

  /* süreç yolu */
  document.querySelectorAll('.pr').forEach(function (pr) {
    var stage = pr.querySelector('.pr-stage'), steps = pr.querySelectorAll('.pr-step'), done = pr.querySelector('.pr-done'), L = done.getTotalLength(), cur = -1;
    var e = pr.querySelector('.pr-e'), tt = pr.querySelector('.pr-t'), w = pr.querySelector('.pr-w'), big = pr.querySelector('.pr-big');
    done.style.strokeDasharray = L; done.style.strokeDashoffset = L;
    var road = pr.querySelector('.pr-road'), ms = pr.querySelectorAll('.pr-m');
    function place() {
      var sr = stage.getBoundingClientRect(), rr = road.getBoundingClientRect();
      Array.prototype.forEach.call(ms, function (m, i) { var pt = done.getPointAtLength(L * i / (ms.length - 1)); m.style.left = (rr.left - sr.left + pt.x / 400 * rr.width) + 'px'; m.style.top = (rr.top - sr.top + pt.y / 600 * rr.height) + 'px'; });
    }
    place(); window.addEventListener('resize', place);
    function tick() {
      var vh = window.innerHeight, mid = vh * (window.innerWidth < 861 ? .78 : .55), s = 0, f = 0;
      for (var i = 0; i < steps.length; i++) { var r = steps[i].getBoundingClientRect(); if (r.top < mid) { s = i; f = Math.min(1, (mid - r.top) / Math.max(1, r.height)); } }
      var prog = Math.min(1, (s + Math.min(1, f)) / steps.length);
      done.style.strokeDashoffset = (L * (1 - prog)).toFixed(1);
      if (s !== cur) {
        cur = s; stage.setAttribute('data-s', s);
        Array.prototype.forEach.call(steps, function (x, i) { x.classList.toggle('on', i === s); });
        pr.querySelectorAll('.pr-m').forEach(function (m, i) { m.classList.toggle('done', i < s); m.classList.toggle('now', i === s); });
        e.textContent = steps[s].getAttribute('data-e'); tt.textContent = steps[s].querySelector('h3').textContent; w.textContent = steps[s].getAttribute('data-w');
        big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop');
      }
    }
    var raf = 0; window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
    window.addEventListener('resize', tick); tick();
  });

  /* fotoğraf hikâyesi */
  document.querySelectorAll('.ps').forEach(function (ps) {
    var imgs = ps.querySelectorAll('.ps-stage img'), steps = ps.querySelectorAll('.ps-step'), num = ps.querySelector('.ps-count b'), bar = ps.querySelector('.ps-bar i'), cur = -1;
    function tick() {
      var vh = window.innerHeight, mid = vh * (window.innerWidth < 861 ? .78 : .55), s = 0;
      for (var i = 0; i < steps.length; i++) if (steps[i].getBoundingClientRect().top < mid) s = i;
      if (s !== cur) { cur = s; Array.prototype.forEach.call(imgs, function (im, i) { im.classList.toggle('on', i === s); }); Array.prototype.forEach.call(steps, function (x, i) { x.classList.toggle('on', i === s); }); num.textContent = s + 1; }
      var r = ps.getBoundingClientRect(); bar.style.width = (Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh))) * 100) + '%';
    }
    var raf = 0; window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); }); }, { passive: true });
    window.addEventListener('resize', tick); tick();
  });

  /* randevu: canlı doluluk (Cal.com) */
  var occ = document.getElementById('occ');
  if (occ && window.fetch) {
    var nsI = 0;
    function pickSlot(day, slot, el) {
      document.querySelectorAll('.occ-day .sel').forEach(function (x) { x.classList.remove('sel'); }); el.classList.add('sel');
      var box = document.getElementById('calInline');
      if (box && window.Cal) {
        box.innerHTML = ''; var ns = 'r' + (++nsI);
        Cal('init', ns, { origin: 'https://app.cal.com' });
        Cal.ns[ns]('inline', { elementOrSelector: '#calInline', config: { layout: 'month_view', theme: 'light' }, calLink: 'muhammed-furkan-tosun-9pauv1/randevu?date=' + day + '&slot=' + encodeURIComponent(slot) });
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else location.href = 'https://cal.com/muhammed-furkan-tosun-9pauv1/randevu?date=' + day + '&slot=' + encodeURIComponent(slot);
    }
    var DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    var now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate()), end = new Date(start.getTime() + 7 * 864e5);
    function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    fetch('https://api.cal.com/v2/slots?eventTypeSlug=randevu&username=muhammed-furkan-tosun-9pauv1&timeZone=Europe/Istanbul&start=' + ymd(start) + '&end=' + ymd(end), { headers: { 'cal-api-version': '2024-09-04' } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        var data = (j && j.data) || {}, free = {}, iso = {}, step = 60;
        Object.keys(data).forEach(function (d) {
          free[d] = []; iso[d] = {};
          data[d].forEach(function (s) { var x = typeof s === 'string' ? s : s.start, hm = x.slice(11, 16); free[d].push(hm); iso[d][hm] = x; });
        });
        var grid = document.getElementById('occGrid'), tot = 0, busy = 0;
        for (var k = 0; k < 7; k++) {
          var day = new Date(start.getTime() + k * 864e5), wd = day.getDay();
          if (wd === 6) continue;
          var o = wd === 0 ? [600, 960] : [1020, 1260], key = ymd(day), col = document.createElement('div'); col.className = 'occ-day';
          var h = document.createElement('b'); h.textContent = (k === 0 ? 'Bugün' : DAYS[wd]) + ' ' + day.getDate(); col.appendChild(h);
          for (var m = o[0]; m + 45 <= o[1]; m += step) {
            var hh = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
            var past = k === 0 && (now.getHours() * 60 + now.getMinutes()) > m;
            var isFree = (free[key] || []).indexOf(hh) >= 0, s;
            if (!past && isFree) { s = document.createElement('a'); s.href = '#calInline'; s.title = hh + ' için randevu al'; (function (k2, sl) { s.addEventListener('click', function (e) { e.preventDefault(); pickSlot(k2, sl, this); }); })(key, new Date(iso[key][hh]).toISOString()); }
            else s = document.createElement('span');
            s.textContent = hh;
            if (past) { s.className = 'p'; } else { tot++; if (isFree) s.className = 'f'; else { s.className = 'd'; s.title = 'Dolu'; busy++; } }
            col.appendChild(s);
          }
          grid.appendChild(col);
        }
        if (!tot) return;
        var left = tot - busy;
        document.getElementById('occSum').textContent = left <= 0 ? 'Bu hafta boş saat kalmadı; gelecek haftaya bakabilirsin.' : 'Bu hafta ' + tot + ' saatin ' + busy + ' tanesi dolu, ' + left + ' boş saat kaldı.';
        occ.hidden = false;
      }).catch(function () {});
  }

  /* ana sayfa: bugün nasılsın? */
  var bn = document.getElementById('bnBox');
  if (bn) {
    var MOODS = [['☀️', 'İyiyim', 'Bunu duymak güzel. Yine de aklını kurcalayan bir şey varsa birlikte bakabiliriz.'], ['⛅', 'İdare eder', 'Bazı günler böyle geçer; bunu fark etmen bile önemli.'], ['🌧️', 'Zorlanıyorum', 'Zorlandığını söylemek kolay değil. Bunu paylaştığın için teşekkür ederim.'], ['⛈️', 'Çok kötüyüm', 'Şu an çok ağır bir yükün olabilir. Yalnız taşımak zorunda değilsin.']];
    var BREATH = { k: 'breath', t: '1 dakikalık nefes', d: 'Dairenin büyümesiyle burnundan 4 saniye nefes al, küçülmesiyle ağzından 6 saniye ver. Uzun nefes vermek bedenin alarmını yavaşlatır.' };
    var TOP = [
      ['🛡️', 'Yaşadığım zor bir olay', 'travma-sonrasi-stres', { k: 'ground', t: '5-4-3-2-1 topraklama', d: 'Etrafında gördüğün 5 şeyi, dokunabildiğin 4 şeyi, duyduğun 3 sesi, kokladığın 2 şeyi ve tadabildiğin 1 şeyi say. Zihni "şimdi ve burada"ya geri getirir.' }],
      ['💞', 'İlişkilerim', 'iliski-sorunlari', { k: 'text', t: '“Ben dili” ile bir cümle', d: '“Sen hep…” yerine “… olduğunda ben … hissediyorum, … ihtiyacım var” diye bir cümle kur. Suçlamadan ihtiyacını anlatmak konuşmayı yumuşatır.' }],
      ['🌫️', 'Sürekli endişe', 'kaygi-bozukluklari', BREATH],
      ['💓', 'Ani korku, panik', 'panik-atak', BREATH],
      ['🌧️', 'Mutsuzluk, isteksizlik', 'depresyon', { k: 'text', t: 'Küçük bir adım', d: 'Bugün 5 dakikalık, küçük ve yapılabilir bir şey seç: pencereyi açmak, kısa bir yürüyüş, birine mesaj atmak. Hareket çoğu zaman motivasyondan önce gelir.' }],
      ['🔋', 'Stres, tükenmişlik', 'stres-ve-tukenmislik', BREATH],
      ['⭐', 'Kendimi yetersiz hissetmek', 'ozguven-sorunlari', { k: 'text', t: 'Arkadaş gözüyle bak', d: 'Kendine söylediğin en sert cümleyi düşün. Aynı şeyi çok sevdiğin bir arkadaşın söylese ona ne derdin? Şimdi o cümleyi kendine söyle.' }],
      ['🌙', 'Uyku', 'uyku-sorunlari', { k: 'text', t: 'Endişeleri kâğıda bırak', d: 'Yatmadan önce aklındakileri bir kâğıda yaz ve "yarın 18:00\'de bakacağım" diye not düş. Zihin unutmayacağını bilince bırakması kolaylaşır.' }],
      ['🍂', 'Bir kayıp, yas', 'yas-ve-kayip', { k: 'text', t: 'Bir anı yaz', d: 'Kaybettiğin kişiyle ilgili sevdiğin bir anıyı birkaç cümleyle yaz. Yas, sevginin devam eden hâlidir; ona yer açmak iyi gelebilir.' }],
      ['🔥', 'Öfke', 'ofke-kontrolu', BREATH]
    ];
    var mood = null;
    function mk2(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function step1() {
      bn.innerHTML = ''; var w = mk2('div', 'bn-step bn-pop'); w.appendChild(mk2('p', 'bn-q', 'Bugün kendini nasıl hissediyorsun?'));
      var g = mk2('div', 'bn-moods'); MOODS.forEach(function (m) { var b = mk2('button', 'bn-mood'); b.type = 'button'; b.appendChild(mk2('span', null, m[0])); b.appendChild(mk2('b', null, m[1])); b.addEventListener('click', function () { mood = m; step2(); }); g.appendChild(b); });
      w.appendChild(g); bn.appendChild(w);
    }
    function step2() {
      bn.innerHTML = ''; var w = mk2('div', 'bn-step bn-pop'); w.appendChild(mk2('p', 'bn-echo', mood[0] + ' ' + mood[2])); w.appendChild(mk2('p', 'bn-q', 'Şu sıralar en çok ne yoruyor?'));
      var g = mk2('div', 'bn-topics'); TOP.forEach(function (tp) { var b = mk2('button', 'bn-topic'); b.type = 'button'; b.appendChild(mk2('span', null, tp[0])); b.appendChild(mk2('b', null, tp[1])); b.addEventListener('click', function () { result(tp); }); g.appendChild(b); });
      var back = mk2('button', 'bn-back', '← Geri'); back.type = 'button'; back.addEventListener('click', step1);
      w.appendChild(g); w.appendChild(back); bn.appendChild(w);
    }
    function result(tp) {
      bn.innerHTML = ''; var w = mk2('div', 'bn-step bn-pop bn-res'), ex = tp[3];
      var l = mk2('div', 'bn-ex'); l.appendChild(mk2('small', null, 'Şimdi 1 dakika')); l.appendChild(mk2('h3', null, ex.t));
      if (ex.k === 'breath') { var c = mk2('div', 'bn-breath'); var lab = mk2('span', null, 'Nefes al'); c.appendChild(lab); l.appendChild(c); var on = true; var iv = setInterval(function () { if (!document.body.contains(c)) { clearInterval(iv); return; } on = !on; lab.textContent = on ? 'Nefes al' : 'Nefes ver'; }, 5000); }
      if (ex.k === 'ground') { var gl = mk2('div', 'bn-ground'); [['5', 'gör'], ['4', 'dokun'], ['3', 'duy'], ['2', 'kokla'], ['1', 'tat']].forEach(function (x, i) { var s = mk2('span'); s.appendChild(mk2('b', null, x[0])); s.appendChild(document.createTextNode(x[1])); s.style.animationDelay = (i * .25) + 's'; gl.appendChild(s); }); l.appendChild(gl); }
      l.appendChild(mk2('p', null, ex.d));
      var r = mk2('div', 'bn-next'); r.appendChild(mk2('p', 'bn-echo', tp[0] + ' ' + tp[1] + (mood[1] === 'Çok kötüyüm' || mood[1] === 'Zorlanıyorum' ? ': Bunu bir süredir yaşıyorsan, bir görüşmede birlikte bakmak iyi gelebilir.' : ': Bu konuda nasıl çalıştığımızı merak edersen kısa bir göz atabilirsin.')));
      var a1 = mk2('a', 'btn primary dark', 'Bu konuda nasıl çalışıyoruz? →'); a1.href = '/calisma-alanlari/' + tp[2] + '/'; r.appendChild(a1);
      var a2 = mk2('a', 'btn ghost-dark', 'Randevu al'); a2.href = '/randevu/'; r.appendChild(a2);
      var again = mk2('button', 'bn-back', 'Baştan başla'); again.type = 'button'; again.addEventListener('click', step1); r.appendChild(again);
      w.appendChild(l); w.appendChild(r); bn.appendChild(w);
    }
    step1();
  }

  /* çalışma alanı: 1 dakikalık egzersiz */
  document.querySelectorAll('.ex1-box').forEach(function (box) {
    var k = box.getAttribute('data-k'), stage = box.querySelector('.ex1-stage'), start = box.querySelector('.ex1-start'), msg = box.querySelector('.ex1-msg');
    function mk(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
    function done(txt) { msg.textContent = txt; start.textContent = 'Tekrar dene'; start.hidden = false; box.classList.add('fin'); }
    function run() {
      start.hidden = true; box.classList.remove('fin'); msg.textContent = ''; stage.innerHTML = '';
      if (k === 'breath') {
        var c = mk('div', 'ex1-breath'), lab = mk('b', null, 'Nefes al'), cnt = mk('small', null, ''); c.appendChild(lab); c.appendChild(cnt); stage.appendChild(c);
        var n = 0, cyc = 6; c.classList.add('in');
        (function loop() { if (n >= cyc) { c.className = 'ex1-breath'; lab.textContent = '🌿'; cnt.textContent = ''; done('Bir dakika boyunca nefesini yavaşlattın. Bedenin alarmının biraz azaldığını fark ettin mi?'); return; }
          lab.textContent = 'Nefes al'; cnt.textContent = (n + 1) + ' / ' + cyc; c.className = 'ex1-breath in';
          setTimeout(function () { lab.textContent = 'Nefes ver'; c.className = 'ex1-breath out'; setTimeout(function () { n++; loop(); }, 6000); }, 4000); })();
      }
      if (k === 'ground') {
        var S = [['5', 'şey gör', '👀'], ['4', 'şeye dokun', '✋'], ['3', 'ses duy', '👂'], ['2', 'koku fark et', '👃'], ['1', 'tat fark et', '👅']], i = 0;
        var card = mk('div', 'ex1-card'); stage.appendChild(card);
        function show() { card.innerHTML = ''; if (i >= S.length) { card.appendChild(mk('span', 'ex1-big', '🌱')); done('Zihnin şimdiye, bu odaya döndü. Zor anılar geldiğinde bu egzersizi her yerde yapabilirsin.'); return; }
          card.appendChild(mk('span', 'ex1-big', S[i][2])); var h = mk('p', 'ex1-q'); h.appendChild(mk('b', null, S[i][0])); h.appendChild(document.createTextNode(' ' + S[i][1])); card.appendChild(h);
          var dots = mk('div', 'ex1-dots'); for (var j = 0; j < +S[i][0]; j++) { var d = mk('button', 'ex1-dot'); d.type = 'button'; d.setAttribute('aria-label', 'işaretle'); d.addEventListener('click', function () { this.classList.add('on'); if (dots.querySelectorAll('.on').length === dots.children.length) { i++; setTimeout(show, 400); } }); dots.appendChild(d); } card.appendChild(dots);
          card.appendChild(mk('small', null, 'Her birini bulunca bir noktaya dokun')); card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
        show();
      }
      if (k === 'cards') {
        var C = JSON.parse(box.getAttribute('data-c')), q = 0; var cd = mk('div', 'ex1-card'); stage.appendChild(cd);
        function nx() { cd.innerHTML = ''; if (q >= C.length) { cd.appendChild(mk('span', 'ex1-big', '🌱')); done(box.getAttribute('data-end')); return; }
          cd.appendChild(mk('small', null, (q + 1) + ' / ' + C.length)); cd.appendChild(mk('p', 'ex1-hot', '“' + C[q][0] + '”'));
          var flip = mk('button', 'btn primary dark', 'Daha dengeli hâlini gör'); flip.type = 'button';
          flip.addEventListener('click', function () { flip.remove(); cd.appendChild(mk('p', 'ex1-cool', '“' + C[q][1] + '”')); var go = mk('button', 'btn ghost-dark', q < C.length - 1 ? 'Sonraki →' : 'Bitir'); go.type = 'button'; go.addEventListener('click', function () { q++; nx(); }); cd.appendChild(go); });
          cd.appendChild(flip); cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); }
        nx();
      }
    }
    start.addEventListener('click', run);
  });

  /* ana sayfa: dönen kelime */
  var rw = document.querySelector('.h-rot');
  if (rw && !reduce) {
    var words = rw.getAttribute('data-words').split('|'), wi = 0, span = rw.querySelector('span');
    setInterval(function () { span.classList.add('out'); setTimeout(function () { wi = (wi + 1) % words.length; span.textContent = words[wi]; span.classList.remove('out'); }, 380); }, 2300);
  }
})();
