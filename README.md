# Code du travail numérique - Administration

> Administrating [code.travail.gouv.fr](https://code.travail.gouv.fr) content.

## Auditabilité

Lorsqu'on rajoute une table, ne pas oublier de rajouter dans la migration l'appel à la fonction d'audit

```sql

-- ajout des triggers d'audit sur la table documents
select audit.audit_table('documents');

-- Le trigger peut etre configuré pour
select audit.audit_table('documents',
-- se declencher au niveau ROW ou STATEMENT
'false',
-- enregistrer le text de la requête
'false',
-- ignorer d'enregistrer certains champs
'{text}');
```

Pour voir la [configuration du trigger](targets/hasura/migrations/1613474820206_audit_trigger/up.sql)

## Suppression des données anciennes

Les données de certaines tables sont nettoyées automatiquement.

Pour ce faire nous utilisons les [cron trigger Hasura](https://hasura.io/docs/1.0/graphql/core/scheduled-triggers/create-cron-trigger.html) pour faire un appel sur notre API Next.Js. L'API va mettre à jour les entrées de la table `clean_jobs` ce qui va alors déclencher des triggers associés à chaque ligne.

Pour l'instant seulement 2 triggers sont en place:

- nettoyage de la table `alerts` (alertes traitées conservés pour 3mois)
- nettoyage de la table `audit.logged_action` (actions conservées pour 3mois)
