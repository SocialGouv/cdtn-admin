-- Mise à jour des descriptions des thèmes de niveau 2 (source = 'themes').
--
-- La description d'un thème est stockée dans public.documents.document->>'description'.
-- Chaque thème est identifié par son slug ET le slug de son thème parent
-- (relation public.document_relations de type 'theme' : document_a = parent, document_b = enfant)
-- afin d'éviter toute ambiguïté si un slug existait sous plusieurs parents.
--
-- Colonne source du document fourni : "description Claude contrast".
-- La colonne meta_description n'est pas modifiée.

WITH new_descriptions(parent_slug, slug, description) AS (
  VALUES
    ('fin-et-rupture-du-contrat', 'abandon-de-poste', 'Absence non justifiée, mise en demeure, présomption de démission'),
    ('difficultes-de-lentreprise', 'accord-de-performance-collective', 'Négociation, contenu et effets de l''APC sur le contrat, refus du salarié et licenciement'),
    ('formation', 'actions-de-formation', 'Dispositifs de formation du salarié : période de reconversion, projet de transition, bilan de compétences'),
    ('difficultes-de-lentreprise', 'activite-partielle-anciennement-chomage-partiel', 'Indemnisation, durée, réduction d''horaire et démarches en activité partielle et APLD'),
    ('maternite-paternite-et-adoption', 'adoption', 'Congé d''adoption : bénéficiaires, durée et protection du salarié'),
    ('jeunes-travailleurs-alternance-et-stages', 'aides-a-linsertion-et-a-la-formation', 'Dispositifs pour l''emploi des jeunes : contrat d''engagement jeune, CIE jeunes, alternance'),
    ('particulier-employeur', 'aides-financieres-et-exonerations', 'Crédit d''impôt, plafonds de dépenses et exonérations de cotisations pour l''emploi à domicile'),
    ('maternite-paternite-et-adoption', 'allocations', 'Aides financières liées aux enfants : PreParE, PAJE, AJPP, AEEH, montants et démarches CAF'),
    ('temps-de-travail', 'amenagement-du-temps-de-travail', 'Répartition du temps de travail sur l''année, accord collectif, heures supplémentaires, repos'),
    ('sante-au-travail', 'arret-de-travail-droits-et-obligations', 'Démarches, sorties autorisées, contrôles, reprise anticipée et protection de l''emploi'),
    ('sante-au-travail', 'arret-maladie-indemnisation', 'Maintien de salaire par l''employeur, calcul du montant versé, conditions à remplir et durée'),
    ('particulier-employeur', 'assistant-e-maternel-e', 'Contrat, salaire, temps de travail, congés et agrément de l''assistante maternelle à domicile'),
    ('remuneration', 'bulletin-de-salaire', 'Mentions obligatoires, remise papier ou électronique, montant net social, conservation, litiges'),
    ('contrat-de-travail', 'cdd', 'Motifs de recours, durée maximale, renouvellement et cas particuliers du CDD (usage, saisonnier)'),
    ('contrat-de-travail', 'cdi', 'Conclusion d''un CDI, cas où il est obligatoire, CDI de chantier et travail intermittent'),
    ('particulier-employeur', 'cesu', 'Cesu déclaratif et préfinancé : différences, services payables, démarches de l''employeur'),
    ('representation-du-personnel-et-negociation-collective', 'comite-social-et-economique-cse', 'Mise en place, attributions, fonctionnement et moyens du CSE selon la taille de l''entreprise'),
    ('formation', 'compte-personnel-de-formation-cpf', 'Droits CPF en euros, plafonds, consultation du compte, formations éligibles et abondements'),
    ('maternite-paternite-et-adoption', 'conge-lie-a-la-maladie-ou-handicap-de-lenfant', 'Absences pour enfant malade, congé de présence parentale, don de jours : durée et conditions'),
    ('maternite-paternite-et-adoption', 'conge-parental', 'Conditions, durée, demande, temps plein ou partiel, prolongation et retour dans l''entreprise'),
    ('formation', 'conges-et-remuneration-de-la-formation', 'Rémunération et protection sociale des salariés et demandeurs d''emploi pendant une formation'),
    ('conges', 'conges-lies-a-la-vie-familiale-mariage-deces-naissance', 'Durées, démarches et indemnisation des congés pour évènement familial (mariage, naissance, décès...)'),
    ('conges', 'conges-lies-a-une-autre-activite', 'Congés pour création d''entreprise, mobilité volontaire sécurisée...'),
    ('conges', 'conges-payes', 'Acquisition, prise et report des congés payés : arrêt maladie, préavis, fermeture d''entreprise...'),
    ('conges', 'conges-speciaux-sabbatique-demenagement', 'Congé sabbatique : conditions, demande, retour dans l''entreprise. Et congé sans solde.'),
    ('jeunes-travailleurs-alternance-et-stages', 'contrat-dapprentissage', 'Apprentissage : conditions du contrat, alternance, aides à l''embauche, aménagements'),
    ('jeunes-travailleurs-alternance-et-stages', 'contrat-de-professionnalisation', 'Bénéficiaires, durée, conditions de travail, obligations de l''employeur et aides à l''embauche'),
    ('contrat-de-travail', 'convention-collective-applicable', 'Identifier et consulter la convention collective applicable à l''entreprise'),
    ('remuneration', 'cotisations-sociales-et-patronales', 'Exonérations de cotisations et d''impôts selon les zones (ZFRR, BER, ZRD, ZFU-TE) et l''effectif'),
    ('emplois-aides-demandeurs-demploi-et-insertion', 'demandeurs-demploi', 'Indemnisation chômage : ARE, ASS, conditions, cumul avec un revenu, reprise d''activité'),
    ('fin-et-rupture-du-contrat', 'demission', 'Lettre de démission, préavis, rétractation, CDD, arrêt de travail et droit au chômage.'),
    ('retraite', 'depart-anticipe-et-retraite-progressive', 'Partir avant l''âge légal ou travailler à temps partiel en touchant une part de sa retraite'),
    ('retraite', 'depart-volontaire-a-la-retraite', 'Prévenir l''employeur, demander sa pension en ligne, choisir sa date de départ et son versement'),
    ('temps-de-travail', 'dimanches', 'Repos dominical, dérogations possibles, zones touristiques, majoration de salaire et repos'),
    ('fin-et-rupture-du-contrat', 'documents-de-fin-de-contrat-et-droit-des-salaries', 'Certificat de travail, solde de tout compte, attestation France Travail : contenu et remise'),
    ('conflit-controle-et-contentieux', 'droit-du-conseiller-prudhomal', 'Absences, formation, rémunération et frais des conseillers prud''hommes, dates de renouvellement'),
    ('temps-de-travail', 'duree-du-travail', 'Durée légale, heures supplémentaires, forfaits en heures ou en jours, CET et congé sabbatique'),
    ('representation-du-personnel-et-negociation-collective', 'elections-professionnelles-et-a-la-representation', 'Organiser les élections du CSE : calendrier, candidatures, deux tours, résultats, recours'),
    ('particulier-employeur', 'emploi-direct-par-lemployeur-particulier', 'Contrat, salaire, temps de travail, démission, licenciement du salarié employé à domicile'),
    ('formation', 'entretien-professionnel-et-conseil-en-evolution-professionnelle-cep', 'Entretien professionnel obligatoire tous les 4 ans et accompagnement gratuit par le CEP'),
    ('risques-professionnels-et-preventions', 'environnement-specifique-de-travail', 'Chutes de hauteur, risque routier, fortes chaleurs, milieu hyperbare, TMS : prévenir sur le terrain'),
    ('remuneration', 'epargne-salariale-participation-et-interessement', 'Intéressement, participation, prime de partage de la valeur, PEE, Perco : règles et versements'),
    ('risques-professionnels-et-preventions', 'equipements-de-travail-et-de-protection', 'Masques respiratoires, filtres, gants : types, choix, règles d''utilisation et obligations'),
    ('representation-du-personnel-et-negociation-collective', 'financement-et-formation', 'Certification des compétences des élus et mandataires syndicaux : candidature, examen, budget CSE'),
    ('fin-et-rupture-du-contrat', 'force-majeure-prise-dacte-et-resiliation-judiciaire', 'Ruptures hors licenciement et démission : force majeure, prise d''acte, saisine du juge, décès'),
    ('embauche', 'formalites-dembauche', 'Déclaration préalable à l''embauche, registre du personnel, documents et infos à remettre au salarié'),
    ('conflit-controle-et-contentieux', 'formalites-obligatoires', 'Registres à tenir, DSN mensuelle, DUERP, durées de conservation des documents d''entreprise'),
    ('conflit-controle-et-contentieux', 'greve', 'Conditions d''une grève licite, retenue sur salaire, lock-out et règlement des conflits'),
    ('sante-au-travail', 'harcelement-moral-et-sexuel', 'Définitions, prévention par l''employeur, recours des victimes ou témoins et sanctions encourues'),
    ('fin-et-rupture-du-contrat', 'heures-pour-recherche-demploi', 'Absences pour chercher un emploi pendant le préavis : droits, nombre d''heures, démarches'),
    ('temps-de-travail', 'heures-supplementaires', 'Définition des heures supplémentaires, majorations de salaire, repos compensateur et limites'),
    ('sante-au-travail', 'inaptitude-au-travail', 'Après un arrêt maladie, un accident du travail ou une maladie professionnelle : démarches et droits'),
    ('fin-et-rupture-du-contrat', 'indemnite-de-licenciement', 'Calcul de l''indemnité légale de licenciement : salaire de référence, ancienneté, montant'),
    ('conflit-controle-et-contentieux', 'inspection-du-travail', 'Missions, pouvoirs de contrôle et obligations des agents, et quand les solliciter'),
    ('contrat-de-travail', 'interim', 'Mission d''intérim : durée maximale, mentions du contrat, période d''essai, droits du salarié'),
    ('jeunes-travailleurs-alternance-et-stages', 'jeunes-travailleurs', 'Règles d''emploi des mineurs : durée du travail, travail de nuit, job d''été, autorisations'),
    ('conges', 'jours-feries-et-ponts', 'Calendrier des jours fériés, rémunération, ponts, récupération et journée de solidarité'),
    ('formation', 'la-certification-professionnelle', 'Titres professionnels du ministère du Travail : accès, VAE, centres agréés, jurys, bilans'),
    ('emplois-aides-demandeurs-demploi-et-insertion', 'les-structures-dinsertion', 'EA, EATT, ESAT, EI, ETTI, ACI : recrutement, aides au poste, mise à disposition'),
    ('representation-du-personnel-et-negociation-collective', 'les-syndicats', 'Désignation, missions et heures de délégation des délégués syndicaux et représentants de section'),
    ('hygiene-securite-et-conditions-de-travail', 'liberte-et-vie-privee-du-salarie', 'Signes religieux, lanceurs d''alerte, vidéosurveillance, données personnelles : vos droits au travail'),
    ('fin-et-rupture-du-contrat', 'licenciement-pour-inaptitude', 'Procédure de licenciement après un avis d''inaptitude : reclassement, indemnités, recours'),
    ('difficultes-de-lentreprise', 'licenciement-pour-motif-economique', 'PSE, consultation du CSE, validation DREETS, ordre des départs et congé de mobilité'),
    ('fin-et-rupture-du-contrat', 'licenciement-pour-motif-personnel-ou-disciplinaire', 'Motifs valables ou interdits, faute disciplinaire, sanctions d''un licenciement abusif'),
    ('hygiene-securite-et-conditions-de-travail', 'local-de-travail', 'Risques de circulation interne et espaces confinés : règles, signalisation, prévention'),
    ('conflit-controle-et-contentieux', 'lutte-contre-les-discriminations', 'Égalité femmes-hommes, égalité salariale, Index, recours et sanctions en cas de discrimination'),
    ('sante-au-travail', 'maladie-accident-du-travail-et-maladie-professionnelle', 'Accident du travail, maladie professionnelle : déclaration, arrêt, reprise et prévention.'),
    ('maternite-paternite-et-adoption', 'maternite', 'Durée du congé prénatal et postnatal, report, salaire maintenu et protection du licenciement'),
    ('embauche', 'methodes-de-recrutement', 'Rédiger une offre d''emploi, questions autorisées au candidat, tests, choix sans discriminer'),
    ('contrat-de-travail', 'mise-a-disposition-detachement-et-portage-salarial', 'Droits des salariés détachés en France, obligations des employeurs, recours en cas de litige'),
    ('retraite', 'mise-a-la-retraite', 'Conditions de mise à la retraite par l''employeur, durée du préavis et droits du salarié'),
    ('contrat-de-travail', 'modification-du-contrat-de-travail', 'Changer une clause, un lieu de travail ou d''employeur : accord du salarié, refus, transfert'),
    ('retraite', 'montant-de-la-pension-de-retraite', 'Calcul de la pension de base du salarié du privé : taux plein, décote, surcote.'),
    ('sante-au-travail', 'mutuelle-et-protection-sociale', 'Mutuelle d''entreprise obligatoire, cas de dispense, panier de soins, versement santé et C2S'),
    ('representation-du-personnel-et-negociation-collective', 'negociation-dans-lentreprise', 'GPEC, négociations annuelles obligatoires, usages d''entreprise et consultation des accords'),
    ('representation-du-personnel-et-negociation-collective', 'negociation-de-branche', 'Dépôt, extension et publication des accords de branche et interprofessionnels, rôle de la CPPNI'),
    ('retraite', 'nombre-de-trimestres-de-retraite', 'Durée d''assurance, trimestres validés ou assimilés, rachat d''études ou de stages, calcul.'),
    ('maternite-paternite-et-adoption', 'paternite', 'Durée, délais, fractionnement et indemnisation du congé de paternité et d''accueil de l''enfant'),
    ('embauche', 'periode-dessai', 'Durée maximale, renouvellement, rupture et délai de prévenance en période d''essai'),
    ('emplois-aides-demandeurs-demploi-et-insertion', 'politique-de-lemploi', 'PMSMP, insertion par l''activité économique, Fonds de développement de l''insertion, prime d''activité'),
    ('fin-et-rupture-du-contrat', 'preavis-de-licenciement-et-de-demission', 'Durée du préavis, dispense, non-respect, faute grave ou arrêt maladie pendant le préavis.'),
    ('risques-professionnels-et-preventions', 'prevention-des-risques', 'Principes de prévention, risques psychosociaux, addictions, postes à risques et obligations'),
    ('remuneration', 'primes', 'Prime d''ancienneté et médaille d''honneur du travail : conditions, échelons, démarches'),
    ('contrat-de-travail', 'principales-caracteristiques', 'Contrat écrit ou non, mentions obligatoires, lien de subordination, modèles et attestation'),
    ('fin-et-rupture-du-contrat', 'procedure-de-licenciement', 'Étapes du licenciement personnel : entretien préalable, lettre, préavis, sanctions.'),
    ('fin-et-rupture-du-contrat', 'procedure-et-licenciement-pour-motif-economique', 'Étapes du licenciement économique individuel ou de 2 à 9 salariés, CSP, congé de reclassement'),
    ('particulier-employeur', 'recours-a-un-organisme-de-service-a-la-personne', 'Activités, déclaration, agrément ou autorisation des organismes de services à la personne'),
    ('retraite', 'regime-de-retraite', 'Caisses de retraite, retraite par points Agirc-Arrco, compte retraite en ligne et âge de départ'),
    ('hygiene-securite-et-conditions-de-travail', 'reglement-interieur-dune-entreprise', 'Obligation dès 50 salariés, contenu, consultation du CSE, dépôt, affichage et contrôle'),
    ('remuneration', 'remboursements-de-frais-et-avantages', 'Frais de transport domicile-travail, forfait mobilités durables, frais professionnels et avantages en nature'),
    ('temps-de-travail', 'repos', 'Temps de pause, pause déjeuner et repos quotidien : durées minimales et dérogations'),
    ('risques-professionnels-et-preventions', 'risques-chimiques', 'Dangers des produits chimiques au travail : acides, cyanures, silice — prévention et aides'),
    ('fin-et-rupture-du-contrat', 'rupture-conventionnelle', 'Rupture à l''amiable d''un CDI : procédure, entretiens, délais, homologation et indemnité'),
    ('difficultes-de-lentreprise', 'rupture-conventionnelle-collective-et-depart-volontaire', 'Accord de rupture conventionnelle collective : mise en place, candidatures, dépôt sur RUPCO'),
    ('fin-et-rupture-du-contrat', 'rupture-et-fin-dun-cdd-ctt', 'Fin ou rupture anticipée d''un CDD ou d''une mission d''intérim, prime de précarité, délai de carence'),
    ('conflit-controle-et-contentieux', 'saisir-le-conseil-de-prudhommes', 'Démarches, délais, conciliation, audience, appel : régler un litige aux prud''hommes'),
    ('remuneration', 'salaire', 'SMIC, minima conventionnels, versement du salaire, rémunération en CDD et intérim.'),
    ('particulier-employeur', 'salaries-au-pair', 'Accueil d''un jeune au pair : conditions, convention Cerfa, argent de poche, titre de séjour, Urssaf'),
    ('conflit-controle-et-contentieux', 'sanctions-disciplinaires', 'Avertissement, mise à pied, rétrogradation : procédure, délais, sanctions interdites, recours'),
    ('difficultes-de-lentreprise', 'sauvegarde-redressement-et-liquidation-judiciaire', 'Paiement des salaires et créances par l''AGS quand l''entreprise est en difficulté'),
    ('hygiene-securite-et-conditions-de-travail', 'securite-au-travail', 'Obligations employeur et salarié, DUERP, coordination SPS et PPSPS sur les chantiers'),
    ('jeunes-travailleurs-alternance-et-stages', 'stage', 'Convention, durée maximale, gratification, obligations de l''entreprise et arrêt du stage'),
    ('representation-du-personnel-et-negociation-collective', 'statut-des-salaries-proteges', 'Salariés protégés : liste des mandats concernés, durée de la protection, autorisation de l''inspection du travail, recours'),
    ('sante-au-travail', 'suivi-medical-et-medecine-du-travail', 'Visites d''information et de prévention, suivi renforcé, périodicité, professionnels de santé'),
    ('temps-de-travail', 'temps-dequivalence-astreintes-et-temps-dhabillage', 'Heures d''équivalence, secteurs concernés, compensation des astreintes et temps d''habillage'),
    ('temps-de-travail', 'temps-partiel', 'Contrat, durée minimale de 24 h, heures complémentaires, congés payés du salarié à temps partiel'),
    ('temps-de-travail', 'travail-de-nuit-et-en-soiree', 'Horaires de nuit et de soirée : mise en place, durées maximales, repos et majorations'),
    ('conflit-controle-et-contentieux', 'travail-illegal', 'Travail dissimulé, marchandage, emploi d''étranger sans titre : infractions et sanctions'),
    ('emplois-aides-demandeurs-demploi-et-insertion', 'travailleurs-en-situation-de-handicap', 'RQTH, aides à l''embauche, emploi accompagné, suivi médical et obligation d''emploi de 6 %'),
    ('embauche', 'travailleurs-etrangers', 'Autorisation de travail, vérification du titre de séjour, sanctions et maîtrise du français'),
    ('emplois-aides-demandeurs-demploi-et-insertion', 'type-de-contrat', 'CUI-CAE, CUI-CIE, PEC, adultes-relais : conditions, durée, aides et démarches d''embauche')
)
UPDATE public.documents d
SET document = jsonb_set(
  COALESCE(d.document, '{}'::jsonb),
  '{description}',
  to_jsonb(n.description),
  true
)
FROM new_descriptions n
JOIN public.documents p
  ON p.source = 'themes'
 AND p.slug = n.parent_slug
JOIN public.document_relations r
  ON r.document_a = p.cdtn_id
 AND r.type = 'theme'
WHERE d.source = 'themes'
  AND d.cdtn_id = r.document_b
  AND d.slug = n.slug;
