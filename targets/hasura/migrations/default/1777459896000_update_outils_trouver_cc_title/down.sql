UPDATE public.documents
SET
  title = 'Trouver sa convention collective',
  meta_description = 'Vous recherchez des informations traitées par votre convention collective ? Notre outil de recherche vous apporte une réponse en saisissant le nom de votre entreprise (ou siret) ou de votre convention collective (ou numéro IDCC).',
  text = 'trouver ma convention collective convention collective recherche ccn trouver ma cc',
  document = jsonb_set(
    jsonb_set(
      jsonb_set(
        document,
        '{metaTitle}',
        to_jsonb('Trouver sa convention collective'::text),
        true
      ),
      '{description}',
      to_jsonb('Recherchez une convention collective par Entreprise, SIRET, Nom ou numéro IDCC'::text),
      true
    ),
    '{displayTitle}',
    to_jsonb('Trouver sa convention collective'::text),
    true
             )
WHERE cdtn_id = 'db8ffe3574';

