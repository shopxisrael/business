/* ===== שופ SHOP — דף נחיתה לשיתופי פעולה ===== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- שכפול רצועת המותגים ללולאה רציפה ---- */
  var marquee = document.querySelector('[data-marquee] .marquee-track');
  if (marquee && !reducedMotion) {
    var items = Array.prototype.slice.call(marquee.children);
    items.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);
    });
  }

  /* ---- אנימציות כניסה לסקשנים ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- מוני ספירה ---- */
  function animateCounter(el) {
    var start = parseInt(el.getAttribute('data-start') || '0', 10);
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) { return; }
    if (reducedMotion) { el.textContent = target; return; }

    var duration = 1200;
    var startTime = null;

    function tick(now) {
      if (startTime === null) { startTime = now; }
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) { requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-target');
    });
  }

  /* ---- טעינה עצלה של טופס Google Forms ---- */
  var formPlaceholder = document.querySelector('[data-form-src]');
  var formLoaded = false;

  function loadForm() {
    if (formLoaded || !formPlaceholder) { return; }
    formLoaded = true;

    var iframe = document.createElement('iframe');
    iframe.src = formPlaceholder.getAttribute('data-form-src');
    iframe.title = 'טופס יצירת קשר לשיתוף פעולה עם שופ';
    iframe.setAttribute('loading', 'lazy');

    /* קישור גיבוי שנשאר זמין גם אם ה-iframe לא נטען */
    var fallback = document.createElement('p');
    fallback.className = 'form-fallback';
    var link = document.createElement('a');
    link.href = 'https://forms.gle/D5xfMScXhMiQysEv8';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'הטופס לא מופיע? לחצו כאן לפתיחה בחלון חדש';
    fallback.appendChild(link);

    var wrap = formPlaceholder.parentNode;
    wrap.replaceChild(iframe, formPlaceholder);
    wrap.appendChild(fallback);
  }

  if (formPlaceholder) {
    if ('IntersectionObserver' in window) {
      var formObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadForm();
            formObserver.disconnect();
          }
        });
      }, { rootMargin: '600px 0px' });
      formObserver.observe(formPlaceholder);
    } else {
      loadForm();
    }
  }

  /* ---- כפתור וואטסאפ צף + פס CTA דביק ---- */
  var floatWa = document.querySelector('[data-float-wa]');
  var stickyCta = document.querySelector('[data-sticky-cta]');
  var contactSection = document.getElementById('contact');

  if (floatWa) { floatWa.hidden = false; }
  if (stickyCta) { stickyCta.hidden = false; }

  var ticking = false;
  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () {
      var scrolled = window.scrollY > 350;
      var nearContact = false;
      if (contactSection) {
        var rect = contactSection.getBoundingClientRect();
        nearContact = rect.top < window.innerHeight && rect.bottom > 0;
      }
      if (floatWa) { floatWa.classList.toggle('visible', scrolled && !nearContact); }
      if (stickyCta) { stickyCta.classList.toggle('visible', scrolled && !nearContact); }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- כפתור שיתוף: Web Share API במובייל, העתקת קישור בדסקטופ ---- */
  var shareBtn = document.querySelector('[data-share]');
  if (shareBtn) {
    var shareData = {
      title: document.title,
      text: 'שיתוף פעולה עם שופ SHOP — תוכנית שותפים לעסקים ומותגים',
      url: window.location.href
    };

    shareBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share(shareData).catch(function () { /* המשתמש ביטל */ });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareData.url).then(function () {
          var original = shareBtn.lastChild.textContent;
          shareBtn.lastChild.textContent = ' הקישור הועתק!';
          setTimeout(function () { shareBtn.lastChild.textContent = original; }, 2000);
        });
      }
    });
  }
})();
