UPDATE public.documents
SET
  title = 'Trouver sa convention collective et ses accords d''entreprise',
  meta_description = 'Trouvez votre convention collective et les accords d’entreprise en saisissant le nom de votre entreprise, SIRET ou numéro IDCC.',
  text = 'Accédez facilement aux informations de votre convention collective et, le cas échéant, aux accords propres à votre entreprise. Saisissez le nom de votre entreprise (ou SIRET) ou celui de votre convention collective (ou numéro IDCC) pour obtenir une réponse personnalisée.',
  document = jsonb_set(
    jsonb_set(
      jsonb_set(
        document,
        '{metaTitle}',
        to_jsonb('Trouver sa convention collective et ses accords d''entreprise'::text),
        true
      ),
      '{description}',
      to_jsonb('Trouvez votre convention collective et les accords d’entreprise en saisissant le nom de votre entreprise, SIRET ou numéro IDCC.'::text),
      true
    ),
    '{displayTitle}',
    to_jsonb('Trouver sa convention collective et ses accords d''entreprise'::text),
    true
             )
WHERE cdtn_id = 'db8ffe3574';

