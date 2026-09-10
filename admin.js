/**
 * SIX SIGMA - ADMIN DASHBOARD LOGIC (admin.js)
 * Contrôleur complet pour l'administration du site vitrine :
 * - Authentification Supabase Auth
 * - Gestion CRUD Parc Matériel & statuts temps réel
 * - Gestion CRUD Chantiers & Réalisations
 * - Traitement des Devis & Réservations
 * - Diagnostic & Synchronisation Supabase
 */

document.addEventListener('DOMContentLoaded', () => {
    // Éléments UI principaux
    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');
    const loginForm = document.getElementById('adminLoginForm');
    const loginAlert = document.getElementById('loginAlert');
    const navAuthSection = document.getElementById('navAuthSection');
    const userProfileBadge = document.getElementById('userProfileBadge');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const btnLogout = document.getElementById('btnLogout');
    const adminToast = document.getElementById('adminToast');

    // Modales
    const equipmentModal = document.getElementById('equipmentModal');
    const projectModal = document.getElementById('projectModal');
    const sqlModal = document.getElementById('sqlModal');

    // Données en mémoire pour filtrage rapide
    let currentEquipmentList = [];
    let currentProjectsList = [];
    let currentQuotesList = [];
    let currentReservationsList = [];

    // ==========================================================================
    // 1. GESTION DE SESSION & INITIALISATION
    // ==========================================================================
    function checkAuth() {
        const user = window.SixSigmaDB.auth.getCurrentUser();
        if (user) {
            loginView.style.display = 'none';
            dashboardView.style.display = 'block';
            userProfileBadge.style.display = 'flex';
            userEmailDisplay.textContent = user.email || 'Admin';
            loadDashboardData();
        } else {
            loginView.style.display = 'flex';
            dashboardView.style.display = 'none';
            userProfileBadge.style.display = 'none';
        }
    }

    // Connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const btnSubmit = document.getElementById('btnLoginSubmit');

            loginAlert.style.display = 'none';
            btnSubmit.disabled = true;
            btnSubmit.querySelector('span').textContent = 'Connexion en cours...';

            try {
                const res = await window.SixSigmaDB.auth.signIn(email, password);
                if (res.success) {
                    showToast('Connexion réussie ! Bienvenue sur le CMS.', 'success');
                    checkAuth();
                }
            } catch (err) {
                loginAlert.textContent = err.message || 'Identifiants invalides. Veuillez réessayer.';
                loginAlert.style.display = 'block';
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.querySelector('span').textContent = 'Accéder au Tableau de Bord';
            }
        });
    }

    // Déconnexion
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await window.SixSigmaDB.auth.signOut();
            showToast('Déconnexion effectuée.', 'info');
            checkAuth();
        });
    }

    // ==========================================================================
    // 2. CHARGEMENT GLOBAL DU TABLEAU DE BORD
    // ==========================================================================
    async function loadDashboardData() {
        await Promise.all([
            loadEquipment(),
            loadProjects(),
            loadInquiries()
        ]);
        updateKpis();
    }

    function updateKpis() {
        const total = currentEquipmentList.length;
        const available = currentEquipmentList.filter(e => e.status === 'disponible').length;
        const mission = currentEquipmentList.filter(e => e.status === 'en_mission').length;
        const maintenance = currentEquipmentList.filter(e => e.status === 'maintenance' || e.status === 'revision').length;

        document.getElementById('kpiTotalEquipment').textContent = total;
        document.getElementById('kpiAvailableEquipment').textContent = available;
        document.getElementById('kpiMissionEquipment').textContent = mission;
        document.getElementById('kpiMaintenanceEquipment').textContent = maintenance;

        const quotesCount = currentQuotesList.length;
        const resCount = currentReservationsList.length;
        document.getElementById('kpiQuotesCount').textContent = quotesCount;
        document.getElementById('kpiReservationsCount').textContent = resCount;

        const subtabQuotesCount = document.getElementById('subtabQuotesCount');
        const subtabResCount = document.getElementById('subtabResCount');
        if (subtabQuotesCount) subtabQuotesCount.textContent = quotesCount;
        if (subtabResCount) subtabResCount.textContent = resCount;

        const newLeadsBadge = document.getElementById('badgeNewLeads');
        const unhandled = currentQuotesList.filter(q => q.status === 'nouveau').length + currentReservationsList.filter(r => r.status === 'en_attente').length;
        if (newLeadsBadge) {
            if (unhandled > 0) {
                newLeadsBadge.style.display = 'inline-block';
                newLeadsBadge.textContent = unhandled;
            } else {
                newLeadsBadge.style.display = 'none';
            }
        }
    }

    // ==========================================================================
    // 3. GESTION DU PARC MATÉRIEL (ENGINS LOURDS)
    // ==========================================================================
    async function loadEquipment() {
        const grid = document.getElementById('adminEquipmentGrid');
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #8b95a5;">Chargement du parc matériel...</div>';

        currentEquipmentList = await window.SixSigmaDB.equipment.getAll();
        renderEquipment(currentEquipmentList);
    }

    function renderEquipment(items) {
        const grid = document.getElementById('adminEquipmentGrid');
        grid.innerHTML = '';

        if (!items || items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #8b95a5;">Aucun engin trouvé correspondant aux critères.</div>';
            return;
        }

        items.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'admin-machine-card';
            card.dataset.id = eq.id;

            const categoryLabels = {
                'terrassement': 'Terrassement',
                'transport': 'Transport',
                'levage': 'Levage',
                'compactage': 'Compactage',
                'forage': 'Forage',
                'energie': 'Énergie'
            };

            card.innerHTML = `
                <div class="machine-card-media">
                    <img src="${eq.image_url}" alt="${eq.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80'">
                    <span class="machine-card-cat">${categoryLabels[eq.category] || eq.category}</span>
                </div>
                <div class="machine-card-body">
                    <div class="machine-header-title">
                        <h4 class="machine-card-name">${eq.name}</h4>
                        <span class="machine-card-code">${eq.code}</span>
                    </div>

                    <div class="machine-specs-row">
                        <div class="spec-item"><span>Poids:</span><strong>${eq.tonnage || 'N/A'}</strong></div>
                        <div class="spec-item"><span>Moteur:</span><strong>${eq.power || 'N/A'}</strong></div>
                        <div class="spec-item"><span>Capacité:</span><strong>${eq.capacity || 'N/A'}</strong></div>
                        <div class="spec-item"><span>Année:</span><strong>${eq.year || '2023'}</strong></div>
                    </div>

                    <div class="status-control-box">
                        <span class="status-label-tag">Statut Site Vitrine :</span>
                        <select class="status-select-inline ${eq.status}" data-action="change-status" data-id="${eq.id}">
                            <option value="disponible" ${eq.status === 'disponible' ? 'selected' : ''}>✅ Disponible</option>
                            <option value="en_mission" ${eq.status === 'en_mission' ? 'selected' : ''}>🏗️ En mission</option>
                            <option value="maintenance" ${eq.status === 'maintenance' ? 'selected' : ''}>🔧 En maintenance</option>
                            <option value="revision" ${eq.status === 'revision' ? 'selected' : ''}>⚙️ En révision</option>
                        </select>
                    </div>

                    <div class="machine-actions">
                        <button class="btn-action-icon edit" data-action="edit-equipment" data-id="${eq.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Modifier</span>
                        </button>
                        <a href="parc-materiel.html" target="_blank" class="btn-action-icon view" title="Voir sur le site vitrine">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>Aperçu</span>
                        </a>
                        <button class="btn-action-icon delete" data-action="delete-equipment" data-id="${eq.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Retirer</span>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Changement de statut instantané depuis le tableau de bord
    document.addEventListener('change', async (e) => {
        if (e.target && e.target.dataset.action === 'change-status') {
            const select = e.target;
            const id = select.dataset.id;
            const newStatus = select.value;

            select.className = `status-select-inline ${newStatus}`;
            try {
                await window.SixSigmaDB.equipment.updateStatus(id, newStatus);
                // Mise à jour de la mémoire locale
                const item = currentEquipmentList.find(x => x.id === id);
                if (item) item.status = newStatus;
                updateKpis();
                showToast(`Statut mis à jour : ${select.options[select.selectedIndex].text}`, 'success');
            } catch (err) {
                showToast('Erreur lors du changement de statut', 'error');
            }
        }
    });

    // Filtres & Recherche de matériel
    const searchInput = document.getElementById('equipmentSearchInput');
    const catFilter = document.getElementById('equipmentCategoryFilter');
    const statusFilter = document.getElementById('equipmentStatusFilter');

    function applyEquipmentFilters() {
        const query = searchInput.value.toLowerCase().trim();
        const cat = catFilter.value;
        const status = statusFilter.value;

        const filtered = currentEquipmentList.filter(eq => {
            const matchQuery = !query || 
                eq.name.toLowerCase().includes(query) || 
                eq.code.toLowerCase().includes(query) || 
                eq.description.toLowerCase().includes(query);
            const matchCat = cat === 'all' || eq.category === cat;
            const matchStatus = status === 'all' || eq.status === status;
            return matchQuery && matchCat && matchStatus;
        });
        renderEquipment(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyEquipmentFilters);
    if (catFilter) catFilter.addEventListener('change', applyEquipmentFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyEquipmentFilters);

    // Modale Ajouter / Modifier Engin
    const btnOpenAddEquipment = document.getElementById('btnOpenAddEquipmentModal');
    const equipmentForm = document.getElementById('equipmentForm');

    if (btnOpenAddEquipment) {
        btnOpenAddEquipment.addEventListener('click', () => {
            document.getElementById('equipmentModalTitle').textContent = 'Ajouter un Engin au Parc';
            equipmentForm.reset();
            document.getElementById('eqFormId').value = '';
            document.getElementById('eqFormYear').value = new Date().getFullYear();
            equipmentModal.style.display = 'flex';
        });
    }

    // Clics d'action sur le matériel (Édition / Suppression)
    document.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('[data-action="edit-equipment"]');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const eq = currentEquipmentList.find(x => x.id === id);
            if (eq) {
                document.getElementById('equipmentModalTitle').textContent = 'Modifier la Fiche Engin';
                document.getElementById('eqFormId').value = eq.id;
                document.getElementById('eqFormName').value = eq.name;
                document.getElementById('eqFormCode').value = eq.code;
                document.getElementById('eqFormCategory').value = eq.category;
                document.getElementById('eqFormTonnage').value = eq.tonnage;
                document.getElementById('eqFormPower').value = eq.power;
                document.getElementById('eqFormCapacity').value = eq.capacity || '';
                document.getElementById('eqFormYear').value = eq.year || 2023;
                document.getElementById('eqFormStatus').value = eq.status;
                document.getElementById('eqFormImageUrl').value = eq.image_url;
                document.getElementById('eqFormDescription').value = eq.description || '';
                document.getElementById('eqFormSpecMoteur').value = eq.specs?.moteur || '';
                document.getElementById('eqFormSpecPortee').value = eq.specs?.force_arrachement || eq.specs?.portee_max || '';
                equipmentModal.style.display = 'flex';
            }
        }

        const deleteBtn = e.target.closest('[data-action="delete-equipment"]');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const eq = currentEquipmentList.find(x => x.id === id);
            const name = eq ? eq.name : 'cet engin';
            if (confirm(`Confirmez-vous le retrait de "${name}" du parc matériel vitrine ?`)) {
                await window.SixSigmaDB.equipment.delete(id);
                currentEquipmentList = currentEquipmentList.filter(x => x.id !== id);
                renderEquipment(currentEquipmentList);
                updateKpis();
                showToast(`Engin "${name}" retiré avec succès.`, 'success');
            }
        }
    });

    if (equipmentForm) {
        equipmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('eqFormId').value;
            const itemData = {
                name: document.getElementById('eqFormName').value.trim(),
                code: document.getElementById('eqFormCode').value.trim(),
                category: document.getElementById('eqFormCategory').value,
                tonnage: document.getElementById('eqFormTonnage').value.trim(),
                power: document.getElementById('eqFormPower').value.trim(),
                capacity: document.getElementById('eqFormCapacity').value.trim(),
                year: parseInt(document.getElementById('eqFormYear').value) || 2023,
                status: document.getElementById('eqFormStatus').value,
                image_url: document.getElementById('eqFormImageUrl').value.trim(),
                description: document.getElementById('eqFormDescription').value.trim(),
                specs: {
                    moteur: document.getElementById('eqFormSpecMoteur').value.trim(),
                    portee: document.getElementById('eqFormSpecPortee').value.trim()
                }
            };

            if (id) {
                // Update
                await window.SixSigmaDB.equipment.update(id, itemData);
                showToast('Fiche engin mise à jour avec succès.', 'success');
            } else {
                // Create
                await window.SixSigmaDB.equipment.create(itemData);
                showToast('Nouvel engin ajouté au catalogue.', 'success');
            }

            equipmentModal.style.display = 'none';
            await loadEquipment();
            updateKpis();
        });
    }

    // ==========================================================================
    // 4. GESTION DES CHANTIERS & RÉALISATIONS
    // ==========================================================================
    async function loadProjects() {
        const grid = document.getElementById('adminProjectsGrid');
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #8b95a5;">Chargement des chantiers...</div>';

        currentProjectsList = await window.SixSigmaDB.chantiers.getAll();
        renderProjects(currentProjectsList);
    }

    function renderProjects(items) {
        const grid = document.getElementById('adminProjectsGrid');
        grid.innerHTML = '';

        if (!items || items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #8b95a5;">Aucun chantier enregistré.</div>';
            return;
        }

        items.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'admin-project-card';
            card.innerHTML = `
                <div class="project-card-media">
                    <img src="${proj.image_url}" alt="${proj.title}" onerror="this.src='projet-genie-civil-minier.png'">
                </div>
                <div class="project-card-body">
                    <h4 class="project-card-title">${proj.title}</h4>
                    <div class="project-meta-row">
                        <span>📍 ${proj.location || 'RDC'}</span>
                        <span>🏢 ${proj.client || 'Client Privé'}</span>
                        <span>📅 ${proj.completion_date || '2024'}</span>
                    </div>
                    <p class="project-desc">${proj.description || ''}</p>
                    <div class="machine-actions" style="margin-top: auto;">
                        <button class="btn-action-icon" data-action="delete-project" data-id="${proj.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Supprimer</span>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Nouveau projet chantier
    const btnOpenAddProject = document.getElementById('btnOpenAddProjectModal');
    const projectForm = document.getElementById('projectForm');

    if (btnOpenAddProject) {
        btnOpenAddProject.addEventListener('click', () => {
            projectForm.reset();
            document.getElementById('projFormId').value = '';
            document.getElementById('projFormDate').value = '2024';
            projectModal.style.display = 'flex';
        });
    }

    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const projData = {
                title: document.getElementById('projFormTitle').value.trim(),
                category: document.getElementById('projFormCategory').value.trim(),
                client: document.getElementById('projFormClient').value.trim(),
                location: document.getElementById('projFormLocation').value.trim(),
                completion_date: document.getElementById('projFormDate').value.trim(),
                image_url: document.getElementById('projFormImageUrl').value.trim(),
                description: document.getElementById('projFormDescription').value.trim(),
                metrics: {
                    metrique1: document.getElementById('projFormMetric1').value.trim(),
                    metrique2: document.getElementById('projFormMetric2').value.trim(),
                    metrique3: document.getElementById('projFormMetric3').value.trim()
                }
            };

            await window.SixSigmaDB.chantiers.create(projData);
            showToast('Chantier ajouté avec succès.', 'success');
            projectModal.style.display = 'none';
            await loadProjects();
        });
    }

    document.addEventListener('click', async (e) => {
        const deleteProjBtn = e.target.closest('[data-action="delete-project"]');
        if (deleteProjBtn) {
            const id = deleteProjBtn.dataset.id;
            if (confirm('Confirmez-vous la suppression de ce projet de la vitrine ?')) {
                await window.SixSigmaDB.chantiers.delete(id);
                showToast('Chantier supprimé.', 'success');
                await loadProjects();
            }
        }
    });

    // ==========================================================================
    // 5. GESTION DES LEADS (DEVIS & RÉSERVATIONS)
    // ==========================================================================
    async function loadInquiries() {
        currentQuotesList = await window.SixSigmaDB.quotes.getAll();
        currentReservationsList = await window.SixSigmaDB.reservations.getAll();

        renderQuotes(currentQuotesList);
        renderReservations(currentReservationsList);
    }

    function renderQuotes(quotes) {
        const list = document.getElementById('quotesList');
        list.innerHTML = '';

        if (!quotes || quotes.length === 0) {
            list.innerHTML = '<div style="text-align: center; padding: 2rem; color: #8b95a5;">Aucune demande de devis reçue pour le moment.</div>';
            return;
        }

        quotes.forEach(q => {
            const card = document.createElement('div');
            card.className = 'inquiry-card';
            const dateStr = q.created_at ? new Date(q.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

            card.innerHTML = `
                <div class="inquiry-header">
                    <div class="inquiry-client-name">${q.nom} ${q.entreprise ? `<span style="font-weight: 400; color: #8b95a5;">(${q.entreprise})</span>` : ''}</div>
                    <span class="inquiry-date">${dateStr}</span>
                </div>
                <div class="inquiry-details-grid">
                    <div><strong>Service :</strong> ${q.service || 'Non précisé'}</div>
                    <div><strong>Email :</strong> <a href="mailto:${q.email}" style="color: #38bdf8;">${q.email}</a></div>
                    <div><strong>Tél :</strong> <a href="tel:${q.telephone}" style="color: #38bdf8;">${q.telephone || 'N/A'}</a></div>
                    <div><strong>Lieu :</strong> ${q.localisation || 'RDC'}</div>
                    <div><strong>Délai :</strong> ${q.delai || 'Standard'}</div>
                </div>
                <div class="inquiry-description">
                    <strong>Message :</strong> ${q.description || 'Aucun message particulier.'}
                </div>
                <div class="inquiry-footer">
                    <span class="status-pill ${q.status}">${q.status === 'nouveau' ? '🟡 Nouveau' : '🟢 Traité'}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        ${q.telephone ? `<a href="https://wa.me/${q.telephone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-mini-action" style="color: #4ade80;">WhatsApp</a>` : ''}
                        <button class="btn-mini-action" data-action="toggle-quote-status" data-id="${q.id}" data-current="${q.status}">
                            ${q.status === 'nouveau' ? 'Marquer Traité' : 'Marquer Nouveau'}
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }

    function renderReservations(resList) {
        const list = document.getElementById('reservationsList');
        list.innerHTML = '';

        if (!resList || resList.length === 0) {
            list.innerHTML = '<div style="text-align: center; padding: 2rem; color: #8b95a5;">Aucune demande de réservation de matériel pour le moment.</div>';
            return;
        }

        resList.forEach(r => {
            const card = document.createElement('div');
            card.className = 'inquiry-card';
            const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

            card.innerHTML = `
                <div class="inquiry-header">
                    <div class="inquiry-client-name">🚜 ${r.equipment_name || 'Machine du parc'}</div>
                    <span class="inquiry-date">${dateStr}</span>
                </div>
                <div class="inquiry-details-grid">
                    <div><strong>Client :</strong> ${r.nom_client} ${r.entreprise ? `(${r.entreprise})` : ''}</div>
                    <div><strong>Tél :</strong> <a href="tel:${r.telephone}" style="color: #38bdf8;">${r.telephone}</a></div>
                    <div><strong>Email :</strong> <a href="mailto:${r.email}" style="color: #38bdf8;">${r.email}</a></div>
                    <div><strong>Durée :</strong> ${r.duree_jours || 'Non spécifiée'}</div>
                    <div><strong>Opérateur inclus :</strong> ${r.besoin_operateur ? 'Oui' : 'Non'}</div>
                    <div><strong>Chantier :</strong> ${r.localisation_chantier || 'N/A'}</div>
                </div>
                ${r.notes_client ? `<div class="inquiry-description"><strong>Précisions :</strong> ${r.notes_client}</div>` : ''}
                <div class="inquiry-footer">
                    <span class="status-pill ${r.status}">${r.status === 'en_attente' ? '🟡 En attente' : '🟢 Confirmé'}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="https://wa.me/${r.telephone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-mini-action" style="color: #4ade80;">Contacter</a>
                        <button class="btn-mini-action" data-action="toggle-res-status" data-id="${r.id}" data-current="${r.status}">
                            ${r.status === 'en_attente' ? 'Confirmer' : 'Rétablir en attente'}
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }

    document.addEventListener('click', async (e) => {
        const quoteBtn = e.target.closest('[data-action="toggle-quote-status"]');
        if (quoteBtn) {
            const id = quoteBtn.dataset.id;
            const current = quoteBtn.dataset.current;
            const newStatus = current === 'nouveau' ? 'traite' : 'nouveau';
            await window.SixSigmaDB.quotes.updateStatus(id, newStatus);
            await loadInquiries();
            updateKpis();
            showToast(`Statut du devis actualisé (${newStatus})`, 'info');
        }

        const resBtn = e.target.closest('[data-action="toggle-res-status"]');
        if (resBtn) {
            const id = resBtn.dataset.id;
            const current = resBtn.dataset.current;
            const newStatus = current === 'en_attente' ? 'confirme' : 'en_attente';
            await window.SixSigmaDB.reservations.updateStatus(id, newStatus);
            await loadInquiries();
            updateKpis();
            showToast(`Statut de réservation actualisé (${newStatus})`, 'info');
        }
    });

    // ==========================================================================
    // 6. ONGLETS ET SOUS-ONGLETS
    // ==========================================================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    const subtabButtons = document.querySelectorAll('.subtab-btn');
    const subtabContainers = document.querySelectorAll('.inquiries-container');

    subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.subtab;
            subtabButtons.forEach(b => b.classList.remove('active'));
            subtabContainers.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetSub = document.getElementById(targetId);
            if (targetSub) targetSub.classList.add('active');
        });
    });

    // Fermeture de toutes les modales
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.closeModal;
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'none';
        });
    });

    // ==========================================================================
    // 7. DIAGNOSTIC SUPABASE & MODALE SQL
    // ==========================================================================
    const btnCheckDbSync = document.getElementById('btnCheckDbSync');
    const btnViewSqlModal = document.getElementById('btnViewSqlModal');
    const btnCopySql = document.getElementById('btnCopySql');
    const sqlCodeBlock = document.getElementById('sqlCodeBlock');

    if (btnCheckDbSync) {
        btnCheckDbSync.addEventListener('click', async () => {
            btnCheckDbSync.disabled = true;
            btnCheckDbSync.querySelector('span').textContent = 'Test en cours...';

            try {
                if (!window.SixSigmaDB.client) throw new Error('Client Supabase non initialisé');
                const { data, error } = await window.SixSigmaDB.client
                    .from('parc_materiel')
                    .select('count', { count: 'exact', head: true });

                if (error) {
                    showToast(`Supabase : Table parc_materiel non trouvée (${error.code || error.message}). Utilisez le bouton Script SQL pour l'initialiser.`, 'error');
                } else {
                    showToast('Connexion Supabase parfaite : Tables PostgreSQL opérationnelles en ligne !', 'success');
                }
            } catch (err) {
                showToast(`Test Supabase : ${err.message}`, 'info');
            } finally {
                btnCheckDbSync.disabled = false;
                btnCheckDbSync.querySelector('span').textContent = 'Tester Tables';
            }
        });
    }

    if (btnViewSqlModal) {
        btnViewSqlModal.addEventListener('click', async () => {
            sqlModal.style.display = 'flex';
            try {
                const res = await fetch('schema.sql');
                if (res.ok) {
                    const code = await res.text();
                    sqlCodeBlock.textContent = code;
                } else {
                    sqlCodeBlock.textContent = '-- Consultez le fichier schema.sql dans le projet.';
                }
            } catch (e) {
                sqlCodeBlock.textContent = '-- Erreur chargement schema.sql.';
            }
        });
    }

    if (btnCopySql) {
        btnCopySql.addEventListener('click', () => {
            const code = sqlCodeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                document.getElementById('btnCopySqlText').textContent = 'Copié dans le presse-papier !';
                showToast('Code SQL copié ! Vous pouvez le coller dans Supabase.', 'success');
                setTimeout(() => {
                    document.getElementById('btnCopySqlText').textContent = 'Copier le Code SQL';
                }, 2500);
            });
        });
    }

    // ==========================================================================
    // 8. TOAST NOTIFICATIONS
    // ==========================================================================
    function showToast(msg, type = 'info') {
        adminToast.textContent = msg;
        adminToast.className = `admin-toast ${type}`;
        adminToast.style.display = 'block';
        clearTimeout(adminToast.timeout);
        adminToast.timeout = setTimeout(() => {
            adminToast.style.display = 'none';
        }, 3500);
    }

    // Démarrage
    checkAuth();
});
