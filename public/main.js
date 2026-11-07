(function () {
  var root = document.documentElement;
  var motionOK = window.matchMedia && matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window;
  if (motionOK) root.classList.add('motion');

  /* Sample week tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var weekSeen = false;
  function play(p) {
    document.querySelectorAll('.wk').forEach(function (w) { w.classList.remove('in'); });
    void p.offsetWidth;
    p.classList.add('in');
  }
  function pick(tab, focus, user) {
    var shown;
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      p.hidden = !on;
      if (on) shown = p;
    });
    if (focus) tab.focus();
    if (user && weekSeen && motionOK) play(shown);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t, false, true); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true, true); }
    });
  });
  if (tabs.length) pick(tabs[0]);
  if (motionOK) {
    var rvio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        rvio.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.sheet-rows,.prow,.strip,.close,.board-grid').forEach(function (el) { el.classList.add('rv'); rvio.observe(el); });
  }
  var sheet = document.querySelector('.sheet');
  if (sheet && motionOK) {
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      weekSeen = true;
      play(document.querySelector('.wk:not([hidden])'));
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(sheet);
  }

  /* Squad video: plays muted on a loop. If the visitor prefers reduced motion it stays still with controls. */
  var sv = document.querySelector('.band-video');
  if (sv && motionOK) {
    /* Controls stay on so the visitor can pause. It plays only while it is on screen. */
    var vio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { var pl = sv.play(); if (pl && pl.catch) pl.catch(function () {}); }
        else sv.pause();
      });
    }, { threshold: 0.35 });
    vio.observe(sv);
  }
  /* Wave field: the logo's three strokes, flowing. Gold on every seventh line. Still under reduced motion. */
  function waves(canvas, opts) {
    if (!canvas || !canvas.getContext) return;
    opts = opts || {};
    var still = !motionOK || !!opts.still;
    var ctx = canvas.getContext('2d'), w, h, dpr, t = 0, mx = .5, raf = 0, vis = true;
    var lines = opts.lines || 22, inkMode = !!opts.ink, host = opts.host;
    function size() {
      if (host) canvas.style.height = host.offsetHeight + 'px';
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) frame();
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      var base = h * (opts.base || .62), spread = h * (opts.spread || .34);
      for (var i = 0; i < lines; i++) {
        var p = i / (lines - 1), y0 = base + (p - .5) * spread * (1 + p * .9);
        var amp = (10 + p * 34) * (.7 + mx * .9) * (opts.amp || 1), f = .0022 + p * .0011, sp = t * (.45 + p * .4);
        ctx.beginPath();
        for (var x = -10; x <= w + 10; x += 14) {
          var y = y0 + Math.sin(x * f + sp + i * .35) * amp + Math.sin(x * f * 2.3 - sp * 1.3) * amp * .35;
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var a = .05 + p * .22;
        ctx.strokeStyle = inkMode ? 'rgba(12,15,16,' + (a + .2) + ')' : (i % 7 === 0 ? 'rgba(216,162,60,' + (a + .35) + ')' : 'rgba(238,234,223,' + a + ')');
        ctx.lineWidth = i % 7 === 0 ? 1.6 : 1;
        ctx.stroke();
      }
    }
    function loop() { if (!vis) { raf = 0; return; } t += .016; frame(); raf = still ? 0 : requestAnimationFrame(loop); }
    size(); window.addEventListener('resize', size);
    if (!still) window.addEventListener('pointermove', function (e) { mx += ((e.clientX / window.innerWidth) - mx) * .08; }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis && !raf && !still) loop(); }).observe(canvas);
    still ? frame() : loop();
  }
  waves(document.getElementById('waves'), { lines: 22, base: .78, spread: .3, host: document.querySelector('.hero .surface') });
  waves(document.getElementById('wavesCta'), { lines: 16, base: .6, spread: .5, amp: .8, ink: true, still: true });
  /* Instagram embeds: load Instagram's script only when a video is near the screen. */
  var igs = document.querySelectorAll('.ig-embed');
  if (igs.length) {
    var loadIg = function () {
      if (document.getElementById('ig-embed-js')) { if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process(); return; }
      var sc = document.createElement('script');
      sc.id = 'ig-embed-js'; sc.async = true; sc.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(sc);
    };
    if ('IntersectionObserver' in window) {
      var igio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { loadIg(); igio.unobserve(e.target); } });
      }, { rootMargin: '400px' });
      igs.forEach(function (el) { igio.observe(el); });
    } else { loadIg(); }
  }
  /* Menu closes on Escape */
  var menu = document.querySelector('.menu');
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });

  /* Assessment form: four steps, sent to /api/assessment, which notifies Chris. */
  var form = document.getElementById('assess');
  if (form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('.fstep'));
    var bars = form.querySelectorAll('.progress i');
    var n = form.querySelector('.step-n');
    var at = 0;
    var show = function (i, focus) {
      at = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      bars.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
      n.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      form.querySelector('.back').hidden = i === 0;
      form.querySelector('.next').hidden = i === steps.length - 1;
      form.querySelector('.send').hidden = i !== steps.length - 1;
      if (focus) { var f = steps[i].querySelector('input'); if (f) f.focus(); }
    };
    var clear = function (s) {
      s.querySelectorAll('.err').forEach(function (e) { e.remove(); });
      s.querySelectorAll('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); e.removeAttribute('aria-describedby'); });
    };
    var fail = function (after, id, msg, input) {
      var p = document.createElement('p');
      p.className = 'err'; p.id = id; p.textContent = msg; p.setAttribute('role', 'alert');
      after.insertAdjacentElement('afterend', p);
      if (input) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id); }
    };
    var valid = function (s) {
      clear(s);
      var ok = true, first = null;
      var radios = s.querySelectorAll('input[type=radio]');
      if (radios.length && !s.querySelector('input:checked')) {
        fail(radios[radios.length - 1].closest('.pick'), 'err-pick', 'Pick one to keep going.');
        ok = false; first = radios[0];
      }
      s.querySelectorAll('input[required]:not([type=radio])').forEach(function (i) {
        if (i.value.trim() && i.checkValidity()) return;
        var label = i.closest('.field').querySelector('label').textContent.toLowerCase();
        var msg = i.value.trim() ? 'That ' + label + ' doesn’t look right. Check it and try again.' : 'I need your ' + label + ' so I can reach you.';
        fail(i, 'err-' + i.name, msg, i);
        ok = false; first = first || i;
      });
      if (first) first.focus();
      return ok;
    };
    form.querySelector('.next').addEventListener('click', function () { if (valid(steps[at])) show(at + 1, true); });
    form.querySelector('.back').addEventListener('click', function () { clear(steps[at]); show(at - 1, true); });
    form.querySelectorAll('.pick input').forEach(function (r) {
      r.addEventListener('change', function () { clear(steps[at]); });
    });
    /* Choosing an option with a mouse or finger moves on to the next step after a short beat, so the choice is seen first.
       Keyboard users (arrow keys fire a click with no pointer) still choose, then press Next, so they can look through the options. */
    form.querySelectorAll('.pick input').forEach(function (r) {
      r.addEventListener('click', function (e) {
        if (e.detail === 0) return;
        var s = steps[at];
        if (at === steps.length - 1) return;
        if (s.querySelector('input:not([type=radio])')) return;
        clear(s);
        setTimeout(function () { if (steps[at] === s && valid(s)) show(at + 1, false); }, 280);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      for (var k = 0; k < steps.length; k++) {
        if (k !== at) show(k, false);
        if (!valid(steps[k])) return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v); });
      var btn = form.querySelector('.send');
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Sending…';
      var old = form.querySelector('.send-err'); if (old) old.remove();
      var finish = function (ok) {
        if (ok) {
          form.hidden = true;
          var done = document.getElementById('assess-done');
          done.hidden = false;
          done.focus({ preventScroll: true });
          done.scrollIntoView({ block: 'start' });
        } else {
          btn.disabled = false; btn.innerHTML = label;
          var p = document.createElement('p');
          p.className = 'err send-err'; p.setAttribute('role', 'alert');
          p.innerHTML = 'That didn’t send. Please email <a href="mailto:chris@methodendurance.com.au">chris@methodendurance.com.au</a> or call <a href="tel:+61409235822">0409 235 822</a>.';
          btn.closest('.fnav').insertAdjacentElement('afterend', p);
        }
      };
      fetch('/api/assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { finish(r.ok); })
        .catch(function () { finish(false); });
    });
    show(0, false);
  }
})();
