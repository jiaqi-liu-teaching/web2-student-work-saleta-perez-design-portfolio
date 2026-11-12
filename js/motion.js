(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !Element.prototype.animate) return;
  const options = { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' };
  const running = new Set();
  const play = (element, frames, extra = {}) => {
    if (!element || preference.matches) return;
    const animation = element.animate(frames, { ...options, ...extra });
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  };
  const rise = [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }];
  const title = [{ opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: 'translateY(18px)' }, { opacity: 1, clipPath: 'inset(0)', transform: 'translateY(0)' }];
  document.querySelectorAll('header > a, header > nav, header > .hamburger-button').forEach((element, index) => {
    play(element, [{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: index * 80, duration: 650 });
  });
  if (!('IntersectionObserver' in window)) return;
  // Observe unhidden boxes; start animations only after they enter the viewport.
  // No CSS hiding gate: errors, disabled JS or reduced motion leave all content visible.
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      if (element.matches('.projects')) {
        play(element, rise, { delay: Number(element.dataset.motionDelay || 0) });
        play(element.querySelector('img'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)' }], { duration: 1100 });
      } else if (element.matches('.project-info,.aboutme-info')) {
        play(element.querySelector('h1'), title, { duration: 1000 });
        play(element.querySelector('.project-description,.about-copy'), rise, { delay: 140 });
        play(element.querySelector('.text-box'), rise, { delay: 260 });
      } else if (element.matches('.project-media')) {
        element.querySelectorAll('img').forEach((image, index) => {
          play(image, rise, { delay: index * 100, duration: 900 });
        });
      } else {
        play(element, rise);
      }
    }
  }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.projects,.project-info,.aboutme-info,.project-intro > .bg-img,.project-media,.about-layout > .carousel,footer > .footer-container').forEach((element, index) => {
    if (element.matches('.projects')) element.dataset.motionDelay = String((index % 2) * 90);
    observer.observe(element);
  });
  preference.addEventListener('change', (event) => {
    if (!event.matches) return;
    observer.disconnect();
    running.forEach((animation) => animation.cancel());
    running.clear();
  });
})();
