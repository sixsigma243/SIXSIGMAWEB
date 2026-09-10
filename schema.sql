-- ==============================================================================
-- SIX SIGMA WEB - SCHÉMA SUPABASE POSTGRESQL (SITE VITRINE & ESPACE GESTION)
-- Projet: https://yvryglqqpjhzelfqwlrp.supabase.co
-- ==============================================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLE : PARC MATÉRIEL (ENGINS LOURDS & ÉQUIPEMENTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parc_materiel (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'terrassement', 'transport', 'levage', 'compactage', 'energie', 'forage'
    category_label TEXT,
    tonnage TEXT,
    power TEXT,
    capacity TEXT,
    year INTEGER,
    status TEXT NOT NULL DEFAULT 'disponible', -- 'disponible', 'en_mission', 'maintenance', 'revision'
    status_label TEXT DEFAULT 'Disponible',
    image_url TEXT,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. TABLE : CHANTIERS & RÉALISATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chantiers_realisations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    client TEXT,
    location TEXT,
    completion_date TEXT,
    image_url TEXT,
    description TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE : DEMANDES DE DEVIS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.demandes_devis (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    entreprise TEXT,
    service TEXT,
    localisation TEXT,
    delai TEXT,
    description TEXT,
    status TEXT DEFAULT 'nouveau', -- 'nouveau', 'en_cours', 'traite', 'archive'
    notes_admin TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE : DEMANDES DE RÉSERVATION D'ENGINS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.demandes_reservation (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    equipment_id TEXT REFERENCES public.parc_materiel(id) ON DELETE SET NULL,
    equipment_name TEXT,
    nom_client TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    entreprise TEXT,
    date_debut DATE,
    duree_jours TEXT,
    localisation_chantier TEXT,
    besoin_operateur BOOLEAN DEFAULT false,
    notes_client TEXT,
    status TEXT DEFAULT 'en_attente', -- 'en_attente', 'confirme', 'refuse', 'termine'
    notes_admin TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.parc_materiel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chantiers_realisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes_devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes_reservation ENABLE ROW LEVEL SECURITY;

-- PARC MATÉRIEL : Lecture publique pour tous les clients, écriture réservée aux utilisateurs connectés (Admin)
CREATE POLICY "Lecture publique parc_materiel" ON public.parc_materiel
    FOR SELECT USING (true);

CREATE POLICY "Gestion admin parc_materiel" ON public.parc_materiel
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CHANTIERS : Lecture publique, écriture réservée aux admins
CREATE POLICY "Lecture publique chantiers" ON public.chantiers_realisations
    FOR SELECT USING (true);

CREATE POLICY "Gestion admin chantiers" ON public.chantiers_realisations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- DEMANDES DE DEVIS : Création libre par les prospects (anon & auth), lecture/mise à jour réservée aux admins
CREATE POLICY "Creation devis par visiteurs" ON public.demandes_devis
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Gestion devis par admins" ON public.demandes_devis
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- DEMANDES DE RÉSERVATION : Création libre, gestion réservée aux admins
CREATE POLICY "Creation reservation par visiteurs" ON public.demandes_reservation
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Gestion reservation par admins" ON public.demandes_reservation
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. DONNÉES INITIALES (SEED DU PARC MATÉRIEL - 13 ENGINS)
-- ------------------------------------------------------------------------------
INSERT INTO public.parc_materiel (code, name, category, category_label, tonnage, power, capacity, year, status, status_label, image_url, description, specs, display_order)
VALUES
(
    'CAT-349D',
    'Pelle Hydraulique CAT 349D LME',
    'terrassement',
    'Terrassement Lourd',
    '49.5 t',
    '283 kW (380 ch)',
    'Godet 3.2 m³',
    2023,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    'Pelle d''excavation minière et de terrassement massif équipée de godet renforcé pour roches dures et système de télémétrie par satellite.',
    '{"moteur": "Cat C13 ACERT", "force_arrachement": "262 kN", "profondeur_max": "7.66 m", "telemetrie": "Product Link 4G/Sat", "cabine": "ROPS/FOPS pressurisée climatisée"}'::jsonb,
    1
),
(
    'KOM-PC400',
    'Pelleteuse Komatsu PC400LC-8R',
    'terrassement',
    'Terrassement Lourd',
    '42.8 t',
    '257 kW (345 ch)',
    'Godet 2.8 m³',
    2022,
    'en_mission',
    'En mission',
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    'Engin de terrassement polyvalent à haut rendement hydraulique, idéal pour carrières, décapage de mort-terrain et excavations de tranchées profondes.',
    '{"moteur": "Komatsu SAA6D125E-5", "portee_max": "11.9 m", "train_roulement": "LC Extra renforcé", "consommation": "28 L/h moyenne"}'::jsonb,
    2
),
(
    'VOL-A40G',
    'Tombereau Articulé Volvo A40G',
    'transport',
    'Transport & Déblai',
    '39 t charge utile',
    '350 kW (476 ch)',
    'Benne 24 m³',
    2023,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    'Tombereau 6x6 tout-terrain pour transport minier intensif en milieu difficile, faible pression au sol et sécurité active en pente.',
    '{"transmission": "Automatique Volvo Powertronic", "ralentisseur": "Hydraulique + frein moteur VEB", "benne": "Acier Hardox 450", "pneus": "29.5 R25 Michelin E4"}'::jsonb,
    3
),
(
    'CAT-777D',
    'Camion à Benne Rigide CAT 777D',
    'transport',
    'Transport Fosse Ouverte',
    '90 t charge utile',
    '746 kW (1000 ch)',
    'Benne 60 m³',
    2021,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    'Camion benne rigide minier conçu pour les grands chantiers d''extraction à ciel ouvert, cycle de transport ultra-rapide et robustesse légendaire.',
    '{"moteur": "Cat 3508B EUI", "vitesse_max": "60 km/h", "suspension": "Oléopneumatique indépendante", "freins": "Refroidis par huile"}'::jsonb,
    4
),
(
    'CAT-D8R',
    'Bouteur Bulldozer CAT D8R Série II',
    'terrassement',
    'Bouteur / Poussage',
    '38.5 t',
    '240 kW (322 ch)',
    'Lame Semi-U 8.7 m³',
    2022,
    'maintenance',
    'En maintenance',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    'Bulldozer de forte puissance doté d''un ripper arrière multi-dents pour déchirer les formations rocheuses dures et préparer les pistes de roulage.',
    '{"ripper": "Parallélogramme à 3 dents", "traction": "Train de roulement suspendu haute résistance", "lame": "Lame inclinable électrohydraulique"}'::jsonb,
    5
),
(
    'CAT-140K',
    'Niveleuse de Précision CAT 140K',
    'terrassement',
    'Nivellement & Pistes',
    '17.5 t',
    '142 kW (190 ch)',
    'Lame 4.27 m',
    2023,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=80',
    'Niveleuse industrielle avec système de guidage GPS 3D pour réfection de pistes minières, talutage et nivellement de plateformes logistiques.',
    '{"guidage": "Compatible Trimble 3D / GPS RTK", "cercle_rotation": "Entraînement hydraulique avec embrayage glissant", "scarificateur": "Avant 5 dents"}'::jsonb,
    6
),
(
    'LIEB-LTM1100',
    'Grue Mobile Tout-Terrain Liebherr LTM 1100-5.2',
    'levage',
    'Levage Lourd',
    '100 t capacité',
    '370 kW (503 ch)',
    'Flèche 52 m + 19 m jib',
    2022,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f3?auto=format&fit=crop&w=1200&q=80',
    'Grue 5 essieux compacte et maniable pour montages de charpentes métalliques, usines de traitement, concasseurs et tuyauteries industrielles.',
    '{"portee_max": "52 mètres", "contrepoids": "35 tonnes modulables", "calage": "Système VarioBase® automatique", "essieux": "10x8x10 directeurs"}'::jsonb,
    7
),
(
    'SANY-SCC800',
    'Grue sur Chenilles SANY SCC800TB',
    'levage',
    'Levage sur Chenilles',
    '80 t capacité',
    '212 kW (288 ch)',
    'Flèche 47 m télescopique',
    2023,
    'en_mission',
    'En mission',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    'Grue télescopique sur chenilles capable de translater avec charge suspendue (Pick & Carry), adaptée aux sols meubles de fondations.',
    '{"flèche": "Télescopique pleine charge", "mode": "Pick & Carry opérationnel", "chenilles": "Voie extensible hydraulique"}'::jsonb,
    8
),
(
    'HAMM-3411',
    'Compacteur Monocylindre HAMM 3411',
    'compactage',
    'Compactage de Sol',
    '11.5 t',
    '100 kW (136 ch)',
    'Largeur bille 2.14 m',
    2022,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    'Rouleau compacteur vibrant avec billes lisses ou pieds dameurs interchangeables pour remblais, digues et couches de forme routières.',
    '{"frequence": "30 / 40 Hz", "amplitude": "1.9 / 0.8 mm", "pente_max": "60% avec entraînement haute traction"}'::jsonb,
    9
),
(
    'EPI-FLEXIROC',
    'Foreuse Minière Epiroc FlexiROC D65',
    'forage',
    'Forage & Minage',
    '22.6 t',
    '328 kW (446 ch)',
    'Diamètre 110-203 mm',
    2023,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&w=1200&q=80',
    'Foreuse fond de trou DTH haute pression pour foration de production dans les mines à ciel ouvert, guidage d''angle et collecteur de poussière intégré.',
    '{"compresseur": "Atlas Copco 30 bar / 470 l/s", "profondeur_forage": "Jusqu''à 54 m", "depoussierage": "Système sous vide automatique"}'::jsonb,
    10
),
(
    'CAT-966L',
    'Chargeuse sur Pneus CAT 966L',
    'terrassement',
    'Chargement & Manutention',
    '23.2 t',
    '230 kW (313 ch)',
    'Godet 4.2 m³',
    2022,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    'Chargeuse sur pneus rapide pour alimentation de trémies, concasseurs et chargement cadencé de camions de transport.',
    '{"moteur": "Cat C9.3 ACERT", "charge_basculement": "16 000 kg", "pesage": "Cat Production Measurement en temps réel"}'::jsonb,
    11
),
(
    'CAT-DE500',
    'Groupe Électrogène Insonorisé CAT DE500 GC',
    'energie',
    'Énergie de Chantier',
    '500 kVA (400 kW)',
    '50 Hz / 400V Triphasé',
    'Réservoir 1000 L',
    2023,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    'Station électrique autonome insonorisée sur skid robuste avec coffret de distribution chantier et démarrage automatique secours.',
    '{"moteur": "Cat C13", "niveau_sonore": "68 dBA à 7m", "autonomie": "14h à 75% de charge", "prises": "Distribution modulaire IP67"}'::jsonb,
    12
),
(
    'MERC-ACTROS',
    'Porte-Char Convoi Exceptionnel Mercedes Actros 3358',
    'transport',
    'Logistique Lourde',
    '150 t PTR',
    '425 kW (578 ch)',
    'Remorque surbaissée 4 essieux',
    2022,
    'disponible',
    'Disponible',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    'Tracteur 6x4 lourd avec col de cygne hydraulique et remorque extensible pour transfert rapide d''engins lourds de chantier à chantier.',
    '{"configuration": "6x4 avec embrayage à ralentisseur turbo", "col_cygne": "Hydraulique détachable", "rampes": "Double articulation électro-hydraulique"}'::jsonb,
    13
)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. DONNÉES INITIALES (SEED DES RÉALISATIONS / CHANTIERS)
-- ------------------------------------------------------------------------------
INSERT INTO public.chantiers_realisations (title, category, client, location, completion_date, image_url, description, metrics, is_featured, display_order)
VALUES
(
    'Plateforme Minière & Digue de Rétention',
    'Génie Civil Minier',
    'Compagnie Minière du Katanga',
    'Kolwezi, RDC',
    '2024',
    'projet-genie-civil-minier.png',
    'Terrassement massif de 180 000 m³, aménagement de pistes d''accès pour engins lourds et construction d''une digue de retenue en enrochement compacté.',
    '{"volume_terrassement": "180 000 m³", "duree": "6 mois", "zero_lti": "145 000 heures sans accident"}'::jsonb,
    true,
    1
),
(
    'Hangar Industriel & Structure Métallique',
    'Construction Métallique',
    'Société Industrielle de Lubumbashi',
    'Lubumbashi, RDC',
    '2023',
    'projet-construction-metallique.png',
    'Fabrication et érection d''une charpente métallique lourde de 450 tonnes d''acier, portée libre de 38 mètres avec pont roulant de 25 tonnes intégré.',
    '{"acier_monte": "450 tonnes", "superficie": "4 200 m²", "pont_roulant": "Capacité 25t"}'::jsonb,
    true,
    2
)
ON CONFLICT DO NOTHING;
