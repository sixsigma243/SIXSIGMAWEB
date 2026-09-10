/**
 * SIX SIGMA — PARC MATÉRIEL & FLOTTE D'ENGINS
 * Gestion interactive du catalogue, filtres, recherche, modale technique & réservations
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Données Techniques Détaillées des Machines ──
  const MACHINES_DATA = {
    'cat-336d2l': {
      ref: 'EXC-01',
      title: 'Pelle Chenillée CAT 336D2 L',
      category: 'Terrassement & Extraction',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      weight: '36.5 Tonnes',
      power: '238 kW / 320 ch',
      bucket: '2.41 m³ renforcé HD',
      depth: '7.54 mètres',
      reach: '11.1 mètres',
      engine: 'Cat C9 ACERT™ Tier 3',
      fuel: 'Consommation optimisée eco-mode',
      features: [
        'Cabine pressurisée insonorisée ROPS/FOPS',
        'Système d’extinction incendie automatique',
        'Ligne hydraulique auxiliaire pour brise-roche (BRH)',
        'Système télématique Cat Product Link™ GPS',
        'Caméra de recul et éclairage de chantier LED 360°',
        'Contrat de maintenance préventive certifié'
      ],
      mobilization: 'Sous 24 à 48 heures sur site',
      operator: 'Opérateur certifié CACES Niveau 4 inclus ou en option'
    },
    'komatsu-pc400': {
      ref: 'EXC-02',
      title: 'Pelle Lourde Komatsu PC400-8R',
      category: 'Terrassement & Extraction',
      status: 'Mobilisable sous 24h',
      statusClass: 'available',
      weight: '42.0 Tonnes',
      power: '257 kW / 345 ch',
      bucket: '2.80 m³ rocheux haute résistance',
      depth: '7.85 mètres',
      reach: '11.8 mètres',
      engine: 'Komatsu SAA6D125E-5',
      fuel: 'Rendement haute productivité carrière',
      features: [
        'Châssis extra-lourd renforcé pour roche abrasive',
        'Blindage ventral et protections vérins d’origine',
        'Contrôle hydropneumatique avancé KOMTRAX™',
        'Cabine climatisée grand confort anti-vibrations',
        'Arrêt d’urgence déporté et coupe-batterie cadenassable',
        'Inspection technique et carnet d’entretien à jour'
      ],
      mobilization: 'Sous 24 à 48 heures',
      operator: 'Opérateur expérimenté mines inclus'
    },
    'cat-320gc': {
      ref: 'EXC-03',
      title: 'Pelle Polyvalente CAT 320 GC',
      category: 'Terrassement & Extraction',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      weight: '20.5 Tonnes',
      power: '108 kW / 145 ch',
      bucket: '1.19 m³ universel',
      depth: '6.72 mètres',
      reach: '9.86 mètres',
      engine: 'Cat C4.4 Électronique',
      fuel: 'Consommation réduite jusqu’à -20%',
      features: [
        'Idéale pour tranchées, fondations et voiries',
        'Attache rapide hydraulique universelle',
        'Climatisation automatique et filtration d’air',
        'Capteurs de profondeur et assistance au nivellement',
        'Balises de sécurité réfléchissantes et gyrophares flash'
      ],
      mobilization: 'Sous 24 heures',
      operator: 'Opérateur polyvalent qualifié'
    },
    'cat-d8r': {
      ref: 'BUL-01',
      title: 'Bulldozer CAT D8R Série II',
      category: 'Terrassement & Extraction',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      weight: '37.8 Tonnes',
      power: '246 kW / 330 ch',
      blade: 'Lame Semi-U 8.7 m³ avec ripper mono-dent',
      groundPressure: '0.82 kg/cm²',
      engine: 'Cat 3406C DITA mécanique robuste',
      features: [
        'Ripper lourd réglable pour roche compacte et décapage',
        'Transmission Power Shift planétaire 3F/3R',
        'Cabine climatisée renforcée avec arceau ROPS certifié',
        'Réservoir carburant grande autonomie (625 L)',
        'Tension chenilles automatique et galets lubrifiés à vie'
      ],
      mobilization: 'Sous 48 heures sur porte-char',
      operator: 'Chef de machine terrassement lourd'
    },
    'cat-140k': {
      ref: 'NIV-01',
      title: 'Niveleuse de Précision CAT 140K',
      category: 'Terrassement & Extraction',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      weight: '17.5 Tonnes',
      power: '141 kW / 190 ch',
      blade: 'Bouclier 4.2 mètres à déport hydraulique',
      features: [
        'Reprofilage de pistes minières et plateformes industrielles',
        'Ripper arrière 5 dents et scarificateur avant',
        'Commandes électro-hydrauliques douces haute précision',
        'Transmission à entraînement direct avec blocage différentiel',
        'Gyrophare et rampe LED de travail nocturne'
      ],
      mobilization: 'Sous 24h à 48h',
      operator: 'Niveleur expert pistes & finitions'
    },
    'bomag-bw219': {
      ref: 'CMP-01',
      title: 'Compacteur Vibrant BOMAG BW 219 D-5',
      category: 'Compactage & Pistes',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      weight: '19.4 Tonnes (charge linéaire 62 kg/cm)',
      power: '150 kW / 204 ch',
      drumWidth: '2 130 mm (cylindre monobloc lisse)',
      features: [
        'Double fréquence et double amplitude de vibration',
        'Système de mesure de compactage continu Terrameter',
        'Capacité de franchissement exceptionnelle jusqu’à 55%',
        'Cabine grand angle avec visibilité panoramique',
        'Kit pieds-dameurs (coquilles dameuses) disponible en option'
      ],
      mobilization: 'Immédiate sous 24h',
      operator: 'Conducteur de compacteur expérimenté'
    },
    'volvo-a40g': {
      ref: 'TRN-01',
      title: 'Tombereau Articulé Volvo A40G',
      category: 'Transport & Dumpers',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      payload: '39 000 kg / 39 Tonnes',
      capacity: '24.0 m³ SAE 2:1',
      power: '350 kW / 476 ch',
      speed: '57 km/h max',
      engine: 'Volvo D13J Tier 4F / Stage IV',
      features: [
        'Traction intégrale 6x6 avec blocages différentiels automatiques',
        'Système de freinage humide sans entretien',
        'Benne chauffée et blindage Hardox 450 contre l’usure',
        'Pesage embarqué On-Board Weighing (OBW) en temps réel',
        'Cabine Care Cab certifiée ROPS/FOPS climatisée'
      ],
      mobilization: 'Mobilisable en flotte (jusqu’à 4 unités)',
      operator: 'Chauffeur dumper minier certifié'
    },
    'mercedes-arocs': {
      ref: 'TRN-02',
      title: 'Camion-Benne Mercedes-Benz Arocs 4142 8x4',
      category: 'Transport & Dumpers',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      payload: '32 000 kg / PTAC 41T',
      body: 'Benne Meiller-Kipper rocheuse 20 m³',
      power: '310 kW / 421 ch',
      engine: 'OM 471 6 cylindres en ligne Turbo',
      features: [
        'Suspensions mécaniques ultra-renforcées pistes difficiles',
        'Plaque de protection sous radiateur et carter moteur',
        'Échappement vertical pour zone minière',
        'Ralentisseur Voith et frein moteur haute puissance',
        'Pneus carrières mixtes 325/95 R24'
      ],
      mobilization: 'Disponibilité immédiate en pool de 6 camions',
      operator: 'Chauffeur poids lourd minier'
    },
    'porte-char-man': {
      ref: 'TRN-03',
      title: 'Ensemble Porte-Engins MAN TGS 33.400 6x4 + Remorque 60T',
      category: 'Transport & Dumpers',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      payload: '60 Tonnes utiles',
      trailer: 'Col de cygne détachable et rampes hydrauliques',
      power: '294 kW / 400 ch',
      features: [
        'Transport lourd d’engins chenillés (pelles, bulldozers, foreuses)',
        'Suspension pneumatique arrière avec réglage de hauteur',
        'Gyrophare convoi exceptionnel et panneaux réglementaires',
        'Treuil hydraulique de halage embarqué 25 Tonnes',
        'Véhicule escorte pilote disponible pour transferts inter-sites'
      ],
      mobilization: 'Sur réservation préalable 24h',
      operator: 'Équipage convoi lourd expérimenté'
    },
    'liebherr-ltm': {
      ref: 'LEV-01',
      title: 'Grue Mobile Tout-Terrain Liebherr LTM 1060-3.1',
      category: 'Levage & Manutention',
      status: 'Mobilisable sous 24h',
      statusClass: 'available',
      capacity: '60 Tonnes à 2.1 m',
      boom: 'Flèche télescopique 48.0 m (+ fléchette 16 m)',
      hookHeight: 'Jusqu’à 63 mètres',
      drive: '6x6x6 direction et transmission intégrales',
      features: [
        'Calculateur de charge LICCON 2 avec contrôle des stabilisateurs VarioBase®',
        'Contrepoids modulable jusqu’à 12.8 Tonnes',
        'Contrôle annuel de levage et certificat d’épreuve à jour',
        'Parfaite pour montage de charpentes métalliques et usines',
        'Palonnier et élingues certifiées fournis'
      ],
      mobilization: 'Sous 24h à 48h selon site',
      operator: 'Grutier hautement certifié avec chef de manœuvre'
    },
    'manitou-mtx': {
      ref: 'LEV-02',
      title: 'Chariot Télescopique Manitou MT-X 1840',
      category: 'Levage & Manutention',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      capacity: '4 000 kg (4.0 Tonnes)',
      liftHeight: '17.55 mètres',
      forwardReach: '13.08 mètres',
      power: '75 kW / 101 ch',
      features: [
        'Quatre roues motrices et directrices (marche en crabe)',
        'Fourches à palettes, godet malaxeur et nacelle 365 kg',
        'Stabilisateurs avant indépendants avec correction de dévers',
        'Arrêt d’urgence et coupe-mouvement de surcharge automatique',
        'Parfait pour logistique de magasin minier et échafaudages'
      ],
      mobilization: 'Immédiate sous 24h',
      operator: 'Cariste certifié CACES R482'
    },
    'cummins-1100': {
      ref: 'NRG-01',
      title: 'Groupe Électrogène Insonorisé Cummins C1100 D5 (1100 kVA)',
      category: 'Énergie & Pompage',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      capacity: '1 100 kVA Prime / 1 250 kVA Standby (880 kW)',
      voltage: '400V Triphasé 50 Hz (configurable)',
      engine: 'Cummins QST30-G4 V12 Turbo Diesel',
      noiseLevel: '75 dB(A) à 7 mètres (conteneur 20 pieds insonorisé)',
      features: [
        'Réservoir carburant journalier intégré avec double paroi',
        'Module de synchronisation et couplage réseau PowerCommand®',
        'Disjoncteur motorisé et inverseur de source automatique (ATS)',
        'Contrat d’astreinte technique et ravitaillement carburant optionnel',
        'Idéal pour alimentation camp de base minier et usine de traitement'
      ],
      mobilization: 'Sous 24 heures (livraison et raccordement par nos équipes)',
      operator: 'Technicien électromécanicien d’astreinte'
    },
    'sykes-hh160': {
      ref: 'NRG-02',
      title: 'Motopompe d’Exhaure Minière Sykes HH160i Haute Pression',
      category: 'Énergie & Pompage',
      status: 'Disponible immédiatement',
      statusClass: 'available',
      flow: 'Débit max : 600 m³/heure (166 L/sec)',
      head: 'Hauteur Manométrique (HMT) : jusqu’à 105 mètres',
      solids: 'Passage de matières solides : 45 mm',
      engine: 'Moteur Diesel insonorisé avec démarrage automatique',
      features: [
        'Amorçage automatique ultra-rapide par compresseur à sec',
        'Roue en acier inoxydable duplex résistante aux eaux acides de mine',
        'Châssis luge ou remorque de chantier tout-terrain',
        'Flotteurs de niveau pour régulation automatique de puisard',
        'Lignes de tuyauteries rigides et flexibles PEHD disponibles en stock'
      ],
      mobilization: 'Immédiate sous 24h',
      operator: 'Équipe de pose et raccordement dédiée'
    }
  };

  // ── Éléments DOM ──
  const searchInput = document.getElementById('fleet-search');
  const clearSearchBtn = document.getElementById('fleet-search-clear');
  const filterTabs = document.querySelectorAll('.fleet-tab');
  const machineCards = document.querySelectorAll('.machine-card');
  const resultsCountEl = document.getElementById('results-count');
  const noResultsEl = document.getElementById('fleet-no-results');

  // Modal Éléments
  const modalOverlay = document.getElementById('machine-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalGrid = document.getElementById('modal-specs-grid');
  const modalFeatures = document.getElementById('modal-features-list');
  const modalMobilization = document.getElementById('modal-mobilization');
  const modalOperator = document.getElementById('modal-operator');
  const modalReserveBtn = document.getElementById('modal-reserve-btn');

  // Formulaire Réservation Éléments
  const resForm = document.getElementById('fleet-reservation-form');
  const machineSelect = document.getElementById('res-machine-select');
  const resEmailBtn = document.getElementById('btn-res-email');
  const resWhatsappBtn = document.getElementById('btn-res-whatsapp');

  let activeCategory = 'all';
  let searchQuery = '';

  // ── Filtrage Combiné (Catégorie + Recherche Texte) ──
  function filterMachines() {
    let visibleCount = 0;
    const query = searchQuery.toLowerCase().trim();

    machineCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      const cardText = card.textContent.toLowerCase();
      const cardKey = card.getAttribute('data-machine-id');

      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      const matchesSearch = query === '' || cardText.includes(query) || (cardKey && cardKey.includes(query));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Mise à jour compteur & état vide
    if (resultsCountEl) {
      resultsCountEl.textContent = `${visibleCount} engin${visibleCount > 1 ? 's' : ''} disponible${visibleCount > 1 ? 's' : ''}`;
    }

    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Événements Onglets Catégories
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-filter');
      filterMachines();
    });
  });

  // Événements Recherche en Direct
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }
      filterMachines();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        filterMachines();
        searchInput.focus();
      }
    });
  }

  // ── Ouverture et Gestion de la Modale Spécifications ──
  function openMachineModal(machineId) {
    const data = MACHINES_DATA[machineId];
    if (!data) return;

    if (modalBadge) modalBadge.textContent = `${data.ref} • ${data.category}`;
    if (modalTitle) modalTitle.textContent = data.title;

    // Construction dynamique de la grille technique
    if (modalGrid) {
      let statsHTML = '';
      if (data.weight) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Poids Opérationnel</div><div class="machine-modal-stat-val">${data.weight}</div></div>`;
      if (data.power) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Puissance Moteur</div><div class="machine-modal-stat-val">${data.power}</div></div>`;
      if (data.bucket) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Capacité Godet</div><div class="machine-modal-stat-val">${data.bucket}</div></div>`;
      if (data.payload) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Charge Utile</div><div class="machine-modal-stat-val">${data.payload}</div></div>`;
      if (data.capacity) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Capacité Nominale</div><div class="machine-modal-stat-val">${data.capacity}</div></div>`;
      if (data.depth) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Prof. de fouille</div><div class="machine-modal-stat-val">${data.depth}</div></div>`;
      if (data.boom) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Longueur Flèche</div><div class="machine-modal-stat-val">${data.boom}</div></div>`;
      if (data.liftHeight) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Hauteur Levage</div><div class="machine-modal-stat-val">${data.liftHeight}</div></div>`;
      if (data.flow) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Débit Exhaure</div><div class="machine-modal-stat-val">${data.flow}</div></div>`;
      if (data.head) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">HMT Pression</div><div class="machine-modal-stat-val">${data.head}</div></div>`;
      if (data.voltage) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Tension / Sortie</div><div class="machine-modal-stat-val">${data.voltage}</div></div>`;
      if (data.blade) statsHTML += `<div class="machine-modal-stat"><div class="machine-modal-stat-label">Lame & Ripper</div><div class="machine-modal-stat-val">${data.blade}</div></div>`;

      modalGrid.innerHTML = statsHTML;
    }

    // Liste des équipements & sécurités
    if (modalFeatures && data.features) {
      modalFeatures.innerHTML = data.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('');
    }

    // Mobilisation et opérateur
    if (modalMobilization) modalMobilization.textContent = data.mobilization || 'Sous 24h à 48h';
    if (modalOperator) modalOperator.textContent = data.operator || 'Opérateur qualifié disponible';

    // Lien CTA de la modale
    if (modalReserveBtn) {
      modalReserveBtn.setAttribute('data-target-machine', machineId);
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMachineModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Événements boutons "Voir la fiche"
  document.querySelectorAll('.btn-machine-detail').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.machine-card');
      const machineId = card ? card.getAttribute('data-machine-id') : null;
      if (machineId) openMachineModal(machineId);
    });
  });

  // Événements boutons "Réserver cet engin" sur les cartes
  document.querySelectorAll('.btn-machine-reserve').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.machine-card');
      const machineId = card ? card.getAttribute('data-machine-id') : null;
      selectMachineAndScroll(machineId);
    });
  });

  // Action CTA depuis la modale
  if (modalReserveBtn) {
    modalReserveBtn.addEventListener('click', () => {
      const machineId = modalReserveBtn.getAttribute('data-target-machine');
      closeMachineModal();
      selectMachineAndScroll(machineId);
    });
  }

  // Fermeture modale
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeMachineModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeMachineModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeMachineModal();
    }
  });

  // ── Sélection Automatique de l'Engin & Scroll fluide vers le formulaire ──
  function selectMachineAndScroll(machineId) {
    if (machineSelect && machineId) {
      machineSelect.value = machineId;
      // Déclenche un surlignage temporaire
      machineSelect.style.borderColor = 'var(--clr-accent)';
      machineSelect.style.boxShadow = '0 0 0 3px rgba(158, 42, 43, 0.3)';
      setTimeout(() => {
        machineSelect.style.borderColor = '';
        machineSelect.style.boxShadow = '';
      }, 2000);
    }

    const resSection = document.getElementById('reservation');
    if (resSection) {
      resSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Réservation Express — WhatsApp & Email ──
  function getFormData() {
    const company = document.getElementById('res-company')?.value.trim() || 'Non précisé';
    const name = document.getElementById('res-name')?.value.trim() || 'Client';
    const phone = document.getElementById('res-phone')?.value.trim() || '';
    const email = document.getElementById('res-email')?.value.trim() || '';
    const machineKey = machineSelect?.value || 'Engin non spécifié';
    const duration = document.getElementById('res-duration')?.value.trim() || 'À convenir';
    const location = document.getElementById('res-location')?.value.trim() || 'Site minier / industriel';
    const operatorReq = document.getElementById('res-operator')?.value || 'Avec opérateur';
    const notes = document.getElementById('res-notes')?.value.trim() || 'Aucune précision complémentaire';

    const machineTitle = MACHINES_DATA[machineKey]?.title || machineKey;

    return { company, name, phone, email, machineTitle, duration, location, operatorReq, notes };
  }

  // ── Sauvegarde Réservation Supabase (CMS Vitrine) ──
  function saveReservationToBackend(d) {
    if (window.SixSigmaDB && window.SixSigmaDB.reservations) {
      window.SixSigmaDB.reservations.submit({
        equipment_name: d.machineTitle,
        nom_client: d.name,
        email: d.email || 'contact@client.cd',
        telephone: d.phone,
        entreprise: d.company,
        duree_jours: d.duration,
        localisation_chantier: d.location,
        besoin_operateur: d.operatorReq.includes('Avec opérateur'),
        notes_client: d.notes
      }).then(res => {
        console.log('Réservation enregistrée dans Supabase/CMS:', res);
      }).catch(err => {
        console.warn('Erreur sauvegarde réservation Supabase:', err);
      });
    }
  }

  // ── Synchronisation Dynamique des Statuts Matériel depuis Supabase ──
  async function syncEquipmentWithBackend() {
    if (!window.SixSigmaDB || !window.SixSigmaDB.equipment) return;
    try {
      const items = await window.SixSigmaDB.equipment.getAll();
      if (!items || items.length === 0) return;

      const statusClassMap = {
        'disponible': 'available',
        'en_mission': 'mission',
        'maintenance': 'maintenance',
        'revision': 'maintenance'
      };

      items.forEach(eq => {
        const codeClean = (eq.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        // Recherche de la carte correspondante
        const cards = document.querySelectorAll('.machine-card');
        cards.forEach(card => {
          const mid = (card.dataset.machineId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (mid.includes(codeClean) || codeClean.includes(mid) || card.dataset.machineId === eq.id) {
            const badge = card.querySelector('.machine-status-badge');
            if (badge) {
              badge.className = `machine-status-badge ${statusClassMap[eq.status] || 'available'}`;
              badge.innerHTML = `<i class="fa-solid fa-circle"></i> ${eq.status_label || eq.status}`;
            }
          }
        });
      });
    } catch (e) {
      console.info('Info sync matériel:', e);
    }
  }

  syncEquipmentWithBackend();

  // Réservation WhatsApp
  if (resWhatsappBtn) {
    resWhatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const d = getFormData();

      if (!d.phone && !d.email) {
        alert('Veuillez renseigner au moins un numéro de téléphone ou un email pour vous recontacter.');
        document.getElementById('res-phone')?.focus();
        return;
      }

      // Enregistrement dans Supabase
      saveReservationToBackend(d);

      const text = `*DEMANDE DE RÉSERVATION ENGIN — SIX SIGMA*
----------------------------------------
*Entreprise :* ${d.company}
*Contact :* ${d.name}
*Téléphone :* ${d.phone}
*Email :* ${d.email}

*Engin sollicité :* ${d.machineTitle}
*Durée estimée :* ${d.duration}
*Lieu d'intervention :* ${d.location}
*Option d'opérateur :* ${d.operatorReq}

*Détails & Spécifications :*
${d.notes}
----------------------------------------
Transmis depuis le catalogue SIX SIGMA`;

      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/243811149816?text=${encoded}`, '_blank');
    });
  }

  // Demande par Email
  if (resEmailBtn) {
    resEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const d = getFormData();

      if (!d.email && !d.phone) {
        alert('Veuillez renseigner au moins un email ou un téléphone pour transmettre votre demande.');
        document.getElementById('res-email')?.focus();
        return;
      }

      // Enregistrement dans Supabase
      saveReservationToBackend(d);

      const subject = encodeURIComponent(`[RÉSERVATION MATÉRIEL] ${d.machineTitle} - ${d.company}`);
      const body = encodeURIComponent(`Bonjour SIX SIGMA,

Veuillez trouver ci-dessous notre demande de réservation / cotation pour votre parc d'engins :

INFORMATIONS DEMANDEUR :
- Entreprise : ${d.company}
- Nom du contact : ${d.name}
- Téléphone : ${d.phone}
- Email : ${d.email}

ENGIN & OPÉRATION :
- Matériel souhaité : ${d.machineTitle}
- Durée estimée du chantier : ${d.duration}
- Localisation du site : ${d.location}
- Modalité opérateur : ${d.operatorReq}

REMARQUES & CAHIER DES CHARGES :
${d.notes}

Dans l'attente de votre offre technique et tarifaire sous 24h.

Cordialement,
${d.name} (${d.company})`);

      window.location.href = `mailto:sixsigmaadministration@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});
