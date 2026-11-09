# Piloter Metabase depuis le navigateur (Claude in Chrome)

Instance : `https://metabase-cdtn.fabrique.social.gouv.fr`. Dashboard par défaut :
`/dashboard/71-tableau-de-bord-du-cdtn-refonte-juillet-2026`.

Faits observés sur cette instance (à revérifier si quelque chose ne colle pas) :

| Élément | Valeur |
| ------- | ------ |
| Base des cartes (SQL natif) | **id 4**, « OVH PG CDTN » |
| Autres bases | 3 « Matomo » (à ne pas utiliser), 2 « Metabase DB », 1 « Sample Database » |
| Onglets du dashboard 71 | Vue d'ensemble (112), NPS (104), Simulateurs (99), Actualités (109), Contributions (100), Brut/net (111), Modèles de courrier (110), Conventions collectives (103, vide) |
| Grille | 24 colonnes ; `row` croît vers le bas ; ex. carte demi-largeur = `size_x` 12 |
| Collections | les cartes sont rangées par thème (ex. collection 124 pour les cartes Actualités) : reprendre celle des voisines |

## Mise en route

1. Charge les outils Chrome **en un seul appel** `ToolSearch` :
   `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__javascript_tool`
2. `tabs_context_mcp` (avec `createIfEmpty`), puis `navigate` vers le dashboard dans
   **un onglet créé pour la session** (n'utilise pas les onglets du PO). Ferme ton
   onglet à la fin.
3. Si la page demande de se connecter, ou si Chrome / l'extension n'est pas
   connecté : arrête-toi et demande au PO de se connecter (ne saisis jamais ses
   identifiants).
4. Tous les appels ci-dessous se font avec `javascript_tool` (`action:
   "javascript_exec"`) **depuis une page Metabase** : les URLs relatives (`/api/...`)
   utilisent la session du PO. Retourne du JSON **compact** (`JSON.stringify` d'un
   résumé) : les sorties longues sont tronquées.

Si les appels `/api` échouent (401/403), ou pour un geste que l'API ne couvre pas,
bascule sur l'interface (`computer`, `find`, `read_page`) et dis-le au PO.

## Lire le dashboard (lecture seule)

```js
const d = await fetch('/api/dashboard/71').then(r => r.json());
JSON.stringify({
  tabs: d.tabs.map(t => ({ id: t.id, name: t.name })),
  params: d.parameters.map(p => ({ id: p.id, name: p.name, slug: p.slug })),
  cartes: d.dashcards
    .filter(c => c.dashboard_tab_id === 109)           // l'onglet visé
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .map(c => ({
      id: c.id, card_id: c.card_id, r: c.row, c: c.col, w: c.size_x, h: c.size_y,
      nom: c.card?.name || c.visualization_settings?.text?.slice(0, 40),
      display: c.card?.display || c.visualization_settings?.virtual_card?.display,
      coll: c.card?.collection_id,
    })),
});
```

Lire le SQL d'une carte voisine : les cartes sont au format « pMBQL » : le SQL est
dans `card.dataset_query.stages[0].native` (et non `native.query`). Pour les
filtres (template-tags), regarde aussi `stages[0]['template-tags']`.

```js
const d = await fetch('/api/dashboard/71').then(r => r.json());
const c = d.dashcards.find(c => c.card?.name?.startsWith('Top 15'));
c.card.dataset_query.stages[0].native;
```

## Lister les tables agrégées disponibles

```js
const m = await fetch('/api/database/4/metadata').then(r => r.json());
JSON.stringify(m.tables.map(t => ({
  id: t.id, nom: t.name,
  colonnes: t.fields.map(f => f.name + ':' + f.base_type.replace('type/', '')),
})).filter(t => /parcours|completion|visites|nps/.test(t.nom)));
```

(Les tables apparaissent au fil des ingestions ; si une table attendue manque, ne
bricole pas : c'est un sujet dev.)

## Valider une requête avant de créer la carte

Exécute le SQL sans rien créer :

```js
const sql = `SELECT slug, SUM(nb_visites_actualite) AS entrees
FROM parcours_actualites
WHERE date >= current_date - interval '90 days' AND date < current_date
GROUP BY slug ORDER BY entrees DESC LIMIT 5`;
const r = await fetch('/api/dataset', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ database: 4, type: 'native', native: { query: sql } }),
}).then(r => r.json());
JSON.stringify({ erreur: r.error, cols: r.data?.cols?.map(c => c.name), lignes: r.data?.rows?.slice(0, 10) });
```

Regarde `erreur`, les colonnes et les premières lignes avant d'aller plus loin.
Cette étape ne modifie rien.

## Créer la carte (écriture : seulement après accord du PO)

```js
const card = await fetch('/api/card', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Titre lisible de la carte',
    description: null,
    display: 'table',                    // table | bar | line | row | scalar | smartscalar | funnel…
    collection_id: 124,                  // celle des cartes voisines
    dataset_query: { type: 'native', database: 4, native: { query: sql } },
    visualization_settings: {},
  }),
}).then(r => r.json());
JSON.stringify({ id: card.id, erreur: card.message });
```

Pour qu'un graphique en ligne/barres affiche bien les bons axes, ajoute dans
`visualization_settings` : `{"graph.dimensions": ["mois"], "graph.metrics":
["taux"]}` (noms de colonnes du SQL). Pour un indicateur avec comparaison
(`smartscalar`), la requête doit renvoyer une colonne de date et une de valeur,
agrégées par période : copie les réglages d'une carte voisine du même type
(`c.visualization_settings`).

## Ajouter la carte au dashboard

**Piège principal** : `PUT /api/dashboard/71` **remplace** toute la liste des
cartes (`dashcards`) et des onglets (`tabs`). Envoyer seulement la nouvelle carte
**supprime toutes les autres**. Toujours : lire l'état courant, le sauvegarder,
envoyer l'existant + la nouvelle.

1. **Sauvegarde** : garde le JSON complet avant modification (dans le scratchpad
   de la session, par ex. `…/scratchpad/dashboard-71-avant.json`, via un `Write`
   de la valeur retournée en petits morceaux ou en vérifiant au moins le nombre
   de cartes et de onglets). Metabase garde aussi un historique : menu « ⋯ » du
   dashboard → « Historique », qui permet de revenir en arrière.
2. **Emplacement** : en bas de l'onglet visé (`row` = max de `row + size_y` des
   cartes de l'onglet), `col: 0`, largeur 24 pour un tableau/graphique pleine
   largeur, 12 pour une demi-largeur, hauteur 6 à 8 pour un graphique.
3. **Envoi** (la nouvelle carte a un `id` négatif ; les autres gardent leurs `id`) :

```js
const d = await fetch('/api/dashboard/71').then(r => r.json());
const avant = { nbCartes: d.dashcards.length, nbOnglets: d.tabs.length };
const TAB = 109;                                   // onglet visé
const bas = Math.max(0, ...d.dashcards.filter(c => c.dashboard_tab_id === TAB)
                               .map(c => c.row + c.size_y));
const nouvelle = {
  id: -1, card_id: CARD_ID, dashboard_tab_id: TAB,
  row: bas, col: 0, size_x: 24, size_y: 7,
  parameter_mappings: [], series: [], visualization_settings: {},
};
const res = await fetch('/api/dashboard/71', {
  method: 'PUT', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tabs: d.tabs, dashcards: [...d.dashcards, nouvelle] }),
}).then(r => r.json());
JSON.stringify({ avant, apres: { nbCartes: res.dashcards?.length, nbOnglets: res.tabs?.length }, erreur: res.message });
```

4. **Contrôle** : `apres.nbCartes` doit valoir `avant.nbCartes + 1` et les onglets
   rester identiques. Sinon, **restaure immédiatement** (renvoie la sauvegarde
   par `PUT`, ou « Historique » dans l'interface) et préviens le PO.

Les filtres du dashboard (période, nom de simulateur…) ne s'appliquent à une carte
que par `parameter_mappings` ; une carte sans mapping ignore ces filtres, ce qui
est normal pour une carte à fenêtre fixe de 90 jours.

## Vérifier visuellement

`navigate` vers `…/dashboard/71-…?tab=109-actualités` (remplace par l'onglet),
`computer` → `screenshot`, et vérifie que la nouvelle carte s'affiche, que les
voisines n'ont pas bougé, et qu'il n'y a pas d'erreur de requête sur la carte.
Donne au PO l'URL de l'onglet.

## Si l'API se comporte autrement qu'attendu

Metabase change parfois de format (ex. `dataset_query` en pMBQL à la lecture). En
cas d'erreur 400 : relis le message, compare avec le JSON d'une carte existante
(`GET /api/card/<id>`) et adapte. Au bout de 2-3 essais infructueux, arrête et
explique au PO où ça coince plutôt que d'insister.

## Pas d'effet de bord

- Ne supprime pas de carte ni de dashboard (`DELETE`) ; si une carte créée par
  erreur doit disparaître, demande l'accord du PO (archivage `PUT /api/card/<id>`
  avec `archived: true` plutôt que suppression).
- Ne modifie pas les bases de données, les permissions ni les réglages admin.
- Ne crée pas de dashboard : on travaille dans celui désigné par le PO.
