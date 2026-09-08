/* ============================================
   SIX SIGMA — Interactions & Animations
   Vanilla JS, zero dependencies
   ============================================ */

/* ── Configurable Constants ── */
const CONFIG = {
  // Replace these with your actual numbers
  PHONE_NUMBER: '+243XXXXXXXXX',       // displayed in contact section
  PHONE_DISPLAY: '+243 XXX XXX XXX',   // formatted for display
  WHATSAPP_NUMBER: '243XXXXXXXXX',     // digits only, no + or spaces (for wa.me link)
  EMAIL: 'contact@sixsigma-btp.com',
  COMPANY: 'SIX SIGMA',
};

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Hydrate configurable contact info ──
  document.querySelectorAll('[data-config-phone]').forEach((el) => {
    el.textContent = CONFIG.PHONE_DISPLAY;
    if (el.tagName === 'A') el.href = `tel:${CONFIG.PHONE_NUMBER}`;
  });

  document.querySelectorAll('[data-config-email]').forEach((el) => {
    el.textContent = CONFIG.EMAIL;
    if (el.tagName === 'A') el.href = `mailto:${CONFIG.EMAIL}`;
  });

  document.querySelectorAll('[data-config-whatsapp-href]').forEach((el) => {
    el.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
  });

  // ── Scroll Reveal (IntersectionObserver) ──
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  // ── Header scroll state ──
  const header = document.querySelector('.header');
  let lastScroll = 0;

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // init

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ── Mobile menu ──
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileClose = document.querySelector('.mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu-links .nav-link');

  const openMobileMenu = () => {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ── Smooth scroll for all anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Service card → pre-fill form & scroll ──
  const serviceSelect = document.getElementById('form-service');
  const contactSection = document.getElementById('contact');

  // Map service card data-service values to <option> values in the dropdown
  const scrollToFormWithService = (serviceValue) => {
    if (!serviceSelect || !contactSection) return;

    // Set the dropdown value
    const option = serviceSelect.querySelector(`option[value="${serviceValue}"]`);
    if (option) {
      serviceSelect.value = serviceValue;
      // Trigger change event for any listeners
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Scroll to contact section
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Flash highlight on the select dropdown briefly
    setTimeout(() => {
      serviceSelect.classList.add('form-select--highlight');
      setTimeout(() => {
        serviceSelect.classList.remove('form-select--highlight');
      }, 1500);
    }, 800);
  };

  // Attach click handlers to all service cards and project cards with data-service
  const clickableItems = document.querySelectorAll('.service-card[data-service], .project-card[data-service]');
  clickableItems.forEach((card) => {
    const cta = card.querySelector('.service-cta, .project-cta-link');
    if (cta) {
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        scrollToFormWithService(card.dataset.service);
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.service-cta, .project-cta-link')) return;
      scrollToFormWithService(card.dataset.service);
    });
  });

  // ── Contact form handling (WhatsApp + Multi-Channel Fallback) ──
  const form = document.getElementById('contact-form');
  const fallbackFeedback = document.getElementById('fallback-feedback');
  const btnSubmitEmail = document.getElementById('btn-submit-email');
  const btnCopyQuote = document.getElementById('btn-copy-quote');

  const showFeedback = (message, isError = false) => {
    if (!fallbackFeedback) return;
    fallbackFeedback.textContent = message;
    fallbackFeedback.className = `fallback-feedback ${isError ? 'error' : ''}`;
    setTimeout(() => {
      fallbackFeedback.textContent = '';
      fallbackFeedback.className = 'fallback-feedback';
    }, 4500);
  };

  const getFormQuoteData = () => {
    if (!form) return null;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const required = ['name', 'email', 'service', 'message'];
    const missing = required.filter((f) => !data[f] || data[f].trim() === '');

    if (missing.length > 0) {
      showFeedback('Veuillez remplir tous les champs obligatoires (*).', true);
      // Highlight first invalid field
      const firstInvalid = form.querySelector(`[name="${missing[0]}"]`);
      if (firstInvalid) firstInvalid.focus();
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showFeedback('Veuillez renseigner une adresse email valide.', true);
      const emailField = form.querySelector('#form-email');
      if (emailField) emailField.focus();
      return null;
    }

    const selectedOption = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex] : null;
    const serviceName = selectedOption ? selectedOption.textContent : data.service;

    return {
      ...data,
      serviceName,
    };
  };

  // Primary: WhatsApp Dispatch
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = getFormQuoteData();
      if (!data) return;

      const waMessage = [
        `📋 *Nouvelle demande de devis — ${CONFIG.COMPANY}*`,
        ``,
        `👤 *Nom :* ${data.name}`,
        `📧 *Email :* ${data.email}`,
        data.phone ? `📞 *Tél :* ${data.phone}` : '',
        `🔧 *Service :* ${data.serviceName}`,
        ``,
        `📝 *Description du projet :*`,
        data.message,
      ]
        .filter(Boolean)
        .join('\n');

      const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Visual button feedback
      const submitBtn = document.getElementById('btn-submit-whatsapp');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Redirection WhatsApp lancée !';
        submitBtn.disabled = true;
        submitBtn.style.background = 'var(--clr-accent)';
        submitBtn.style.borderColor = 'var(--clr-accent)';

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
        }, 3500);
      }

      showFeedback('Votre devis a été préparé pour WhatsApp.');
    });
  }

  // Fallback 1: Direct Email (mailto)
  if (btnSubmitEmail) {
    btnSubmitEmail.addEventListener('click', () => {
      const data = getFormQuoteData();
      if (!data) return;

      const subject = encodeURIComponent(`[Devis SIX SIGMA] ${data.serviceName} - ${data.name}`);
      const body = encodeURIComponent(
        `Bonjour SIX SIGMA,\n\n` +
        `Je souhaite solliciter une étude et un devis pour le projet suivant :\n\n` +
        `• Service concerné : ${data.serviceName}\n` +
        `• Nom / Entreprise : ${data.name}\n` +
        `• Email de contact : ${data.email}\n` +
        (data.phone ? `• Téléphone : ${data.phone}\n` : '') +
        `\nDescription et besoins spécifiques :\n${data.message}\n\n` +
        `Dans l'attente de votre retour,\nCordialement,\n${data.name}`
      );

      window.location.href = `mailto:${CONFIG.EMAIL}?subject=${subject}&body=${body}`;
      showFeedback('Client de messagerie ouvert avec le devis pré-rempli.');
    });
  }

  // Fallback 2: Copy Quote Summary to Clipboard
  if (btnCopyQuote) {
    btnCopyQuote.addEventListener('click', () => {
      const data = getFormQuoteData();
      if (!data) return;

      const summary = [
        `=== DEMANDE DE DEVIS SIX SIGMA ===`,
        `Service : ${data.serviceName}`,
        `Nom / Contact : ${data.name}`,
        `Email : ${data.email}`,
        data.phone ? `Téléphone : ${data.phone}` : null,
        `Projet :`,
        data.message,
        `==================================`,
      ]
        .filter(Boolean)
        .join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(summary)
          .then(() => {
            showFeedback('✅ Récapitulatif copié dans le presse-papier !');
          })
          .catch(() => {
            prompt('Copiez votre récapitulatif de devis ci-dessous :', summary);
          });
      } else {
        prompt('Copiez votre récapitulatif de devis ci-dessous :', summary);
      }
    });
  }

  // ── Counter animation for stats (starts at 0 on scroll, counts to target) ──
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const start = performance.now();

            // Set to 0 at animation onset
            el.textContent = '0' + suffix;

            const animate = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(eased * target);
              el.textContent = current + suffix;

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                el.textContent = target + suffix;
              }
            };

            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  // ── Hero video playback control ──
  const heroVideo = document.querySelector('.hero-video');
  const heroVideoToggle = document.getElementById('btn-hero-video-toggle');

  if (heroVideo && heroVideoToggle) {
    heroVideoToggle.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play().then(() => {
          heroVideoToggle.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Chantier Kolwezi (Direct)</span>';
        }).catch(() => {});
      } else {
        heroVideo.pause();
        heroVideoToggle.innerHTML = '<i class="fa-solid fa-play"></i> <span>Reprendre la vidéo</span>';
      }
    });
  }
});
