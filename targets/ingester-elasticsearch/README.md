# gestion des accès elasticsearch

Afin d'accéder au serveur elasticsearch, nous utilisons une authentification à base de token.
[voir la documention de l'api api-key](https://www.elastic.co/guide/en/elasticsearch/reference/master/security-api-create-api-key.html)

Ces `tokens` sont générés via l'api depuis la console kibana (dans "Stack management" / "API keys") ou avec le script [`./scripts/create-keys.sh`](./scripts/create-keys.sh)

Chaque token correspond à un ensemble de roles ainsi qu'une liste d'index sur lequel le token sera actif.
[voir la documentation sur les roles](https://www.elastic.co/guide/en/elasticsearch/reference/master/security-api-put-role.html)
Nous avons besoin de 3 tokens :

- `cdtn_api`: token pour l'api (lecture)
- `cdtn_ingest`: un token pour manipuler les index et les remplir (lecture/écriture)
- `cdtn_update`:  un token pour mettre à jour un index (preview)

L'api retourne une paire id/api_key clé qu'il faut ensuite transformer avant de pouvoir l'utiliser 

```json
{
  "id" : "<key_id>",
  "name" : "<key_name>",
  "api_key" : "<api_key>"
}
```

```sh
ELASTICSEARCH_TOKEN_INGEST=$(echo -n "<key_id>:<api_key>" | base64)
```

```js
const elasticsearch = require("@elastic/elasticsearch")

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_TOKEN_INGEST
  },
});
```
