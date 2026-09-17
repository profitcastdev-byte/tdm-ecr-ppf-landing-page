/* ==========================================================================
   The Detailing Mafia ECR | PPF Landing Page
   --------------------------------------------------------------------------
   >>> CLIENT DETAILS : EDIT THIS BLOCK ONLY <<<
   Change the values below and every phone, WhatsApp and map link on the page
   updates automatically (header, hero, cards, footer, floating buttons,
   mobile bar).
   ========================================================================== */
const CLIENT = {
  // Phone. Digits only, with country code, no '+' and no spaces.
  phone:        '918925737773',
  phoneDisplay: '+91 89257 37773',

  // WhatsApp. Usually the same number.
  whatsapp:        '918925737773',
  whatsappMessage: "Hi, I'd like a free PPF quote for my car at your ECR studio.",

  // Studio address, written as plain text. The map link and the embedded map
  // are both built from it at runtime, so there is nothing to URL-encode by
  // hand and the link can never drift out of sync with the address shown.
  address: '2/632, SH 49 (ECR), opposite Goyal Marble, Neelankarai, Chennai, Tamil Nadu 600115',

  // Short Google Maps link for the verified business listing. When set, this
  // is used for "Get Directions" in place of the address search above, so the
  // pin lands on the business rather than the street.
  mapShortLink: 'https://maps.app.goo.gl/Qhip5VcUf94nmhKdA'
};

CLIENT.mapLink  = CLIENT.mapShortLink ||
  ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CLIENT.address));
CLIENT.mapEmbed = 'https://www.google.com/maps?q=' +
  encodeURIComponent('The Detailing Mafia ECR, ' + CLIENT.address) + '&z=16&output=embed';
/* ====================== END OF CLIENT DETAILS BLOCK ====================== */


/* ==========================================================================
   GOOGLE ADS / ANALYTICS CONVERSION TRACKING
   Paste the gtag.js base tag into the <head> of index.html, then fill in the
   IDs below. Until `id` is set, tracking is inert and every link still works.

   NOTE: Google hands you the same function name (`gtag_report_conversion`)
   in every snippet. Pasting two as-is means the second silently overwrites
   the first and every conversion reports as whichever loaded last. That is
   why the labels are kept as data here and fired through one function.
   ========================================================================== */
const ADS = {
  id: 'AW-10990978713',
  conversions: {
    // PC - LP - Phone Call Click
    phone:    { send_to: 'AW-10990978713/T8MzCIy3obEcEJmN9Pgo', value: 1.0, currency: 'INR' },
    // PC - LP - WhatsApp Click
    whatsapp: { send_to: 'AW-10990978713/Sf9YCMPEobEcEJmN9Pgo', value: 1.0, currency: 'INR' }
  }
};
/* ==================== END OF CONVERSION TRACKING BLOCK ==================== */


(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const waLink = (msg) =>
    'https://wa.me/' + CLIENT.whatsapp + '?text=' +
    encodeURIComponent(msg || CLIENT.whatsappMessage);

  /* ----------------------------------------------------------------------
     1. Inject client contact details into every link
     ---------------------------------------------------------------------- */
  function applyClientDetails() {
    $$('a[href^="tel:"]').forEach(a => { a.href = 'tel:+' + CLIENT.phone; });
    $$('a[href*="wa.me/"]').forEach(a => { a.href = waLink(); });
    $$('[data-maplink]').forEach(a => { a.href = CLIENT.mapLink; });

    const addr = $('[data-visit="address"]');
    if (addr) addr.textContent = CLIENT.address;

    $$('.ph-num').forEach(el => { el.textContent = CLIENT.phoneDisplay; });

    // only reassign if it differs, so the iframe is not fetched twice
    const map = $('[data-visit="map"]');
    if (map && CLIENT.mapEmbed && map.getAttribute('src') !== CLIENT.mapEmbed) {
      map.src = CLIENT.mapEmbed;
    }

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------------------
     2. Scroll progress bar
     ---------------------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)).toFixed(4) + ')';
    };
    onScroll(update);
    update();
  }

  /* ----------------------------------------------------------------------
     3. Sticky header state
     ---------------------------------------------------------------------- */
  function initHeader() {
    const header = $('#siteHeader');
    if (!header) return;
    onScroll(() => header.classList.toggle('is-stuck', window.scrollY > 24));
  }

  /* ----------------------------------------------------------------------
     4. Smooth scroll for in-page anchors
        Hand-rolled rather than `behavior:'smooth'`, because the native curve
        is short and decelerates abruptly. This eases in and out over a
        distance-scaled duration, which reads far calmer on a long page.
     ---------------------------------------------------------------------- */
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function scrollToY(targetY) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const duration = Math.min(1100, Math.max(620, Math.abs(distance) * 0.5));
    const startTime = performance.now();

    const step = now => {
      const t = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initSmoothScroll() {
    const headerH = () => ($('#siteHeader')?.offsetHeight || 0) + 20;

    $$('a[href^="#"]').forEach(link => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;

      link.addEventListener('click', e => {
        const target = document.getElementById(id.slice(1));
        if (!target) return;

        e.preventDefault();
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerH());

        if (prefersReducedMotion) window.scrollTo(0, top);
        else scrollToY(top);

        // keep keyboard focus in sync without a second jump
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. Scroll reveal animations
     ---------------------------------------------------------------------- */
  function initReveal() {
    const items = $$('.reveal');

    items.forEach(el => {
      const d = el.dataset.delay;
      if (d) el.style.setProperty('--d', d);
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0 });

    items.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------------------
     6. FAQ accordion, one open at a time.
        The open/close animation is pure CSS (grid-template-rows 0fr to 1fr),
        so all this does is toggle a class and keep aria in sync.
     ---------------------------------------------------------------------- */
  function initAccordion() {
    const items = $$('.acc-item');

    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      $('.acc-head', item).setAttribute('aria-expanded', String(open));
    };

    items.forEach(item => {
      setOpen(item, false);
      $('.acc-head', item).addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach(other => { if (other !== item) setOpen(other, false); });
        setOpen(item, willOpen);
      });
    });
  }

  /* ----------------------------------------------------------------------
     7. Work carousels
        Native scroll-snap does the scrolling; this only drives the arrows
        and dots and keeps them in sync with wherever the user has scrolled
        to, including by swipe, trackpad or keyboard.

        The parts are found inside each .carousel rather than by id, so a
        second carousel anywhere on the page needs no JavaScript change.
     ---------------------------------------------------------------------- */
  function initCarousel() {
    $$('.carousel').forEach(setupCarousel);
  }

  function setupCarousel(root) {
    const viewport = $('.carousel-viewport', root);
    const dotsWrap = $('.carousel-dots', root);
    const prevBtn  = $('[data-carousel-prev]', root);
    const nextBtn  = $('[data-carousel-next]', root);
    if (!viewport) return;

    const slides = $$('.slide', viewport);
    if (!slides.length) return;

    const gapPx = () => parseFloat(getComputedStyle(viewport).gap) || 0;
    const step  = () => slides[0].getBoundingClientRect().width + gapPx();

    // how many slides fit at this width, so the dots map to pages not slides
    const perPage     = () => Math.max(1, Math.round(viewport.clientWidth / step()));
    const pageCount   = () => Math.max(1, Math.ceil(slides.length / perPage()));
    const currentPage = () => Math.round(viewport.scrollLeft / (step() * perPage()));

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < pageCount(); i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Go to slide group ' + (i + 1));
        b.addEventListener('click', () => goToPage(i));
        dotsWrap.appendChild(b);
      }
      syncNav();
    }

    function goToPage(i) {
      viewport.scrollTo({
        left: i * step() * perPage(),
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }

    function syncNav() {
      const page = currentPage();
      if (dotsWrap) {
        $$('button', dotsWrap).forEach((d, i) =>
          d.setAttribute('aria-current', String(i === page)));
      }

      // 2px of slack: sub-pixel scroll widths otherwise leave the last
      // arrow enabled at the very end of the track
      const atStart = viewport.scrollLeft <= 2;
      const atEnd   = viewport.scrollLeft >=
                      viewport.scrollWidth - viewport.clientWidth - 2;
      if (prevBtn) prevBtn.disabled = atStart;
      if (nextBtn) nextBtn.disabled = atEnd;
    }

    prevBtn?.addEventListener('click', () => goToPage(Math.max(0, currentPage() - 1)));
    nextBtn?.addEventListener('click', () =>
      goToPage(Math.min(pageCount() - 1, currentPage() + 1)));

    viewport.addEventListener('scroll', () => {
      if (viewport._t) cancelAnimationFrame(viewport._t);
      viewport._t = requestAnimationFrame(syncNav);
    }, { passive: true });

    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn?.click(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prevBtn?.click(); }
    });

    buildDots();
    window.addEventListener('resize', debounce(buildDots, 200));
  }

  /* ----------------------------------------------------------------------
     8. Opening hours: live "Open now" / "Closed now" line
        The days and times are written in the markup, which is what a
        crawler and a JS-less visitor read. This only adds the status line,
        so if the script never runs the hours are still correct and complete.
     ---------------------------------------------------------------------- */
  const HOURS = { open: 10, close: 20, closedDays: [1] };   // 1 = Monday

  function initHours() {
    const box   = $('[data-hours-status]');
    const label = $('[data-hours-label]');
    if (!box || !label) return;

    const paint = () => {
      const now  = new Date();
      const open = !HOURS.closedDays.includes(now.getDay()) &&
                   now.getHours() >= HOURS.open && now.getHours() < HOURS.close;

      box.classList.toggle('is-open', open);
      box.classList.toggle('is-closed', !open);
      label.textContent = open ? 'Open now' : 'Closed now';
      box.hidden = false;
    };

    paint();
    setInterval(paint, 60000);
  }

  /* ----------------------------------------------------------------------
     9. Floating buttons + persistent mobile CTA bar
     ---------------------------------------------------------------------- */
  function initFloatingCTAs() {
    const fabs   = $$('.fab');
    const bar    = $('#mobileBar');
    const footer = $('.site-footer');

    let footerVisible = false;
    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        footerVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(footer);
    }

    function update() {
      const scrolled = window.scrollY > 300;
      // The floating buttons wait until the visitor has committed to the page.
      fabs.forEach(f => f.classList.toggle('is-visible', scrolled));
      // The bar does not: the phone hero has no CTA pair of its own, so if the
      // bar waited for a scroll there would be no way to call from first paint.
      // It only steps aside once the footer (which carries the number) is up.
      if (bar) bar.classList.toggle('is-visible', !footerVisible);
    }

    onScroll(update);
    update();
  }

  /* ----------------------------------------------------------------------
     10. Subtle parallax drift on the hero banner (desktop, motion-safe only)
         The image is scaled up first so there is margin to move into, without
         it drifting would expose a gap at the edge of the section.
     ---------------------------------------------------------------------- */
  const PARALLAX_SCALE = 1.08;
  const PARALLAX_RATE  = 0.05;

  function initHeroParallax() {
    const img = $('.hero-bg img');
    if (!img || prefersReducedMotion || window.innerWidth < 980) return;

    const hero = $('.hero');
    img.style.willChange = 'transform';

    const draw = () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      const limit = hero.offsetHeight * (PARALLAX_SCALE - 1) / 2;
      const shift = Math.min(limit, y * PARALLAX_RATE);
      img.style.transform =
        'translate3d(0,' + shift.toFixed(2) + 'px,0) scale(' + PARALLAX_SCALE + ')';
    };

    draw();
    onScroll(draw);
  }

  /* ----------------------------------------------------------------------
     11. Trust marquee
         Duplicates the row until the track covers the viewport twice over so
         the loop point never becomes visible, and derives the duration from
         the row width so the strip drifts at MARQUEE_SPEED, the same slow
         pace on a phone as on an ultrawide monitor.
     ---------------------------------------------------------------------- */
  const MARQUEE_SPEED = 32; // px per second

  function initMarquee() {
    if (prefersReducedMotion) return;

    $$('.marquee').forEach(marquee => {
      const track = $('.marquee-track', marquee);
      if (!track) return;

      // drop clones from a previous run so this is safe to re-invoke
      $$('.marquee-row', track).forEach((row, i) => { if (i) row.remove(); });

      const base = $('.marquee-row', track);
      if (!base) return;

      const rowW = base.getBoundingClientRect().width;
      if (!rowW) return;

      const copies = Math.max(2, Math.ceil((marquee.clientWidth * 2) / rowW));
      for (let i = 1; i < copies; i++) {
        const clone = base.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true'); // screen readers read it once
        track.appendChild(clone);
      }

      track.style.setProperty('--marquee-copies', copies);
      track.style.setProperty('--marquee-dur', (rowW / MARQUEE_SPEED).toFixed(2) + 's');
    });
  }

  /* ----------------------------------------------------------------------
     12. Conversion tracking
         Fires on every phone and WhatsApp link on the page, found by href, so
         links added later are covered automatically with no inline onclick
         handlers to keep in sync.
     ---------------------------------------------------------------------- */
  function reportConversion(type, url) {
    const conv = ADS.conversions[type];

    // gtag missing or unconfigured (ad blocker, offline, no ID yet): never
    // let tracking stand between the visitor and the call
    if (!ADS.id || !conv || !conv.send_to || typeof window.gtag !== 'function') {
      if (url) window.location = url;
      return false;
    }

    let navigated = false;
    const go = () => {
      if (navigated) return;
      navigated = true;
      if (url) window.location = url;
    };

    window.gtag('event', 'conversion', Object.assign({}, conv, { event_callback: go }));
    if (url) setTimeout(go, 900);
    return false;
  }

  window.gtagReportPhone    = url => reportConversion('phone', url);
  window.gtagReportWhatsApp = url => reportConversion('whatsapp', url);

  function initConversionTracking() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const type = href.startsWith('tel:') ? 'phone'
                 : href.includes('wa.me/') ? 'whatsapp'
                 : null;
      if (!type) return;

      // let ctrl/cmd/middle clicks open in a new tab untouched
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // tel: hands off to the dialer and target=_blank opens a new tab, so
      // neither unloads this page and the ping has time to send without us
      // having to intercept navigation
      reportConversion(type, null);
    }, true);
  }

  /* ----------------------------------------------------------------------
     Utilities
     ---------------------------------------------------------------------- */
  const scrollHandlers = [];
  let ticking = false;

  function onScroll(fn) {
    scrollHandlers.push(fn);
    if (scrollHandlers.length === 1) {
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          scrollHandlers.forEach(h => h());
          ticking = false;
        });
      }, { passive: true });
    }
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function init() {
    applyClientDetails();
    initScrollProgress();
    initHeader();
    initSmoothScroll();
    initReveal();
    initAccordion();
    initCarousel();
    initHours();
    initFloatingCTAs();
    initHeroParallax();
    initMarquee();
    initConversionTracking();

    // the marquee row is measured in px, so re-measure once the webfont
    // swaps in and whenever the viewport changes width
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initMarquee);
    }
    window.addEventListener('resize', debounce(initMarquee, 200));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
