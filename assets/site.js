/* Shared behaviour for every page: top navigation, research list, lazy videos, tabs, BibTeX copy.
   Pages load works.js first, then this file, at the end of <body>. Works from a local folder (file://) and on GitHub Pages. */
(function () {
  'use strict';
  var S = window.SITE || {};
  var PAPERS = S.papers || [], COLLABS = S.collabs || [];
  var me = document.currentScript;
  var ROOT = me.src.replace(/assets\/site\.js(\?.*)?$/, '');   // site root, from where this script was loaded
  var LOCAL = location.protocol === 'file:';
  var current = document.body.getAttribute('data-work') || '';

  function url(p) {                       // p: absolute URL, or a path relative to the site root
    if (/^[a-z]+:/i.test(p) || p.charAt(0) === '#') return p;
    var u = ROOT + p;
    if (LOCAL && /\/$/.test(u)) u += 'index.html';
    return u;
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var HOUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>';
  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  /* ---------------------------------------------------------- top navigation */
  var slot = document.getElementById('site-nav');
  if (slot) {
    var nav = el('nav', { 'class': 'topnav', 'aria-label': 'Site' });
    var inner = el('div', { 'class': 'topnav-inner' });
    if (S.home) inner.appendChild(el('a', { 'class': 'nav-home', href: url(S.home), title: 'Homepage', 'aria-label': 'Homepage' }, HOUSE));
    var more = el('div', { 'class': 'nav-more' });
    var btn = el('button', { type: 'button', 'aria-expanded': 'false', 'aria-haspopup': 'true' }, 'More Research ' + CHEVRON);
    var menu = el('div', { 'class': 'nav-menu', role: 'menu' });
    PAPERS.concat(COLLABS).forEach(function (w) {
      if (w.page && w.id !== current) menu.appendChild(el('a', { role: 'menuitem', href: url(w.page) }, esc(w.short || w.title)));
    });
    menu.appendChild(el('a', { role: 'menuitem', 'class': 'all', href: url('research/') }, 'All publications &rarr;'));
    more.appendChild(btn); more.appendChild(menu); inner.appendChild(more);
    nav.appendChild(inner); slot.replaceWith(nav);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = more.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function () { more.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { more.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------------------------------------------------------- research list */
  function authorList(w) {
    return (w.authors || []).map(function (a) { return a.replace(/[*†]+$/, '') === S.me ? '<span class="me">' + esc(a) + '</span>' : esc(a); }).join(', ');
  }
  function venueHTML(w) {                                  // Full Name (ABBR), volume — the abbreviation in bold so the venue is spotted at a glance
    var s = w.venue ? '<i>' + esc(w.venue) + '</i>' : '';
    if (w.venueShort) s += s ? ' (<b class="vs">' + esc(w.venueShort) + '</b>)' : '<b class="vs">' + esc(w.venueShort) + '</b>';
    if (s && w.volume) s += ', ' + esc(w.volume);
    return s;
  }
  function linkRow(w) {                                    // arXiv / Project Page / Code, only the ones that exist
    var wl = el('span', { 'class': 'wl' });
    if (w.arxiv) wl.appendChild(el('a', { href: w.arxiv }, 'arXiv'));
    if (w.page) wl.appendChild(el('a', { href: url(w.page) }, 'Project Page'));
    if (w.code) wl.appendChild(el('a', { href: w.code }, 'Code'));
    return wl.childNodes.length ? wl : null;
  }
  var list = document.getElementById('works');
  if (list) {
    var year = null;
    PAPERS.forEach(function (w) {
      if (w.year !== year) { year = w.year; list.appendChild(el('div', { 'class': 'year' }, esc(year))); }
      var item = el('div', { 'class': 'work' + (w.thumb ? '' : ' nothumb') });
      var main = w.page ? url(w.page) : (w.arxiv || '');
      if (w.thumb) {
        var th = el(main ? 'a' : 'div', main ? { 'class': 'thumb', href: main, tabindex: '-1', 'aria-hidden': 'true' } : { 'class': 'thumb' });
        th.appendChild(el('img', { src: url(w.thumb), alt: '' }));
        item.appendChild(th);
      }
      var body = el('div');
      body.appendChild(main ? el('a', { 'class': 'wt', href: main }, esc(w.title)) : el('div', { 'class': 'wt' }, esc(w.title)));
      if (w.authors && w.authors.length) body.appendChild(el('div', { 'class': 'wa' }, authorList(w)));
      var v = venueHTML(w);
      if (v) body.appendChild(el('div', { 'class': 'wv' }, v + (w.year ? ', ' + esc(w.year) : '')));
      var row = linkRow(w);
      if (row) { var box = el('div', { 'class': 'wl-box' }); box.appendChild(row); body.appendChild(box); }
      item.appendChild(body);
      list.appendChild(item);
    });
  }
  var cites = document.getElementById('collabs');
  if (cites) {
    if (!COLLABS.length) {
      var sec = document.getElementById('collabs-section');
      if (sec) sec.hidden = true;
    }
    COLLABS.forEach(function (w) {                        // citation style: Authors. Title. Venue, Year. [links]
      var li = el('li');
      var parts = [];
      if (w.authors && w.authors.length) parts.push(authorList(w) + '.');
      var tl = w.page ? url(w.page) : (w.arxiv || '');      // the title links to the project page or arXiv when there is one
      parts.push(tl ? '<a class="ct" href="' + esc(tl) + '">' + esc(w.title) + '</a>.' : '<span class="ct">' + esc(w.title) + '.</span>');
      var vv = venueHTML(w);
      parts.push((vv ? vv + ', ' : '') + esc(w.year) + '.');
      li.innerHTML = parts.join(' ');
      var row = linkRow(w);
      if (row) li.appendChild(row);
      cites.appendChild(li);
    });
  }

  /* ---------------------------------------------------------- folder links when browsing a local copy */
  if (LOCAL) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
      var h = a.getAttribute('href');
      if (!/^[a-z]+:|^#|^\//i.test(h) && /\/(#.*)?$/.test(h)) a.setAttribute('href', h.replace(/\/(#.*)?$/, '/index.html$1'));
    });
  }

  /* ---------------------------------------------------------- videos: load when near the screen, play only while visible */
  var vids = document.querySelectorAll('video[data-src], video[data-auto]');
  function start(v) {
    if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src;
    if (v.hasAttribute('data-auto')) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) start(e.target);
        else if (e.target.hasAttribute('data-auto') && !e.target.paused) e.target.pause();
      });
    }, { rootMargin: '250px 0px' });
    Array.prototype.forEach.call(vids, function (v) { io.observe(v); });
  } else {
    Array.prototype.forEach.call(vids, start);
  }

  /* ---------------------------------------------------------- tabs */
  Array.prototype.forEach.call(document.querySelectorAll('[role="tablist"]'), function (bar) {
    var tabs = bar.querySelectorAll('[role="tab"]');
    function select(t) {
      Array.prototype.forEach.call(tabs, function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on ? 'true' : 'false');
        x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      var v = document.getElementById(t.getAttribute('aria-controls')).querySelector('video');
      if (v) { try { v.currentTime = 0; } catch (e) {} start(v); }
    }
    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n); }
      });
    });
  });

  /* ---------------------------------------------------------- BibTeX copy */
  Array.prototype.forEach.call(document.querySelectorAll('.copy[data-target]'), function (b) {
    b.addEventListener('click', function () {
      var text = document.getElementById(b.getAttribute('data-target')).innerText;
      function done() { var o = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = o; }, 1500); }
      function fallback() {
        var ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  });
})();
