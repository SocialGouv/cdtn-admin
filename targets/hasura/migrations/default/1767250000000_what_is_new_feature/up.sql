-- ============================================================================
-- Migration consolidée pour la fonctionnalité "Quoi de neuf"
-- Cette migration crée la table, insère les contenus et les publie
-- ============================================================================

-- 1. Création de la table what_is_new_items
-- ============================================================================
CREATE TABLE "public"."what_is_new_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "week_start" date NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "href" text,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CHECK ("kind" IN ('evolution-juridique', 'mise-a-jour-fonctionnelle'))
);

CREATE INDEX "what_is_new_items_week_start_idx" ON "public"."what_is_new_items" ("week_start");
CREATE INDEX "what_is_new_items_kind_idx" ON "public"."what_is_new_items" ("kind");

COMMENT ON TABLE "public"."what_is_new_items" IS E'Admin content for the "Quoi de neuf ?" feature (items only; months/weeks are derived).';

CREATE TRIGGER "set_public_what_is_new_items_updated_at"
  BEFORE UPDATE ON "public"."what_is_new_items"
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TRIGGER "set_public_what_is_new_items_updated_at" ON "public"."what_is_new_items" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- 2. Insertion des 51 contenus "Quoi de neuf"
-- ============================================================================
WITH data(ord, week_start, kind, title, href, description) AS (
  VALUES
    -- 2025-09-01..2025-09-07 (week_start = 2025-09-01)
    (1, '2025-09-01'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Prime d'ancienneté$$, $$/contribution/3248-quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant$$, $$Ajout de la valeur de point pour la Gironde, les Landes, l'Aisne, la Charente-Maritime, l'Oise et la Haute-Marne.$$),
    (2, '2025-09-01'::date, 'evolution-juridique', $$IDCC 275 Question/Réponse : Salaire minimum$$, $$/contribution/275-quel-est-le-salaire-minimum$$, $$Mise à jour des salaires minima en vigueur au 1er septembre.$$),
    (3, '2025-09-01'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Primes$$, $$/contribution/3248-quelles-sont-les-primes-prevues-par-la-convention-collective$$, $$Modification de la prime de vacances pour l'Aisne.$$),
    (4, '2025-09-08'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Prime d'ancienneté$$, $$/contribution/3248-quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant$$, $$Ajout de la valeur de point pour la Flandre Douaisis, le Pas-de-Calais, Rouen et Dieppe.$$),
    (5, '2025-09-08'::date, 'evolution-juridique', $$Modification de la Question/Réponse : Arrêt maladie pendant les congés payés$$, $$/contribution/si-le-salarie-est-malade-pendant-ses-conges-quelles-en-sont-les-consequences$$, NULL),
    (6, '2025-09-08'::date, 'mise-a-jour-fonctionnelle', $$Mise en ligne d'un formulaire de satisfaction$$, NULL, $$Formulaire permettant d'évaluer la satisfaction suite à la refonte du site vers le système de design de l'État.$$),
    (7, '2025-09-15'::date, 'evolution-juridique', $$IDCC 1480 Question/Réponse : Salaire minimum$$, $$/contribution/1480-quel-est-le-salaire-minimum$$, $$Modification du salaire minimum hiérarchique pour les radios, agences de presse et piges agences de presse.$$),
    (8, '2025-09-15'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Prime d'ancienneté$$, $$/contribution/3248-quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant$$, $$Ajout de la valeur de point pour l'Indre-et-Loire et le Loiret.$$),
    (9, '2025-09-15'::date, 'evolution-juridique', $$Nouveau modèle : Mise en demeure pour abandon de poste$$, $$/modeles-de-courriers/modele-de-mise-en-demeure-pour-abandon-de-poste$$, $$Modèle de lettre pour mettre en demeure un salarié ayant abandonné volontairement son poste de justifier son absence et de reprendre son poste.$$),
    (10, '2025-09-15'::date, 'evolution-juridique', $$Nouveau modèle : Convocation à un entretien préalable au licenciement du salarié particulier employeur$$, $$/modeles-de-courriers/convocation-a-un-entretien-prealable-au-licenciement-du-salarie-du-particulier-employeur$$, $$Modèle permettant de convoquer le salarié du particulier employeur à un entretien préalable au licenciement.$$),
    (11, '2025-09-22'::date, 'evolution-juridique', $$IDCC 1501 Question/Réponse : Durée de la période d'essai$$, $$/contribution/1501-quelle-est-la-duree-maximale-de-la-periode-dessai-sans-et-avec-renouvellement$$, $$Modification de la durée initiale de la période d'essai et retrait de la mention « 1 mois pour les ouvriers ».$$),
    (12, '2025-09-22'::date, 'evolution-juridique', $$IDCC 1501 Question/Réponse : Renouvellement de la période d'essai$$, $$/contribution/1501-la-periode-dessai-peut-elle-etre-renouvelee$$, $$Précision sur le renouvellement de la période d'essai pour les cadres et retrait de la mention « les ouvriers ».$$),
    (13, '2025-09-29'::date, 'evolution-juridique', $$IDCC 1090 Question/Réponse : Salaire minimum$$, $$/contribution/1090-quel-est-le-salaire-minimum$$, $$Modification du salaire conventionnel.$$),
    (14, '2025-09-29'::date, 'evolution-juridique', $$IDCC 1090 Question/Réponse : Prime$$, $$/contribution/1090-quelles-sont-les-primes-prevues-par-la-convention-collective$$, $$Modification de l'indemnité de panier.$$),
    (15, '2025-09-29'::date, 'evolution-juridique', $$IDCC 2098 Question/Réponse : Congé pour évènements familiaux$$, $$/contribution/2098-les-conges-pour-evenements-familiaux$$, $$Modification du congé pour annonce d'une maladie ou d'un handicap pour un enfant.$$),
    (16, '2025-09-29'::date, 'evolution-juridique', $$Modification page : Arrêt maladie « L'employeur peut-il organiser un contrôle »$$, $$/information/arret-maladie-lemployeur-peut-il-organiser-un-controle$$, $$Ajout d'une précision sur la visite de pré-reprise.$$),
    (17, '2025-09-29'::date, 'evolution-juridique', $$Modification de la page : Le suivi médical des salariés$$, $$/information/suivi-medical-et-accompagnement-de-certains-salaries$$, $$Décret instaurant un examen périodique pour certains salariés et précision sur la visite de pré-reprise.$$),
    (18, '2025-10-13'::date, 'evolution-juridique', $$IDCC 1480 Question/Réponse : Salaire minimum$$, $$/contribution/1480-quel-est-le-salaire-minimum$$, $$Ajout du salaire minimum pour la presse quotidienne nationale.$$),
    (19, '2025-10-13'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Prime d'ancienneté$$, $$/contribution/3248-quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant$$, $$Ajout de la valeur de point pour l'arrondissement d'Avesnes (Maubeuge).$$),
    (20, '2025-10-13'::date, 'evolution-juridique', $$Nouveau modèle : Demande de prise de congé de paternité et de l'accueil de l'enfant$$, $$/modeles-de-courriers/modele-de-lettre-de-prise-de-conge-paternite-et-daccueil$$, $$Ce modèle permet au / à la salarié(e) de prendre des jours de congé de paternité et d'accueil de l'enfant.$$),
    (21, '2025-10-20'::date, 'evolution-juridique', $$IDCC 0016 Question/Réponse : Salaire minimum$$, $$/contribution/16-quel-est-le-salaire-minimum$$, $$Intégration du secteur des transports de fonds et valeurs aux transports routiers et activités auxiliaires.$$),
    (22, '2025-10-20'::date, 'evolution-juridique', $$IDCC 0016 Question/Réponse : Primes$$, $$/contribution/16-quelles-sont-les-primes-prevues-par-la-convention-collective$$, $$Intégration du secteur des transports de fonds et valeurs aux transports routiers et activités auxiliaires.$$),
    (23, '2025-10-20'::date, 'evolution-juridique', $$IDCC 0016 Question/Réponse : Jours fériés$$, $$/contribution/16-jours-feries-et-ponts-dans-le-secteur-prive$$, $$Intégration du secteur des transports de fonds et valeurs aux transports routiers et activités auxiliaires.$$),
    (24, '2025-10-20'::date, 'evolution-juridique', $$IDCC 0016 Question/Réponse : Travail du dimanche$$, $$/contribution/travail-du-dimanche-quelle-contrepartie$$, $$Intégration du secteur des transports de fonds et valeurs aux transports routiers et activités auxiliaires.$$),
    (25, '2025-10-27'::date, 'evolution-juridique', $$Nouveau modèle : Lettre de licenciement pour faute simple ou grave du salarié du particulier employeur$$, $$/modeles-de-courriers/lettre-de-licenciement-pour-faute-simple-ou-grave-du-salarie-du-particulier-employeur$$, $$Modèle permettant de notifier le licenciement pour faute simple ou grave d'un salarié du particulier employeur.$$),
    (26, '2025-10-27'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Prime d'ancienneté$$, $$/contribution/3248-quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant$$, $$Ajout de la valeur de point pour l'Aube, les Pyrénées-Atlantiques et Seignanx.$$),
    (27, '2025-10-27'::date, 'mise-a-jour-fonctionnelle', $$Mise à jour de la page déclaration d'accessibilité : totalement conforme$$, $$/accessibilite$$, $$Suite à un audit puis un contre-audit en octobre 2025, 100 % des critères RGAA sont respectés sur le site.$$),
    (28, '2025-10-27'::date, 'mise-a-jour-fonctionnelle', $$Ajout dans la page outil de services externes$$, $$/outils$$, NULL),
    (29, '2025-10-27'::date, 'mise-a-jour-fonctionnelle', $$Ajout d'un nouvel onglet « Code du travail » sur la page d'accueil$$, $$/$$, $$Accès direct à la page « Comprendre le droit du travail » et au glossaire depuis le haut du site.$$),
    (30, '2025-10-27'::date, 'mise-a-jour-fonctionnelle', $$Ajout de sous section dans le menu du site$$, NULL, $$Mise en avant dans chaque section du menu des principaux contenus les plus consultés.$$),
    (31, '2025-10-27'::date, 'evolution-juridique', $$IDCC 3248 Question/Réponse : Primes$$, $$/contribution/3248-quelles-sont-les-primes-prevues-par-la-convention-collective$$, $$Ajout de la valeur de point pour le Maine-et-Loire.$$),
    (32, '2025-10-27'::date, 'evolution-juridique', $$IDCC 2098 Question/Réponse : Salaire minimum$$, $$/contribution/2098-quel-est-le-salaire-minimum$$, $$Réévaluation du salaire minimum.$$),
    (33, '2025-10-27'::date, 'evolution-juridique', $$IDCC 275 Question/Réponse : Salaire minimum$$, $$/contribution/275-quel-est-le-salaire-minimum$$, $$Réévaluation du salaire minimum.$$),
    (34, '2025-11-10'::date, 'mise-a-jour-fonctionnelle', $$Ajout de la section « Comprendre le droit du travail » sur la page d'accueil$$, NULL, $$Permettre à l'usager de comprendre plus facilement le droit du travail.$$),
    (35, '2025-12-01'::date, 'evolution-juridique', $$Question/Réponse : Heures supplémentaires : contreparties$$, $$/contribution/heures-supplementaires$$, $$Création d'une nouvelle page avec ces déclinaisons par convention collective.$$),
    (36, '2025-12-08'::date, 'mise-a-jour-fonctionnelle', $$Ajout du nouveau parcours de recherche$$, NULL, $$Permettre à l'usager de trouver plus facilement une information en droit du travail.$$),
    (37, '2025-12-08'::date, 'mise-a-jour-fonctionnelle', $$Ajout de la section "Quoi de neuf" sur la page d'accueil$$, NULL, $$Permettre à l'usager de voir les nouveautés du code du travail numérique.$$),
    (38, '2025-12-15'::date, 'mise-a-jour-fonctionnelle', $$Ajout des infographies dans les Questions/Réponses$$, NULL, $$Permettre à l'usager d'avoir une réponse complète et synthétique en droit du travail.$$),
    (39, '2025-12-22'::date, 'evolution-juridique', $$IDCC 86 Question/Réponse : Maintien de salaire$$, $$/contribution/86-en-cas-darret-maladie-du-salarie-lemployeur-doit-il-assurer-le-maintien-de-salaire$$, $$Le maintien de salaire est désormais assuré dès le premier jour d'arrêt maladie (suppression du délai de carence de 3 jours).$$),
    (40, '2025-12-22'::date, 'evolution-juridique', $$IDCC 1480 Question/Réponse : Salaire minimum$$, $$/contribution/1480-quel-est-le-salaire-minimum$$, $$Modification des grilles de salaires pour les journalistes de la presse périodique et hebdomadaire.$$),
    (41, '2025-12-22'::date, 'evolution-juridique', $$Nouveau modèle : Demande de retour anticipé après un congé parental d'éducation à temps partiel$$, $$/modeles-de-courriers/demande-de-retour-anticipe-a-la-suite-dun-conge-parental-deducation-a-temps-partiel$$, $$Ce modèle de lettre s'adresse au salarié qui souhaite demander un retour anticipé après un congé parental d'éducation à temps partiel.$$),
    (42, '2025-12-22'::date, 'evolution-juridique', $$Nouveau modèle : Demande de retour anticipé après un congé parental d'éducation à temps plein$$, $$/modeles-de-courriers/demande-de-retour-anticipe-a-la-suite-dun-conge-parental-deducation-a-temps-plein$$, $$Ce modèle de lettre s'adresse au salarié qui souhaite demander un retour anticipé après un congé parental d'éducation à temps plein.$$),
    (43, '2025-12-22'::date, 'evolution-juridique', $$Nouveau modèle : Demande de prolongation et/ou de transformation du congé parental d'éducation à temps partiel$$, $$/modeles-de-courriers/demande-de-prolongation-et-ou-de-transformation-du-conge-parental-deducation-a-temps-partiel$$, $$Ce modèle de lettre s'adresse au salarié qui souhaite demander la prolongation du congé parental d'éducation à temps plein et/ou sa transformation en activité à temps partiel.$$),
    (44, '2025-12-22'::date, 'evolution-juridique', $$Nouveau modèle : Demande de prolongation et/ou de transformation du congé parental d'éducation à temps plein$$, $$/modeles-de-courriers/demande-de-prolongation-et-ou-de-transformation-du-conge-parental-deducation-a-temps-plein$$, $$Ce modèle de lettre s'adresse au salarié qui souhaite demander la prolongation du congé parental d'éducation à temps partiel et/ou sa transformation en congé parental d'éducation à temps plein.$$),
    (45, '2026-01-05'::date, 'evolution-juridique', $$Nouvelle fiche juridique : Le contrat de valorisation de l'expérience (CVE)$$, $$/fiche-ministere-travail/le-contrat-de-valorisation-de-lexperience-cve$$, NULL),
    (46, '2026-01-05'::date, 'evolution-juridique', $$Nouveau cas de recours de CDD dans le modèle de courrier$$, $$/modeles-de-courriers/contrat-de-travail-a-duree-determinee-cdd$$, $$Ajout d'un cas de recours de CDD dans le modèle : reconversion professionnelle dans le cadre d'une mobilité professionnelle interne ou externe à l'entreprise.$$),
    (47, '2026-01-05'::date, 'evolution-juridique', $$Modification de la durée maximale d'un CDD$$, $$/contribution/quelle-peut-etre-la-duree-maximale-dun-cdd$$, $$Durée maximale pour un CDD de reconversion professionnelle : selon la réalisation de l'objet du contrat, avec une durée minimale de 6 mois.$$),
    (48, '2026-01-05'::date, 'evolution-juridique', $$IDCC 1518 - Question/Réponse : Prime d'ancienneté$$, $$/contribution/1518-quand-le-salarie-a-t-il-droit-a-une-prime-danciennete-quel-est-son-montant$$, $$Modification du montant de la prime d'ancienneté.$$),
    (49, '2026-01-05'::date, 'evolution-juridique', $$IDCC 1351 - Question/Réponse : primes prévues par la convention collective$$, $$/contribution/1351-quelles-sont-les-primes-prevues-par-la-convention-collective$$, $$Modification du montant de la prime panier, de l'indemnité panier, de la prime d'entretien des tenues et ajout de l'indemnité d'amortissement et d'entretien du chien.$$),
    (50, '2026-01-05'::date, 'evolution-juridique', $$Question/Réponse : Quel est le salaire minimum ?$$, $$/contribution/quel-est-le-salaire-minimum$$, $$Revalorisation du SMIC au 1er janvier 2026 et nouvelles grilles de salaire des conventions collectives impactées.$$),
    (51, '2026-01-05'::date, 'evolution-juridique', $$Question/Réponse : Indemnités du congé maternité$$, $$/contribution/quelles-sont-les-conditions-dindemnisation-pendant-le-conge-de-maternite$$, $$Revalorisation du plafond mensuel de la Sécurité sociale au 1er janvier 2026 et déclinaison du montant de cette indemnité par convention collective.$$)
),
normalized AS (
  SELECT
    ord,
    week_start,
    kind,
    title,
    CASE
      WHEN NULLIF(href, '') IS NULL THEN NULL
      WHEN NULLIF(href, '') ~ '^https?://' THEN NULLIF(href, '')
      ELSE 'https://code.travail.gouv.fr' || NULLIF(href, '')
    END AS href,
    NULLIF(description, '') AS description
  FROM data
),
numbered AS (
  SELECT
    n.*,
    row_number() OVER (PARTITION BY week_start ORDER BY ord) AS pos_in_week
  FROM normalized n
),
to_insert AS (
  SELECT
    week_start,
    kind,
    title,
    href,
    description,
    ((week_start::timestamp AT TIME ZONE 'UTC') + interval '12 hours' + (pos_in_week * interval '1 second')) AS created_at,
    ((week_start::timestamp AT TIME ZONE 'UTC') + interval '12 hours' + (pos_in_week * interval '1 second')) AS updated_at
  FROM numbered
)
INSERT INTO "public"."what_is_new_items" (
  "week_start",
  "kind",
  "title",
  "href",
  "description",
  "created_at",
  "updated_at"
)
SELECT
  week_start,
  kind,
  title,
  href,
  description,
  created_at,
  updated_at
FROM to_insert;

-- 3. Publication des contenus dans la table documents
-- ============================================================================
-- On utilise les IDs générés automatiquement dans what_is_new_items
-- et on génère les cdtn_id en UUID v4
INSERT INTO "public"."documents" (
  "cdtn_id",
  "initial_id",
  "title",
  "meta_description",
  "source",
  "slug",
  "text",
  "document",
  "is_published",
  "is_searchable",
  "is_available"
)
SELECT
  gen_random_uuid()::text AS cdtn_id,
  w.id::text AS initial_id,
  w.title AS title,
  CASE
    WHEN w.description IS NOT NULL AND btrim(w.description) <> '' THEN btrim(w.description)
    ELSE 'Mise à jour - ' || w.title
  END AS meta_description,
  'what_is_new'::text AS source,
  ('quoi-de-neuf-' || w.id::text) AS slug,
  CASE
    WHEN w.description IS NOT NULL AND btrim(w.description) <> ''
      THEN w.title || E'\n\n' || btrim(w.description)
    ELSE w.title
  END AS text,
  jsonb_strip_nulls(
    jsonb_build_object(
      'title', w.title,
      'weekStart', w.week_start::text,
      'kind', w.kind,
      'description', NULLIF(btrim(w.description), ''),
      'url', NULLIF(w.href, ''),
      'createdAt', w.created_at,
      'updatedAt', w.updated_at
    )
  ) AS document,
  TRUE AS is_published,
  TRUE AS is_searchable,
  TRUE AS is_available
FROM "public"."what_is_new_items" w;