# gestion des accès elasticsearch

Afin d'accéder au serveur elasticsearch, nous utilisons une authentification à base de token.
[voir la documention de l'api api-key](https://www.elastic.co/guide/en/elasticsearch/reference/master/security-api-create-api-key.html)
Ces `tokens` sont générés via l'api depuis la console kibana.

Chaque token correspond à un ensemble de roles ainsi qu'une liste d'index sur lequel le token sera actif.
[voir la documentation sur les roles](https://www.elastic.co/guide/en/elasticsearch/reference/master/security-api-put-role.html)
Nous avons besoin de 2 tokens

-   un token pour l'api
-   un token pour manipuler les index et les remplir

## token API dev

Le token utiliser par l'api nécessite les besoin des 

```json
POST /_security/api_key
{
  "name": "cdtn_api",
  "role_descriptors": {
    "role-update": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["cdtn-*"],
          "privileges": ["read"]
        }
      ]
    }
  }
}
```

## token pour la mise à jour d'un document (preview)

```json
POST /_security/api_key
{
  "name": "cdtn_ingest",
  "role_descriptors": {
    "role-update": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["cdtn-*"],
          "privileges": ["index"]
        }
      ]
    }
  }
}
```

## token pour l'ingestion

```json
POST /_security/api_key
{
  "name": "cdtn_ingest",
  "role_descriptors": {
    "role-update": {
      "cluster": ["all"],
      "index": [
        {
          "names": ["cdtn-*"],
          "privileges": ["create_doc", "create_index", "delete_index", "manage"]
        }
      ]
    }
  }
}
```

à noter que pour le cluster de prod, nous utilisons le pattern d'index suivant `["cdtn-prod*"]`

L'api retourne une paire id/ai_key clé qu'il faut ensuite transformer  avant d'être dans le code js 

```json
{
  "id" : "<key_id>",
  "name" : "update_prod",
  "api_key" : "<api_key>"
}
```

```sh
ELASTIC_TOKEN=echo -n "<key_id>:<api_key>" | base64
```

```js
const elasticsearch = require("@elastic/elasticsearch")

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTIC_TOKEN
  },
});
```
