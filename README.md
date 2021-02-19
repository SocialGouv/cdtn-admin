# Code du travail numérique - Administration

> Administrating [code.travail.gouv.fr](https://code.travail.gouv.fr) content.

## Auditabilité

Lorsqu'on rajoute une table, ne pas oublier de rajouter dans la migration l'appel à la fonction d'audit

```sql

-- ajout des triggers d'audit sur la table document
select audit.audit_table('documents');

-- Le trigger peut etre configurer pour
select audit.audit_table('documents',
-- se declencher au niveau ROW ou STATEMENT
'false',
-- enregister le text de la requète
'false',
-- ignorer d'enregistrer certains champs
'{text}');
```

Pour voir la [configuration du trigger](targets/hasura/migrations/1613474820206_audit_trigger/up.sql)
