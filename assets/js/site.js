/* ====================================================================
   Site engine v2
   Cinematic layer: intro sequence, kinetic type, smooth scroll (Lenis),
   scroll scenes (GSAP ScrollTrigger), 3D tilt, particles, custom cursor.
   Core layer: transitions, nav, reveals, slideshow, timeline, counters,
   gallery, lightbox, contact form. Every cinematic feature degrades
   gracefully when its library is missing or motion is reduced.
   ==================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  if (hasGsap) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------------- Year ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Kinetic type: split into animatable characters --- */
  $$('.kinetic').forEach(function (el) {
    var idx = 0;
    var frag = document.createDocumentFragment();
    el.childNodes.forEach = Array.prototype.forEach;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (piece) {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { var sp = document.createElement('span'); sp.className = 'sp'; sp.innerHTML = '&nbsp;'; frag.appendChild(sp); return; }
          var w = document.createElement('span'); w.className = 'word';
          piece.split('').forEach(function (chr) {
            var c = document.createElement('span');
            c.className = 'ch'; c.textContent = chr;
            c.style.setProperty('--i', String(idx++));
            w.appendChild(c);
          });
          frag.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        var clone = node.cloneNode(false);
        clone.textContent = '';
        var w2 = document.createElement('span'); w2.className = 'word';
        (node.textContent || '').split('').forEach(function (chr) {
          if (chr === ' ') { var sp2 = document.createElement('span'); sp2.className = 'sp'; sp2.innerHTML = '&nbsp;'; w2.appendChild(sp2); return; }
          var c2 = document.createElement('span');
          c2.className = 'ch'; c2.textContent = chr;
          c2.style.setProperty('--i', String(idx++));
          w2.appendChild(c2);
        });
        clone.appendChild(w2);
        frag.appendChild(clone);
      }
    });
    el.textContent = '';
    el.appendChild(frag);
  });

  /* ---------------- Intro title sequence (home only) ---------------- */
  var intro = $('#intro');
  function armPage() { document.body.classList.add('is-loaded'); }

  if (intro && !reduced) {
    /* split the intro name */
    var nameEl = $('.intro-name', intro);
    if (nameEl && !nameEl.querySelector('.ch')) {
      var txt = nameEl.textContent.trim(); nameEl.textContent = '';
      var k = 0;
      /* group characters into word spans so lines break only between words */
      txt.split(/(\s+)/).forEach(function (piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { var s = document.createElement('span'); s.className = 'sp'; nameEl.appendChild(s); return; }
        var w = document.createElement('span'); w.className = 'word';
        piece.split('').forEach(function (chr) {
          var c = document.createElement('span'); c.className = 'ch'; c.textContent = chr;
          c.style.setProperty('--i', String(k++)); w.appendChild(c);
        });
        nameEl.appendChild(w);
      });
    }
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { intro.classList.add('go'); });
    var closed = false;
    function closeIntro() {
      if (closed) return; closed = true;
      intro.classList.add('done');
      document.body.style.overflow = '';
      setTimeout(armPage, 350);
      setTimeout(function () { intro.remove(); }, 1400);
    }
    $('.intro-skip', intro).addEventListener('click', closeIntro);
    setTimeout(closeIntro, 3400);
  } else {
    if (intro) intro.remove();
    setTimeout(armPage, 120);
  }

  /* ---------------- Smooth momentum scroll ---------------- */
  var lenis = null;
  if (hasLenis && !reduced && finePointer) {
    lenis = new window.Lenis({ lerp: .09, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasGsap) lenis.on('scroll', window.ScrollTrigger.update);
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
      setTimeout(function () { window.location.href = href; }, 640);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { veil.classList.remove('on'); armPage(); }
    });
  }

  /* ---------------- Custom cursor ---------------- */
  if (finePointer && !reduced) {
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function cursorLoop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(cursorLoop);
    })();
    document.addEventListener('mouseover', function (e) {
      document.body.classList.toggle('cursor-hot', !!e.target.closest('a, button, .g-item'));
    }, { passive: true });
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
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      }
    });
  }

  /* ---------------- Hero particle field ---------------- */
  $$('.hero-particles').forEach(function (canvas) {
    if (reduced || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, pts = [];
    var COUNT = finePointer ? 55 : 28;
    function size() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size, { passive: true });
    for (var i = 0; i < COUNT; i++) {
      pts.push({
        x: Math.random() * 2000 % (W || 1200),
        y: Math.random() * 2000 % (H || 800),
        r: .6 + Math.random() * 1.7,
        vy: .12 + Math.random() * .35,
        vx: (Math.random() - .5) * .12,
        o: .15 + Math.random() * .45,
        tw: Math.random() * 6.28
      });
    }
    var running = true;
    document.addEventListener('visibilitychange', function () { running = !document.hidden; });
    (function tick() {
      requestAnimationFrame(tick);
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y -= p.vy; p.x += p.vx; p.tw += .02;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4; else if (p.x > W + 4) p.x = -4;
        var a = p.o * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(47,213,124,' + a.toFixed(3) + ')';
        ctx.fill();
      }
    })();
  });

  /* ---------------- 3D tilt ---------------- */
  if (finePointer && !reduced) {
    $$('[data-tilt]').forEach(function (el) {
      var MAX = parseFloat(el.dataset.tilt) || 7;
      var host = el.parentElement;
      host.addEventListener('mousemove', function (e) {
        var r = host.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        el.style.transform =
          'rotateY(' + (px * MAX).toFixed(2) + 'deg) rotateX(' + (-py * MAX).toFixed(2) + 'deg)';
      });
      host.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------- Hero slideshow (inside the frame) ---------------- */
  var show = $('#heroShow');
  if (show) {
    var slides = $$('img', show);
    var dots = $$('#heroDots i');
    var at = 0, HOLD = 6400;
    /* slides 2..n carry data-src; fetch them only after first paint */
    window.addEventListener('load', function () {
      if (reduced) return;
      slides.forEach(function (img) {
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
      });
    });
    function go(n) {
      slides[at].classList.remove('on');
      if (dots[at]) dots[at].classList.remove('on');
      at = n % slides.length;
      if (dots[at]) { void dots[at].offsetWidth; dots[at].classList.add('on'); }
      slides[at].classList.add('on');
    }
    slides[0].classList.add('on');
    if (dots[0]) dots[0].classList.add('on');
    if (!reduced && slides.length > 1) {
      setInterval(function () { go(at + 1); }, HOLD);
    }
  }

  /* ---------------- Horizontal chapter journey ---------------- */
  var hj = $('.hj');
  if (hj) {
    var track = $('.hj-track', hj);
    var viewport = $('.hj-viewport', hj);
    var wide = window.innerWidth > 940;
    if (hasGsap && !reduced && wide) {
      var scrollLen = function () { return track.scrollWidth - viewport.clientWidth; };
      window.gsap.to(track, {
        x: function () { return -scrollLen(); },
        ease: 'none',
        scrollTrigger: {
          trigger: hj,
          start: 'top top',
          end: function () { return '+=' + scrollLen(); },
          pin: true,
          scrub: .6,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      /* panels breathe as they travel */
      $$('.hj-panel', track).forEach(function (p) {
        window.gsap.fromTo(p, { y: 40 }, {
          y: -10, ease: 'none',
          scrollTrigger: { trigger: hj, start: 'top top', end: 'bottom top', scrub: 1 }
        });
      });
    } else {
      viewport.style.overflowX = 'auto';
      viewport.style.webkitOverflowScrolling = 'touch';
    }
  }

  /* ---------------- GSAP scroll scenes (progressive enhancement) ----- */
  if (hasGsap && !reduced) {
    /* hero visual drifts up slightly as you leave the hero */
    $$('.hero-visual').forEach(function (v) {
      window.gsap.to(v, {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: v.closest('.hero'), start: 'top top', end: 'bottom top', scrub: 1 }
      });
    });
    /* aurora parallax */
    $$('.hero-aurora').forEach(function (a) {
      window.gsap.to(a, {
        y: 120, ease: 'none',
        scrollTrigger: { trigger: a.closest('.hero'), start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    });
    /* marquee band skews with scroll velocity; applied to the container
       because the track's transform is owned by its CSS keyframe animation */
    var mWrap = $('.marquee');
    if (mWrap) {
      var proxy = { skew: 0 };
      var clamp = window.gsap.utils.clamp(-8, 8);
      window.ScrollTrigger.create({
        onUpdate: function (self) {
          var s = clamp(self.getVelocity() / -280);
          if (Math.abs(s) > Math.abs(proxy.skew)) {
            proxy.skew = s;
            window.gsap.to(proxy, {
              skew: 0, duration: .9, ease: 'power3',
              onUpdate: function () { mWrap.style.transform = 'skewX(' + proxy.skew.toFixed(2) + 'deg)'; }
            });
          }
        }
      });
    }
    /* big image parallax inside sections */
    $$('[data-plx]').forEach(function (el) {
      var f = parseFloat(el.dataset.plx) || .1;
      window.gsap.to(el, {
        y: function () { return -120 * f * 3; },
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  } else if (!reduced) {
    /* rAF parallax fallback */
    var plx = $$('[data-plx]');
    if (plx.length) {
      var ticking = false;
      var pfall = function () {
        var vh = window.innerHeight;
        plx.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var f = parseFloat(el.dataset.plx) || .12;
          var mid = r.top + r.height / 2 - vh / 2;
          el.style.transform = 'translateY(' + (-mid * f).toFixed(1) + 'px)';
        });
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(pfall); ticking = true; }
      }, { passive: true });
      pfall();
    }
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealables = $$('.rv');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* Fail-safe: nothing on screen may ever stay hidden. Any .rv whose top
     has entered the viewport gets revealed even if its observer never
     fired (very tall images, odd embedding contexts, browser quirks). */
  function rvSweep() {
    var vh = window.innerHeight;
    $$('.rv:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * .96 && r.bottom > 0) el.classList.add('in');
    });
  }
  var sweepTick = false;
  window.addEventListener('scroll', function () {
    if (!sweepTick) { sweepTick = true; requestAnimationFrame(function () { rvSweep(); sweepTick = false; }); }
  }, { passive: true });
  window.addEventListener('load', rvSweep);
  setTimeout(rvSweep, 900);
  setInterval(rvSweep, 2500);

  /* kinetic headings outside heroes play when scrolled into view */
  if ('IntersectionObserver' in window && !reduced) {
    var kio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('play'); kio.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    $$('.kinetic').forEach(function (el) {
      if (!el.closest('.hero')) kio.observe(el);
    });
  } else {
    $$('.kinetic').forEach(function (el) { el.classList.add('play'); });
  }

  /* ---------------- Timeline draw ---------------- */
  var tl = $('.tl');
  if (tl && !reduced) {
    var drawLine = function () {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * .72 - r.top) / r.height;
      tl.style.setProperty('--draw', String(Math.max(0, Math.min(1, p)) * 100));
    };
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
      '<stop offset="0" stop-color="#0c1f14"/><stop offset="1" stop-color="#007a3b"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/>' +
      '<text x="50%" y="47%" fill="#2fd57c" font-family="Georgia,serif" font-size="' +
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
      if (hasGsap) window.ScrollTrigger.refresh();
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
      if (lenis) lenis.stop();
    }
    function closeLb() {
      lb.hidden = true;
      lbImg.src = '';
      document.body.style.overflow = '';
      if (lenis) lenis.start();
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
