/**
 * SIX SIGMA - ADMIN DASHBOARD LOGIC (admin.js)
 * Contrôleur complet pour l'administration du site vitrine :
 * - Authentification sécurisée Admin
 * - Gestion CRUD Parc Matériel & statuts temps réel
 * - Gestion CRUD Chantiers & Réalisations
 * - Traitement des Devis & Réservations
 * - Diagnostic & Synchronisation Base de Données
 */

function initAdminPortal() {
    // Éléments UI principaux
    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');
    const loginForm = document.getElementById('adminLoginForm');
    const loginAlert = document.getElementById('loginAlert');
    const btnLoginSubmit = document.getElementById('btnLoginSubmit');
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

    // Éléments du formulaire de connexion enrichi
    const loginCard = document.getElementById('loginCard');
    const loginAlertText = document.getElementById('loginAlertText');
    const btnLoginSpinner = document.getElementById('btnLoginSpinner');
    const btnLoginText = document.getElementById('btnLoginText');
    const btnLoginArrow = document.getElementById('btnLoginArrow');
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const existingSessionBanner = document.getElementById('existingSessionBanner');
    const existingUserEmailText = document.getElementById('existingUserEmailText');
    const btnResumeSession = document.getElementById('btnResumeSession');
    const btnSwitchAccount = document.getElementById('btnSwitchAccount');

    // ==========================================================================
    // 1. GESTION DE SESSION & INITIALISATION
    // ==========================================================================
    function checkAuth() {
        try {
            let user = null;
            if (window.SixSigmaDB && window.SixSigmaDB.auth) {
                user = window.SixSigmaDB.auth.getCurrentUser();
            } else {
                const raw = localStorage.getItem('sixsigma_admin_session');
                if (raw) user = JSON.parse(raw).user;
            }

            if (user && user.email) {
                // Si l'utilisateur est authentifié
                if (loginView) loginView.style.display = 'none';
                if (dashboardView) dashboardView.style.display = 'block';
                if (userProfileBadge) userProfileBadge.style.display = 'flex';
                if (userEmailDisplay) userEmailDisplay.textContent = user.email || 'Admin';
                loadDashboardData();
            } else {
                // Mode non connecté : afficher l'écran de login
                if (loginView) loginView.style.display = 'flex';
                if (dashboardView) dashboardView.style.display = 'none';
                if (userProfileBadge) userProfileBadge.style.display = 'none';

                // Vérifier si une session antérieure est mémorisée
                const raw = localStorage.getItem('sixsigma_admin_session');
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed && parsed.user && parsed.user.email) {
                            if (existingSessionBanner && existingUserEmailText) {
                                existingUserEmailText.textContent = parsed.user.email;
                                existingSessionBanner.style.display = 'block';
                            }
                        }
                    } catch (err) {}
                }
            }
        } catch (e) {
            console.warn('Erreur vérification auth:', e);
            if (loginView) loginView.style.display = 'flex';
            if (dashboardView) dashboardView.style.display = 'none';
        }
    }

    // Bascule Afficher/Masquer le mot de passe
    if (btnTogglePassword) {
        btnTogglePassword.addEventListener('click', () => {
            const passEl = document.getElementById('loginPassword');
            if (!passEl) return;
            const isPassword = passEl.type === 'password';
            passEl.type = isPassword ? 'text' : 'password';

            const eyeShow = btnTogglePassword.querySelector('.eye-show');
            const eyeHide = btnTogglePassword.querySelector('.eye-hide');
            if (eyeShow) eyeShow.style.display = isPassword ? 'none' : 'block';
            if (eyeHide) eyeHide.style.display = isPassword ? 'block' : 'none';
            btnTogglePassword.title = isPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe';
        });
    }

    // Reprendre la session mémorisée
    if (btnResumeSession) {
        btnResumeSession.addEventListener('click', () => {
            const raw = localStorage.getItem('sixsigma_admin_session');
            if (raw) {
                const sess = JSON.parse(raw);
                if (loginView) loginView.style.display = 'none';
                if (dashboardView) dashboardView.style.display = 'block';
                if (userProfileBadge) userProfileBadge.style.display = 'flex';
                if (userEmailDisplay) userEmailDisplay.textContent = (sess.user && sess.user.email) || 'Admin';
                showToast('Session restaurée avec succès.', 'success');
                loadDashboardData();
            }
        });
    }

    // Changer de compte
    if (btnSwitchAccount) {
        btnSwitchAccount.addEventListener('click', () => {
            if (existingSessionBanner) existingSessionBanner.style.display = 'none';
            localStorage.removeItem('sixsigma_admin_session');
            const emailEl = document.getElementById('loginEmail');
            const passEl = document.getElementById('loginPassword');
            if (emailEl) { emailEl.value = ''; emailEl.focus(); }
            if (passEl) passEl.value = '';
        });
    }

    // Gestionnaire de connexion robuste et complet
    async function handleLogin(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const emailEl = document.getElementById('loginEmail');
        const passEl = document.getElementById('loginPassword');

        const email = (emailEl?.value || '').trim().toLowerCase();
        const password = (passEl?.value || '').trim();

        if (loginAlert) loginAlert.style.display = 'none';

        // Validation immédiate
        if (!email || !password) {
            triggerLoginError('Veuillez saisir votre adresse email et votre mot de passe.');
            if (!email && emailEl) emailEl.focus();
            else if (passEl) passEl.focus();
            return;
        }

        // État de chargement élégant sur le bouton
        setLoginLoadingState(true);

        try {
            let authResult = null;

            // 1. Authentification via le module Supabase / SixSigmaDB
            if (window.SixSigmaDB && window.SixSigmaDB.auth) {
                authResult = await window.SixSigmaDB.auth.signIn(email, password);
            } else {
                // Fallback direct si le script DB chargeait encore
                const isTargetAdmin = (
                    email === 'sixsigmaadministration@gmail.com' &&
                    (password === 'SIXsigma243' || password === 'sixsigma243')
                );
                if (isTargetAdmin) {
                    const adminUser = {
                        id: '74b79542-a563-4546-8199-6c37f2188929',
                        email: email,
                        role: 'admin'
                    };
                    localStorage.setItem('sixsigma_admin_session', JSON.stringify({
                        user: adminUser,
                        signedInAt: Date.now(),
                        provider: 'offline_verified'
                    }));
                    authResult = { success: true, user: adminUser };
                } else {
                    throw new Error('Identifiants incorrects.');
                }
            }

            if (authResult && authResult.success) {
                // Mémorisation de la préférence "Se souvenir de moi"
                if (rememberMeCheckbox) {
                    localStorage.setItem('sixsigma_remember_me', rememberMeCheckbox.checked ? 'true' : 'false');
                }

                // Animation de succès sur le bouton
                if (btnLoginSubmit) {
                    btnLoginSubmit.classList.add('is-success');
                }
                if (btnLoginSpinner) btnLoginSpinner.style.display = 'none';
                if (btnLoginText) btnLoginText.textContent = 'Connexion autorisée ! Redirection...';

                showToast('Connexion réussie ! Bienvenue sur le CMS Six Sigma.', 'success');

                // Transition fluide vers le Dashboard
                setTimeout(() => {
                    setLoginLoadingState(false);
                    if (loginView) loginView.style.display = 'none';
                    if (dashboardView) dashboardView.style.display = 'block';
                    if (userProfileBadge) userProfileBadge.style.display = 'flex';
                    if (userEmailDisplay) userEmailDisplay.textContent = authResult.user.email || email;
                    loadDashboardData();
                }, 350);

                return;
            }

            throw new Error('Identifiants incorrects. Veuillez vérifier votre adresse email et mot de passe.');
        } catch (err) {
            console.warn('Erreur connexion admin:', err);
            const userFriendlyMsg = err.message && err.message.includes('Email not confirmed')
                ? 'Adresse email en attente de confirmation Supabase.'
                : (err.message && err.message.includes('Invalid login credentials')
                    ? 'Adresse email ou mot de passe incorrect.'
                    : (err.message || 'Identifiants incorrects.'));

            triggerLoginError(userFriendlyMsg);
            if (passEl) {
                passEl.select();
                passEl.focus();
            }
        } finally {
            setLoginLoadingState(false);
        }
    }

    function setLoginLoadingState(isLoading) {
        if (!btnLoginSubmit) return;
        btnLoginSubmit.disabled = isLoading;
        if (isLoading) {
            btnLoginSubmit.classList.add('is-loading');
            btnLoginSubmit.classList.remove('is-success');
            if (btnLoginSpinner) btnLoginSpinner.style.display = 'inline-block';
            if (btnLoginArrow) btnLoginArrow.style.display = 'none';
            if (btnLoginText) btnLoginText.textContent = 'Vérification Supabase...';
        } else {
            btnLoginSubmit.classList.remove('is-loading');
            if (btnLoginSpinner) btnLoginSpinner.style.display = 'none';
            if (btnLoginArrow) btnLoginArrow.style.display = 'inline-block';
            if (btnLoginText) btnLoginText.textContent = 'Accéder au Tableau de Bord';
        }
    }

    function triggerLoginError(message) {
        if (loginAlert) {
            if (loginAlertText) loginAlertText.textContent = message;
            else loginAlert.textContent = message;
            loginAlert.style.display = 'flex';
        }
        if (loginCard) {
            loginCard.classList.remove('shake');
            void loginCard.offsetWidth; // Reflow for replay
            loginCard.classList.add('shake');
            setTimeout(() => loginCard.classList.remove('shake'), 600);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (btnLoginSubmit) {
        btnLoginSubmit.addEventListener('click', (e) => {
            handleLogin(e);
        });
    }

    // Déconnexion
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (window.SixSigmaDB && window.SixSigmaDB.auth) {
                await window.SixSigmaDB.auth.signOut();
            } else {
                localStorage.removeItem('sixsigma_admin_session');
            }
            if (existingSessionBanner) existingSessionBanner.style.display = 'none';
            showToast('Vous avez été déconnecté avec succès.', 'info');
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

        const kpiTot = document.getElementById('kpiTotalEquipment');
        const kpiAvail = document.getElementById('kpiAvailableEquipment');
        const kpiMiss = document.getElementById('kpiMissionEquipment');
        const kpiMaint = document.getElementById('kpiMaintenanceEquipment');

        if (kpiTot) kpiTot.textContent = total;
        if (kpiAvail) kpiAvail.textContent = available;
        if (kpiMiss) kpiMiss.textContent = mission;
        if (kpiMaint) kpiMaint.textContent = maintenance;

        const quotesCount = currentQuotesList.length;
        const resCount = currentReservationsList.length;

        const kpiQ = document.getElementById('kpiQuotesCount');
        const kpiR = document.getElementById('kpiReservationsCount');
        if (kpiQ) kpiQ.textContent = quotesCount;
        if (kpiR) kpiR.textContent = resCount;

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
        if (!grid) return;
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #8b95a5;">Chargement du parc matériel...</div>';

        if (window.SixSigmaDB && window.SixSigmaDB.equipment) {
            currentEquipmentList = await window.SixSigmaDB.equipment.getAll();
        } else {
            const raw = localStorage.getItem('sixsigma_db_equipment');
            currentEquipmentList = raw ? JSON.parse(raw) : [];
        }
        renderEquipment(currentEquipmentList);
    }

    function renderEquipment(items) {
        const grid = document.getElementById('adminEquipmentGrid');
        if (!grid) return;
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
                    <img src="${eq.image_url}" alt="${eq.name}" loading="lazy" onerror="this.src='projet-genie-civil-minier.png'">
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
                if (window.SixSigmaDB && window.SixSigmaDB.equipment) {
                    await window.SixSigmaDB.equipment.updateStatus(id, newStatus);
                }
                const item = currentEquipmentList.find(x => x.id === id);
                if (item) item.status = newStatus;
                updateKpis();
                showToast(`Statut actualisé sur le site public : ${select.options[select.selectedIndex].text}`, 'success');
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
        const query = (searchInput?.value || '').toLowerCase().trim();
        const cat = catFilter?.value || 'all';
        const status = statusFilter?.value || 'all';

        const filtered = currentEquipmentList.filter(eq => {
            const matchQuery = !query || 
                eq.name.toLowerCase().includes(query) || 
                eq.code.toLowerCase().includes(query) || 
                (eq.description && eq.description.toLowerCase().includes(query));
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
            if (equipmentForm) equipmentForm.reset();
            document.getElementById('eqFormId').value = '';
            document.getElementById('eqFormYear').value = new Date().getFullYear();
            if (equipmentModal) equipmentModal.style.display = 'flex';
        });
    }

    // Clics d'action sur le matériel (Édition / Suppression)
    document.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('[data-action="edit-equipment"]');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const eq = currentEquipmentList.find(x => x.id === id);
            if (eq && equipmentModal) {
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
                if (window.SixSigmaDB && window.SixSigmaDB.equipment) {
                    await window.SixSigmaDB.equipment.delete(id);
                }
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
                if (window.SixSigmaDB && window.SixSigmaDB.equipment) {
                    await window.SixSigmaDB.equipment.update(id, itemData);
                }
                showToast('Fiche engin mise à jour avec succès.', 'success');
            } else {
                if (window.SixSigmaDB && window.SixSigmaDB.equipment) {
                    await window.SixSigmaDB.equipment.create(itemData);
                }
                showToast('Nouvel engin ajouté au catalogue.', 'success');
            }

            if (equipmentModal) equipmentModal.style.display = 'none';
            await loadEquipment();
            updateKpis();
        });
    }

    // ==========================================================================
    // 4. GESTION DES CHANTIERS & RÉALISATIONS
    // ==========================================================================
    async function loadProjects() {
        const grid = document.getElementById('adminProjectsGrid');
        if (!grid) return;
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #8b95a5;">Chargement des chantiers...</div>';

        if (window.SixSigmaDB && window.SixSigmaDB.chantiers) {
            currentProjectsList = await window.SixSigmaDB.chantiers.getAll();
        } else {
            const raw = localStorage.getItem('sixsigma_db_projects');
            currentProjectsList = raw ? JSON.parse(raw) : [];
        }
        renderProjects(currentProjectsList);
    }

    function renderProjects(items) {
        const grid = document.getElementById('adminProjectsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!items || items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #8b95a5;">Aucun chantier enregistré.</div>';
            return;
        }

        items.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'admin-project-card';
            const hasVideo = Boolean(proj.video_url && proj.video_url.trim() !== '');

            card.innerHTML = `
                <div class="project-card-media" style="position: relative;">
                    ${hasVideo
                        ? `<video src="${proj.video_url}" playsinline autoplay muted loop poster="${proj.image_url || 'projet-genie-civil-minier.png'}" style="width:100%;height:100%;object-fit:cover;"></video>
                           <span style="position:absolute;top:8px;left:8px;background:rgba(14,165,233,0.95);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;display:flex;align-items:center;gap:4px;">
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                               Vidéo MP4
                           </span>`
                        : `<img src="${proj.image_url}" alt="${proj.title}" onerror="this.src='projet-genie-civil-minier.png'">`
                    }
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
    const projImageFileInput = document.getElementById('projImageFileInput');
    const projImageUploadStatus = document.getElementById('projImageUploadStatus');
    const projFormImageUrl = document.getElementById('projFormImageUrl');
    const projVideoFileInput = document.getElementById('projVideoFileInput');
    const projVideoUploadStatus = document.getElementById('projVideoUploadStatus');
    const projFormVideoUrl = document.getElementById('projFormVideoUrl');

    if (btnOpenAddProject) {
        btnOpenAddProject.addEventListener('click', () => {
            if (projectForm) projectForm.reset();
            document.getElementById('projFormId').value = '';
            document.getElementById('projFormDate').value = '2024';
            if (projImageUploadStatus) projImageUploadStatus.textContent = 'Aucun fichier';
            if (projVideoUploadStatus) projVideoUploadStatus.textContent = 'Aucune vidéo';
            if (projectModal) projectModal.style.display = 'flex';
        });
    }

    // Téléversement d'image projet vers Supabase Storage
    if (projImageFileInput) {
        projImageFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (projImageUploadStatus) projImageUploadStatus.innerHTML = '<span style="color:#38bdf8;">⏳ Envoi en cours...</span>';
            try {
                if (window.SixSigmaDB && window.SixSigmaDB.storage) {
                    const res = await window.SixSigmaDB.storage.upload(file);
                    if (res && res.url) {
                        if (projFormImageUrl) projFormImageUrl.value = res.url;
                        if (projImageUploadStatus) projImageUploadStatus.innerHTML = '<span style="color:#4ade80;">✅ Hébergé sur Supabase Storage</span>';
                        showToast('Image hébergée avec succès sur Supabase Storage !', 'success');
                    }
                }
            } catch (err) {
                if (projImageUploadStatus) projImageUploadStatus.innerHTML = '<span style="color:#f87171;">❌ Échec de l\'envoi</span>';
                showToast('Erreur upload image : ' + err.message, 'error');
            }
        });
    }

    // Téléversement de vidéo projet (.mp4) vers Supabase Storage
    if (projVideoFileInput) {
        projVideoFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (projVideoUploadStatus) projVideoUploadStatus.innerHTML = '<span style="color:#38bdf8;">⏳ Envoi vidéo MP4 en cours...</span>';
            try {
                if (window.SixSigmaDB && window.SixSigmaDB.storage) {
                    const res = await window.SixSigmaDB.storage.upload(file);
                    if (res && res.url) {
                        if (projFormVideoUrl) projFormVideoUrl.value = res.url;
                        if (projVideoUploadStatus) projVideoUploadStatus.innerHTML = '<span style="color:#4ade80;">✅ Vidéo MP4 hébergée sur Supabase Storage</span>';
                        showToast('Vidéo MP4 hébergée sur Supabase Storage !', 'success');
                    }
                }
            } catch (err) {
                if (projVideoUploadStatus) projVideoUploadStatus.innerHTML = '<span style="color:#f87171;">❌ Échec de l\'envoi vidéo</span>';
                showToast('Erreur upload vidéo : ' + err.message, 'error');
            }
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
                video_url: document.getElementById('projFormVideoUrl') ? document.getElementById('projFormVideoUrl').value.trim() : null,
                description: document.getElementById('projFormDescription').value.trim(),
                metrics: {
                    metrique1: document.getElementById('projFormMetric1').value.trim(),
                    metrique2: document.getElementById('projFormMetric2').value.trim(),
                    metrique3: document.getElementById('projFormMetric3').value.trim()
                }
            };

            if (window.SixSigmaDB && window.SixSigmaDB.chantiers) {
                await window.SixSigmaDB.chantiers.create(projData);
            }
            showToast('Chantier ajouté avec succès et synchronisé en direct.', 'success');
            if (projectModal) projectModal.style.display = 'none';
            await loadProjects();
        });
    }

    // ── GESTION DE LA VIDÉO DU HERO (ACCUEIL) ──
    const heroVideoModal = document.getElementById('heroVideoModal');
    const btnOpenHeroVideo = document.getElementById('btnOpenHeroVideoModal');
    const heroVideoForm = document.getElementById('heroVideoForm');
    const heroVideoUrlInput = document.getElementById('heroVideoUrlInput');
    const heroVideoFileInput = document.getElementById('heroVideoFileInput');
    const heroVideoUploadStatus = document.getElementById('heroVideoUploadStatus');
    const heroVideoPreviewContainer = document.getElementById('heroVideoPreviewContainer');
    const heroVideoPreview = document.getElementById('heroVideoPreview');

    if (btnOpenHeroVideo) {
        btnOpenHeroVideo.addEventListener('click', async () => {
            let currentUrl = 'assets/mine-kolwezi.mp4';
            if (window.SixSigmaDB && window.SixSigmaDB.settings) {
                currentUrl = await window.SixSigmaDB.settings.get('hero_video_url', 'assets/mine-kolwezi.mp4');
            }
            if (heroVideoUrlInput) heroVideoUrlInput.value = currentUrl;
            if (heroVideoPreview && heroVideoPreviewContainer) {
                heroVideoPreview.src = currentUrl;
                heroVideoPreviewContainer.style.display = 'block';
            }
            if (heroVideoModal) heroVideoModal.style.display = 'flex';
        });
    }

    if (heroVideoFileInput) {
        heroVideoFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (heroVideoUploadStatus) heroVideoUploadStatus.innerHTML = '<span style="color:#38bdf8;">⏳ Téléversement de la vidéo Hero vers Supabase Storage...</span>';
            try {
                if (window.SixSigmaDB && window.SixSigmaDB.storage) {
                    const res = await window.SixSigmaDB.storage.upload(file);
                    if (res && res.url) {
                        if (heroVideoUrlInput) heroVideoUrlInput.value = res.url;
                        if (heroVideoPreview && heroVideoPreviewContainer) {
                            heroVideoPreview.src = res.url;
                            heroVideoPreviewContainer.style.display = 'block';
                            heroVideoPreview.play().catch(() => {});
                        }
                        if (heroVideoUploadStatus) heroVideoUploadStatus.innerHTML = '<span style="color:#4ade80;">✅ Vidéo Hero téléversée avec succès</span>';
                        showToast('Vidéo Hero téléversée sur Supabase Storage !', 'success');
                    }
                }
            } catch (err) {
                if (heroVideoUploadStatus) heroVideoUploadStatus.innerHTML = '<span style="color:#f87171;">❌ Erreur téléversement</span>';
                showToast('Erreur d\'upload : ' + err.message, 'error');
            }
        });
    }

    if (heroVideoUrlInput) {
        heroVideoUrlInput.addEventListener('input', () => {
            const url = heroVideoUrlInput.value.trim();
            if (url && heroVideoPreview && heroVideoPreviewContainer) {
                heroVideoPreview.src = url;
                heroVideoPreviewContainer.style.display = 'block';
            }
        });
    }

    if (heroVideoForm) {
        heroVideoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newUrl = heroVideoUrlInput.value.trim();
            if (!newUrl) return;
            if (window.SixSigmaDB && window.SixSigmaDB.settings) {
                await window.SixSigmaDB.settings.set('hero_video_url', newUrl);
            }
            showToast('Vidéo du Hero mise à jour et active sur le site !', 'success');
            if (heroVideoModal) heroVideoModal.style.display = 'none';
        });
    }

    document.addEventListener('click', async (e) => {
        const deleteProjBtn = e.target.closest('[data-action="delete-project"]');
        if (deleteProjBtn) {
            const id = deleteProjBtn.dataset.id;
            if (confirm('Confirmez-vous la suppression de ce projet de la vitrine ?')) {
                if (window.SixSigmaDB && window.SixSigmaDB.chantiers) {
                    await window.SixSigmaDB.chantiers.delete(id);
                }
                showToast('Chantier supprimé.', 'success');
                await loadProjects();
            }
        }
    });

    // ==========================================================================
    // 5. GESTION DES LEADS (DEVIS & RÉSERVATIONS)
    // ==========================================================================
    async function loadInquiries() {
        if (window.SixSigmaDB) {
            currentQuotesList = await window.SixSigmaDB.quotes.getAll();
            currentReservationsList = await window.SixSigmaDB.reservations.getAll();
        } else {
            currentQuotesList = JSON.parse(localStorage.getItem('sixsigma_db_quotes') || '[]');
            currentReservationsList = JSON.parse(localStorage.getItem('sixsigma_db_reservations') || '[]');
        }

        renderQuotes(currentQuotesList);
        renderReservations(currentReservationsList);
    }

    function renderQuotes(quotes) {
        const list = document.getElementById('quotesList');
        if (!list) return;
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
        if (!list) return;
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
            if (window.SixSigmaDB && window.SixSigmaDB.quotes) {
                await window.SixSigmaDB.quotes.updateStatus(id, newStatus);
            }
            await loadInquiries();
            updateKpis();
            showToast(`Statut du devis actualisé (${newStatus})`, 'info');
        }

        const resBtn = e.target.closest('[data-action="toggle-res-status"]');
        if (resBtn) {
            const id = resBtn.dataset.id;
            const current = resBtn.dataset.current;
            const newStatus = current === 'en_attente' ? 'confirme' : 'en_attente';
            if (window.SixSigmaDB && window.SixSigmaDB.reservations) {
                await window.SixSigmaDB.reservations.updateStatus(id, newStatus);
            }
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
    // 7. DIAGNOSTIC BASE DE DONNÉES & MODALE SQL
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
                if (window.SixSigmaDB && window.SixSigmaDB.client) {
                    const { data, error } = await window.SixSigmaDB.client
                        .from('parc_materiel')
                        .select('count', { count: 'exact', head: true });

                    if (error) {
                        showToast(`Tables distantes non initialisées (${error.code || error.message}). Utilisez le bouton Script SQL.`, 'info');
                    } else {
                        showToast('Base de Données Opérationnelle : Synchronisation en direct active !', 'success');
                    }
                } else {
                    showToast('Mode local autonome actif (100% fonctionnel).', 'success');
                }
            } catch (err) {
                showToast(`État : ${err.message}`, 'info');
            } finally {
                btnCheckDbSync.disabled = false;
                btnCheckDbSync.querySelector('span').textContent = 'Tester Tables';
            }
        });
    }

    if (btnViewSqlModal && sqlModal) {
        btnViewSqlModal.addEventListener('click', async () => {
            sqlModal.style.display = 'flex';
            try {
                const res = await fetch('schema.sql');
                if (res.ok) {
                    const code = await res.text();
                    if (sqlCodeBlock) sqlCodeBlock.textContent = code;
                } else if (sqlCodeBlock) {
                    sqlCodeBlock.textContent = '-- Consultez le fichier schema.sql dans la racine du site.';
                }
            } catch (e) {
                if (sqlCodeBlock) sqlCodeBlock.textContent = '-- Fichier schema.sql disponible dans le projet.';
            }
        });
    }

    if (btnCopySql && sqlCodeBlock) {
        btnCopySql.addEventListener('click', () => {
            const code = sqlCodeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                const copyText = document.getElementById('btnCopySqlText');
                if (copyText) copyText.textContent = 'Copié dans le presse-papier !';
                showToast('Code SQL copié avec succès !', 'success');
                setTimeout(() => {
                    if (copyText) copyText.textContent = 'Copier le Code SQL';
                }, 2500);
            });
        });
    }

    // ==========================================================================
    // 8. TOAST NOTIFICATIONS
    // ==========================================================================
    function showToast(msg, type = 'info') {
        if (!adminToast) return;
        adminToast.textContent = msg;
        adminToast.className = `admin-toast ${type}`;
        adminToast.style.display = 'block';
        clearTimeout(adminToast.timeout);
        adminToast.timeout = setTimeout(() => {
            adminToast.style.display = 'none';
        }, 3500);
    }

    // Lancement de la vérification de session
    checkAuth();
}

// Initialisation résiliente quel que soit l'état du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPortal);
} else {
    initAdminPortal();
}
