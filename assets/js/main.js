/* ==================================================================
   Site behaviour: nav, reveal, counters, gallery, lightbox, form
   ================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var toggle = $('#navToggle'), nav = $('#nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Header shadow + active link ---------- */
  var header = $('#siteHeader');
  var sections = $$('main section[id]');
  var navLinks = $$('.nav a[href^="#"]');

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    var pos = window.scrollY + 140, current = '';
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Placeholder for any missing photo ---------- */
  function placeholder(w, h, label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0b4a32"/><stop offset="1" stop-color="#12694a"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/>' +
      '<text x="50%" y="47%" fill="#c9a227" font-family="Georgia,serif" font-size="' +
      Math.round(Math.min(w, h) / 5) + '" font-weight="700" text-anchor="middle">J</text>' +
      '<text x="50%" y="62%" fill="rgba(255,255,255,.55)" font-family="system-ui,sans-serif" font-size="' +
      Math.round(Math.min(w, h) / 18) + '" text-anchor="middle">' + (label || 'photo') + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function guardImage(img, label) {
    img.addEventListener('error', function handle() {
      img.removeEventListener('error', handle);
      img.src = placeholder(img.getAttribute('width') || 800,
                            img.getAttribute('height') || 600, label);
      img.style.objectFit = 'cover';
    });
  }
  $$('img[data-photo]').forEach(function (img) { guardImage(img, 'add this photo'); });

  /* ---------- Gallery ---------- */
  var grid = $('#galleryGrid');
  var items = (window.GALLERY || []);
  var visible = [];

  if (grid && items.length) {
    /* filter bar */
    var labels = { ministry: 'Ministry', office: 'Meetings', events: 'Events & durbars', constituency: 'Constituency' };
    var cats = [];
    items.forEach(function (it) { if (cats.indexOf(it.cat) === -1) cats.push(it.cat); });

    var bar = document.createElement('div');
    bar.className = 'gallery-filters';
    bar.innerHTML = '<button class="gfilter active" data-f="all">All photos</button>' +
      cats.map(function (c) {
        return '<button class="gfilter" data-f="' + c + '">' + (labels[c] || c) + '</button>';
      }).join('');
    grid.parentNode.insertBefore(bar, grid);

    /* tiles */
    items.forEach(function (it, i) {
      var b = document.createElement('button');
      b.className = 'g-item';
      b.type = 'button';
      b.dataset.cat = it.cat || '';
      b.dataset.index = String(i);
      b.setAttribute('aria-label', 'Open photo: ' + it.title);

      var img = document.createElement('img');
      /* grid shows the light thumbnail; the lightbox loads the full-size file */
      img.src = it.src.replace(/^images\//, 'images/thumbs/');
      img.alt = it.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      guardImage(img, it.title);

      var cap = document.createElement('span');
      cap.className = 'g-cap';
      cap.innerHTML = '<b></b><span></span>';
      cap.querySelector('b').textContent = it.title;
      cap.querySelector('span').textContent = it.meta || '';

      b.appendChild(img);
      b.appendChild(cap);
      grid.appendChild(b);
    });

    var tiles = $$('.g-item', grid);
    function applyFilter(f) {
      visible = [];
      tiles.forEach(function (t) {
        var show = (f === 'all' || t.dataset.cat === f);
        t.classList.toggle('hide', !show);
        if (show) visible.push(Number(t.dataset.index));
      });
    }
    applyFilter('all');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.gfilter');
      if (!btn) return;
      $$('.gfilter', bar).forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.dataset.f);
    });

    /* ---------- Lightbox ---------- */
    var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
    var cursor = 0;

    function show(index) {
      var it = items[index];
      if (!it) return;
      cursor = index;
      lbImg.src = it.src;
      lbImg.alt = it.title;
      lbCap.textContent = it.title + (it.meta ? ' — ' + it.meta : '');
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.hidden = true;
      lbImg.src = '';
      document.body.style.overflow = '';
    }
    function step(dir) {
      if (!visible.length) return;
      var at = visible.indexOf(cursor);
      var next = visible[(at + dir + visible.length) % visible.length];
      show(next);
    }

    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('.g-item');
      if (tile) show(Number(tile.dataset.index));
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { step(-1); });
    $('#lbNext').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var nums = $$('.stat-num');
  function runCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var decimals = (String(target).split('.')[1] || '').length;
    var start = null, dur = 1400;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* ================================================================
     Contact form

     Messages are delivered by Web3Forms — a free relay that emails
     each submission to the constituency office. No server needed.

     TO SWITCH IT ON:
       1. Go to https://web3forms.com
       2. Enter the office email address (e.g. jayussif@yahoo.com)
       3. They email back an Access Key — paste it below.

     Until a key is set, the form falls back to opening the visitor's
     email app, so it is never silently broken.
     ================================================================ */
  var FORM_ACCESS_KEY = '';           /* <-- paste the Web3Forms key here */
  var OFFICE_EMAIL = 'jayussif@yahoo.com';

  var form = $('#contactForm'), note = $('#formNote');

  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var contact = (data.get('contact') || '').toString().trim();
      var community = (data.get('community') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      /* Spam trap: real people leave this hidden field empty. */
      if ((data.get('website') || '').toString().trim() !== '') return;

      if (!name || !contact || !message) {
        note.className = 'form-note bad';
        note.textContent = 'Please fill in your name, your contact and your message.';
        return;
      }

      /* ---- No key yet: hand off to the visitor's email app ---- */
      if (!FORM_ACCESS_KEY) {
        var body = 'Name: ' + name + '\nContact: ' + contact +
                   '\nCommunity: ' + (community || '-') + '\n\n' + message;
        window.location.href = 'mailto:' + OFFICE_EMAIL +
          '?subject=' + encodeURIComponent('Message from ' + name + ' via the website') +
          '&body=' + encodeURIComponent(body);
        note.className = 'form-note ok';
        note.textContent = 'Opening your email app… if nothing happens, please write to ' + OFFICE_EMAIL + '.';
        return;
      }

      /* ---- Key present: send it properly ---- */
      note.className = 'form-note';
      note.textContent = 'Sending…';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: FORM_ACCESS_KEY,
          subject: 'Website message from ' + name + (community ? ' (' + community + ')' : ''),
          from_name: 'Ayawaso North website',
          name: name,
          contact: contact,
          community: community || 'Not given',
          message: message
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (out) {
          if (out && out.success) {
            form.reset();
            note.className = 'form-note ok';
            note.textContent = 'Thank you — your message has reached the constituency office.';
          } else {
            throw new Error((out && out.message) || 'Submission rejected');
          }
        })
        .catch(function () {
          note.className = 'form-note bad';
          note.innerHTML = 'Sorry, that did not send. Please email ' +
            '<a href="mailto:' + OFFICE_EMAIL + '">' + OFFICE_EMAIL + '</a> directly.';
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
        });
    });
  }
})();
