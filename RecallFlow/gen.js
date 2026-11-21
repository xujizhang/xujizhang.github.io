/* Interactive generation analysis (data in media/gen/data.js, the same data as Fig. 5 of the paper).
   Pick one of 15 decisions in NoRepeat episodes and move through the generation steps (0 = source, 8 = action):
   each line is one of 30 sampled action chunks (gripper path) of long-history DP (left) and RecallFlow (right). */
(function () {
  'use strict';
  var G = window.GEN, root = document.getElementById('gen');
  if (!G || !root) return;
  root.hidden = false;
  var fallback = document.getElementById('gen-fallback');
  if (fallback) fallback.hidden = true;

  var bin = atob(G.paths), u8 = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  var P = new Int16Array(u8.buffer);                       // [decision][policy][step][sample][waypoint][x, y] in half pixels
  var NS = G.steps, N = G.n, WP = G.wp, PER = N * WP * 2, LAST = NS - 1;
  var RGB = { lh: '46,117,182', ours: '123,85,184' };
  var NAME = { lh: 'Long-history DP', ours: 'RecallFlow (ours)' };
  var cur = { m: 11, u: 0 };                               // episode 4, third decision: the example in the paper and the video
  var playing = null;

  var sel = root.querySelector('#gen-select');
  G.decisions.forEach(function (d, i) {
    var n = d.touched.filter(Boolean).length;
    var o = document.createElement('option');
    o.value = i;
    o.textContent = 'Episode ' + d.ep + ', decision ' + d.dec + ' (' + (n ? n + ' of 3 touched' : 'none touched') + ')';
    sel.appendChild(o);
  });
  sel.value = cur.m;

  var imgs = G.decisions.map(function (d, i) {
    var im = new Image();
    im.onload = function () { if (i === cur.m) draw(); };
    im.src = d.img;
    return im;
  });
  var panels = G.order.map(function (pol) {
    var box = root.querySelector('.gen-panel.' + pol);
    return { pol: pol, canvas: box.querySelector('canvas'), count: box.querySelector('.gen-count') };
  });
  var slider = root.querySelector('#gen-step'), stepLab = root.querySelector('#gen-steplab'), playBtn = root.querySelector('#gen-play');

  function at(m, p, k) { return ((m * 2 + p) * NS + k) * PER; }

  function check(ctx, x, y) {                              // gold disc with a check mark under an already touched container
    ctx.beginPath(); ctx.arc(x, y, 17, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgb(255,210,74)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgb(17,17,17)'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 8, y + 1); ctx.lineTo(x - 2, y + 7); ctx.lineTo(x + 9, y - 7);
    ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function draw() {
    var d = G.decisions[cur.m];
    var k = Math.min(Math.floor(cur.u), LAST), f = cur.u - k, k2 = Math.min(k + 1, LAST);
    panels.forEach(function (pn, p) {
      var c = pn.canvas, dpr = window.devicePixelRatio || 1;
      var W = Math.max(1, Math.round(c.clientWidth * dpr)), H = Math.round(W * G.h / G.w);
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      var ctx = c.getContext('2d'), s = W / G.w, im = imgs[cur.m];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#e9eaee'; ctx.fillRect(0, 0, W, H);
      if (im.complete && im.naturalWidth) ctx.drawImage(im, 0, 0, W, H);
      ctx.setTransform(s, 0, 0, s, 0, 0);
      d.cont.forEach(function (q, i) { if (d.touched[i]) check(ctx, q[0], q[1] + 80); });
      var a = at(cur.m, p, k), b = at(cur.m, p, k2), xs = [], ys = [];
      ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(' + RGB[pn.pol] + ',0.45)';
      for (var n = 0; n < N; n++) {
        ctx.beginPath();
        for (var w = 0; w < WP; w++) {
          var o = n * WP * 2 + w * 2;
          var x = (P[a + o] + (P[b + o] - P[a + o]) * f) / 2, y = (P[a + o + 1] + (P[b + o + 1] - P[a + o + 1]) * f) / 2;
          if (w) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          if (w === WP - 1) { xs.push(x); ys.push(y); }
        }
        ctx.stroke();
      }
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.fillStyle = 'rgba(' + RGB[pn.pol] + ',0.95)';
      for (n = 0; n < N; n++) { ctx.beginPath(); ctx.arc(xs[n], ys[n], 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); }
      pn.count.innerHTML = '<b>' + d.count[pn.pol][k] + '</b> / 30 samples head to an untouched container';
    });
    slider.value = cur.u;
    stepLab.textContent = 'Step ' + k + ' / 8' + (k === 0 ? ' · source' : k === LAST ? ' · action' : '');
    mark(cur.u);
  }

  /* ---------------------------------------------------------- average curve over the 15 decisions (Fig. 5b) with a marker */
  var CW = 520, CH = 300, L = 44, R = 64, T = 28, B = 46;
  function X(k) { return L + (CW - L - R) * k / LAST; }
  function Y(v) { return T + (CH - T - B) * (1 - v / 100); }
  var svg = root.querySelector('#gen-curve'), h = [];
  [0, 25, 50, 75, 100].forEach(function (v) {
    h.push('<line x1="' + L + '" x2="' + (CW - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="grid"/>');
    h.push('<text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" class="ytick">' + v + '</text>');
  });
  for (var k = 0; k <= LAST; k++) h.push('<text x="' + X(k) + '" y="' + (CH - B + 18) + '" class="xtick">' + k + '</text>');
  h.push('<text x="' + ((L + CW - R) / 2) + '" y="' + (CH - 6) + '" class="xlab">generation step (0 = source, 8 = action)</text>');
  G.order.forEach(function (pol) {
    var pts = G.curve[pol].map(function (v, k) { return X(k) + ',' + Y(v); }).join(' ');
    h.push('<polyline points="' + pts + '" class="ln ' + pol + '"/>');
    G.curve[pol].forEach(function (v, k) { h.push('<circle cx="' + X(k) + '" cy="' + Y(v) + '" r="3.2" class="pt ' + pol + '"/>'); });
  });
  h.push('<g id="gen-mark"><line class="mk" y1="' + T + '" y2="' + (CH - B) + '"/>' +
         '<circle class="mkpt lh" r="6"/><circle class="mkpt ours" r="6"/>' +
         '<text class="mkv lh"></text><text class="mkv ours"></text></g>');
  h.push('<g class="leg"><line x1="' + (L + 14) + '" x2="' + (L + 40) + '" y1="' + (Y(80)) + '" y2="' + (Y(80)) + '" class="ln ours"/>' +
         '<text x="' + (L + 48) + '" y="' + (Y(80) + 4) + '" class="lt ours">RecallFlow</text>' +
         '<line x1="' + (L + 14) + '" x2="' + (L + 40) + '" y1="' + (Y(68)) + '" y2="' + (Y(68)) + '" class="ln lh"/>' +
         '<text x="' + (L + 48) + '" y="' + (Y(68) + 4) + '" class="lt lh">Long-history DP</text></g>');
  svg.setAttribute('viewBox', '0 0 ' + CW + ' ' + CH);
  svg.innerHTML = h.join('');

  function val(pol, u) {
    var k = Math.min(Math.floor(u), LAST), f = u - k, c = G.curve[pol];
    return k >= LAST ? c[LAST] : c[k] + (c[k + 1] - c[k]) * f;
  }
  function mark(u) {
    var g = svg.querySelector('#gen-mark'), x = X(u);
    g.querySelector('.mk').setAttribute('x1', x); g.querySelector('.mk').setAttribute('x2', x);
    G.order.forEach(function (pol) {
      var v = val(pol, u), y = Y(v);
      var c = g.querySelector('.mkpt.' + pol); c.setAttribute('cx', x); c.setAttribute('cy', y);
      var t = g.querySelector('.mkv.' + pol);
      t.setAttribute('x', x + 9);
      t.setAttribute('y', pol === 'ours' ? y - 9 : y + 18);
      t.textContent = v.toFixed(1);
    });
  }

  /* ---------------------------------------------------------- few integration steps (Fig. 5c) */
  var few = root.querySelector('#gen-few'), fh = [];
  G.few.steps.forEach(function (s, i) {
    var v = G.few.ours[i];
    fh.push('<span class="lab us">' + s + (s === 1 ? ' step' : ' steps') + '</span><span class="track"><span class="fill us" style="width:' + v + '%"></span></span><span class="val us">' + v + '%</span>');
  });
  fh.push('<span class="lab">Long-history DP, 8 steps</span><span class="track"><span class="fill lh" style="width:' + G.few.lh8 + '%"></span></span><span class="val">' + G.few.lh8 + '%</span>');
  few.innerHTML = fh.join('');

  /* ---------------------------------------------------------- controls */
  function stop() { if (playing) { cancelAnimationFrame(playing); playing = null; } playBtn.classList.remove('on'); playBtn.setAttribute('aria-label', 'Play'); }
  function play() {
    if (cur.u >= LAST) cur.u = 0;
    var t0 = null, u0 = cur.u, dur = 4600 * (LAST - u0) / LAST;
    playBtn.classList.add('on'); playBtn.setAttribute('aria-label', 'Pause');
    function tick(t) {
      if (t0 === null) t0 = t;
      cur.u = Math.min(LAST, u0 + (LAST - u0) * (t - t0) / Math.max(dur, 1));
      draw();
      if (cur.u < LAST) playing = requestAnimationFrame(tick); else stop();
    }
    playing = requestAnimationFrame(tick);
  }
  playBtn.addEventListener('click', function () { if (playing) stop(); else play(); });
  slider.addEventListener('input', function () { stop(); cur.u = parseFloat(slider.value); draw(); });
  sel.addEventListener('change', function () { cur.m = +sel.value; draw(); });
  Array.prototype.forEach.call(root.querySelectorAll('.gen-nav'), function (b) {
    b.addEventListener('click', function () {
      cur.m = (cur.m + (+b.getAttribute('data-d')) + G.decisions.length) % G.decisions.length;
      sel.value = cur.m; draw();
    });
  });
  window.addEventListener('resize', draw);
  draw();
  if ('IntersectionObserver' in window) {                  // play once the first time the widget comes into view
    var seen = false, io = new IntersectionObserver(function (es) {
      if (!seen && es[0].isIntersecting) { seen = true; play(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(root.querySelector('.gen-panels'));
  }
})();
