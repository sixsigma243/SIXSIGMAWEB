/**
 * SIX SIGMA — CHARTE HSE & SÉCURITÉ INDUSTRIELLE
 * Gestion interactive des documents de conformité, modale d'audit et formulaires
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Données des Documents HSE d'Audit ──
  const HSE_DOCS = {
    'charte-hse': {
      title: 'Charte & Politique Générale HSE — SIX SIGMA',
      ref: 'DOC-HSE-001',
      date: 'Édition 2026 / Révision Annuelle',
      summary: 'Déclaration solennelle de la Direction Générale relative à l\'Objectif Zéro Accident, à l\'autorité d\'arrêt de travail (Stop Work Authority) et aux engagements de préservation environnementale sur l\'ensemble des chantiers.',
      keyPoints: [
        'Zéro compromis sur le port obligatoire des EPI de classe 3 certifiés',
        'Autorité de retrait immédiat pour tout collaborateur face à un danger imminent',
        'Analyses de risques préliminaires (JSA/Take 5) obligatoires avant toute opération',
        'Contrôles inopinés et dépistages de vigilance à l\'entrée des sites'
      ]
    },
    'plan-urgence': {
      title: 'Plan d\'Organisation des Secours & Gestion de Crise (POS)',
      ref: 'DOC-HSE-002',
      date: 'Validé Service Médical & Incendie',
      summary: 'Protocole d\'alerte et d\'évacuation sanitaire d\'urgence (MEDEVAC), maillage des secouristes du travail (SST), stations de premier secours mobiles et liaisons radio permanentes.',
      keyPoints: [
        'Chaîne d\'alerte opérationnelle 24/7 avec poste de commandement central',
        'Malles médicalisées et défibrillateurs semi-automatiques (DSA) sur bases-vies',
        'Exercices d\'évacuation trimestriels documentés',
        'Conventions médicales avec les centres hospitaliers de référence'
      ]
    },
    'gestion-environnement': {
      title: 'Plan de Gestion Environnementale & Zéro Rejet Toxique',
      ref: 'DOC-HSE-003',
      date: 'Conforme ISO 14001',
      summary: 'Procédures strictes de stockage et rétention des hydrocarbures, gestion et traçabilité des déchets industriels dangereux, réhabilitation et végétalisation des zones d\'emprunt.',
      keyPoints: [
        'Bacs de rétention 110% obligatoires sous chaque groupe et cuve carburant',
        'Kits d\'intervention anti-pollution absorbants embarqués dans chaque engin',
        'Bordereaux de suivi des déchets (BSD) archivés et audités',
        'Mesures systématiques de turbidité et qualité des eaux de rejet'
      ]
    }
  };

  // ── Modale Document Preview ──
  const modal = document.getElementById('hse-modal');
  const modalClose = document.getElementById('hse-modal-close');
  const modalTitle = document.getElementById('hse-modal-title');
  const modalRef = document.getElementById('hse-modal-ref');
  const modalSummary = document.getElementById('hse-modal-summary');
  const modalPoints = document.getElementById('hse-modal-points');

  function openHseModal(docKey) {
    const doc = HSE_DOCS[docKey];
    if (!doc || !modal) return;

    if (modalTitle) modalTitle.textContent = doc.title;
    if (modalRef) modalRef.textContent = `${doc.ref} • ${doc.date}`;
    if (modalSummary) modalSummary.textContent = doc.summary;
    if (modalPoints) {
      modalPoints.innerHTML = doc.keyPoints.map(p => `<li><i class="fa-solid fa-check" style="color: var(--clr-accent); margin-right: 8px;"></i>${p}</li>`).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeHseModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.btn-doc-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const docKey = btn.getAttribute('data-doc');
      if (docKey) openHseModal(docKey);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeHseModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeHseModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeHseModal();
    }
  });

  // ── Formulaire Demande d'Audit HSE / Appel d'Offres ──
  const auditForm = document.getElementById('hse-audit-form');
  if (auditForm) {
    auditForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const company = document.getElementById('audit-company')?.value.trim() || 'Société non précisée';
      const name = document.getElementById('audit-name')?.value.trim() || 'Responsable';
      const email = document.getElementById('audit-email')?.value.trim() || '';
      const phone = document.getElementById('audit-phone')?.value.trim() || '';
      const scope = document.getElementById('audit-scope')?.value || 'Audit HSE Général';
      const message = document.getElementById('audit-message')?.value.trim() || 'Transmission de cahier des charges';

      const subject = encodeURIComponent(`[DEMANDE AUDIT HSE / APPEL D'OFFRES] ${company} - ${scope}`);
      const body = encodeURIComponent(`Bonjour à la Direction HSE de SIX SIGMA,

Veuillez trouver ci-dessous notre demande de documentation / audit HSE pour un projet industriel :

COORDONNÉES :
- Entreprise / Donneur d'ordres : ${company}
- Nom du contact : ${name}
- Email professionnel : ${email}
- Téléphone : ${phone}

OBJET DE LA CONSULTATION :
- Type de dossier : ${scope}
- Description / Exigences particulières :
${message}

Merci de nous transmettre votre dossier d'agrément HSE et vos certifications à jour.

Cordialement,
${name} (${company})`);

      window.location.href = `mailto:sixsigmaadministration@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});
