/* ============================================
   SIX SIGMA — Interactions & Animations
   Vanilla JS, zero dependencies
   ============================================ */

/* ── Configurable Constants ── */
const CONFIG = {
  PHONE_NUMBER: '+243811149816',            // format international pour lien tel:
  PHONE_DISPLAY: '+243 811 149 816',        // format soigné pour affichage visuel
  WHATSAPP_NUMBER: '243811149816',          // chiffres uniquement sans '+' ni espaces pour wa.me
  EMAIL: 'sixsigmaadministration@gmail.com', // email officiel destinataire
  COMPANY: 'SIX SIGMA',
};

// Images de secours (attribut data-fallback) sans gestionnaire onerror en ligne : compatible CSP stricte.
// Les erreurs d'image ne remontent pas : écoute en phase de capture.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.fallback) return;
  if (img.dataset.fallback === 'hide') {
    img.style.display = 'none';
  } else if (img.getAttribute('src') !== img.dataset.fallback) {
    img.src = img.dataset.fallback;
  }
}, true);

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Échappement HTML des données dynamiques (base Supabase) avant injection via innerHTML — anti-XSS
  const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeRecord = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, typeof v === 'string' ? escapeHtml(v) : v]));

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
    if (mobileMenu) mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (mobileToggle) mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (mobileToggle) mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
  };

  const toggleMobileMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileMenu);
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

  // Attach click handlers to all bento cards, service cards, and project cards with data-service
  const clickableItems = document.querySelectorAll('.bento-card[data-service], .service-card[data-service], .project-card[data-service]');
  clickableItems.forEach((card) => {
    const cta = card.querySelector('.bento-cta, .service-cta, .project-cta-link');
    if (cta) {
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        scrollToFormWithService(card.dataset.service);
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.bento-cta, .service-cta, .project-cta-link')) return;
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

    // Streamlined 4 essential fields
    const required = ['name', 'phone', 'service', 'message'];
    const missing = required.filter((f) => !data[f] || data[f].trim() === '');

    if (missing.length > 0) {
      showFeedback('Veuillez remplir tous les champs obligatoires (*).', true);
      // Highlight first invalid field
      const firstInvalid = form.querySelector(`[name="${missing[0]}"]`);
      if (firstInvalid) firstInvalid.focus();
      return null;
    }

    // Email is optional, but if provided, validate format
    if (data.email && data.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        showFeedback('Veuillez renseigner une adresse email valide ou laisser le champ vide.', true);
        const emailField = form.querySelector('#form-email');
        if (emailField) emailField.focus();
        return null;
      }
    }

    const selectedOption = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex] : null;
    const serviceName = selectedOption ? selectedOption.textContent : data.service;

    return {
      ...data,
      serviceName,
    };
  };

  const saveQuoteToBackend = (data) => {
    if (window.SixSigmaDB && window.SixSigmaDB.quotes) {
      window.SixSigmaDB.quotes.submit({
        nom: data.name,
        email: data.email && data.email.trim() !== '' ? data.email : 'contact@client.cd',
        telephone: data.phone,
        entreprise: data.name,
        service: data.serviceName,
        description: data.message
      }).then(res => {
        // Enregistré avec succès
      }).catch(err => {
        // Fallback silencieux
      });
    }
  };

  // Primary: WhatsApp Dispatch
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = getFormQuoteData();
      if (!data) return;

      // Enregistrement automatique dans Supabase (CMS vitrine)
      saveQuoteToBackend(data);

      const waMessage = [
        `🏗️ *COTATION DIRECTE — ${CONFIG.COMPANY}*`,
        `────────────────────────`,
        `👤 *Nom / Société :* ${data.name}`,
        `📞 *Téléphone / WhatsApp :* ${data.phone}`,
        `📧 *Email :* ${data.email && data.email.trim() !== '' ? data.email : 'Non renseigné'}`,
        `🔧 *Pôle d'expertise :* ${data.serviceName}`,
        `────────────────────────`,
        `📝 *Projet & Localisation :*`,
        data.message,
      ].join('\n');

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

      showFeedback('Votre demande a été enregistrée et préparée pour WhatsApp.');
    });
  }

  // Fallback 1: Direct Email (mailto)
  if (btnSubmitEmail) {
    btnSubmitEmail.addEventListener('click', () => {
      const data = getFormQuoteData();
      if (!data) return;

      saveQuoteToBackend(data);

      const subject = encodeURIComponent(`[Demande de Cotation] ${data.serviceName} - ${data.name}`);
      const body = encodeURIComponent(
        `Bonjour ${CONFIG.COMPANY},\n\n` +
        `Je vous transmets ma demande de cotation pour le projet suivant :\n\n` +
        `• Nom / Société : ${data.name}\n` +
        `• Téléphone / WhatsApp : ${data.phone}\n` +
        `• Email : ${data.email && data.email.trim() !== '' ? data.email : 'Non renseigné'}\n` +
        `• Pôle concerné : ${data.serviceName}\n\n` +
        `Description des travaux & Localisation :\n${data.message}\n\n` +
        `Dans l'attente de votre chiffrage technique,\nCordialement,\n${data.name}`
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
        `=== DEMANDE DE COTATION DIRECTE — ${CONFIG.COMPANY} ===`,
        `• Nom / Société : ${data.name}`,
        `• Téléphone / WhatsApp : ${data.phone}`,
        `• Email : ${data.email && data.email.trim() !== '' ? data.email : 'Non renseigné'}`,
        `• Pôle concerné : ${data.serviceName}`,
        ``,
        `Description & Localisation du chantier :`,
        data.message,
        `======================================================`,
      ].join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(summary)
          .then(() => {
            showFeedback('Récapitulatif copié dans le presse-papier !');
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

  // ── Vidéos économes : rien n'est téléchargé en mode économie de données, en 2G
  //    ou si le visiteur limite les animations (l'image d'affiche reste visible) ──
  const connection = navigator.connection || {};
  const allowVideo = !connection.saveData
    && !/2g$/.test(connection.effectiveType || '')
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const playVideoFrom = (video, url) => {
    if (!video || !url || !allowVideo) return;
    let source = video.querySelector('source');
    if (!source) {
      source = document.createElement('source');
      source.type = 'video/mp4';
      video.appendChild(source);
    }
    if (source.getAttribute('src') === url) return;
    source.src = url;
    video.load();
    video.play().catch(() => {});
  };

  // Vidéos hors hero : chargées seulement à l'approche de l'écran
  const lazyVideos = [...document.querySelectorAll('video:not(.hero-video) source[data-src]')].map((s) => s.parentElement);
  if (lazyVideos.length && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        videoObserver.unobserve(entry.target);
        playVideoFrom(entry.target, entry.target.querySelector('source').dataset.src);
      });
    }, { rootMargin: '300px 0px' });
    lazyVideos.forEach((v) => videoObserver.observe(v));
  }

  // ── Hero video playback control ──
  const heroVideo = document.querySelector('.hero-video');
  const heroVideoToggle = document.getElementById('btn-hero-video-toggle');

  // Sans vidéo (économie de données), le bouton lecture/pause n'a pas de sens
  if (!allowVideo) {
    const heroVideoControls = document.querySelector('.hero-video-controls');
    if (heroVideoControls) heroVideoControls.hidden = true;
  }

  if (heroVideo && heroVideoToggle) {
    heroVideoToggle.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play().then(() => {
          heroVideoToggle.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Opérations en direct</span>';
        }).catch(() => {});
      } else {
        heroVideo.pause();
        heroVideoToggle.innerHTML = '<i class="fa-solid fa-play"></i> <span>Reprendre la vidéo</span>';
      }
    });
  }

  // ── PROJECT DETAIL MODAL & DYNAMIC SUPABASE HYDRATION ──
  const projectData = {
    'genie-civil': {
      img: 'projet-genie-civil-minier.jpg',
      video: null,
      title: 'Plateforme Minière & Terrassement de Grande Envergure',
      location: 'Site Minier Industriel, RDC',
      badges: [
        { text: 'Génie Civil Minier', icon: 'fa-mountain-sun', type: 'primary' },
        { text: 'En exploitation', icon: 'fa-check', type: 'success' }
      ],
      desc: 'Terrassement massif et nivellement de plateformes pour unités de concassage et traitement de minerai. Fondations profondes en béton armé haute résistance (C35/45), ouvrages hydrauliques de rétention des eaux et des résidus miniers, et pistes renforcées pour convois de 120 tonnes. Application rigoureuse des protocoles HSE avec tolérance zéro incident (Zero LTI).',
      stats: [
        { value: '45 000 m³', label: 'Terrassement' },
        { value: '2 800 m³', label: 'Béton coulé' },
        { value: '0 LTI', label: 'Accidents' },
        { value: '14', label: 'Engins mobilisés' },
        { value: '120+', label: 'Ouvriers déployés' },
        { value: '8 mois', label: 'Délai livraison' }
      ],
      tags: ['Terrassement massif', 'Béton armé C35/45', 'Sécurité HSE', 'Ouvrages hydrauliques', 'Pistes minières', 'Fondations profondes']
    },
    'construction-metallique': {
      img: 'projet-construction-metallique.jpg',
      video: null,
      title: 'Complexe Industriel & Charpente Métallique Grande Portée',
      location: 'Zone Industrielle & Logistique',
      badges: [
        { text: 'Construction Métallique', icon: 'fa-industry', type: 'primary' },
        { text: 'Livré clés en main', icon: 'fa-check', type: 'success' }
      ],
      desc: 'Conception, fabrication en atelier et érection sur site d\'une charpente métallique industrielle à grande portée (30m libre). Structure intégrant des mezzanines avec bureaux administratifs, un bardage haute durabilité en tôle prélaquée, une dalle béton renforcée fibre et des chemins de roulement pour pont roulant de 10 tonnes.',
      stats: [
        { value: '480 T', label: 'Acier structurel' },
        { value: '2 200 m²', label: 'Surface couverte' },
        { value: '30 m', label: 'Portée libre' },
        { value: '10 T', label: 'Pont roulant' },
        { value: '85', label: 'Soudeurs & monteurs' },
        { value: '6 mois', label: 'Délai livraison' }
      ],
      tags: ['Charpente acier', 'Grande portée', 'Bureaux intégrés', 'Usinage certifié', 'Bardage prélaqué', 'Pont roulant']
    }
  };

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('minier') || cat.includes('terrassement')) return 'fa-mountain-sun';
    if (cat.includes('méta') || cat.includes('industriel') || cat.includes('hangar')) return 'fa-industry';
    if (cat.includes('route') || cat.includes('voirie')) return 'fa-road';
    if (cat.includes('bureau') || cat.includes('étude')) return 'fa-compass-drafting';
    return 'fa-helmet-safety';
  };

  const getServiceSlug = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('méta')) return 'construction-metallique';
    if (cat.includes('locat') || cat.includes('engin')) return 'location-equipements';
    if (cat.includes('assainiss') || cat.includes('drainage')) return 'assainissement';
    return 'genie-civil';
  };

  const parseProjectMetrics = (metrics) => {
    if (!metrics) return [];
    if (Array.isArray(metrics)) return metrics;
    const stats = [];
    if (typeof metrics === 'object') {
      for (const [k, v] of Object.entries(metrics)) {
        if (!v) continue;
        let label = k;
        if (k === 'volume_terrassement' || k === 'metrique1') label = 'Terrassement';
        else if (k === 'duree' || k === 'metrique2') label = 'Délai';
        else if (k === 'zero_lti' || k === 'metrique3') label = 'Sécurité';
        else if (k === 'acier_monte') label = 'Structure Acier';
        else if (k === 'superficie') label = 'Superficie';
        else if (k === 'pont_roulant') label = 'Équipement';
        stats.push({ value: String(v), label: label });
      }
    }
    return stats;
  };

  const modalOverlay = document.getElementById('project-modal-overlay');
  const modalClose = document.getElementById('modal-close');

  const openProjectModal = (projectKey) => {
    const data = projectData[projectKey];
    if (!data || !modalOverlay) return;

    // Fill modal media (Image or Video)
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');

    if (data.video) {
      if (modalVideo) {
        modalVideo.src = data.video;
        modalVideo.style.display = 'block';
        modalVideo.play().catch(() => {});
      }
      if (modalImg) modalImg.style.display = 'none';
    } else {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.src = '';
        modalVideo.style.display = 'none';
      }
      if (modalImg) {
        modalImg.src = data.img;
        modalImg.alt = data.title;
        modalImg.style.display = 'block';
      }
    }

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-location-text').textContent = data.location;
    document.getElementById('modal-desc').textContent = data.desc;

    // Badges
    const badgesEl = document.getElementById('modal-badges');
    badgesEl.innerHTML = data.badges.map(b =>
      `<span class="badge badge-${b.type}"><i class="fa-solid ${b.icon}"></i> ${escapeHtml(b.text)}</span>`
    ).join('');

    // Stats
    const statsEl = document.getElementById('modal-stats');
    statsEl.innerHTML = data.stats.map(s =>
      `<div class="project-modal-stat">
        <div class="project-modal-stat-value">${escapeHtml(s.value)}</div>
        <div class="project-modal-stat-label">${escapeHtml(s.label)}</div>
      </div>`
    ).join('');

    // Tags
    const tagsEl = document.getElementById('modal-tags');
    tagsEl.innerHTML = data.tags.map(t =>
      `<span class="project-tag">${escapeHtml(t)}</span>`
    ).join('');

    // Open
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    if (!modalOverlay) return;
    const modalVideo = document.getElementById('modal-video');
    if (modalVideo) {
      modalVideo.pause();
    }
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close triggers
  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProjectModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  // Modal CTA quote closes modal and scrolls to form
  const modalCtaQuote = document.getElementById('modal-cta-quote');
  if (modalCtaQuote) {
    modalCtaQuote.addEventListener('click', (e) => {
      e.preventDefault();
      closeProjectModal();
      const ct = document.getElementById('contact');
      if (ct) ct.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Open triggers — "Voir la fiche technique" buttons
  document.querySelectorAll('.project-view-btn[data-project]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openProjectModal(btn.dataset.project);
    });
  });

  // ── HYDRATATION DYNAMIQUE DES CHANTIERS DEPUIS SUPABASE ──
  const hydrateChantiers = async () => {
    const grid = document.getElementById('chantiers-dynamiques-grid');
    if (!grid) return;

    if (!window.SixSigmaDB || !window.SixSigmaDB.chantiers) return;

    try {
      const projects = await window.SixSigmaDB.chantiers.getAll();
      if (!Array.isArray(projects)) return;

      // Vider la grille : la base fait foi, y compris quand l'admin a retiré tous les chantiers
      grid.innerHTML = '';
      if (projects.length === 0) {
        grid.innerHTML = '<p class="projects-empty">Nos nouvelles réalisations seront publiées très prochainement.</p>';
        return;
      }

      projects.forEach((p, idx) => {
        const projKey = p.id || `proj-${idx}`;
        const serviceSlug = getServiceSlug(p.category);
        const icon = getCategoryIcon(p.category);
        const hasVideo = Boolean(p.video_url && p.video_url.trim() !== '');

        // Extraction et structuration des métriques
        const parsedStats = parseProjectMetrics(p.metrics);
        const tags = [
          p.category,
          p.client,
          p.location,
          ...parsedStats.map(s => `${s.label}: ${s.value}`)
        ].filter(Boolean);

        // Mémorisation dans projectData pour la fiche technique modale
        projectData[projKey] = {
          img: p.image_url || 'projet-genie-civil-minier.jpg',
          video: p.video_url || null,
          title: p.title,
          location: (p.location || 'RDC') + (p.client ? ` • Client : ${p.client}` : ''),
          badges: [
            { text: p.category || 'Génie Civil', icon: icon, type: 'primary' },
            { text: p.completion_date ? `Livré en ${p.completion_date}` : 'Livré clés en main', icon: 'fa-check', type: 'success' },
            ...(hasVideo ? [{ text: 'Vidéo HD', icon: 'fa-play', type: 'accent' }] : [])
          ],
          desc: p.description || 'Chantier d\'envergure exécuté selon les plus hauts standards d\'ingénierie et de conformité HSE.',
          stats: parsedStats.length > 0 ? parsedStats : [
            { value: p.completion_date || '2024', label: 'Année' },
            { value: '0 LTI', label: 'Sécurité HSE' }
          ],
          tags: tags.length > 0 ? tags : ['Ingénierie BTP', 'Qualité certifiée', 'Sécurité HSE']
        };

        // Création carte DOM
        const card = document.createElement('article');
        card.className = `project-card reveal visible`;
        card.dataset.service = serviceSlug;

        const sp = safeRecord(p);
        const mediaHtml = hasVideo
          ? `<video src="${sp.video_url}" playsinline autoplay muted loop poster="${sp.image_url || 'projet-genie-civil-minier.jpg'}" class="project-img project-video" preload="metadata"></video>`
          : `<img src="${sp.image_url || 'projet-genie-civil-minier.jpg'}" alt="${sp.title}" class="project-img" loading="lazy" data-fallback="projet-genie-civil-minier.jpg" />`;

        const tagsHtml = tags.slice(0, 4).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('');

        card.innerHTML = `
          <div class="project-image-wrapper">
            ${mediaHtml}
            <div class="project-badges">
              <span class="badge badge-primary"><i class="fa-solid ${icon}"></i> ${sp.category || 'Génie Civil'}</span>
              <span class="badge badge-success"><i class="fa-solid fa-check"></i> ${sp.completion_date || 'En exploitation'}</span>
              ${hasVideo ? '<span class="badge badge-accent" style="background: rgba(14,165,233,0.95);"><i class="fa-solid fa-play"></i> Vidéo HD</span>' : ''}
            </div>
          </div>
          <div class="project-body">
            <div class="project-meta">
              <span class="project-location"><i class="fa-solid fa-location-dot"></i> ${sp.location || 'RDC'}</span>
              <span class="project-scale"><i class="fa-solid fa-layer-group"></i> ${sp.client || 'Infrastructure'}</span>
            </div>
            <h3 class="project-title">${sp.title}</h3>
            <p class="project-desc">${sp.description || ''}</p>
            <div class="project-tags">
              ${tagsHtml}
            </div>
            <div class="project-footer">
              <button class="project-view-btn" data-project="${projKey}">
                Voir la fiche technique <i class="fa-solid fa-arrow-right"></i>
              </button>
              <a href="#contact" class="service-cta project-cta-link" data-service="${serviceSlug}">
                Demander une étude similaire <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        `;

        // Événements boutons et carte
        const viewBtn = card.querySelector('.project-view-btn');
        if (viewBtn) {
          viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openProjectModal(projKey);
          });
        }

        const ctaLink = card.querySelector('.project-cta-link');
        if (ctaLink) {
          ctaLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToFormWithService(serviceSlug);
          });
        }

        card.addEventListener('click', (e) => {
          if (e.target.closest('.project-view-btn, .project-cta-link')) return;
          openProjectModal(projKey);
        });

        grid.appendChild(card);
      });
    } catch (err) {
      console.warn('Erreur lors de l\'hydratation dynamique des chantiers:', err);
    }
  };

  // ── HYDRATATION DU HERO VIDÉO DEPUIS SUPABASE SETTINGS ──
  // La vidéo réglée dans /sixgestion est lue en priorité ; un seul téléchargement au total
  const hydrateHeroVideo = async () => {
    const heroVideoEl = document.querySelector('.hero-video');
    if (!heroVideoEl) return;
    const defaultSource = heroVideoEl.querySelector('source[data-src]');
    let url = defaultSource ? defaultSource.dataset.src : null;
    try {
      if (window.SixSigmaDB && window.SixSigmaDB.settings) {
        const customHeroUrl = await window.SixSigmaDB.settings.get('hero_video_url');
        if (customHeroUrl && customHeroUrl.trim() !== '') url = customHeroUrl.trim();
      }
    } catch (e) {
      console.info('Hero video hydration skipped:', e);
    }
    playVideoFrom(heroVideoEl, url);
  };

  // Lancement des hydratations Supabase
  hydrateChantiers();
  hydrateHeroVideo();

  // Écoute des mises à jour dynamiques émises par le portail /sixgestion ou Supabase Realtime
  window.addEventListener('sixsigma:chantiers_changed', hydrateChantiers);
  window.addEventListener('sixsigma:settings_changed', hydrateHeroVideo);
  window.addEventListener('sixsigma:data_updated', (e) => {
    const key = (e.detail && e.detail.key) || '';
    if (key.includes('project') || key.includes('chantier')) {
      hydrateChantiers();
    }
    if (key.includes('hero') || key.includes('setting')) {
      hydrateHeroVideo();
    }
  });

  // ── REAL-TIME FORM VALIDATION ──
  const formFields = form ? form.querySelectorAll('.form-input, .form-select, .form-textarea') : [];

  const validateField = (field) => {
    const name = field.name;
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');

    // Remove old state
    field.classList.remove('valid', 'invalid');

    // Don't validate empty optional fields
    if (!isRequired && value === '') return;

    let isValid = false;

    if (name === 'email') {
      // Optional but if filled, must be valid
      if (value === '') {
        return; // optional and empty = no indicator
      }
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    } else if (name === 'phone') {
      isValid = value.length >= 8;
    } else if (name === 'service') {
      isValid = value !== '';
    } else {
      isValid = value.length >= 2;
    }

    field.classList.add(isValid ? 'valid' : 'invalid');
  };

  formFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      // Clear invalid state on input (re-validate on blur)
      if (field.classList.contains('invalid') && field.value.trim().length >= 2) {
        field.classList.remove('invalid');
        field.classList.add('valid');
      }
    });
    if (field.tagName === 'SELECT') {
      field.addEventListener('change', () => validateField(field));
    }
  });

  // ── FAQ ACCORDION INTERACTIVITY ──
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── COOKIE CONSENT BANNER ──
  const cookieBanner = document.getElementById('cookie-banner');
  const btnCookieAccept = document.getElementById('btn-cookie-accept');
  const btnCookieDecline = document.getElementById('btn-cookie-decline');

  if (cookieBanner) {
    const currentConsent = localStorage.getItem('sixsigma_cookie_consent');
    if (!currentConsent) {
      setTimeout(() => {
        cookieBanner.style.display = 'block';
      }, 600);
    }

    if (btnCookieAccept) {
      btnCookieAccept.addEventListener('click', () => {
        localStorage.setItem('sixsigma_cookie_consent', 'accepted');
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          cookieBanner.style.display = 'none';
        }, 300);
      });
    }

    if (btnCookieDecline) {
      btnCookieDecline.addEventListener('click', () => {
        localStorage.setItem('sixsigma_cookie_consent', 'declined');
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          cookieBanner.style.display = 'none';
        }, 300);
      });
    }
  }

  // Raccourci secret d'accès direct pour l'administrateur (Ctrl + Shift + A)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'sixgestion.html';
    }
  });

});

