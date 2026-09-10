/**
 * SIX SIGMA — MODULE D'INTERNATIONALISATION (FR / EN)
 * Prise en charge bilingue instantanée pour consortiums miniers internationaux
 */

const TRANSLATIONS = {
  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_services: 'Services',
    nav_fleet: 'Parc Matériel',
    nav_projects: 'Réalisations',
    nav_hse: 'Charte HSE',
    nav_about: 'À propos',
    nav_contact: 'Contact',
    nav_quote_btn: 'Devis Express',
    btn_erp: 'Portail Client ERP',

    // Hero Home
    hero_badge: 'Génie Civil Industriel, Minier & BTP',
    hero_title: 'Génie Civil Minier & Construction Métallique',
    hero_subtitle: 'SIX SIGMA conçoit, bâtit et livre vos infrastructures lourdes où que vos chantiers l\'exigent. Flotte d\'engins mobilisable sous 24-48h et équipes d\'ingénieurs certifiées HSE pour tous vos projets d\'envergure.',
    hero_cta_quote: 'Demander une cotation',
    hero_cta_services: 'Découvrir nos expertises',
    trust_mob_val: 'Mobilisation 24-48h',
    trust_mob_lbl: 'Flotte lourde & engins de terrassement',
    trust_hse_val: 'Normes HSE Internationales',
    trust_hse_lbl: 'Zéro compromis sur la sécurité terrain',
    trust_del_val: 'Livraison Clé en Main',
    trust_del_lbl: 'Respect des plannings et des budgets',

    // Services Bento
    services_label: 'Nos expertises',
    services_title: 'Un savoir-faire complet au service de vos projets',
    services_desc: 'De la conception à la réalisation, SIX SIGMA couvre l\'intégralité de la chaîne de valeur du BTP et de l\'ingénierie.',
    bento_lead_badge: 'Pôle d\'Excellence • Travaux Lourds',
    bento_lead_title: 'Génie Civil Minier & Terrassement Lourd',
    bento_lead_desc: 'Conception et exécution d\'infrastructures minières de grande envergure : plateformes industrielles, radiers armés, fondations profondes, bassins de rétention et pistes pour convois lourds.',
    bento_steel_badge: 'Charpente Acier',
    bento_steel_title: 'Construction Métallique & Hangars',
    bento_steel_desc: 'Fabrication, usinage et levage de charpentes acier haute portée, hangars de stockage minier, passerelles et structures mécano-soudées certifiées.',
    bento_fleet_title: 'Location d\'Engins Lourds',
    bento_fleet_desc: 'Pelles hydrauliques, compacteurs, niveleuses et camions bennes mobilisables sous 24-48h avec chauffeurs formés aux exigences HSE.',
    bento_fleet_cta: 'Consulter le parc matériel',

    // Parc Matériel
    fleet_hero_badge: 'Flotte Industrielle & Minière • Disponibilité Immédiate',
    fleet_hero_title: 'Parc Matériel & Engins Lourds Haute Performance',
    fleet_hero_subtitle: 'Pelles d\'extraction, dumpers articulés, niveleuses, bulldozers et générateurs industriels forte puissance. Flotte certifiée, rigoureusement entretenue et prête à la mobilisation sous 24 à 48 heures.',
    fleet_tab_all: 'Tous les engins',
    fleet_tab_earth: 'Terrassement & Pelles',
    fleet_tab_trans: 'Transport & Dumpers',
    fleet_tab_lift: 'Levage & Manutention',
    fleet_tab_energy: 'Énergie & Pompage',
    fleet_tab_comp: 'Compactage & Pistes',
    fleet_search_ph: 'Rechercher par nom, marque (CAT, Komatsu...), tonnage, kW...',
    fleet_res_title: 'Réservation d\'Engins & Mobilisation Express',

    // HSE
    hse_hero_badge: 'Engagement Institutionnel • Zéro Compromis',
    hse_hero_title: 'Politique HSE, Intégrité Humaine & Sécurité Opérationnelle',
    hse_hero_subtitle: 'Sur chaque chantier minier et industriel, la vie humaine et la préservation de l\'environnement prévalent sur toute autre considération. Notre engagement : Objectif Zéro Accident et respect des normes internationales les plus strictes.',
    hse_pillars_badge: 'Principes Fondamentaux',
    hse_pillars_title: 'Les 5 Piliers Inviolables de Notre Charte HSE',

    // Footer
    footer_brand_desc: 'Constructeur et opérateur de référence en génie civil industriel, construction métallique et travaux lourds.',
    footer_emergency: 'Permanence technique 24/7',
    footer_emergency_sub: 'Astreinte chantier & mobilisation d\'urgence',
    footer_rights: '© 2026 SIX SIGMA S.A.S. Tous droits réservés.'
  },

  en: {
    // Navigation
    nav_home: 'Home',
    nav_services: 'Services',
    nav_fleet: 'Heavy Fleet',
    nav_projects: 'Projects',
    nav_hse: 'HSE Charter',
    nav_about: 'About Us',
    nav_contact: 'Contact',
    nav_quote_btn: 'Fast Quote',
    btn_erp: 'Client ERP Portal',

    // Hero Home
    hero_badge: 'Industrial, Mining & Civil Engineering',
    hero_title: 'Mining Civil Engineering & Steel Construction',
    hero_subtitle: 'SIX SIGMA designs, engineers and executes heavy infrastructure wherever your site demands. Heavy equipment fleet ready within 24-48h and HSE certified engineering crews for all major ventures.',
    hero_cta_quote: 'Request a Quote',
    hero_cta_services: 'Explore Our Capabilities',
    trust_mob_val: '24-48h Deployment',
    trust_mob_lbl: 'Heavy fleet & earthmoving machinery',
    trust_hse_val: 'International HSE Standards',
    trust_hse_lbl: 'Zero compromise on site safety',
    trust_del_val: 'Turnkey Delivery',
    trust_del_lbl: 'Strict adherence to schedule & budget',

    // Services Bento
    services_label: 'Our Expertise',
    services_title: 'Comprehensive Engineering Across the Project Lifecycle',
    services_desc: 'From initial design to final handover, SIX SIGMA covers the full value chain of civil and industrial engineering.',
    bento_lead_badge: 'Core Division • Heavy Works',
    bento_lead_title: 'Mining Civil Engineering & Bulk Earthworks',
    bento_lead_desc: 'Design and construction of large-scale mining infrastructure: industrial platforms, reinforced slabs, deep foundations, retention ponds and heavy haul roads.',
    bento_steel_badge: 'Structural Steel',
    bento_steel_title: 'Structural Steel & Industrial Warehouses',
    bento_steel_desc: 'Fabrication, machining and erection of long-span steel trusses, mining storage sheds, conveyor bridges and certified welded assemblies.',
    bento_fleet_title: 'Heavy Equipment Rental',
    bento_fleet_desc: 'Hydraulic excavators, compactors, motor graders and dump trucks mobilized within 24-48 hours with HSE trained certified operators.',
    bento_fleet_cta: 'View equipment fleet',

    // Parc Matériel
    fleet_hero_badge: 'Industrial & Mining Fleet • Ready for Dispatch',
    fleet_hero_title: 'High-Performance Heavy Equipment & Mining Fleet',
    fleet_hero_subtitle: 'Mining excavators, articulated haulers, motor graders, bulldozers and heavy industrial diesel generators. Fully certified, systematically serviced and ready to deploy in 24-48 hours.',
    fleet_tab_all: 'All Equipment',
    fleet_tab_earth: 'Earthmoving & Excavators',
    fleet_tab_trans: 'Haulage & Dumpers',
    fleet_tab_lift: 'Lifting & Material Handling',
    fleet_tab_energy: 'Power & Dewatering',
    fleet_tab_comp: 'Compaction & Roadworks',
    fleet_search_ph: 'Search by model, brand (CAT, Komatsu...), tonnage, kW...',
    fleet_res_title: 'Equipment Booking & Fast Mobilization',

    // HSE
    hse_hero_badge: 'Corporate Commitment • Zero Compromise',
    hse_hero_title: 'HSE Policy, Human Integrity & Operational Safety',
    hse_hero_subtitle: 'On every mining and industrial site, human safety and environmental protection supersede all operational priorities. Our commitment: Zero Harm Goal and compliance with international standards.',
    hse_pillars_badge: 'Core Principles',
    hse_pillars_title: 'The 5 Inviolable Pillars of Our HSE Charter',

    // Footer
    footer_brand_desc: 'Leading contractor in industrial civil engineering, structural steel, and heavy earthmoving works.',
    footer_emergency: '24/7 Technical On-Call',
    footer_emergency_sub: 'Site emergency standby & rapid deployment',
    footer_rights: '© 2026 SIX SIGMA S.A.S. All rights reserved.'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('sixsigma_lang') || 'fr';
    this.init();
  }

  init() {
    this.applyTranslations(this.currentLang);
    this.updateToggleUI(this.currentLang);
    this.bindEvents();
  }

  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('sixsigma_lang', lang);
    document.documentElement.lang = lang;
    this.applyTranslations(lang);
    this.updateToggleUI(lang);
  }

  applyTranslations(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    // Text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
  }

  updateToggleUI(lang) {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  bindEvents() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const selectedLang = e.currentTarget.getAttribute('data-lang');
        if (selectedLang) {
          this.setLanguage(selectedLang);
        }
      });
    });
  }
}

// Initialisation globale
window.i18n = new I18nManager();
