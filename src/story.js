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
    var DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    var now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate()), end = new Date(start.getTime() + 7 * 864e5);
    function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    fetch('https://api.cal.com/v2/slots?eventTypeSlug=randevu&username=muhammed-furkan-tosun-9pauv1&timeZone=Europe/Istanbul&start=' + ymd(start) + '&end=' + ymd(end), { headers: { 'cal-api-version': '2024-09-04' } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        var data = (j && j.data) || {}, free = {}, step = 45;
        Object.keys(data).forEach(function (d) {
          var arr = data[d].map(function (s) { var x = typeof s === 'string' ? s : s.start; return x.slice(11, 16); });
          free[d] = arr;
          for (var i = 1; i < arr.length; i++) { var a = arr[i - 1].split(':'), b = arr[i].split(':'), df = (b[0] * 60 + +b[1]) - (a[0] * 60 + +a[1]); if (df > 0 && df < step) step = df; }
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
            var isFree = (free[key] || []).indexOf(hh) >= 0, s = document.createElement('span');
            s.textContent = hh;
            if (past) { s.className = 'p'; } else { tot++; if (isFree) s.className = 'f'; else { s.className = 'd'; busy++; } }
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

  /* ana sayfa: dönen kelime */
  var rw = document.querySelector('.h-rot');
  if (rw && !reduce) {
    var words = rw.getAttribute('data-words').split('|'), wi = 0, span = rw.querySelector('span');
    setInterval(function () { span.classList.add('out'); setTimeout(function () { wi = (wi + 1) % words.length; span.textContent = words[wi]; span.classList.remove('out'); }, 380); }, 2300);
  }
})();
