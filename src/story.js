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

  /* ana sayfa: dönen kelime */
  var rw = document.querySelector('.h-rot');
  if (rw && !reduce) {
    var words = rw.getAttribute('data-words').split('|'), wi = 0, span = rw.querySelector('span');
    setInterval(function () { span.classList.add('out'); setTimeout(function () { wi = (wi + 1) % words.length; span.textContent = words[wi]; span.classList.remove('out'); }, 380); }, 2300);
  }
})();
