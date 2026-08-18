/* ====================================================================
   Site engine: preloader, transitions, nav, reveals, parallax,
   slideshow, timeline, counters, gallery, lightbox, contact form
   ==================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Year ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Preloader (home only, once per session) ---------------- */
  var loader = $('#loader');
  function armPage() { document.body.classList.add('is-loaded'); }

  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem('yj_intro') === '1'; } catch (e) {}
    if (seen || reduced) {
      loader.classList.add('done');
      setTimeout(armPage, 80);
    } else {
      try { sessionStorage.setItem('yj_intro', '1'); } catch (e) {}
      setTimeout(function () {
        loader.classList.add('done');
        setTimeout(armPage, 250);
      }, 1900);
    }
  } else {
    setTimeout(armPage, 120);
  }

  /* ---------------- Curtain page transitions ---------------- */
  var veil = $('#veil');
  if (veil) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!/\.html($|#)/.test(href) || /^https?:/i.test(href)) return;
      e.preventDefault();
      veil.classList.add('on');
      setTimeout(function () { window.location.href = href; }, 660);
    });
    /* bfcache restore: make sure the curtain is lifted */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { veil.classList.remove('on'); armPage(); }
    });
  }

  /* ---------------- Header state ---------------- */
  var header = $('#siteHeader');
  function headerState() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', headerState, { passive: true });
  headerState();

  /* ---------------- Overlay menu ---------------- */
  var burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------------- Hero slideshow (Ken Burns crossfade) ---------------- */
  var show = $('#heroShow');
  if (show) {
    var slides = $$('figure', show);
    var dots = $$('#heroDots i');
    var at = 0, HOLD = 6400;

    function go(n) {
      slides[at].classList.remove('on');
      if (dots[at]) dots[at].classList.remove('on');
      at = n % slides.length;
      /* restart the dot fill animation */
      if (dots[at]) { void dots[at].offsetWidth; dots[at].classList.add('on'); }
      slides[at].classList.add('on');
    }
    slides[0].classList.add('on');
    if (dots[0]) dots[0].classList.add('on');
    if (!reduced && slides.length > 1) {
      setInterval(function () { go(at + 1); }, HOLD);
    }
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealables = $$('.rv');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Parallax ---------------- */
  var plx = $$('[data-plx]');
  if (plx.length && !reduced) {
    var ticking = false;
    function parallax() {
      var vh = window.innerHeight;
      plx.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var f = parseFloat(el.dataset.plx) || .12;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translateY(' + (-mid * f).toFixed(1) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------------- Timeline draw ---------------- */
  var tl = $('.tl');
  if (tl && !reduced) {
    function drawLine() {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * .72 - r.top) / r.height;
      tl.style.setProperty('--draw', String(Math.max(0, Math.min(1, p)) * 100));
    }
    window.addEventListener('scroll', drawLine, { passive: true });
    drawLine();
  } else if (tl) {
    tl.style.setProperty('--draw', '100');
  }

  /* ---------------- Counters ---------------- */
  var nums = $$('.stat-num');
  function runCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var decimals = (String(target).split('.')[1] || '').length;
    var start = null, dur = 1600;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && !reduced) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* ---------------- Missing-photo placeholder ---------------- */
  function placeholder(w, h, label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0d2b1e"/><stop offset="1" stop-color="#10402c"/>' +
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

  /* ---------------- Gallery + lightbox ---------------- */
  var grid = $('#galleryGrid');
  var items = (window.GALLERY || []);
  var visible = [];

  if (grid && items.length) {
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

    items.forEach(function (it, i) {
      var b = document.createElement('button');
      b.className = 'g-item rv';
      if (i % 3 === 1) b.dataset.d = '1';
      if (i % 3 === 2) b.dataset.d = '2';
      b.type = 'button';
      b.dataset.cat = it.cat || '';
      b.dataset.index = String(i);
      b.setAttribute('aria-label', 'Open photo: ' + it.title);

      var img = document.createElement('img');
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
      if ('IntersectionObserver' in window && !reduced) {
        var one = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add('in'); one.unobserve(en.target); }
          });
        }, { threshold: 0.08 });
        one.observe(b);
      } else {
        b.classList.add('in');
      }
    });

    var tiles = $$('.g-item', grid);
    function applyFilter(f) {
      visible = [];
      tiles.forEach(function (t) {
        var showTile = (f === 'all' || t.dataset.cat === f);
        t.classList.toggle('hide', !showTile);
        if (showTile) visible.push(Number(t.dataset.index));
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

    var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
    var cursor = 0;

    function showPhoto(index) {
      var it = items[index];
      if (!it) return;
      cursor = index;
      lbImg.src = it.src;
      lbImg.alt = it.title;
      lbCap.textContent = it.title + (it.meta ? ' · ' + it.meta : '');
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lb.hidden = true;
      lbImg.src = '';
      document.body.style.overflow = '';
    }
    function step(dir) {
      if (!visible.length) return;
      var atV = visible.indexOf(cursor);
      showPhoto(visible[(atV + dir + visible.length) % visible.length]);
    }

    grid.addEventListener('click', function (e) {
      var tile = e.target.closest('.g-item');
      if (tile) showPhoto(Number(tile.dataset.index));
    });
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { step(-1); });
    $('#lbNext').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ================================================================
     Contact form, delivered by Web3Forms.

     TO SWITCH IT ON:
       1. Go to https://web3forms.com
       2. Enter the office email address
       3. Paste the Access Key they send below.

     Until a key is set, the form falls back to the visitor's email
     app, so it is never silently broken.
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

      if (!FORM_ACCESS_KEY) {
        var body = 'Name: ' + name + '\nContact: ' + contact +
                   '\nCommunity: ' + (community || '-') + '\n\n' + message;
        window.location.href = 'mailto:' + OFFICE_EMAIL +
          '?subject=' + encodeURIComponent('Message from ' + name + ' via the website') +
          '&body=' + encodeURIComponent(body);
        note.className = 'form-note ok';
        note.textContent = 'Opening your email app. If nothing happens, please write to ' + OFFICE_EMAIL + '.';
        return;
      }

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
            note.textContent = 'Thank you, your message has reached the constituency office.';
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
