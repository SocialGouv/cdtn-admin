--
-- PostgreSQL database dump
--

-- Dumped from database version 10.14 (Debian 10.14-1.pgdg90+1)
-- Dumped by pg_dump version 10.14 (Debian 10.14-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: contents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('9ddcd066-b052-4b01-abf1-dcaf6ec36538', 'Accident du travail et maladie professionnelle', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('73a4aad0-6f55-4164-83e0-94dc5639c318', 'Accord de performance collective', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('92f99406-8c16-47c6-b9e5-984b7b74ad2a', 'Acteurs de la formation', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3fdd963d-5601-41c1-a6ae-0b695da3b6f7', 'Activité partielle (anciennement chômage partiel)', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7585f8f1-9bb5-4a9b-bbab-d081ba962eb1', 'Aménagement du temps de travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('44fc6030-66d4-4fe5-83bc-9cfcf885d633', 'Autres congés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('46fafd8e-c48c-4d31-9885-03154b8d6345', 'Autres départs', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3ede72c7-8918-4a71-9e32-14c121bff82c', 'Bulletin de salaire et cotisations sociales', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('33c5efde-e7ec-4a66-a580-ba716bfac42a', 'CDD', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('5490e6d3-7eb2-4e14-a224-55190cc4a835', 'CDI', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('5df61cbe-5e6d-499b-b8df-37833ccb7cf5', 'Compte épargne-temps (CET)', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('6f731cab-2c42-4de7-a299-08eca8a73efa', 'Compte personnel d’activité (CPA)', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('00df2192-1d2b-499b-969e-0c46428c040a', 'Compte personnel de formation (CPF)', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('03dfb49d-57eb-4f36-b44a-22a2527624df', 'Compte professionnel de prévention (C2P) ', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('55134e29-4475-43d2-b967-74fc0b59fba7', 'Conditions de travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('5741102c-811f-4128-a3af-a8b7a0548916', 'Conflits au travail et contrôle de la réglementation', '', 'Resignation', 'Vous vous demandez ce quelle est la définition d’une grève ou encore celle du travail dissimulé ? Vous souhaitez connaître les différentes sanctions disciplinaires ? On vous a parlé de l’inspection du travail ou du conseil des prud’hommes et vous souhaitez les contacter ou les saisir ? Retrouvez toutes nos réponses ici. ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('8c35249e-aa7e-4b11-ad99-460d97f4bff8', 'Congés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('20d13d3a-a1ab-4891-823e-98dd0cd97665', 'Congés et absences pour formation', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', 'Congés et repos', '', 'Holidays', 'Vous souhaitez calculer les congés payés, les RTT... ? Vous vous interrogez sur les temps de pause et de repos obligatoires ou sur le fait de pouvoir travailler le dimanche ou un jour férié ? Vous attendez un enfant et cherchez à connaître les durées du congé maternité et du congé paternité ?  Retrouvez toutes nos réponses ici. ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7fc1cb74-c476-4544-ad33-1ff87ababa43', 'Congés liés à la naissance et à l’enfance', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('c752aeb0-3c25-4f94-8abe-bc2411550f5c', 'Congés payés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('d7a1813b-5391-4b2a-8b17-16b69d069e3a', 'Congés pour événément familial', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('b0297169-d586-4998-aca2-7b8e1eea971b', 'Contrat d’apprentissage', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('d1ec6f5f-bc98-4e46-8a3e-3d71c0ec1da8', 'Contrat de professionnalisation', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', 'Contrat de travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('216ab2d4-4c30-48ec-87ef-0b20ffae2e01', 'Contrats d’insertion et emplois aidés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('6bdbcb2b-f29c-4907-80f5-20d9c5b3cf13', 'Contrats divers et professions particulières', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('0a85aee3-2dae-4305-883b-27be16baa2eb', 'Convention de forfait (en heures ou en jours)', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7a649405-9823-4b0a-a04a-10d71003ef04', 'Demandeurs d’emploi', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('688661b6-f614-47a7-99cf-e70b15e691ef', 'Démission', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', 'Départ de l’entreprise', '', 'Depart', 'C’est la fin de votre contrat de travail, vous souhaitez rompre le contrat de travail d’un salarié et vous vous demandez quels sont les documents obligatoire à remettre ? Vous voulez démissionner, faire une rupture conventionnelle ou connaître les indemnités auxquelles vous avez droit ? Retrouvez toutes nos réponses ici. ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('35a6e554-f5a1-4a6e-9c1d-b7bd4f2aff05', 'Départ volontaire à la retraite', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('0e96006c-eada-4ebb-abd9-cee1893dd3cb', 'Détachement', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('a10e9aab-d980-4ec6-abdc-6054390c800a', 'Dimanches, jours fériés et ponts', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('321702f6-5393-4d9b-a2fb-8b081bf9ff57', 'Dispositifs d’accès à la formation', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('13840451-12bb-49d8-b28c-cf744213c811', 'Documents à remettre au salarié', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('8f378fe8-a6bc-4462-9fc0-d976b4830d24', 'Droit d’alerte et de retrait des salariés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('94e0005a-30ff-44c4-8c9b-29f7701270fc', 'Durée du travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('e32ebf06-45a4-4827-becf-366e8ac707e8', 'Durée du travail à temps complet', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('396fa23f-7bfd-4e9b-9bc9-d8897d2d005d', 'Durée du travail d’un jeune avant 18 ans', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('035baa3c-99ea-4dd5-bcc7-bae7e8f56d5e', 'Egalité professionnelle', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('e17c67b3-6a9f-4424-94d8-851c43b6057e', 'Embauche', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('da6ce4df-c734-4baf-bcaf-6b761dd5515f', 'Embauche et contrat de travail', '', 'Contract', 'Vous venez de trouver un travail, vous embauchez un salarié ou un apprenti ? Vous souhaitez faire une déclaration préalable à l’embauche, rédiger un contrat de travail (CDI, CDD, travail temporaire, temps plein, temps partiel) ? Retrouvez toutes nos réponses ici.  ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('555a7a59-3185-4562-90c6-813a47ddc9d6', 'Emploi', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3352b14f-1c55-48c8-9675-f0e1b01d73fd', 'Emploi et formation professionnelle', '', 'Formation', 'Vous voulez vous former ou former vos salariés, vous vous demandez ce que sont le CPF et la VAE ? Vous souhaitez embaucher un sénior ou un travailleur handicapé, vous vous demandez s’il existe des aides ? Vous êtes en activité partielle ou vous souhaitez demander l’activité partielle ? Retrouvez toutes nos réponses ici.', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7e03b6d7-04fa-4b4e-ac8c-5a6966ca13cd', 'Entreprises en difficulté', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('e68fddfb-9e94-4825-9743-95523aa15b26', 'Épargne salariale', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7426ac11-4986-4b94-93e3-e7dbe7817a68', 'Equipements de travail et de protection', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('e93743c8-f637-4a6f-9761-79de09ff6ce7', 'Femme enceinte - Maternité', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('0d5ff7d9-43e9-41ad-9e14-79094ef0e037', 'Fin d’un CDD - CTT', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('b1009c1d-184c-49c2-966a-f1aeffc5fea7', 'Formalités d’embauche', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('c3e02ffb-759e-463e-9dce-d185c5fe6721', 'Formation professionnelle', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('1141c3fc-8148-4ce7-a13f-a1d7bdd06a64', 'Grève', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('e520f498-0ef1-4ecd-a929-606c0e77deb2', 'Handicap', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('b7c0ea1f-b09d-4a71-9254-82fcc2a29395', 'Handicap', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('bd17aa4e-066e-4197-8028-3dc2e05110d0', 'Harcèlement et discrimination', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3f22a0c2-f6d7-4073-a2ee-9b6d9987407c', 'Heures supplémentaires, d’équivalence et astreintes', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('8b057be7-aa97-481c-b154-27e4cf26569e', 'Inaptitude', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('c05994a4-73f8-4706-87a4-0100356c0745', 'Inspection du travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('69bdbe8f-9a8a-4579-ab60-c121b9335ed8', 'Intéressement et participation', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('6ac1ae35-d1b4-4cc4-81b8-e1fc8a85e988', 'Intérim', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('06bf31ab-8bac-4edc-adbf-e34af82230b0', 'Jeunes', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('33640fe0-079b-4c51-bdce-75879c9d417f', 'Jeunes travailleurs', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3e6234de-5f32-4138-8381-46afd6a14bbb', 'Jeunes travailleurs', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('d4a24e74-a4eb-48d1-a1e0-c8a36d5fd934', 'La certification professionnelle', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('346cbf76-d125-48ad-9530-165fa103535b', 'Le conseil de prud’hommes', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('e2d2d90c-aeed-4c35-a255-83277a2a6859', 'Les aides à l’emploi', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('55b856d9-63a7-4e6e-a64e-90ebfa1a4e71', 'Les structures d’insertion', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('d1aed12a-48ac-4965-821f-ac63d2192492', 'Les syndicats dans l’entreprise', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('53da03de-3ca6-46c1-8e06-989328bbc6ad', 'Libertés du salarié', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('0a0ffae1-7226-4dac-9ce3-d099109e0252', 'Licenciement', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('ef4e5a38-a310-47ce-86c9-ae579662c373', 'Licenciement pour inaptitude', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('30b99d6c-c854-4ee2-85a1-9681e2c11b46', 'Licenciement pour motif économique', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('482b8fd2-8cd7-47bb-ba20-de2753f24dbc', 'Licenciement pour motif personnel', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('375ac9a2-aca0-4bab-a79e-f6a327cd5841', 'Lieu de travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('9c2a2e39-1897-4323-9163-ffd50fefb814', 'Maladie', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7bf239b9-d159-42b1-8f75-1e97721b3a1c', 'Méthodes de recrutement', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('ccb034ec-d604-40dd-b571-97b08d306e71', 'Mise à la retraite', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3d36d959-fb8f-4ff6-a759-276164b6da5b', 'Modification du contrat de travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('936725cb-33d0-4f6e-a17e-7d80268eb684', 'Négociations dans l’entreprise', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('ae1cfae4-ef89-43c6-a4ce-4259cc179d1e', 'Négociations de branche', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('edcd2c6d-fad3-497a-b8d3-034721e4471a', 'Obligations générales de prévention', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('72410537-4bf9-4aaf-b5fd-b85f106a0885', 'Pause', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('31506fb1-3121-402c-af0b-8154af804da7', 'Période d’essai', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('8c3bcd88-bf80-4826-a502-a366f6632217', 'Plans d’épargne salariale', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('f7fe3e14-9dce-4c5f-9882-f6ed44bcb831', 'Politique de l’emploi', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('09f560ee-22db-4741-8cde-b889b6beb7b6', 'Pré-retraite', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('cf8ad41e-b8e7-448f-ae81-cbaf4c654a0e', 'Primes et avantages', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('fbf73eff-4d67-4be9-982e-5d01b5e9ed3d', 'Prise d’acte et résiliation judiciaire', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('ed88177b-8540-4703-a036-f30b5e8400fd', 'Publics et mesures spécifiques', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('a1cf5d3d-6e1d-4a34-ab11-6f04343c045b', 'Réduction du temps de travail (RTT)', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('a77c3f06-6594-4a75-9fee-8693b33da75a', 'Règlement intérieur d’une entreprise', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('c77e88c6-f636-460d-939e-e7b3457c2af5', 'Remboursement des frais de transport', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('718fdf59-ffee-46f1-a3ce-a20c1022126b', 'Repos', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('3233b3d6-ea1e-4cbd-9595-5846542ac538', 'Repos quotidien et hebdomadaire', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('fc69c570-5520-478e-9302-3e226e1cc718', 'Représentation du personnel', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7592a138-69a7-47d6-b122-6329854d596d', 'Représentation du personnel et négociation collective', '', 'Nego', 'Vous devez mettre en place un CSE et vous vous demandez comment faire ?  Vous voulez tout savoir sur le rôle d’un délégué syndical ? Ou peut être que vous souhaitez négocier un accord d’entreprise et connaître quelles sont les négociations annuelles obligatoires ? Retrouvez toutes nos réponses ici. ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('73c92ca4-58fa-4ce9-9a43-a0f227b3df41', 'Retraite', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('a33ad5a9-f7ab-4433-b30f-81ac81fdae34', 'Risques professionnels', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('68752741-c18a-4003-9c7e-fcd8d6bfee41', 'Risques professionnels et prévention', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('15514d1b-e07f-4c9f-b771-99b8be8198c7', 'Rupture conventionnelle', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('5d4e8525-fa12-42d7-8cad-7d9948125dfb', 'Rupture conventionnelle collective', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('ec4f3127-e5b9-4f4f-911b-5a5c5930c5a3', 'Rupture conventionnelle individuelle', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('47042834-cd29-400f-9f80-fc8a22067c3d', 'Salaire', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('64774920-c8f9-49aa-b30d-177a57406bb7', 'Salaire et Rémunération', '', 'Salary', 'C’est l’heure de la paye, comment rédiger ou lire un bulletin de paie, quelle différence entre brut et net ? Vous souhaitez savoir si vous avez droit à une prime d’ancienneté, au remboursement des frais de transport ? Ou encore connaître le différence entre intéressement et participation ? Retrouvez toutes nos réponses ici. ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('b05023d9-f874-45cc-9930-43a7b5006e56', 'Sanctions disciplinaires', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('49ee16e2-8362-47f7-af31-a754b6100996', 'Santé au travail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7ab00fdc-433b-4a31-92e7-838a85304f8b', 'Santé, sécurité et conditions de travail', '', 'Health', 'Vous vous demandez quand passer la visite médicale ou quelles sont les démarches lors d’un arrêt de travail ? Vous souhaitez connaître les obligations de l’employeur pour protéger la santé et la sécurité de ses salariés (lieu de travail, équipements de travail...) Retrouvez toutes nos réponses ici. ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7d7824fa-43b6-46f1-8f2a-e90ac9271135', 'Seniors', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('4c91890a-3115-4b6c-bfa3-a94ff3f7b155', 'Stage', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('47ae4f26-4048-48ce-a3c9-0ad003c78170', 'Suivi médical des salariés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('6a36004a-6b5b-468e-ba12-901ad3cc2413', 'Télétravail', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('5b71dec5-c165-48e2-bb33-de7cb163ad41', 'Temps de travail', '', 'Time', 'Vous voulez savoir la durée maximale de travail par jour ou encore calculer les heures supplémentaires ? Vous vous demandez quelle est la définition d’un temps partiel ? Vous travaillez de nuit et souhaitez connaître les contreparties ? Vous souhaitez aménager le temps de travail ? Retrouvez toutes nos réponses ici.  ', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('0a1ff972-2da6-4da7-bfaf-1d35e78152b2', 'Temps partiel', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('cd686089-425a-475e-8df8-3029b0691a55', 'Travail de nuit et en soirée', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('4137553d-912c-4bae-88d7-a29a2b46e2d9', 'Travail illégal', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('c2369ccf-e94f-431c-83f1-22389f8b5bfd', 'Travailleur à domicile', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('ffeee50d-82a0-4992-a895-7aa23c5d8703', 'Travailleur de nuit', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('fa5d9011-eb2f-4d93-9a37-d524b6e73954', 'Travailleurs étrangers', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('c9843e7e-63ae-482c-b910-5b73cc9bbb4c', 'Travailleurs et secteurs spécifiques', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('7e215bda-8be0-4db1-993d-00859d298a37', 'Travailleurs handicapés', '', NULL, '', false, true);
INSERT INTO public.themes (id, title, short_title, icon, description, is_special, is_published) VALUES ('04c109f0-3288-4d4b-bd39-c982baadcfa3', 'Validation des acquis de l’expérience (VAE)', '', NULL, '', false, true);


--
-- Data for Name: content_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: theme_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('fbab0fe7-140f-4a35-a755-18ce765a78d0', '49ee16e2-8362-47f7-af31-a754b6100996', '9ddcd066-b052-4b01-abf1-dcaf6ec36538', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('77965cf2-eacc-4f44-9dfc-ddde96c1f8f3', '46fafd8e-c48c-4d31-9885-03154b8d6345', '73a4aad0-6f55-4164-83e0-94dc5639c318', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('8cd330b1-5e3d-4f00-930a-36d71ed3a506', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', '92f99406-8c16-47c6-b9e5-984b7b74ad2a', 7, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('700b52c6-a75f-47cf-907c-47730dc70529', '7e03b6d7-04fa-4b4e-ac8c-5a6966ca13cd', '3fdd963d-5601-41c1-a6ae-0b695da3b6f7', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('e71e72f3-4cfb-4cfa-a5f7-89956b1484b6', '5b71dec5-c165-48e2-bb33-de7cb163ad41', '7585f8f1-9bb5-4a9b-bbab-d081ba962eb1', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('bdc8fff1-653c-44ff-b286-d67059805305', '8c35249e-aa7e-4b11-ad99-460d97f4bff8', '44fc6030-66d4-4fe5-83bc-9cfcf885d633', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('4eab40ad-fe3a-4568-bf7f-007778f87cd3', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '46fafd8e-c48c-4d31-9885-03154b8d6345', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('208dddb1-357e-4b8e-8457-122d0ede6d76', '64774920-c8f9-49aa-b30d-177a57406bb7', '3ede72c7-8918-4a71-9e32-14c121bff82c', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1eace7f7-adcb-431a-be88-6566d1353272', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', '33c5efde-e7ec-4a66-a580-ba716bfac42a', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('b213ce62-eca6-4451-99b4-90cd201d3654', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', '5490e6d3-7eb2-4e14-a224-55190cc4a835', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('2169f08f-2b18-477d-98a6-aa129fdf5c98', 'cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', '5df61cbe-5e6d-499b-b8df-37833ccb7cf5', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('40d89d15-f569-4756-b1f0-65123d43c91f', '555a7a59-3185-4562-90c6-813a47ddc9d6', '6f731cab-2c42-4de7-a299-08eca8a73efa', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('fa0dae61-45d2-489b-8a2f-3cfcd978cb54', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', '00df2192-1d2b-499b-969e-0c46428c040a', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('eabd627c-1147-4cbe-8cbc-b523c8503380', '68752741-c18a-4003-9c7e-fcd8d6bfee41', '03dfb49d-57eb-4f36-b44a-22a2527624df', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('a5aa104a-5764-4b14-bb56-6a8fcf962a2f', '7ab00fdc-433b-4a31-92e7-838a85304f8b', '55134e29-4475-43d2-b967-74fc0b59fba7', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('8f672bf6-dd5a-4c33-a9b5-33de0c1ed649', NULL, '5741102c-811f-4128-a3af-a8b7a0548916', 9, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('4fba6a87-56d1-43ca-978b-33c77e087099', 'cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', '8c35249e-aa7e-4b11-ad99-460d97f4bff8', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('364ebbcb-2c16-4351-82c2-2e76faa95aed', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', '20d13d3a-a1ab-4891-823e-98dd0cd97665', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('6a241614-0210-4666-9af6-93c1e8710933', NULL, 'cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('e5256482-31a8-45cd-8958-91cd49f8aa36', '8c35249e-aa7e-4b11-ad99-460d97f4bff8', '7fc1cb74-c476-4544-ad33-1ff87ababa43', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('23d2b1cb-cfb6-49ac-bccb-336d9b8ef89a', '8c35249e-aa7e-4b11-ad99-460d97f4bff8', 'c752aeb0-3c25-4f94-8abe-bc2411550f5c', 0, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('b70f0498-7b52-486f-9a2a-113f991c409a', '8c35249e-aa7e-4b11-ad99-460d97f4bff8', 'd7a1813b-5391-4b2a-8b17-16b69d069e3a', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ff36c1e0-8948-4611-a1d7-ef94f4e1e296', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', 'b0297169-d586-4998-aca2-7b8e1eea971b', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('731fe077-618f-4f0f-9de9-e8739f7153f9', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', 'd1ec6f5f-bc98-4e46-8a3e-3d71c0ec1da8', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d9d0a98f-1b7b-4e37-80e6-16f0ed9369e9', 'da6ce4df-c734-4baf-bcaf-6b761dd5515f', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('c5b604ca-4953-40f9-a243-82a2fd7466e4', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', '216ab2d4-4c30-48ec-87ef-0b20ffae2e01', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('293073b6-93d3-41ef-9908-6d7bcc1d9c82', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', '6bdbcb2b-f29c-4907-80f5-20d9c5b3cf13', 7, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ca6ad6cd-d795-463a-a1ac-f5a7c0b82a61', '94e0005a-30ff-44c4-8c9b-29f7701270fc', '0a85aee3-2dae-4305-883b-27be16baa2eb', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('7c74cc2a-3b4c-43f8-9b5a-6a110a7bb6c3', '555a7a59-3185-4562-90c6-813a47ddc9d6', '7a649405-9823-4b0a-a04a-10d71003ef04', 7, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('59510e6c-0166-4eaa-90ec-383daff44b1d', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '688661b6-f614-47a7-99cf-e70b15e691ef', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('4b277c15-6b13-440f-a6e6-d010948655ba', NULL, 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', 8, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ef5e047c-9c35-4964-817b-7c8e5bd0b7aa', '73c92ca4-58fa-4ce9-9a43-a0f227b3df41', '35a6e554-f5a1-4a6e-9c1d-b7bd4f2aff05', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('2f07f10c-2dbf-45c9-a79f-c965b339b765', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', '0e96006c-eada-4ebb-abd9-cee1893dd3cb', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('c8c314e4-cf82-482a-bdfd-09411b33f6ff', 'cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', 'a10e9aab-d980-4ec6-abdc-6054390c800a', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('dc4a3268-c515-4a7d-9eb7-5362eadcfb92', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', '321702f6-5393-4d9b-a2fb-8b081bf9ff57', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('7e744256-c411-4cbf-8ac2-ccacd8085d98', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '13840451-12bb-49d8-b28c-cf744213c811', 0, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('20526a87-1128-4def-9c87-e69db4d87073', '55134e29-4475-43d2-b967-74fc0b59fba7', '8f378fe8-a6bc-4462-9fc0-d976b4830d24', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d308749a-9402-40b4-93ce-34c3932492cc', '5b71dec5-c165-48e2-bb33-de7cb163ad41', '94e0005a-30ff-44c4-8c9b-29f7701270fc', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('17915b7f-3917-4bdb-aa93-44c191737012', '94e0005a-30ff-44c4-8c9b-29f7701270fc', 'e32ebf06-45a4-4827-becf-366e8ac707e8', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('65f5ec63-ddfe-446f-b74c-22d04b18a215', '94e0005a-30ff-44c4-8c9b-29f7701270fc', '396fa23f-7bfd-4e9b-9bc9-d8897d2d005d', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1f3db5bc-788a-4867-a4d2-9f8e1c5ae66e', '55134e29-4475-43d2-b967-74fc0b59fba7', '035baa3c-99ea-4dd5-bcc7-bae7e8f56d5e', 7, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('466f3447-8a24-414a-9a5a-b52808b217b0', 'da6ce4df-c734-4baf-bcaf-6b761dd5515f', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('8802b4b4-ba66-4750-bc75-6a46caba216e', NULL, 'da6ce4df-c734-4baf-bcaf-6b761dd5515f', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('7954f3f1-9739-48b9-aa99-7f015978512b', '3352b14f-1c55-48c8-9675-f0e1b01d73fd', '555a7a59-3185-4562-90c6-813a47ddc9d6', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('f8e24f95-4a49-406c-9fc6-3fc299b02850', NULL, '3352b14f-1c55-48c8-9675-f0e1b01d73fd', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('618f7ab8-1a26-4024-9c31-ba735d85f32e', '3352b14f-1c55-48c8-9675-f0e1b01d73fd', '7e03b6d7-04fa-4b4e-ac8c-5a6966ca13cd', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d7bcb8b9-0a2c-42cb-9bec-e0ea68bd5094', '64774920-c8f9-49aa-b30d-177a57406bb7', 'e68fddfb-9e94-4825-9743-95523aa15b26', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('78c6565a-1f5c-4461-8b8c-37f188b6842f', '55134e29-4475-43d2-b967-74fc0b59fba7', '7426ac11-4986-4b94-93e3-e7dbe7817a68', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d07d74f8-f914-4812-9134-431870c2cd94', 'c9843e7e-63ae-482c-b910-5b73cc9bbb4c', 'e93743c8-f637-4a6f-9761-79de09ff6ce7', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('13c345c6-af2c-4507-bda4-93711a020f58', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '0d5ff7d9-43e9-41ad-9e14-79094ef0e037', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('92037c1f-b540-49d4-a134-6f253ed2210a', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', 'b1009c1d-184c-49c2-966a-f1aeffc5fea7', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d4577b05-fa66-4e49-b90b-7c72eb366cd7', '3352b14f-1c55-48c8-9675-f0e1b01d73fd', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('608397f0-6321-458f-ab4a-fa211dd8ec3d', '5741102c-811f-4128-a3af-a8b7a0548916', '1141c3fc-8148-4ce7-a13f-a1d7bdd06a64', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('3ada0f90-9a1f-4da2-9575-030c5c12d2ae', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', 'e520f498-0ef1-4ecd-a929-606c0e77deb2', 8, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('13c61ab0-4063-4894-aa86-c851ee712d9d', 'c9843e7e-63ae-482c-b910-5b73cc9bbb4c', 'b7c0ea1f-b09d-4a71-9254-82fcc2a29395', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1b306f95-631c-4301-829b-fe4f119390a3', '55134e29-4475-43d2-b967-74fc0b59fba7', 'bd17aa4e-066e-4197-8028-3dc2e05110d0', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('f6232318-4711-4905-a4d6-74ed1e486f20', '5b71dec5-c165-48e2-bb33-de7cb163ad41', '3f22a0c2-f6d7-4073-a2ee-9b6d9987407c', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('3c0b3b5f-3667-4d9f-902a-5866f6ac2fab', '49ee16e2-8362-47f7-af31-a754b6100996', '8b057be7-aa97-481c-b154-27e4cf26569e', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('0a6fa4c1-54fc-4adc-9554-821b521a9ae3', '5741102c-811f-4128-a3af-a8b7a0548916', 'c05994a4-73f8-4706-87a4-0100356c0745', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('13e16af7-157a-404e-9bfb-c48531bcb1c0', 'e68fddfb-9e94-4825-9743-95523aa15b26', '69bdbe8f-9a8a-4579-ab60-c121b9335ed8', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('c73d0b46-a38b-4d0a-b576-07acd95c8f96', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', '6ac1ae35-d1b4-4cc4-81b8-e1fc8a85e988', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('fc9ae3da-fc1e-4880-b60a-7438e29aebae', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', '06bf31ab-8bac-4edc-adbf-e34af82230b0', 9, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1f9f266a-730c-409a-889f-4fbda8f2972c', 'c9843e7e-63ae-482c-b910-5b73cc9bbb4c', '33640fe0-079b-4c51-bdce-75879c9d417f', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('a0513e1f-22af-45bf-b93d-7eb68d386181', '555a7a59-3185-4562-90c6-813a47ddc9d6', '3e6234de-5f32-4138-8381-46afd6a14bbb', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('16c5e713-df08-4dcc-b134-e5202eaf014f', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', 'd4a24e74-a4eb-48d1-a1e0-c8a36d5fd934', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('9568c018-5e7c-4b0b-8213-c74c720457db', '5741102c-811f-4128-a3af-a8b7a0548916', '346cbf76-d125-48ad-9530-165fa103535b', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('53e1b22a-1c59-4431-a282-5ded85284bbe', '555a7a59-3185-4562-90c6-813a47ddc9d6', 'e2d2d90c-aeed-4c35-a255-83277a2a6859', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('b19777fd-c1bf-4a32-95b6-632c324558a9', '555a7a59-3185-4562-90c6-813a47ddc9d6', '55b856d9-63a7-4e6e-a64e-90ebfa1a4e71', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('3fb774d7-c568-4700-afe5-2f592ea37e01', '7592a138-69a7-47d6-b122-6329854d596d', 'd1aed12a-48ac-4965-821f-ac63d2192492', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('09acd4ad-46fb-4874-87b6-fb296cbcaf11', '55134e29-4475-43d2-b967-74fc0b59fba7', '53da03de-3ca6-46c1-8e06-989328bbc6ad', 8, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('c3b45ebb-bc65-4173-b702-1bfb8b996a2f', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '0a0ffae1-7226-4dac-9ce3-d099109e0252', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('48c80e4e-f1f8-4119-b026-b8bf3e55feae', '0a0ffae1-7226-4dac-9ce3-d099109e0252', 'ef4e5a38-a310-47ce-86c9-ae579662c373', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('55bd5d61-3f96-4879-9bfd-0d867bfd81f2', '0a0ffae1-7226-4dac-9ce3-d099109e0252', '30b99d6c-c854-4ee2-85a1-9681e2c11b46', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('820012e8-7953-4e16-a4bf-c5724ccad7ef', '0a0ffae1-7226-4dac-9ce3-d099109e0252', '482b8fd2-8cd7-47bb-ba20-de2753f24dbc', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('0f7d06a4-7ac9-4b02-872a-d228e58488f5', '55134e29-4475-43d2-b967-74fc0b59fba7', '375ac9a2-aca0-4bab-a79e-f6a327cd5841', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('60cf2a97-2e45-4824-a356-0abb2e46bb3d', '49ee16e2-8362-47f7-af31-a754b6100996', '9c2a2e39-1897-4323-9163-ffd50fefb814', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('e49fb039-cbeb-470d-aede-dca284ad01ef', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', '7bf239b9-d159-42b1-8f75-1e97721b3a1c', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1d228cdd-acb6-45c4-932d-257f40ce68d7', '73c92ca4-58fa-4ce9-9a43-a0f227b3df41', 'ccb034ec-d604-40dd-b571-97b08d306e71', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('b2835c60-6ecc-488f-8bf4-f00f52b7397e', '3ae220be-e1b9-4231-8cd5-7d3003c1e8ec', '3d36d959-fb8f-4ff6-a759-276164b6da5b', 8, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d17f2324-3d25-4a55-b9e8-9f542ee655d4', '7592a138-69a7-47d6-b122-6329854d596d', '936725cb-33d0-4f6e-a17e-7d80268eb684', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('95d68980-0458-4260-a50e-8b5ea5c8a246', '7592a138-69a7-47d6-b122-6329854d596d', 'ae1cfae4-ef89-43c6-a4ce-4259cc179d1e', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('6ce5f246-47f1-44cf-a9ac-39f7d1fb76a2', '68752741-c18a-4003-9c7e-fcd8d6bfee41', 'edcd2c6d-fad3-497a-b8d3-034721e4471a', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d9a22f22-9d5b-4d42-ae90-bf822c2e34d5', '718fdf59-ffee-46f1-a3ce-a20c1022126b', '72410537-4bf9-4aaf-b5fd-b85f106a0885', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d6c492ed-580f-4d0d-ad7b-d3e53816ea1e', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', '31506fb1-3121-402c-af0b-8154af804da7', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('8760565f-38b0-4426-bbfe-e3cec19755f9', 'e68fddfb-9e94-4825-9743-95523aa15b26', '8c3bcd88-bf80-4826-a502-a366f6632217', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('718a9a2f-3aed-4e6f-b1b3-ea339a998077', '555a7a59-3185-4562-90c6-813a47ddc9d6', 'f7fe3e14-9dce-4c5f-9882-f6ed44bcb831', 8, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ad087117-b95f-4719-bcdd-4cdecc1d231d', '73c92ca4-58fa-4ce9-9a43-a0f227b3df41', '09f560ee-22db-4741-8cde-b889b6beb7b6', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ec1ad316-8d62-44e4-af36-5ad4fa135cd2', '64774920-c8f9-49aa-b30d-177a57406bb7', 'cf8ad41e-b8e7-448f-ae81-cbaf4c654a0e', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('24642f8f-23db-4bd2-afd8-630769922c0d', '46fafd8e-c48c-4d31-9885-03154b8d6345', 'fbf73eff-4d67-4be9-982e-5d01b5e9ed3d', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ee6be4b6-10b8-428b-aed1-e9738b3ff684', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', 'ed88177b-8540-4703-a036-f30b5e8400fd', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('479bb37d-5fff-4d0e-b96d-242ca63120dd', 'cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', 'a1cf5d3d-6e1d-4a34-ab11-6f04343c045b', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('7695f1ff-02be-4d10-8768-6c57d044e458', '55134e29-4475-43d2-b967-74fc0b59fba7', 'a77c3f06-6594-4a75-9fee-8693b33da75a', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('3d49d671-2abe-448c-b712-30d05c70f414', '64774920-c8f9-49aa-b30d-177a57406bb7', 'c77e88c6-f636-460d-939e-e7b3457c2af5', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('aec56ea3-7999-4143-85af-4525203ee669', 'cbb667f3-b3ae-4600-8ce8-9d4bd62f4067', '718fdf59-ffee-46f1-a3ce-a20c1022126b', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('9a9bd210-d029-4bca-8d67-68b936c8c9b8', '718fdf59-ffee-46f1-a3ce-a20c1022126b', '3233b3d6-ea1e-4cbd-9595-5846542ac538', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d19f1b95-ebfa-4f5e-ba4e-95fef79929c1', '7592a138-69a7-47d6-b122-6329854d596d', 'fc69c570-5520-478e-9302-3e226e1cc718', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('d19c0468-0ee5-48cb-96a8-a176994fedfe', NULL, '7592a138-69a7-47d6-b122-6329854d596d', 7, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('07f61097-5d3b-4850-9976-5ca7f6e1cdaa', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '73c92ca4-58fa-4ce9-9a43-a0f227b3df41', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1ad36220-10f3-48b9-b2e2-ea8e9a9e8631', '68752741-c18a-4003-9c7e-fcd8d6bfee41', 'a33ad5a9-f7ab-4433-b30f-81ac81fdae34', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('ac688439-6303-4dd8-8522-858385459100', '7ab00fdc-433b-4a31-92e7-838a85304f8b', '68752741-c18a-4003-9c7e-fcd8d6bfee41', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('fb536f07-d5b7-4ac1-a9f3-fdf842d352ed', 'a91437fb-e493-4e18-8f7d-7ffe8d16ff1f', '15514d1b-e07f-4c9f-b771-99b8be8198c7', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('b537d60f-5281-4070-99ef-f3e84f266857', '15514d1b-e07f-4c9f-b771-99b8be8198c7', '5d4e8525-fa12-42d7-8cad-7d9948125dfb', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('4d811ae7-bca6-412b-ad05-39728a144eed', '15514d1b-e07f-4c9f-b771-99b8be8198c7', 'ec4f3127-e5b9-4f4f-911b-5a5c5930c5a3', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('2969bc8a-41c9-413f-89a8-dff5fe096341', '64774920-c8f9-49aa-b30d-177a57406bb7', '47042834-cd29-400f-9f80-fc8a22067c3d', 1, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('a1697307-c4ad-44c9-ace8-e343fc190e01', NULL, '64774920-c8f9-49aa-b30d-177a57406bb7', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('fea5dac0-108c-4ee3-874f-282518ac7328', '5741102c-811f-4128-a3af-a8b7a0548916', 'b05023d9-f874-45cc-9930-43a7b5006e56', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('f51a223d-d93a-4a44-bc4e-6113bee92316', '7ab00fdc-433b-4a31-92e7-838a85304f8b', '49ee16e2-8362-47f7-af31-a754b6100996', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1f32f34e-130a-4186-b655-77b4eaa02f2b', NULL, '7ab00fdc-433b-4a31-92e7-838a85304f8b', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('bb231eff-1c09-4925-8e97-66643f201aa6', '555a7a59-3185-4562-90c6-813a47ddc9d6', '7d7824fa-43b6-46f1-8f2a-e90ac9271135', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('baf8cc75-d971-4469-bd67-f45d7450801e', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', '4c91890a-3115-4b6c-bfa3-a94ff3f7b155', 7, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('1eb74071-b1d6-48bc-bddc-31c7924cd855', '49ee16e2-8362-47f7-af31-a754b6100996', '47ae4f26-4048-48ce-a3c9-0ad003c78170', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('07204986-9462-47bf-8268-b1522fd22ebd', '55134e29-4475-43d2-b967-74fc0b59fba7', '6a36004a-6b5b-468e-ba12-901ad3cc2413', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('b77e9390-38de-4188-8aa9-7037a767b2b7', NULL, '5b71dec5-c165-48e2-bb33-de7cb163ad41', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('4da91e4b-8551-4fce-b502-46de96b595e1', '5b71dec5-c165-48e2-bb33-de7cb163ad41', '0a1ff972-2da6-4da7-bfaf-1d35e78152b2', 2, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('a5a047be-465f-49df-98cb-cc61dd3f0e21', '5b71dec5-c165-48e2-bb33-de7cb163ad41', 'cd686089-425a-475e-8df8-3029b0691a55', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('c08a1859-720d-4ec0-be2b-9fb30a12ba13', '5741102c-811f-4128-a3af-a8b7a0548916', '4137553d-912c-4bae-88d7-a29a2b46e2d9', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('fdf43617-b314-44af-97ed-38f4b2e39a54', 'c9843e7e-63ae-482c-b910-5b73cc9bbb4c', 'c2369ccf-e94f-431c-83f1-22389f8b5bfd', 3, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('da74d174-d62d-4429-b68f-2dd941810a06', 'c9843e7e-63ae-482c-b910-5b73cc9bbb4c', 'ffeee50d-82a0-4992-a895-7aa23c5d8703', 5, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('661785c9-4f47-4b34-afdc-c50aedc56e9c', 'e17c67b3-6a9f-4424-94d8-851c43b6057e', 'fa5d9011-eb2f-4d93-9a37-d524b6e73954', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('f5c40b68-9953-4f50-a00b-e18c93a21513', '7ab00fdc-433b-4a31-92e7-838a85304f8b', 'c9843e7e-63ae-482c-b910-5b73cc9bbb4c', 4, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('a8638ca0-db6e-4021-bcd7-221ccdff8410', '555a7a59-3185-4562-90c6-813a47ddc9d6', '7e215bda-8be0-4db1-993d-00859d298a37', 6, false);
INSERT INTO public.theme_relations (id, parent, child, "position", is_weak) VALUES ('2f77aff1-ffec-45c8-9b63-72c0ccd825e4', 'c3e02ffb-759e-463e-9dce-d185c5fe6721', '04c109f0-3288-4d4b-bd39-c982baadcfa3', 3, false);


--
-- PostgreSQL database dump complete
--

