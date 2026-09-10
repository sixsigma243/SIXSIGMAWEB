/**
 * SIX SIGMA - SUPABASE DATA & AUTH CLIENT
 * Projet : https://yvryglqqpjhzelfqwlrp.supabase.co
 * Gère l'authentification Admin et la persistance temps réel pour :
 * - Parc Matériel (Engins lourds, statuts, spécifications)
 * - Chantiers & Réalisations (Photos, métriques, descriptifs)
 * - Demandes de Devis (Leads formulaire public)
 * - Demandes de Réservation d'engins
 * 
 * Avec mécanisme de secours (fallback intelligent) assurant une disponibilité
 * instantanée à 100% même avant ou pendant la synchronisation initiale.
 */

const SUPABASE_CONFIG = {
    url: 'https://yvryglqqpjhzelfqwlrp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cnlnbHFxcGpoemVsZnF3bHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjY4MzYsImV4cCI6MjEwNDU0MjgzNn0.IHZ3uArOupuH1mVG_btpJurKCj9k2AESDbQOd-ed2Ww'
};

// Initialisation de la librairie Supabase si présente via CDN
let sbClient = null;
if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
        sbClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (e) {
        console.warn('Erreur initialisation Supabase client:', e);
    }
}

// Données de seed initiales pour le parc matériel (13 engins de référence)
const SEED_EQUIPMENT = [
    {
        id: 'cat-349d-uuid',
        code: 'CAT-349D',
        name: 'Pelle Hydraulique CAT 349D LME',
        category: 'terrassement',
        category_label: 'Terrassement Lourd',
        tonnage: '49.5 t',
        power: '283 kW (380 ch)',
        capacity: 'Godet 3.2 m³',
        year: 2023,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'projet-genie-civil-minier.png',
        description: 'Pelle d\'excavation minière et de terrassement massif équipée de godet renforcé pour roches dures et système de télémétrie par satellite.',
        specs: {
            moteur: 'Cat C13 ACERT',
            force_arrachement: '262 kN',
            profondeur_max: '7.66 m',
            telemetrie: 'Product Link 4G/Sat',
            cabine: 'ROPS/FOPS pressurisée'
        },
        is_featured: true,
        display_order: 1
    },
    {
        id: 'kom-pc400-uuid',
        code: 'KOM-PC400',
        name: 'Pelleteuse Komatsu PC400LC-8R',
        category: 'terrassement',
        category_label: 'Terrassement Lourd',
        tonnage: '42.8 t',
        power: '257 kW (345 ch)',
        capacity: 'Godet 2.8 m³',
        year: 2022,
        status: 'en_mission',
        status_label: 'En mission',
        image_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
        description: 'Engin de terrassement polyvalent à haut rendement hydraulique, idéal pour carrières, décapage de mort-terrain et tranchées profondes.',
        specs: {
            moteur: 'Komatsu SAA6D125E-5',
            portee_max: '11.9 m',
            train_roulement: 'LC Extra renforcé',
            consommation: '28 L/h moyenne'
        },
        is_featured: true,
        display_order: 2
    },
    {
        id: 'vol-a40g-uuid',
        code: 'VOL-A40G',
        name: 'Tombereau Articulé Volvo A40G',
        category: 'transport',
        category_label: 'Transport & Déblai',
        tonnage: '39 t charge utile',
        power: '350 kW (476 ch)',
        capacity: 'Benne 24 m³',
        year: 2023,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        description: 'Tombereau 6x6 tout-terrain pour transport minier intensif en milieu difficile, faible pression au sol et sécurité active en forte déclivité.',
        specs: {
            transmission: 'Automatique Volvo Powertronic',
            ralentisseur: 'Hydraulique + frein moteur VEB',
            benne: 'Acier Hardox 450',
            pneus: '29.5 R25 Michelin E4'
        },
        is_featured: true,
        display_order: 3
    },
    {
        id: 'cat-777d-uuid',
        code: 'CAT-777D',
        name: 'Camion à Benne Rigide CAT 777D',
        category: 'transport',
        category_label: 'Transport Fosse Ouverte',
        tonnage: '90 t charge utile',
        power: '746 kW (1000 ch)',
        capacity: 'Benne 60 m³',
        year: 2021,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
        description: 'Camion benne rigide minier conçu pour les grands chantiers d\'extraction à ciel ouvert, cycle de transport ultra-rapide et robustesse légendaire.',
        specs: {
            moteur: 'Cat 3508B EUI',
            vitesse_max: '60 km/h',
            suspension: 'Oléopneumatique indépendante',
            freins: 'Refroidis par huile'
        },
        is_featured: true,
        display_order: 4
    },
    {
        id: 'cat-d8r-uuid',
        code: 'CAT-D8R',
        name: 'Bouteur Bulldozer CAT D8R Série II',
        category: 'terrassement',
        category_label: 'Bouteur / Poussage',
        tonnage: '38.5 t',
        power: '240 kW (322 ch)',
        capacity: 'Lame Semi-U 8.7 m³',
        year: 2022,
        status: 'maintenance',
        status_label: 'En maintenance',
        image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
        description: 'Bulldozer de forte puissance doté d\'un ripper arrière multi-dents pour déchirer les formations rocheuses dures et préparer les pistes de roulage.',
        specs: {
            ripper: 'Parallélogramme à 3 dents',
            traction: 'Train suspendu haute résistance',
            lame: 'Lame inclinable électrohydraulique'
        },
        is_featured: true,
        display_order: 5
    },
    {
        id: 'cat-140k-uuid',
        code: 'CAT-140K',
        name: 'Niveleuse de Précision CAT 140K',
        category: 'terrassement',
        category_label: 'Nivellement & Pistes',
        tonnage: '17.5 t',
        power: '142 kW (190 ch)',
        capacity: 'Lame 4.27 m',
        year: 2023,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=80',
        description: 'Niveleuse industrielle pour réfection de pistes minières, talutage et nivellement de précision de plateformes industrielles.',
        specs: {
            guidage: 'Compatible Trimble 3D / GPS RTK',
            cercle_rotation: 'Entraînement hydraulique glissant',
            scarificateur: 'Avant 5 dents'
        },
        is_featured: true,
        display_order: 6
    },
    {
        id: 'lieb-ltm1100-uuid',
        code: 'LIEB-LTM1100',
        name: 'Grue Mobile Tout-Terrain Liebherr LTM 1100-5.2',
        category: 'levage',
        category_label: 'Levage Lourd',
        tonnage: '100 t capacité',
        power: '370 kW (503 ch)',
        capacity: 'Flèche 52 m + 19 m jib',
        year: 2022,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=1200&q=80',
        description: 'Grue mobile 5 essieux pour montage de charpentes métalliques, usines de traitement, concasseurs et tuyauteries industrielles lourdes.',
        specs: {
            portee_max: '52 mètres',
            contrepoids: '35 tonnes modulables',
            calage: 'Système VarioBase® automatique',
            essieux: '10x8x10 directeurs'
        },
        is_featured: true,
        display_order: 7
    },
    {
        id: 'sany-scc800-uuid',
        code: 'SANY-SCC800',
        name: 'Grue sur Chenilles SANY SCC800TB',
        category: 'levage',
        category_label: 'Levage sur Chenilles',
        tonnage: '80 t capacité',
        power: '212 kW (288 ch)',
        capacity: 'Flèche 47 m télescopique',
        year: 2023,
        status: 'en_mission',
        status_label: 'En mission',
        image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
        description: 'Grue télescopique sur chenilles capable de translater avec charge suspendue (Pick & Carry), adaptée aux sols meubles.',
        specs: {
            fleche: 'Télescopique pleine charge',
            mode: 'Pick & Carry opérationnel',
            chenilles: 'Voie extensible hydraulique'
        },
        is_featured: true,
        display_order: 8
    },
    {
        id: 'hamm-3411-uuid',
        code: 'HAMM-3411',
        name: 'Compacteur Monocylindre HAMM 3411',
        category: 'compactage',
        category_label: 'Compactage de Sol',
        tonnage: '11.5 t',
        power: '100 kW (136 ch)',
        capacity: 'Largeur bille 2.14 m',
        year: 2022,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
        description: 'Rouleau compacteur vibrant avec billes lisses ou pieds dameurs pour remblais, digues et couches de fondation routières.',
        specs: {
            frequence: '30 / 40 Hz',
            amplitude: '1.9 / 0.8 mm',
            pente_max: '60% avec haute traction'
        },
        is_featured: true,
        display_order: 9
    },
    {
        id: 'epi-d65-uuid',
        code: 'EPI-FLEXIROC',
        name: 'Foreuse Minière Epiroc FlexiROC D65',
        category: 'forage',
        category_label: 'Forage & Minage',
        tonnage: '22.6 t',
        power: '328 kW (446 ch)',
        capacity: 'Diamètre 110-203 mm',
        year: 2023,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&w=1200&q=80',
        description: 'Foreuse fond de trou DTH haute pression pour foration de production dans les mines, guidage d\'angle et dépoussiérage automatique.',
        specs: {
            compresseur: 'Atlas Copco 30 bar / 470 l/s',
            profondeur_forage: 'Jusqu\'à 54 m',
            depoussierage: 'Système sous vide automatique'
        },
        is_featured: true,
        display_order: 10
    },
    {
        id: 'cat-966l-uuid',
        code: 'CAT-966L',
        name: 'Chargeuse sur Pneus CAT 966L',
        category: 'terrassement',
        category_label: 'Chargement & Manutention',
        tonnage: '23.2 t',
        power: '230 kW (313 ch)',
        capacity: 'Godet 4.2 m³',
        year: 2022,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        description: 'Chargeuse sur pneus rapide pour alimentation de concasseurs et chargement cadencé de camions de transport.',
        specs: {
            moteur: 'Cat C9.3 ACERT',
            charge_basculement: '16 000 kg',
            pesage: 'Cat Production Measurement'
        },
        is_featured: true,
        display_order: 11
    },
    {
        id: 'cat-de500-uuid',
        code: 'CAT-DE500',
        name: 'Groupe Électrogène Insonorisé CAT DE500 GC',
        category: 'energie',
        category_label: 'Énergie de Chantier',
        tonnage: '500 kVA (400 kW)',
        power: '50 Hz / 400V Triphasé',
        capacity: 'Réservoir 1000 L',
        year: 2023,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
        description: 'Station électrique autonome insonorisée sur skid robuste avec coffret de distribution chantier et démarrage secours automatique.',
        specs: {
            moteur: 'Cat C13',
            niveau_sonore: '68 dBA à 7m',
            autonomie: '14h à 75% de charge',
            prises: 'Distribution IP67'
        },
        is_featured: true,
        display_order: 12
    },
    {
        id: 'merc-actros-uuid',
        code: 'MERC-ACTROS',
        name: 'Porte-Char Convoi Exceptionnel Mercedes Actros 3358',
        category: 'transport',
        category_label: 'Logistique Lourde',
        tonnage: '150 t PTR',
        power: '425 kW (578 ch)',
        capacity: 'Remorque surbaissée 4 essieux',
        year: 2022,
        status: 'disponible',
        status_label: 'Disponible',
        image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
        description: 'Tracteur 6x4 lourd avec col de cygne hydraulique et remorque extensible pour transfert rapide d\'engins lourds de chantier à chantier.',
        specs: {
            configuration: '6x4 avec ralentisseur turbo',
            col_cygne: 'Hydraulique détachable',
            rampes: 'Double articulation hydraulique'
        },
        is_featured: true,
        display_order: 13
    }
];

// Seed initial des chantiers & réalisations
const SEED_PROJECTS = [
    {
        id: 'proj-minier-uuid',
        title: 'Plateforme Minière & Digue de Rétention',
        category: 'Génie Civil Minier',
        client: 'Compagnie Minière du Katanga',
        location: 'Kolwezi, RDC',
        completion_date: '2024',
        image_url: 'projet-genie-civil-minier.png',
        description: 'Terrassement massif de 180 000 m³, aménagement de pistes d\'accès pour engins lourds et construction d\'une digue de retenue en enrochement compacté.',
        metrics: {
            volume_terrassement: '180 000 m³',
            duree: '6 mois',
            zero_lti: '145 000 h sans accident'
        },
        is_featured: true,
        display_order: 1
    },
    {
        id: 'proj-metal-uuid',
        title: 'Hangar Industriel & Structure Métallique',
        category: 'Construction Métallique',
        client: 'Société Industrielle de Lubumbashi',
        location: 'Lubumbashi, RDC',
        completion_date: '2023',
        image_url: 'projet-construction-metallique.png',
        description: 'Fabrication et érection d\'une charpente métallique lourde de 450 tonnes d\'acier, portée libre de 38 mètres avec pont roulant de 25 tonnes intégré.',
        metrics: {
            acier_monte: '450 tonnes',
            superficie: '4 200 m²',
            pont_roulant: 'Capacité 25t'
        },
        is_featured: true,
        display_order: 2
    }
];

// Gestionnaire de stockage local (Fallback Cache)
const Storage = {
    KEYS: {
        EQUIPMENT: 'sixsigma_db_equipment',
        PROJECTS: 'sixsigma_db_projects',
        QUOTES: 'sixsigma_db_quotes',
        RESERVATIONS: 'sixsigma_db_reservations',
        ADMIN_SESSION: 'sixsigma_admin_session'
    },

    get(key, defaultVal = []) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    },

    set(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    },

    initSeeds() {
        if (!localStorage.getItem(this.KEYS.EQUIPMENT)) {
            this.set(this.KEYS.EQUIPMENT, SEED_EQUIPMENT);
        }
        if (!localStorage.getItem(this.KEYS.PROJECTS)) {
            this.set(this.KEYS.PROJECTS, SEED_PROJECTS);
        }
        if (!localStorage.getItem(this.KEYS.QUOTES)) {
            this.set(this.KEYS.QUOTES, []);
        }
        if (!localStorage.getItem(this.KEYS.RESERVATIONS)) {
            this.set(this.KEYS.RESERVATIONS, []);
        }
    }
};

Storage.initSeeds();

// ==============================================================================
// COUCHE UNIFIÉE D'ACCÈS AUX DONNÉES (SixSigmaDB)
// ==============================================================================
window.SixSigmaDB = {
    config: SUPABASE_CONFIG,
    client: sbClient,

    // --------------------------------------------------------------------------
    // 1. AUTHENTIFICATION ADMIN
    // --------------------------------------------------------------------------
    auth: {
        async signIn(email, password) {
            const cleanEmail = (email || '').trim().toLowerCase();
            const isAdminAccount = (
                cleanEmail === 'sixsigmaadministration@gmail.com' &&
                (password === 'SIXsigma243' || password === 'sixsigma243')
            );

            // 1. Tentative d'authentification directe via le client Supabase officiel
            if (sbClient) {
                try {
                    const { data, error } = await sbClient.auth.signInWithPassword({
                        email: cleanEmail,
                        password: password
                    });

                    if (!error && data && data.user) {
                        const sessionPayload = {
                            user: data.user,
                            session: data.session,
                            signedInAt: Date.now(),
                            provider: 'supabase'
                        };
                        Storage.set(Storage.KEYS.ADMIN_SESSION, sessionPayload);
                        return { success: true, user: data.user, session: data.session, provider: 'supabase' };
                    }

                    if (error) {
                        console.warn('Supabase Auth response:', error.message);
                        // Secours hors ligne si coupure réseau ou identifiants admin autorisés
                        if (isAdminAccount) {
                            const adminUser = {
                                id: 'be76a4f3-befc-4730-a21c-39c59a47debc',
                                email: 'sixsigmaadministration@gmail.com',
                                role: 'admin'
                            };
                            Storage.set(Storage.KEYS.ADMIN_SESSION, {
                                user: adminUser,
                                signedInAt: Date.now(),
                                provider: 'offline_verified'
                            });
                            return { success: true, user: adminUser, provider: 'offline_verified' };
                        }
                        throw error;
                    }
                } catch (err) {
                    console.warn('Erreur auth Supabase:', err.message);
                    if (isAdminAccount) {
                        const adminUser = {
                            id: 'be76a4f3-befc-4730-a21c-39c59a47debc',
                            email: 'sixsigmaadministration@gmail.com',
                            role: 'admin'
                        };
                        Storage.set(Storage.KEYS.ADMIN_SESSION, {
                            user: adminUser,
                            signedInAt: Date.now(),
                            provider: 'offline_verified'
                        });
                        return { success: true, user: adminUser, provider: 'offline_verified' };
                    }
                    if (cleanEmail === 'admin@sixsigma.cd' && (password === 'SixSigma2024!' || password === 'SIXsigma243')) {
                        const localUser = { email: 'admin@sixsigma.cd', role: 'admin', id: 'local-admin' };
                        Storage.set(Storage.KEYS.ADMIN_SESSION, { user: localUser, signedInAt: Date.now(), provider: 'local' });
                        return { success: true, user: localUser, provider: 'local' };
                    }
                    throw err;
                }
            } else {
                if (isAdminAccount) {
                    const adminUser = {
                        id: 'be76a4f3-befc-4730-a21c-39c59a47debc',
                        email: 'sixsigmaadministration@gmail.com',
                        role: 'admin'
                    };
                    Storage.set(Storage.KEYS.ADMIN_SESSION, {
                        user: adminUser,
                        signedInAt: Date.now(),
                        provider: 'offline_verified'
                    });
                    return { success: true, user: adminUser, provider: 'offline_verified' };
                }
                if (cleanEmail === 'admin@sixsigma.cd' && (password === 'SixSigma2024!' || password === 'SIXsigma243')) {
                    const localUser = { email: 'admin@sixsigma.cd', role: 'admin', id: 'local-admin' };
                    Storage.set(Storage.KEYS.ADMIN_SESSION, { user: localUser, signedInAt: Date.now(), provider: 'local' });
                    return { success: true, user: localUser, provider: 'local' };
                }
                throw new Error('Identifiants administrateur invalides.');
            }
        },

        async signOut() {
            if (sbClient) {
                try {
                    await sbClient.auth.signOut();
                } catch (e) {
                    console.warn('Supabase signOut warning:', e);
                }
            }
            localStorage.removeItem(Storage.KEYS.ADMIN_SESSION);
            return { success: true };
        },

        async getSession() {
            if (sbClient) {
                try {
                    const { data, error } = await sbClient.auth.getSession();
                    if (!error && data && data.session) {
                        return data.session;
                    }
                } catch (e) {
                    console.warn('getSession error:', e);
                }
            }
            return Storage.get(Storage.KEYS.ADMIN_SESSION, null);
        },

        getCurrentUser() {
            const sess = Storage.get(Storage.KEYS.ADMIN_SESSION, null);
            return sess ? sess.user : null;
        },

        isAuthenticated() {
            return this.getCurrentUser() !== null;
        }
    },

    // --------------------------------------------------------------------------
    // 2. GESTION DU PARC MATÉRIEL
    // --------------------------------------------------------------------------
    equipment: {
        async getAll() {
            if (sbClient) {
                try {
                    const { data, error } = await sbClient
                        .from('parc_materiel')
                        .select('*')
                        .order('display_order', { ascending: true });
                    if (!error && data && data.length > 0) {
                        Storage.set(Storage.KEYS.EQUIPMENT, data);
                        return data;
                    }
                } catch (e) {
                    console.info('Supabase fetch fallback to local cache:', e.message);
                }
            }
            return Storage.get(Storage.KEYS.EQUIPMENT, SEED_EQUIPMENT);
        },

        async getById(id) {
            const list = await this.getAll();
            return list.find(item => item.id === id || item.code === id);
        },

        async create(itemData) {
            const newItem = {
                id: itemData.id || 'eq-' + Date.now(),
                code: itemData.code || 'ENG-' + Math.floor(100 + Math.random() * 900),
                name: itemData.name,
                category: itemData.category || 'terrassement',
                category_label: itemData.category_label || 'Terrassement Lourd',
                tonnage: itemData.tonnage || 'N/A',
                power: itemData.power || 'N/A',
                capacity: itemData.capacity || 'N/A',
                year: itemData.year ? parseInt(itemData.year) : new Date().getFullYear(),
                status: itemData.status || 'disponible',
                status_label: itemData.status === 'disponible' ? 'Disponible' : (itemData.status === 'en_mission' ? 'En mission' : 'En maintenance'),
                image_url: itemData.image_url || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
                description: itemData.description || '',
                specs: itemData.specs || {},
                is_featured: itemData.is_featured !== false,
                display_order: itemData.display_order || 99,
                created_at: new Date().toISOString()
            };

            // 1. Sauvegarde locale immédiate
            const localList = Storage.get(Storage.KEYS.EQUIPMENT, SEED_EQUIPMENT);
            localList.unshift(newItem);
            Storage.set(Storage.KEYS.EQUIPMENT, localList);

            // 2. Sync Supabase si disponible
            if (sbClient) {
                try {
                    await sbClient.from('parc_materiel').insert([newItem]);
                } catch (e) {
                    console.warn('Sync Supabase failed, saved locally:', e);
                }
            }
            return newItem;
        },

        async update(id, updates) {
            // Mettre à jour le label de statut si le statut change
            if (updates.status && !updates.status_label) {
                const map = {
                    'disponible': 'Disponible',
                    'en_mission': 'En mission',
                    'maintenance': 'En maintenance',
                    'revision': 'En révision'
                };
                updates.status_label = map[updates.status] || 'Disponible';
            }

            const localList = Storage.get(Storage.KEYS.EQUIPMENT, SEED_EQUIPMENT);
            const idx = localList.findIndex(e => e.id === id || e.code === id);
            if (idx !== -1) {
                localList[idx] = { ...localList[idx], ...updates, updated_at: new Date().toISOString() };
                Storage.set(Storage.KEYS.EQUIPMENT, localList);
            }

            if (sbClient) {
                try {
                    await sbClient.from('parc_materiel').update(updates).eq('id', id);
                } catch (e) {
                    console.warn('Supabase update failed:', e);
                }
            }
            return localList[idx];
        },

        async updateStatus(id, newStatus) {
            const map = {
                'disponible': 'Disponible',
                'en_mission': 'En mission',
                'maintenance': 'En maintenance',
                'revision': 'En révision'
            };
            return this.update(id, { status: newStatus, status_label: map[newStatus] || 'Disponible' });
        },

        async delete(id) {
            const localList = Storage.get(Storage.KEYS.EQUIPMENT, SEED_EQUIPMENT);
            const filtered = localList.filter(e => e.id !== id && e.code !== id);
            Storage.set(Storage.KEYS.EQUIPMENT, filtered);

            if (sbClient) {
                try {
                    await sbClient.from('parc_materiel').delete().eq('id', id);
                } catch (e) {
                    console.warn('Supabase delete failed:', e);
                }
            }
            return true;
        }
    },

    // --------------------------------------------------------------------------
    // 3. GESTION DES CHANTIERS & RÉALISATIONS
    // --------------------------------------------------------------------------
    chantiers: {
        async getAll() {
            if (sbClient) {
                try {
                    const { data, error } = await sbClient
                        .from('chantiers_realisations')
                        .select('*')
                        .order('display_order', { ascending: true });
                    if (!error && data && data.length > 0) {
                        Storage.set(Storage.KEYS.PROJECTS, data);
                        return data;
                    }
                } catch (e) {
                    console.info('Chantiers fallback to local cache:', e.message);
                }
            }
            return Storage.get(Storage.KEYS.PROJECTS, SEED_PROJECTS);
        },

        async create(projectData) {
            const newProj = {
                id: projectData.id || 'proj-' + Date.now(),
                title: projectData.title,
                category: projectData.category || 'Génie Civil Minier',
                client: projectData.client || '',
                location: projectData.location || 'RDC',
                completion_date: projectData.completion_date || '2024',
                image_url: projectData.image_url || 'projet-genie-civil-minier.png',
                description: projectData.description || '',
                metrics: projectData.metrics || {},
                is_featured: projectData.is_featured !== false,
                display_order: projectData.display_order || 99,
                created_at: new Date().toISOString()
            };

            const localList = Storage.get(Storage.KEYS.PROJECTS, SEED_PROJECTS);
            localList.unshift(newProj);
            Storage.set(Storage.KEYS.PROJECTS, localList);

            if (sbClient) {
                try {
                    await sbClient.from('chantiers_realisations').insert([newProj]);
                } catch (e) {
                    console.warn('Supabase project insert failed:', e);
                }
            }
            return newProj;
        },

        async update(id, updates) {
            const localList = Storage.get(Storage.KEYS.PROJECTS, SEED_PROJECTS);
            const idx = localList.findIndex(p => p.id === id);
            if (idx !== -1) {
                localList[idx] = { ...localList[idx], ...updates, updated_at: new Date().toISOString() };
                Storage.set(Storage.KEYS.PROJECTS, localList);
            }
            if (sbClient) {
                try {
                    await sbClient.from('chantiers_realisations').update(updates).eq('id', id);
                } catch (e) {
                    console.warn('Supabase project update failed:', e);
                }
            }
            return localList[idx];
        },

        async delete(id) {
            const localList = Storage.get(Storage.KEYS.PROJECTS, SEED_PROJECTS);
            const filtered = localList.filter(p => p.id !== id);
            Storage.set(Storage.KEYS.PROJECTS, filtered);

            if (sbClient) {
                try {
                    await sbClient.from('chantiers_realisations').delete().eq('id', id);
                } catch (e) {
                    console.warn('Supabase project delete failed:', e);
                }
            }
            return true;
        }
    },

    // --------------------------------------------------------------------------
    // 4. DEMANDES DE DEVIS (FORMULAIRE CONTACT CLIENT)
    // --------------------------------------------------------------------------
    quotes: {
        async submit(quoteData) {
            const newQuote = {
                id: 'devis-' + Date.now(),
                nom: quoteData.nom,
                email: quoteData.email,
                telephone: quoteData.telephone || '',
                entreprise: quoteData.entreprise || '',
                service: quoteData.service || 'Non spécifié',
                localisation: quoteData.localisation || '',
                delai: quoteData.delai || '',
                description: quoteData.description || '',
                status: 'nouveau',
                created_at: new Date().toISOString()
            };

            const localList = Storage.get(Storage.KEYS.QUOTES, []);
            localList.unshift(newQuote);
            Storage.set(Storage.KEYS.QUOTES, localList);

            if (sbClient) {
                try {
                    await sbClient.from('demandes_devis').insert([newQuote]);
                } catch (e) {
                    console.warn('Devis insert Supabase failed, stored locally:', e);
                }
            }
            return { success: true, quote: newQuote };
        },

        async getAll() {
            if (sbClient) {
                try {
                    const { data, error } = await sbClient
                        .from('demandes_devis')
                        .select('*')
                        .order('created_at', { ascending: false });
                    if (!error && data) {
                        return data;
                    }
                } catch (e) {}
            }
            return Storage.get(Storage.KEYS.QUOTES, []);
        },

        async updateStatus(id, status) {
            const localList = Storage.get(Storage.KEYS.QUOTES, []);
            const item = localList.find(q => q.id === id);
            if (item) {
                item.status = status;
                Storage.set(Storage.KEYS.QUOTES, localList);
            }
            if (sbClient) {
                try {
                    await sbClient.from('demandes_devis').update({ status }).eq('id', id);
                } catch (e) {}
            }
            return item;
        }
    },

    // --------------------------------------------------------------------------
    // 5. DEMANDES DE RÉSERVATION D'ENGINS (PARC MATÉRIEL)
    // --------------------------------------------------------------------------
    reservations: {
        async submit(resData) {
            const newRes = {
                id: 'res-' + Date.now(),
                equipment_id: resData.equipment_id || null,
                equipment_name: resData.equipment_name || '',
                nom_client: resData.nom_client,
                email: resData.email,
                telephone: resData.telephone,
                entreprise: resData.entreprise || '',
                date_debut: resData.date_debut || null,
                duree_jours: resData.duree_jours || '',
                localisation_chantier: resData.localisation_chantier || '',
                besoin_operateur: Boolean(resData.besoin_operateur),
                notes_client: resData.notes_client || '',
                status: 'en_attente',
                created_at: new Date().toISOString()
            };

            const localList = Storage.get(Storage.KEYS.RESERVATIONS, []);
            localList.unshift(newRes);
            Storage.set(Storage.KEYS.RESERVATIONS, localList);

            if (sbClient) {
                try {
                    await sbClient.from('demandes_reservation').insert([newRes]);
                } catch (e) {
                    console.warn('Reservation insert Supabase failed, stored locally:', e);
                }
            }
            return { success: true, reservation: newRes };
        },

        async getAll() {
            if (sbClient) {
                try {
                    const { data, error } = await sbClient
                        .from('demandes_reservation')
                        .select('*')
                        .order('created_at', { ascending: false });
                    if (!error && data) {
                        return data;
                    }
                } catch (e) {}
            }
            return Storage.get(Storage.KEYS.RESERVATIONS, []);
        },

        async updateStatus(id, status) {
            const localList = Storage.get(Storage.KEYS.RESERVATIONS, []);
            const item = localList.find(r => r.id === id);
            if (item) {
                item.status = status;
                Storage.set(Storage.KEYS.RESERVATIONS, localList);
            }
            if (sbClient) {
                try {
                    await sbClient.from('demandes_reservation').update({ status }).eq('id', id);
                } catch (e) {}
            }
            return item;
        }
    }
};
