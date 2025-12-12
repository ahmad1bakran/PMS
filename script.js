// Language toggle system:
// - Each visible text element has data-en and data-ar attributes.
// - currentLang stores the active language ("en" or "ar").
// - setLanguage updates the document direction and swaps innerText for every element with data-en.
const langElements = () => document.querySelectorAll('[data-en]');
const LANG_KEY = 'pms-lang';
let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  if (window.localStorage) {
    localStorage.setItem(LANG_KEY, lang); // persist across refreshes
  }

  document.documentElement.lang = lang;
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', lang === 'ar');

  langElements().forEach((el) => {
    const text = el.dataset[lang];
    if (typeof text === 'string') {
      el.innerText = text;
    }
  });

  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.innerText = lang === 'en' ? 'AR' : 'EN';
    toggle.setAttribute('aria-pressed', lang === 'ar');
  }
  if (document.body.classList.contains('nav-open')) {
    document.body.classList.remove('nav-open'); // close menu after toggling language
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sectionAnimations = {
    '#hero': 'anim-hero',
    '#about': 'anim-about',
    '#vmv': 'anim-vmv',
    '#services': 'anim-services',
    '#clients': 'anim-clients',
    '#achievements': 'anim-whyus',
    '#partners': 'anim-partners',
    '#contact': 'anim-contact',
  };

  function triggerSectionAnimation(id) {
    const el = document.querySelector(id);
    const animClass = sectionAnimations[id];
    if (!el || !animClass) return;
    el.classList.remove(animClass);
    // force reflow to restart animation
    void el.offsetWidth;
    el.classList.add(animClass);
    setTimeout(() => el.classList.remove(animClass), 900);
  }

  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      setLanguage(currentLang === 'en' ? 'ar' : 'en');
    });
  }
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
  }

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Navigation buttons smooth scroll
  document.querySelectorAll('.section-jump').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const el = target ? document.querySelector(target) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        setActiveNav(target);
        triggerSectionAnimation(target);
      }
      document.body.classList.remove('nav-open');
    });
  });

  // Smooth scroll for hero Contact button with slight offset animation
  document.querySelectorAll('.scroll-contact').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#contact');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        triggerSectionAnimation('#contact');
        target.classList.add('pulse');
        setTimeout(() => target.classList.remove('pulse'), 900);
      }
    });
  });

  // Smooth scroll + highlight for "Explore Services"
  document.querySelectorAll('a[href="#services"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#services');
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      triggerSectionAnimation('#services');
      const highlight = target.querySelector('.services-heading') || target;
      highlight.classList.add('section-flash');
      setTimeout(() => highlight.classList.remove('section-flash'), 1200);
    });
  });

  // Track active nav based on scroll position
  const navButtons = Array.from(document.querySelectorAll('.section-jump'));
  const sectionMap = navButtons
    .map((btn) => {
      const target = btn.dataset.target;
      const el = target ? document.querySelector(target) : null;
      return el ? { id: target, el, btn } : null;
    })
    .filter(Boolean);

  function setActiveNav(id) {
    navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.target === id));
  }

  const activeObserver = new IntersectionObserver(
    (entries) => {
      // Pick the section with the highest intersection ratio in view
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        setActiveNav(`#${visible[0].target.id}`);
      }
    },
    {
      threshold: [0.1, 0.25, 0.5, 0.75],
      rootMargin: "-35% 0px -35% 0px", // focus mid-viewport to reduce premature section switches
    }
  );

  sectionMap.forEach(({ el }) => activeObserver.observe(el));

  // Reveal animation on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));
  document.querySelector('.hero')?.classList.add('visible');

  const savedLang = (window.localStorage && localStorage.getItem(LANG_KEY)) || 'en';
  setLanguage(savedLang);

  // Mobile fallback: ensure logo wall section shows on small screens even if observer misses
  const clientGallery = document.querySelector('#client-gallery');
  if (clientGallery && window.innerWidth <= 820) {
    clientGallery.classList.add('visible');
  }

  // Toggle back-to-top visibility on scroll
  window.addEventListener('scroll', () => {
    if (!backToTop) return;
    const shouldShow = window.scrollY > 300;
    backToTop.classList.toggle('show', shouldShow);
    if (window.scrollY < 150) {
      setActiveNav('#hero');
    }
  });
});
