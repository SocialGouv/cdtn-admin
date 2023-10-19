# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.20.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.19.1...v2.20.0) (2023-10-19)

### Bug Fixes

- **comments ui:** meilleur affiche des commentaires & changement de statuts dans les contribs ([#1070](https://github.com/SocialGouv/cdtn-admin/issues/1070)) ([59e35bb](https://github.com/SocialGouv/cdtn-admin/commit/59e35bbe0cc01d0b93d1d8a9bd54dd70f06b141f))
- **frontend:** ajout du titre dans le header ([#1085](https://github.com/SocialGouv/cdtn-admin/issues/1085)) ([8cdb494](https://github.com/SocialGouv/cdtn-admin/commit/8cdb494a9d094f37a0011550b8e2d483d6e2b03b))

### Features

- **admin:** ajout de la suppression d'un commentaire ([#1081](https://github.com/SocialGouv/cdtn-admin/issues/1081)) ([9503f87](https://github.com/SocialGouv/cdtn-admin/commit/9503f878ee7c384aed540bf4edf52767409e193f))
- afficher les erreurs dans un snackbar ([#1044](https://github.com/SocialGouv/cdtn-admin/issues/1044)) ([61accc3](https://github.com/SocialGouv/cdtn-admin/commit/61accc368fcb32363468e26a82359177d415419e))
- ajout des liens dans l editeur ([#1082](https://github.com/SocialGouv/cdtn-admin/issues/1082)) ([000828e](https://github.com/SocialGouv/cdtn-admin/commit/000828ed7b35248441c48efb1b18b1ea320d7295))
- **contrib:** désactivation du formulaire quand on soumet ([#1083](https://github.com/SocialGouv/cdtn-admin/issues/1083)) ([7bbdb95](https://github.com/SocialGouv/cdtn-admin/commit/7bbdb95204bb3286dd86bd4cc6b05e034c891883))
- popup confirmation avant quit ([#1077](https://github.com/SocialGouv/cdtn-admin/issues/1077)) ([4d574e4](https://github.com/SocialGouv/cdtn-admin/commit/4d574e4bb45e72deab890bc4c2190013e6fa8273))

## [2.19.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.19.0...v2.19.1) (2023-10-10)

### Bug Fixes

- bug contribution validation sur page non editable ([#1075](https://github.com/SocialGouv/cdtn-admin/issues/1075)) ([b63771a](https://github.com/SocialGouv/cdtn-admin/commit/b63771aab8f474aebee9eee4e5a8ef9e747ba01f))

# [2.19.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.18.0...v2.19.0) (2023-10-09)

### Bug Fixes

- **nextjs:** downgrade nextjs version ([#1071](https://github.com/SocialGouv/cdtn-admin/issues/1071)) ([bca21f8](https://github.com/SocialGouv/cdtn-admin/commit/bca21f80d9328e6f008dafa50ec71fd95b3c3b9f))

### Features

- **upload:** refacto files in typescript ([#1050](https://github.com/SocialGouv/cdtn-admin/issues/1050)) ([a70fc4f](https://github.com/SocialGouv/cdtn-admin/commit/a70fc4fdbf254876d80b0fc477062ce0983f58af))

# [2.18.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.9...v2.18.0) (2023-10-09)

### Bug Fixes

- contribution ref link ([#1047](https://github.com/SocialGouv/cdtn-admin/issues/1047)) ([1b44bfa](https://github.com/SocialGouv/cdtn-admin/commit/1b44bfa86f19da97d64e61db993c4013de268648))
- **dependencies:** remove un-used dependencies ([#1034](https://github.com/SocialGouv/cdtn-admin/issues/1034)) ([529ffb4](https://github.com/SocialGouv/cdtn-admin/commit/529ffb40bcf79738494d745b0bb756ebd43ab3a4))
- **wording:** rename answer type on contribution page ([#1052](https://github.com/SocialGouv/cdtn-admin/issues/1052)) ([2a0ace5](https://github.com/SocialGouv/cdtn-admin/commit/2a0ace55918f3bda72a34ae9ce8b81b92fdd5a16))

### Features

- 1032 admin amélioration bouton maj des données notamment le vraiment ([#1033](https://github.com/SocialGouv/cdtn-admin/issues/1033)) ([ee41911](https://github.com/SocialGouv/cdtn-admin/commit/ee419116d67ba45b11f32346ee323ae001c3a444))
- contribution zod ([#1056](https://github.com/SocialGouv/cdtn-admin/issues/1056)) ([6f8021f](https://github.com/SocialGouv/cdtn-admin/commit/6f8021fe83ce6969fa78e66e0e766595eaaf4159)), closes [#1040](https://github.com/SocialGouv/cdtn-admin/issues/1040)

### Reverts

- Revert "feat:1007 admin liste des contenus modifiés lors dune maj des données - page info (#1013)" ([ec3584f](https://github.com/SocialGouv/cdtn-admin/commit/ec3584f59094dc238d4ece3eeadd9c02993608af)), closes [#1013](https://github.com/SocialGouv/cdtn-admin/issues/1013)

## [2.17.9](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.8...v2.17.9) (2023-09-29)

### Bug Fixes

- **dev:** correction du probleme de socket en phase de dev en HMR + suppression de sentry ([#1045](https://github.com/SocialGouv/cdtn-admin/issues/1045)) ([d371ec1](https://github.com/SocialGouv/cdtn-admin/commit/d371ec1e7e15b3bd4a017f021099ca0edc9c7911))

## [2.17.8](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.7...v2.17.8) (2023-09-28)

### Bug Fixes

- **env:** set default credentials when `.env` is not set ([#1041](https://github.com/SocialGouv/cdtn-admin/issues/1041)) ([f545433](https://github.com/SocialGouv/cdtn-admin/commit/f54543347a4ed7ece6738b14ac42cbd9d6f828cc))
- **env:** use config file instead of env for public variable ([#1039](https://github.com/SocialGouv/cdtn-admin/issues/1039)) ([68eaefa](https://github.com/SocialGouv/cdtn-admin/commit/68eaefa0690e43699eca633d46ff1eda2ebb6058))

## [2.17.7](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.6...v2.17.7) (2023-09-27)

### Bug Fixes

- **env:** remove env file in dockerfile ([34ab0ab](https://github.com/SocialGouv/cdtn-admin/commit/34ab0aba5a4dbc1eb9c1042eba7fd1dc8ee217e6))

## [2.17.6](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.5...v2.17.6) (2023-09-27)

### Bug Fixes

- **env:** add env in gitignore ([d99d7c9](https://github.com/SocialGouv/cdtn-admin/commit/d99d7c9b221e3b48b1b897d9cbac515360edfed4))
- **env:** remove env in targets ([2262e45](https://github.com/SocialGouv/cdtn-admin/commit/2262e4515c01224af115f72b74eedcceca871f9e))

## [2.17.5](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.4...v2.17.5) (2023-09-27)

**Note:** Version bump only for package frontend

## [2.17.4](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.3...v2.17.4) (2023-09-27)

**Note:** Version bump only for package frontend

## [2.17.3](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.2...v2.17.3) (2023-09-27)

### Bug Fixes

- **contributions:** ajout d'un selecteur de references pour les fiches SP ([#1029](https://github.com/SocialGouv/cdtn-admin/issues/1029)) ([c57d763](https://github.com/SocialGouv/cdtn-admin/commit/c57d763762567d4d7497059a47e8b7b853e998df))
- **contributions:** rename otherAnswer field by contentType ([#1027](https://github.com/SocialGouv/cdtn-admin/issues/1027)) ([a590140](https://github.com/SocialGouv/cdtn-admin/commit/a5901403d289602c24f7b87c6b96ebeb2af39486))
- **contribution:** utilisation de l'ID de l'article à la place du CID pour générer le lien ([#1030](https://github.com/SocialGouv/cdtn-admin/issues/1030)) ([69f703c](https://github.com/SocialGouv/cdtn-admin/commit/69f703cb68bee64297ac678502d1f0368ed34d66))
- yarn berry + fetch + docker opti + sec ([#1012](https://github.com/SocialGouv/cdtn-admin/issues/1012)) ([81bce48](https://github.com/SocialGouv/cdtn-admin/commit/81bce4838781e60c05a084769a35cf0d2a26609c))

## [2.17.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.1...v2.17.2) (2023-09-25)

### Bug Fixes

- **kali ref:** fix kali ref on contributions ([#1026](https://github.com/SocialGouv/cdtn-admin/issues/1026)) ([19d20c0](https://github.com/SocialGouv/cdtn-admin/commit/19d20c0eda5167fb37524bf7bf9cba004b500e3c))

## [2.17.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.17.0...v2.17.1) (2023-09-25)

**Note:** Version bump only for package frontend

# [2.17.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.16.1...v2.17.0) (2023-09-25)

### Features

- ajout du support de l'accordéon sur les contributions ([#1020](https://github.com/SocialGouv/cdtn-admin/issues/1020)) ([c55bd4c](https://github.com/SocialGouv/cdtn-admin/commit/c55bd4cb09946c266a7e01775ef17e9884240270))
- **alerts:** ajout d'un feature de notification pour les alertes de la dares ([#1004](https://github.com/SocialGouv/cdtn-admin/issues/1004)) ([530043d](https://github.com/SocialGouv/cdtn-admin/commit/530043d68ce7def89555ae696d0ac2d6f9aa346b))
- remise des icones de status et ajout de l'index de question ([#1021](https://github.com/SocialGouv/cdtn-admin/issues/1021)) ([d734c39](https://github.com/SocialGouv/cdtn-admin/commit/d734c398d91e3bd6cd7348aeb706aa3c2a57bb8f)), closes [#1022](https://github.com/SocialGouv/cdtn-admin/issues/1022)

## [2.16.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.16.0...v2.16.1) (2023-09-20)

### Bug Fixes

- admin search content ([#1019](https://github.com/SocialGouv/cdtn-admin/issues/1019)) ([f1e3b18](https://github.com/SocialGouv/cdtn-admin/commit/f1e3b18776e39a3d84e00c58883a35ed403f852e))

# [2.16.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.15.1...v2.16.0) (2023-09-18)

### Features

- **contribs:** add global stats on contrib page ([#1017](https://github.com/SocialGouv/cdtn-admin/issues/1017)) ([a522361](https://github.com/SocialGouv/cdtn-admin/commit/a522361b83b6dc0f31914289b78ac62336db7cfd))

## [2.15.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.15.0...v2.15.1) (2023-09-18)

### Bug Fixes

- correction sur le bouton de soumission au changement de mot de passe ([#1016](https://github.com/SocialGouv/cdtn-admin/issues/1016)) ([54269cc](https://github.com/SocialGouv/cdtn-admin/commit/54269ccc9cc2f1ce6388824ea18b0c22fba239df))

# [2.15.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.14.0...v2.15.0) (2023-09-15)

### Bug Fixes

- ne plus envoyer le secret_token depuis le frontend ([#1014](https://github.com/SocialGouv/cdtn-admin/issues/1014)) ([ff10f07](https://github.com/SocialGouv/cdtn-admin/commit/ff10f070ec6b45ab4f4aabd070afeb7917c524ca))

# [2.14.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.13.0...v2.14.0) (2023-09-05)

### Features

- ajout des tableaux dans l'editeur ([#1001](https://github.com/SocialGouv/cdtn-admin/issues/1001)) ([5866be8](https://github.com/SocialGouv/cdtn-admin/commit/5866be834d5f451ce52d6f25c6444b899e568447))
- migration to zod ([#1002](https://github.com/SocialGouv/cdtn-admin/issues/1002)) ([083c018](https://github.com/SocialGouv/cdtn-admin/commit/083c018388a5e6f9aa7a6c57587491a0c661bb33))

# [2.13.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.12.1...v2.13.0) (2023-08-25)

### Bug Fixes

- **build:** set utils in lib folder ([c9d29ac](https://github.com/SocialGouv/cdtn-admin/commit/c9d29acb0cb6c38e938016e2007c22bbf06d643d))

### Features

- add warnings when DILA API call failed to get references ([#987](https://github.com/SocialGouv/cdtn-admin/issues/987)) ([65b922d](https://github.com/SocialGouv/cdtn-admin/commit/65b922d9cb6450a7a0246d628b30e0f93fbbf9ff))
- ameliorer le poid sur les contributions generique ([#997](https://github.com/SocialGouv/cdtn-admin/issues/997)) ([7a4c014](https://github.com/SocialGouv/cdtn-admin/commit/7a4c01427974af044bdac73919ee8ac83c3bb904))
- **ui:** replace `theme-ui` by `mui` + migration vers `dsfr` ([#992](https://github.com/SocialGouv/cdtn-admin/issues/992)) ([5241a6b](https://github.com/SocialGouv/cdtn-admin/commit/5241a6b7c16ea3df812fb8c39df9f4cb618391ca))

## [2.12.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.12.0...v2.12.1) (2023-08-04)

### Bug Fixes

- **theme-ui:** move component to mui on EditorialContent ([#970](https://github.com/SocialGouv/cdtn-admin/issues/970)) ([6d594df](https://github.com/SocialGouv/cdtn-admin/commit/6d594df92753ced786192c0fa74b25e6cff4e3f2))

# [2.12.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.11.4...v2.12.0) (2023-08-02)

**Note:** Version bump only for package frontend

## [2.11.4](https://github.com/SocialGouv/cdtn-admin/compare/v2.11.3...v2.11.4) (2023-07-31)

**Note:** Version bump only for package frontend

## [2.11.3](https://github.com/SocialGouv/cdtn-admin/compare/v2.11.2...v2.11.3) (2023-07-28)

**Note:** Version bump only for package frontend

## [2.11.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.11.1...v2.11.2) (2023-07-25)

### Bug Fixes

- 976 admin améliorer la recherche articles des cc + nos contenus à nous ([#978](https://github.com/SocialGouv/cdtn-admin/issues/978)) ([670f897](https://github.com/SocialGouv/cdtn-admin/commit/670f89757c38984af5f948bcc1864be7fefb8a16))
- mettre le titre sur une seule ligne ([#982](https://github.com/SocialGouv/cdtn-admin/issues/982)) ([452f67c](https://github.com/SocialGouv/cdtn-admin/commit/452f67ce2bd8cfcd9e5f15753ce452c35a8c5da7))

## [2.11.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.11.0...v2.11.1) (2023-07-18)

**Note:** Version bump only for package frontend

# [2.11.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.10.2...v2.11.0) (2023-07-12)

### Bug Fixes

- **ui:** move theme-ui components to mui (Home + Alerts) ([#964](https://github.com/SocialGouv/cdtn-admin/issues/964)) ([279b011](https://github.com/SocialGouv/cdtn-admin/commit/279b01167a9f121ef52789f3a17bf558e610524e))

## [2.10.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.10.1...v2.10.2) (2023-07-04)

### Bug Fixes

- contributions issues ([#967](https://github.com/SocialGouv/cdtn-admin/issues/967)) ([8bd3e96](https://github.com/SocialGouv/cdtn-admin/commit/8bd3e9656d15d95ed931af7c5445f88ec0ccbe9b))

## [2.10.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.10.0...v2.10.1) (2023-07-03)

**Note:** Version bump only for package frontend

# [2.10.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.9.1...v2.10.0) (2023-07-03)

### Bug Fixes

- **auth:** remove inMemoryToken from `auth` ([#958](https://github.com/SocialGouv/cdtn-admin/issues/958)) ([61a623f](https://github.com/SocialGouv/cdtn-admin/commit/61a623f71efb433daa6dd6ec9c1d9f43167b630e))
- **contributions:** make button behavior right on answer form ([#962](https://github.com/SocialGouv/cdtn-admin/issues/962)) ([9bdf988](https://github.com/SocialGouv/cdtn-admin/commit/9bdf988dfbf4e35c40f1067346cc46a50ac75dcb))
- **upgrade:** set node version to 20 ([#939](https://github.com/SocialGouv/cdtn-admin/issues/939)) ([1b1b23e](https://github.com/SocialGouv/cdtn-admin/commit/1b1b23ef111f48ebc790fe075463a1634cd0d69b))

## [2.9.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.9.0...v2.9.1) (2023-06-26)

### Bug Fixes

- **auth:** delete log ([#953](https://github.com/SocialGouv/cdtn-admin/issues/953)) ([8f86d86](https://github.com/SocialGouv/cdtn-admin/commit/8f86d867626c398d8cc172f1582a088c95955a06))
- downgrade theme-ui ([#952](https://github.com/SocialGouv/cdtn-admin/issues/952)) ([1995f55](https://github.com/SocialGouv/cdtn-admin/commit/1995f55e47736f210977ba83decbc2a8ec392c52))

# [2.9.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.8.0...v2.9.0) (2023-06-26)

### Bug Fixes

- **lerna:** modify internals dependencies ([c39b77d](https://github.com/SocialGouv/cdtn-admin/commit/c39b77d65692619463f96b3f5eb51e7b1ea976ef))

### Features

- **dep:** update package.json ([69c69ac](https://github.com/SocialGouv/cdtn-admin/commit/69c69ac26b7ac857d1a06c8bbb80e73811460038))

# [2.8.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.7.1...v2.8.0) (2023-06-26)

### Bug Fixes

- **ci:** correction de la branche de review ([#949](https://github.com/SocialGouv/cdtn-admin/issues/949)) ([eedf525](https://github.com/SocialGouv/cdtn-admin/commit/eedf525fc7153c08e403a42f5e4b0e322d524e0a))
- **code:** clean-up de parties du css and extraction de certaines logiques métiers dans des fichiers séparée ([#929](https://github.com/SocialGouv/cdtn-admin/issues/929)) ([5fb6add](https://github.com/SocialGouv/cdtn-admin/commit/5fb6add6506877ab1cb5457a8f631225e56b6f31))
- **contributions:** bug d'affichage des commentaires ([#941](https://github.com/SocialGouv/cdtn-admin/issues/941)) ([839c784](https://github.com/SocialGouv/cdtn-admin/commit/839c784afff297af6c9e7d2d50472f8afa369647))
- remove mui-labs ([#948](https://github.com/SocialGouv/cdtn-admin/issues/948)) ([c52cbec](https://github.com/SocialGouv/cdtn-admin/commit/c52cbec12e82aa585f205f235d8a94f9dece35d7))

### Features

- **contributions:** edit references labels ([#935](https://github.com/SocialGouv/cdtn-admin/issues/935)) ([ad63b82](https://github.com/SocialGouv/cdtn-admin/commit/ad63b82bd1723134744d05332ee80073fda35dc4))
- implement filter on most recent article refs ([#942](https://github.com/SocialGouv/cdtn-admin/issues/942)) ([9d8f52a](https://github.com/SocialGouv/cdtn-admin/commit/9d8f52ab356296b775c2cccf432c4f9c4bea0957))

## [2.7.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.7.0...v2.7.1) (2023-06-01)

**Note:** Version bump only for package frontend

# [2.7.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.6.1...v2.7.0) (2023-05-30)

### Features

- 895 outil de contrib création page édition réponses ([#903](https://github.com/SocialGouv/cdtn-admin/issues/903)) ([4b2f5d4](https://github.com/SocialGouv/cdtn-admin/commit/4b2f5d4735c797b7e049e6908c5256200e7e0c4e)), closes [#907](https://github.com/SocialGouv/cdtn-admin/issues/907)
- implementation contribution list ([#897](https://github.com/SocialGouv/cdtn-admin/issues/897)) ([1643d85](https://github.com/SocialGouv/cdtn-admin/commit/1643d853ab9cfbb61bde03394aaf60adade968d4)), closes [#912](https://github.com/SocialGouv/cdtn-admin/issues/912) [#907](https://github.com/SocialGouv/cdtn-admin/issues/907) [#913](https://github.com/SocialGouv/cdtn-admin/issues/913) [#915](https://github.com/SocialGouv/cdtn-admin/issues/915) [#916](https://github.com/SocialGouv/cdtn-admin/issues/916)

## [2.6.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.6.0...v2.6.1) (2023-05-04)

**Note:** Version bump only for package frontend

# [2.6.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.5.4...v2.6.0) (2023-05-04)

### Features

- add logs on sitemap endpoint ([#908](https://github.com/SocialGouv/cdtn-admin/issues/908)) ([3c48450](https://github.com/SocialGouv/cdtn-admin/commit/3c48450028296e1e1dbbabf4e4075b4a11e60fce))

## [2.5.4](https://github.com/SocialGouv/cdtn-admin/compare/v2.5.3...v2.5.4) (2023-03-23)

### Bug Fixes

- build error for frontend ([#889](https://github.com/SocialGouv/cdtn-admin/issues/889)) ([620ffbb](https://github.com/SocialGouv/cdtn-admin/commit/620ffbbb98146c210b6b56ba7f5718aa5ab5b419))
- **hasura:** add config yaml for cli ([#884](https://github.com/SocialGouv/cdtn-admin/issues/884)) ([2c28b8a](https://github.com/SocialGouv/cdtn-admin/commit/2c28b8aeb28b264b0329f53a4e64b0cc86a442f6))

## [2.5.3](https://github.com/SocialGouv/cdtn-admin/compare/v2.5.2...v2.5.3) (2023-03-02)

**Note:** Version bump only for package frontend

## [2.5.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.5.1...v2.5.2) (2023-02-23)

**Note:** Version bump only for package frontend

## [2.5.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.5.0...v2.5.1) (2023-02-10)

**Note:** Version bump only for package frontend

# [2.5.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.4.5...v2.5.0) (2023-02-10)

### Features

- implémentation de la désactivation de compte utilisateur ([#870](https://github.com/SocialGouv/cdtn-admin/issues/870)) ([a336477](https://github.com/SocialGouv/cdtn-admin/commit/a33647702d52fbb1e0ba668ded522a733fa669b7))

## [2.4.5](https://github.com/SocialGouv/cdtn-admin/compare/v2.4.4...v2.4.5) (2022-12-28)

**Note:** Version bump only for package frontend

## [2.4.4](https://github.com/SocialGouv/cdtn-admin/compare/v2.4.3...v2.4.4) (2022-12-16)

**Note:** Version bump only for package frontend

## [2.4.3](https://github.com/SocialGouv/cdtn-admin/compare/v2.4.2...v2.4.3) (2022-12-16)

**Note:** Version bump only for package frontend

## [2.4.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.4.1...v2.4.2) (2022-12-15)

**Note:** Version bump only for package frontend

## [2.4.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.4.0...v2.4.1) (2022-12-15)

**Note:** Version bump only for package frontend

# [2.4.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.8...v2.4.0) (2022-12-15)

### Bug Fixes

- **fiches-sp:** bug dans la suppression des fiches SP ([#852](https://github.com/SocialGouv/cdtn-admin/issues/852)) ([30d4571](https://github.com/SocialGouv/cdtn-admin/commit/30d457193a7fa75693bb2e2bb63f51860337ca37))

## [2.3.8](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.7...v2.3.8) (2022-12-07)

**Note:** Version bump only for package frontend

## [2.3.7](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.6...v2.3.7) (2022-12-06)

**Note:** Version bump only for package frontend

## [2.3.6](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.5...v2.3.6) (2022-12-06)

**Note:** Version bump only for package frontend

## [2.3.5](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.4...v2.3.5) (2022-11-08)

**Note:** Version bump only for package frontend

## [2.3.4](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.3...v2.3.4) (2022-10-13)

**Note:** Version bump only for package frontend

## [2.3.3](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.2...v2.3.3) (2022-10-12)

**Note:** Version bump only for package frontend

## [2.3.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.1...v2.3.2) (2022-10-12)

### Bug Fixes

- **permissions:** ajout des permissions sur les tables dans le schéma v1 ([#830](https://github.com/SocialGouv/cdtn-admin/issues/830)) ([110f989](https://github.com/SocialGouv/cdtn-admin/commit/110f989095ffcc8f063794b27883e39cc37a3606))

## [2.3.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.0...v2.3.1) (2022-10-10)

**Note:** Version bump only for package frontend

# [2.3.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.2.0...v2.3.0) (2022-10-06)

### Bug Fixes

- contrib edition ([#816](https://github.com/SocialGouv/cdtn-admin/issues/816)) ([b4bb2b3](https://github.com/SocialGouv/cdtn-admin/commit/b4bb2b3025b94174b9e55a647137fea370d2a680))
- **contrib:** bug sur l'ajout d'un commentaire et suppression d'une réf ([#818](https://github.com/SocialGouv/cdtn-admin/issues/818)) ([971cf8f](https://github.com/SocialGouv/cdtn-admin/commit/971cf8f9244f8d30977a2f49bf6e5c6847ad5332))
- remove powered by header ([#819](https://github.com/SocialGouv/cdtn-admin/issues/819)) ([fe57b40](https://github.com/SocialGouv/cdtn-admin/commit/fe57b40a2e826f0e9064677492394d3fdafa93ff))
- **secu:** sanitize upload to avoid xss attack ([#813](https://github.com/SocialGouv/cdtn-admin/issues/813)) ([d571729](https://github.com/SocialGouv/cdtn-admin/commit/d571729b1199f2acf49dd7ba6eb0737c7fdafbf2))

### Features

- use super user instead of hasura admin role ([#812](https://github.com/SocialGouv/cdtn-admin/issues/812)) ([5c9ba5b](https://github.com/SocialGouv/cdtn-admin/commit/5c9ba5bbff245d832a6e3bffbd3afce6278d82d0))

# [2.2.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.1.0...v2.2.0) (2022-09-05)

### Bug Fixes

- password update email not throwing ([#811](https://github.com/SocialGouv/cdtn-admin/issues/811)) ([6e835eb](https://github.com/SocialGouv/cdtn-admin/commit/6e835eb300f5682e2e0b7722a812d8a8275adcee))

### Features

- add questionnaire field ([#807](https://github.com/SocialGouv/cdtn-admin/issues/807)) ([81a600b](https://github.com/SocialGouv/cdtn-admin/commit/81a600b2ac0587928c54d4fe97a589e529ae9b8f))
- add validation to password change ([#798](https://github.com/SocialGouv/cdtn-admin/issues/798)) ([0fd5d32](https://github.com/SocialGouv/cdtn-admin/commit/0fd5d329badcf5b9831b82a1bf894a7d00f1d7a1))

# [2.1.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.0.1...v2.1.0) (2022-09-02)

### Features

- **headers:** add security headers to frontend and contributions ([#802](https://github.com/SocialGouv/cdtn-admin/issues/802)) ([11381f2](https://github.com/SocialGouv/cdtn-admin/commit/11381f23b30f341b3c665ad6be68c2edf5c45cb1))

## [2.0.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.0.0...v2.0.1) (2022-08-29)

### Bug Fixes

- **api:** limit uploadable extensions ([#794](https://github.com/SocialGouv/cdtn-admin/issues/794)) ([6f28030](https://github.com/SocialGouv/cdtn-admin/commit/6f280303ecd3611df9d694438942cc1a56202fab))

# [2.0.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.20.0...v2.0.0) (2022-08-17)

**Note:** Version bump only for package frontend

# [1.20.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.19.2...v1.20.0) (2022-08-17)

### Features

- ajout de blocs multiple dans les sections admin page info ([#785](https://github.com/SocialGouv/cdtn-admin/issues/785)) ([a2e7894](https://github.com/SocialGouv/cdtn-admin/commit/a2e7894d306fa7d378bd7268d4da514befd4f30b)), closes [#789](https://github.com/SocialGouv/cdtn-admin/issues/789) [#786](https://github.com/SocialGouv/cdtn-admin/issues/786) [#795](https://github.com/SocialGouv/cdtn-admin/issues/795)

## [1.19.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.19.1...v1.19.2) (2022-07-21)

### Bug Fixes

- bug page à la une ([#787](https://github.com/SocialGouv/cdtn-admin/issues/787)) ([2784b82](https://github.com/SocialGouv/cdtn-admin/commit/2784b82fcc6c47c6aad33542994afe7f6e43c4ab))

## [1.19.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.19.0...v1.19.1) (2022-07-21)

### Bug Fixes

- display/save prequalified contents ([#786](https://github.com/SocialGouv/cdtn-admin/issues/786)) ([d4ca12e](https://github.com/SocialGouv/cdtn-admin/commit/d4ca12eed554fb113cfafe6f6e4057fea0133aa8))

# [1.19.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.18.2...v1.19.0) (2022-07-08)

### Bug Fixes

- **contribution:** correction sur les échecs d'authentification ([#782](https://github.com/SocialGouv/cdtn-admin/issues/782)) ([6e714ae](https://github.com/SocialGouv/cdtn-admin/commit/6e714aed9db6ad633edbf8b862c302ca093d9740))

### Features

- Ajout du paramètre d'affichage en onglet/accordéon des contenus info ([#780](https://github.com/SocialGouv/cdtn-admin/issues/780)) ([855a581](https://github.com/SocialGouv/cdtn-admin/commit/855a58148226682a44b67215f02d5b8f38112034))

## [1.18.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.18.1...v1.18.2) (2022-06-16)

**Note:** Version bump only for package frontend

## [1.18.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.18.0...v1.18.1) (2022-06-09)

**Note:** Version bump only for package frontend

# [1.18.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.17.2...v1.18.0) (2022-06-07)

**Note:** Version bump only for package frontend

## [1.17.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.17.1...v1.17.2) (2022-06-06)

**Note:** Version bump only for package frontend

## [1.17.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.17.0...v1.17.1) (2022-06-02)

**Note:** Version bump only for package frontend

# [1.17.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.8...v1.17.0) (2022-06-01)

### Features

- migration de l'outil de contrib ([#766](https://github.com/SocialGouv/cdtn-admin/issues/766)) ([3fe04a7](https://github.com/SocialGouv/cdtn-admin/commit/3fe04a7bfb7f58b3a0227a18a1999aebabe109c5))

## [1.16.8](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.7...v1.16.8) (2022-05-18)

**Note:** Version bump only for package frontend

## [1.16.7](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.6...v1.16.7) (2022-05-17)

**Note:** Version bump only for package frontend

## [1.16.6](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.5...v1.16.6) (2022-05-17)

**Note:** Version bump only for package frontend

## [1.16.5](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.4...v1.16.5) (2022-05-17)

**Note:** Version bump only for package frontend

## [1.16.4](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.3...v1.16.4) (2022-05-17)

**Note:** Version bump only for package frontend

## [1.16.3](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.2...v1.16.3) (2022-05-16)

**Note:** Version bump only for package frontend

## [1.16.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.1...v1.16.2) (2022-05-16)

**Note:** Version bump only for package frontend

## [1.16.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.0...v1.16.1) (2022-05-16)

**Note:** Version bump only for package frontend

# [1.16.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.15.1...v1.16.0) (2022-05-12)

### Features

- migration from gitlab to github ([#730](https://github.com/SocialGouv/cdtn-admin/issues/730)) ([4c6dd02](https://github.com/SocialGouv/cdtn-admin/commit/4c6dd027364b0eb31a0d7ae8ddc6c080399e6317))
