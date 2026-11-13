(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const overlay = document.querySelector('.mobile-overlay');
  const hamburger = document.querySelector('.hamburger-button');
  const close = document.querySelector('.close-button');
  if (overlay && hamburger && close) {
    overlay.inert = true;
    hamburger.setAttribute('aria-expanded', 'false');
    const toggle = (open) => {
      overlay.inert = !open;
      overlay.classList.toggle('overlay-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      (open ? close : hamburger).focus();
    };
    for (const [control, label, open] of [[hamburger, 'Open navigation', true], [close, 'Close navigation', false]]) {
      control.tabIndex = 0;
      control.setAttribute('role', 'button');
      control.setAttribute('aria-label', label);
      control.addEventListener('click', () => toggle(open));
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle(open);
        }
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('overlay-open')) toggle(false);
    });
  }

  const image = document.querySelector('.carousel-images');
  const carousel = document.querySelector('.carousel');
  if (image && carousel) {
    const slides = ['img1.png', 'img2.png', 'img3.png'];
    const slideImages = slides.map(file => { const img = new Image(); img.src = `assets/${file}`; return img; });
    let current = slides.indexOf(image.getAttribute('src').split('/').pop());
    if (current < 0) current = 0;
    let busy = false;
    const change = async (direction) => {
      if (busy) return;
      busy = true;
      const nextIndex = (current + direction + slides.length) % slides.length;
      const url = `assets/${slides[nextIndex]}`;
      let outgoing;
      try {
        await slideImages[nextIndex].decode();
        if (reducedMotion.matches || !image.animate) {
          image.src = url;
        } else {
          outgoing = image.cloneNode();
          outgoing.className = 'carousel-outgoing';
          outgoing.alt = '';
          outgoing.setAttribute('aria-hidden', 'true');
          carousel.append(outgoing);
          image.src = url;
          const options = { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' };
          const fadeOut = outgoing.animate([
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: `translateX(${-direction * 22}px)` }
          ], options);
          const fadeIn = image.animate([
            { opacity: 0, transform: `translateX(${direction * 22}px)` },
            { opacity: 1, transform: 'translateX(0)' }
          ], options);
          await Promise.allSettled([fadeOut.finished, fadeIn.finished]);
        }
        current = nextIndex;
      } catch {
        // A failed image download leaves the current slide in place.
      } finally {
        outgoing?.remove();
        busy = false;
      }
    };
    let timer;
    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      timer = setInterval(() => {
        if (document.hidden) return;
        const bounds = carousel.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight) change(1);
      }, 1500);
    };
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', event => { if (event.persisted) start(); });
    start();
  }
})();

// Keep anchor/focus scrolling clear of the phone header as fonts and images load.
(() => {
  const header = document.querySelector('body > header');
  if (!header || !('ResizeObserver' in window)) return;
  const phone = matchMedia('(max-width: 600px)');
  const measure = () => {
    if (phone.matches) document.documentElement.style.setProperty('--mobile-header-height', `${header.getBoundingClientRect().height}px`);
  };
  new ResizeObserver(measure).observe(header);
  phone.addEventListener('change', measure);
  measure();
})();
