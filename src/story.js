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

  /* ana sayfa: dönen kelime */
  var rw = document.querySelector('.h-rot');
  if (rw && !reduce) {
    var words = rw.getAttribute('data-words').split('|'), wi = 0, span = rw.querySelector('span');
    setInterval(function () { span.classList.add('out'); setTimeout(function () { wi = (wi + 1) % words.length; span.textContent = words[wi]; span.classList.remove('out'); }, 380); }, 2300);
  }
})();
