# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.4](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.3...v2.3.4) (2022-10-13)


### Bug Fixes

* **kube-workflow:** min cpu limits ([#833](https://github.com/SocialGouv/cdtn-admin/issues/833)) ([7de1b17](https://github.com/SocialGouv/cdtn-admin/commit/7de1b173382897490d91b9730869480090e8afd5))





## [2.3.3](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.2...v2.3.3) (2022-10-12)

**Note:** Version bump only for package cdtn-admin





## [2.3.2](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.1...v2.3.2) (2022-10-12)


### Bug Fixes

* **permissions:** ajout des permissions sur les tables dans le schéma v1 ([#830](https://github.com/SocialGouv/cdtn-admin/issues/830)) ([110f989](https://github.com/SocialGouv/cdtn-admin/commit/110f989095ffcc8f063794b27883e39cc37a3606))
* update MCAS proxy adresses ([18aafca](https://github.com/SocialGouv/cdtn-admin/commit/18aafca34d21e3acd9ab286f9fc52ad48f49d286))





## [2.3.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.3.0...v2.3.1) (2022-10-10)


### Bug Fixes

* add a new ip to whitelist ([#829](https://github.com/SocialGouv/cdtn-admin/issues/829)) ([f0eaf38](https://github.com/SocialGouv/cdtn-admin/commit/f0eaf38a312f9a0e2d5bcb2ec84a6444aa28991f))
* **ccn:** add default effectif / update ccn stopword and synos ([#827](https://github.com/SocialGouv/cdtn-admin/issues/827)) ([352d66d](https://github.com/SocialGouv/cdtn-admin/commit/352d66d13deca01296b9d789ea2dcaf0eaed079e)), closes [#4440](https://github.com/SocialGouv/cdtn-admin/issues/4440)





# [2.3.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.2.0...v2.3.0) (2022-10-06)


### Bug Fixes

* contrib edition ([#816](https://github.com/SocialGouv/cdtn-admin/issues/816)) ([b4bb2b3](https://github.com/SocialGouv/cdtn-admin/commit/b4bb2b3025b94174b9e55a647137fea370d2a680))
* **contrib:** bug sur l'ajout d'un commentaire et suppression d'une réf ([#818](https://github.com/SocialGouv/cdtn-admin/issues/818)) ([971cf8f](https://github.com/SocialGouv/cdtn-admin/commit/971cf8f9244f8d30977a2f49bf6e5c6847ad5332))
* **covisits:** update ES logs reading mechanism  ([#823](https://github.com/SocialGouv/cdtn-admin/issues/823)) ([ff9e50b](https://github.com/SocialGouv/cdtn-admin/commit/ff9e50b1687130fce0b65da4cc5e29d4899b51fb))
* **ingester:** ajout de feature qui permet de désactiver certaines parties du processus d'export ([#824](https://github.com/SocialGouv/cdtn-admin/issues/824)) ([4e22dbd](https://github.com/SocialGouv/cdtn-admin/commit/4e22dbd6c4a7efc8bc96239bfa7a8d0deabcd982))
* **ingress:** add new VPN IPs ([#822](https://github.com/SocialGouv/cdtn-admin/issues/822)) ([619a5cd](https://github.com/SocialGouv/cdtn-admin/commit/619a5cd543c728408e104ba032410c6649cfb5b9))
* remove powered by header ([#819](https://github.com/SocialGouv/cdtn-admin/issues/819)) ([fe57b40](https://github.com/SocialGouv/cdtn-admin/commit/fe57b40a2e826f0e9064677492394d3fdafa93ff))
* **secu:** sanitize upload to avoid xss attack ([#813](https://github.com/SocialGouv/cdtn-admin/issues/813)) ([d571729](https://github.com/SocialGouv/cdtn-admin/commit/d571729b1199f2acf49dd7ba6eb0737c7fdafbf2))


### Features

* use super user instead of hasura admin role ([#812](https://github.com/SocialGouv/cdtn-admin/issues/812)) ([5c9ba5b](https://github.com/SocialGouv/cdtn-admin/commit/5c9ba5bbff245d832a6e3bffbd3afce6278d82d0))





# [2.2.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.1.0...v2.2.0) (2022-09-05)


### Bug Fixes

* password update email not throwing ([#811](https://github.com/SocialGouv/cdtn-admin/issues/811)) ([6e835eb](https://github.com/SocialGouv/cdtn-admin/commit/6e835eb300f5682e2e0b7722a812d8a8275adcee))


### Features

* add questionnaire field ([#807](https://github.com/SocialGouv/cdtn-admin/issues/807)) ([81a600b](https://github.com/SocialGouv/cdtn-admin/commit/81a600b2ac0587928c54d4fe97a589e529ae9b8f))
* add validation to password change ([#798](https://github.com/SocialGouv/cdtn-admin/issues/798)) ([0fd5d32](https://github.com/SocialGouv/cdtn-admin/commit/0fd5d329badcf5b9831b82a1bf894a7d00f1d7a1))





# [2.1.0](https://github.com/SocialGouv/cdtn-admin/compare/v2.0.1...v2.1.0) (2022-09-02)


### Features

* **headers:** add security headers to frontend and contributions ([#802](https://github.com/SocialGouv/cdtn-admin/issues/802)) ([11381f2](https://github.com/SocialGouv/cdtn-admin/commit/11381f23b30f341b3c665ad6be68c2edf5c45cb1))





## [2.0.1](https://github.com/SocialGouv/cdtn-admin/compare/v2.0.0...v2.0.1) (2022-08-29)


### Bug Fixes

* **api:** limit uploadable extensions ([#794](https://github.com/SocialGouv/cdtn-admin/issues/794)) ([6f28030](https://github.com/SocialGouv/cdtn-admin/commit/6f280303ecd3611df9d694438942cc1a56202fab))
* **sitemaps:** Upload sitemap to the wrong azure container ([#799](https://github.com/SocialGouv/cdtn-admin/issues/799)) ([0d9e7d4](https://github.com/SocialGouv/cdtn-admin/commit/0d9e7d429cbc15a2b79580cc57e7e4659908a4e0))





# [2.0.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.20.0...v2.0.0) (2022-08-17)


* feat(contribution)!: the generic answer has a null agreement id (#778) ([9776b8c](https://github.com/SocialGouv/cdtn-admin/commit/9776b8ca541d3a79ef0b714d598e2cb32414490e)), closes [#778](https://github.com/SocialGouv/cdtn-admin/issues/778)


### BREAKING CHANGES

* database schema





# [1.20.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.19.2...v1.20.0) (2022-08-17)


### Features

* ajout de blocs multiple dans les sections admin page info ([#785](https://github.com/SocialGouv/cdtn-admin/issues/785)) ([a2e7894](https://github.com/SocialGouv/cdtn-admin/commit/a2e7894d306fa7d378bd7268d4da514befd4f30b)), closes [#789](https://github.com/SocialGouv/cdtn-admin/issues/789) [#786](https://github.com/SocialGouv/cdtn-admin/issues/786) [#795](https://github.com/SocialGouv/cdtn-admin/issues/795)





## [1.19.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.19.1...v1.19.2) (2022-07-21)


### Bug Fixes

* bug page à la une ([#787](https://github.com/SocialGouv/cdtn-admin/issues/787)) ([2784b82](https://github.com/SocialGouv/cdtn-admin/commit/2784b82fcc6c47c6aad33542994afe7f6e43c4ab))





## [1.19.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.19.0...v1.19.1) (2022-07-21)


### Bug Fixes

* display/save prequalified contents ([#786](https://github.com/SocialGouv/cdtn-admin/issues/786)) ([d4ca12e](https://github.com/SocialGouv/cdtn-admin/commit/d4ca12eed554fb113cfafe6f6e4057fea0133aa8))





# [1.19.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.18.2...v1.19.0) (2022-07-08)


### Bug Fixes

* **contribution:** correction sur les échecs d'authentification ([#782](https://github.com/SocialGouv/cdtn-admin/issues/782)) ([6e714ae](https://github.com/SocialGouv/cdtn-admin/commit/6e714aed9db6ad633edbf8b862c302ca093d9740))


### Features

* Ajout du paramètre d'affichage en onglet/accordéon des contenus info ([#780](https://github.com/SocialGouv/cdtn-admin/issues/780)) ([855a581](https://github.com/SocialGouv/cdtn-admin/commit/855a58148226682a44b67215f02d5b8f38112034))





## [1.18.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.18.1...v1.18.2) (2022-06-16)


### Bug Fixes

* **workflow:** release github ([c94e6e1](https://github.com/SocialGouv/cdtn-admin/commit/c94e6e1c9672c5ec8f27f9711ce16b8f7453555a))





## [1.18.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.18.0...v1.18.1) (2022-06-09)


### Bug Fixes

* **contribution:** ingest only published contribution ([#775](https://github.com/SocialGouv/cdtn-admin/issues/775)) ([5ee8a1c](https://github.com/SocialGouv/cdtn-admin/commit/5ee8a1c760182b9746d3e6d8f95d7505b4e492e4))





# [1.18.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.17.2...v1.18.0) (2022-06-07)


### Bug Fixes

* **contribution:** add trigger to update the updated_at field ([#774](https://github.com/SocialGouv/cdtn-admin/issues/774)) ([4429c25](https://github.com/SocialGouv/cdtn-admin/commit/4429c256e9c5c3d2962c6b38bb9d6b5abd018491))


### Features

* **ingester:** use the new contribution data ([#772](https://github.com/SocialGouv/cdtn-admin/issues/772)) ([a4b4815](https://github.com/SocialGouv/cdtn-admin/commit/a4b4815d8fb2ecdf3face53e18a78baad83e2c84))





## [1.17.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.17.1...v1.17.2) (2022-06-06)


### Bug Fixes

* **ingester:** parents is not default exported anymore ([#771](https://github.com/SocialGouv/cdtn-admin/issues/771)) ([2a7f1a0](https://github.com/SocialGouv/cdtn-admin/commit/2a7f1a006c770d7b4190d137b538ca052fd94c16))





## [1.17.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.17.0...v1.17.1) (2022-06-02)


### Bug Fixes

* **alert:** correction suite aux problèmes sur les jobs ([#769](https://github.com/SocialGouv/cdtn-admin/issues/769)) ([d89be61](https://github.com/SocialGouv/cdtn-admin/commit/d89be6101fa3a78affc0543e600887e491690cd2))





# [1.17.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.8...v1.17.0) (2022-06-01)


### Features

* migration de l'outil de contrib ([#766](https://github.com/SocialGouv/cdtn-admin/issues/766)) ([3fe04a7](https://github.com/SocialGouv/cdtn-admin/commit/3fe04a7bfb7f58b3a0227a18a1999aebabe109c5))





## [1.16.8](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.7...v1.16.8) (2022-05-18)


### Bug Fixes

* remove eslogs ([1246df9](https://github.com/SocialGouv/cdtn-admin/commit/1246df9065e67b6f9c242505e101f8e05cedad4e))
* remove unused job ([c161423](https://github.com/SocialGouv/cdtn-admin/commit/c161423d488711c88698844932708b32de454bab))





## [1.16.7](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.6...v1.16.7) (2022-05-17)


### Bug Fixes

* env prod ([2376e99](https://github.com/SocialGouv/cdtn-admin/commit/2376e998b25801d53ba0a8dedf9ddf117eb952c0))





## [1.16.6](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.5...v1.16.6) (2022-05-17)


### Bug Fixes

* iso alert preprod / prod ([2798a24](https://github.com/SocialGouv/cdtn-admin/commit/2798a246958fc35ae4424ccb7fd0a1389ebfd08e))


### Features

* remove releaserc ([39a7907](https://github.com/SocialGouv/cdtn-admin/commit/39a7907a183703a4b85015451b3d3bb294830dbb))





## [1.16.5](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.4...v1.16.5) (2022-05-17)


### Bug Fixes

* alert ([8802a50](https://github.com/SocialGouv/cdtn-admin/commit/8802a507f516c9d7462ca8b3095e6c146034983e))
* alerting ([1530a8f](https://github.com/SocialGouv/cdtn-admin/commit/1530a8fff8372eeea2133d06dbf3cf061d6f4bea))
* dep ([a1552f4](https://github.com/SocialGouv/cdtn-admin/commit/a1552f4a57d31a81f3d3e2bfbd07bbbc482dd413))
* docker ([d9917bf](https://github.com/SocialGouv/cdtn-admin/commit/d9917bf659824a94dca1644c960799441755db14))
* docker ([4541d19](https://github.com/SocialGouv/cdtn-admin/commit/4541d19abd25798ec084d550ee6733dcc14e4787))
* droit ([81bce34](https://github.com/SocialGouv/cdtn-admin/commit/81bce343fd424f180d0dbcb6fb26a8074bb283e7))
* droit ([0613a94](https://github.com/SocialGouv/cdtn-admin/commit/0613a9448ea1e04142740d668a64ba175b8b3859))
* droit ([995ef7c](https://github.com/SocialGouv/cdtn-admin/commit/995ef7ccd55aac5521d683e7996c22161e748d48))
* droit ([0e80318](https://github.com/SocialGouv/cdtn-admin/commit/0e803185f8ad7e29bd9babe593e7030c4109405b))
* droittttt ([cd324ad](https://github.com/SocialGouv/cdtn-admin/commit/cd324ad7ad04fc88f8d8b423d6d76e3f5a9ee47c))
* folder ([b6ca292](https://github.com/SocialGouv/cdtn-admin/commit/b6ca292e64dd9297fd7ad34e4e9cf7ffcb4112c2))
* image ([37c3741](https://github.com/SocialGouv/cdtn-admin/commit/37c3741109c5cc44c8c7cf4863580a4a1d0554a2))
* image ([97ab7f9](https://github.com/SocialGouv/cdtn-admin/commit/97ab7f99deb7599b8bb266d4ff9735bde5fb493d))
* ingester ([4fbdc3b](https://github.com/SocialGouv/cdtn-admin/commit/4fbdc3be4e11c0fcbc14fa5afa269153c072ac2e))
* ingester encore ([1710697](https://github.com/SocialGouv/cdtn-admin/commit/1710697946f10d1f3a52afcfbdd74eb9c97fbb6d))
* ip whitelist ([30799b4](https://github.com/SocialGouv/cdtn-admin/commit/30799b4dc9c982461b6ae89b2702db660108c6c3))
* job ([a0ee0be](https://github.com/SocialGouv/cdtn-admin/commit/a0ee0be53088da3f084513daebc3231d32f7a0b2))
* job ([6c2a6d4](https://github.com/SocialGouv/cdtn-admin/commit/6c2a6d41d95a43bf8feeae9a34afe7f687577909))
* policy ([c6ec6d4](https://github.com/SocialGouv/cdtn-admin/commit/c6ec6d4a371a1bcf16ddbeb34d052e3674c7a020))





## [1.16.4](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.3...v1.16.4) (2022-05-17)


### Bug Fixes

* remove whitelist ([1ee2409](https://github.com/SocialGouv/cdtn-admin/commit/1ee24095b7b43371eaaeef2e97a08aaf5f093ff7))





## [1.16.3](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.2...v1.16.3) (2022-05-16)

**Note:** Version bump only for package cdtn-admin





## [1.16.2](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.1...v1.16.2) (2022-05-16)


### Bug Fixes

* cred ([31b7dd3](https://github.com/SocialGouv/cdtn-admin/commit/31b7dd3541a8f5b76d3197db262739849eb3a2c6))
* cred ([0ea2054](https://github.com/SocialGouv/cdtn-admin/commit/0ea20540f8d4aea71abd7c4da039d9612008fdd6))
* credentials ([dfc8280](https://github.com/SocialGouv/cdtn-admin/commit/dfc828031566eeb773eb85bfca94d05ff66eb42b))
* emptydir ([95ca9cb](https://github.com/SocialGouv/cdtn-admin/commit/95ca9cb36a4e64f17db3444b2fae062a73bba7e1))
* port ([0a3443f](https://github.com/SocialGouv/cdtn-admin/commit/0a3443fe13bef3bb2527dfb8a3e1e6a508e003a7))
* preprod ([f9da4b3](https://github.com/SocialGouv/cdtn-admin/commit/f9da4b346c76a24ef84fc563d767df3eba7200b8))





## [1.16.1](https://github.com/SocialGouv/cdtn-admin/compare/v1.16.0...v1.16.1) (2022-05-16)


### Bug Fixes

* job ([5892735](https://github.com/SocialGouv/cdtn-admin/commit/58927353cad0eb1d0f9c2173dbe3a6d957a377e6))
* job ingester ([76e2ce2](https://github.com/SocialGouv/cdtn-admin/commit/76e2ce2ae3a11de2c29cdb24a6456fb9d5038f88))
* remove unused document ([413d2f9](https://github.com/SocialGouv/cdtn-admin/commit/413d2f9128cb6636131cfea311a2ece30ea8ed92))





# [1.16.0](https://github.com/SocialGouv/cdtn-admin/compare/v1.15.1...v1.16.0) (2022-05-12)


### Bug Fixes

* api url ([85d782d](https://github.com/SocialGouv/cdtn-admin/commit/85d782d18906e76eb42a9ae99f1f803f9f2c8a9a))
* api url ([c5ddd57](https://github.com/SocialGouv/cdtn-admin/commit/c5ddd574b4e6c9c3cab7f56af49c0216e7a3c533))
* preprod url ([ac1f7f9](https://github.com/SocialGouv/cdtn-admin/commit/ac1f7f98c014b47ef4e16a185d0997dfed99c414))
* preprod url ([43f4e98](https://github.com/SocialGouv/cdtn-admin/commit/43f4e9837c034bc3dcb8a13f535c15e3adfb5918))
* secret ([25f0871](https://github.com/SocialGouv/cdtn-admin/commit/25f08717faf8a857c53767c469c3adfa48d3174a))
* security ([89b57c1](https://github.com/SocialGouv/cdtn-admin/commit/89b57c1107951cb9c42de1a5852a66a65349a8fa))
* security ([ebdd633](https://github.com/SocialGouv/cdtn-admin/commit/ebdd63351c254d90f880298699c9bd8f75461c21))
* url ([684d4fc](https://github.com/SocialGouv/cdtn-admin/commit/684d4fc992aeb1d0011e832704dcdd7371db1886))
* url ([2b24f73](https://github.com/SocialGouv/cdtn-admin/commit/2b24f73edb30092a732b2e7f965741840640426f))
* workflow ([183a21b](https://github.com/SocialGouv/cdtn-admin/commit/183a21bfd2df674f7c6b0b51f2369dd3237beb41))


### Features

* deactivation ([3b35fdf](https://github.com/SocialGouv/cdtn-admin/commit/3b35fdfac2f6ca6b8010dc082d6821bcf9a30df8))
* **workflow:** add preprod + prod ([#763](https://github.com/SocialGouv/cdtn-admin/issues/763)) ([77c8f1f](https://github.com/SocialGouv/cdtn-admin/commit/77c8f1f9679c3082d5a6d3c54eddfdce72a24557))
* migration from gitlab to github ([#730](https://github.com/SocialGouv/cdtn-admin/issues/730)) ([4c6dd02](https://github.com/SocialGouv/cdtn-admin/commit/4c6dd027364b0eb31a0d7ae8ddc6c080399e6317))
