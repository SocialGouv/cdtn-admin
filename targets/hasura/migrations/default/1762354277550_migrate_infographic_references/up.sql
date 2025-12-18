INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'LEGIARTI000046773077');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'LEGIARTI000046773080');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'LEGIARTI000048711640');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('71b59a49-c99b-453f-9acc-c514e771f328', 'LEGIARTI000019071185');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('71b59a49-c99b-453f-9acc-c514e771f328', 'LEGIARTI000019071182');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('71b59a49-c99b-453f-9acc-c514e771f328', 'LEGIARTI000019071180');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'LEGIARTI000048711690');
INSERT INTO infographic.infographic_legi_references(infographic_id, article_id)
VALUES ('29e52fed-e6bf-4dbe-8b77-7b3b1e9c2c32', 'LEGIARTI000046773104');


INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('6bbafd60-3511-4c5c-bafe-7935aa2882dd', 'https://www.inrs.fr/demarche/employeur/ce-qu-il-faut-retenir.html',
        'Démarches de prévention - INRS');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('6bbafd60-3511-4c5c-bafe-7935aa2882dd', 'https://www.ameli.fr/entreprise/sante-travail/prevention',
        'Prévention des risques professionnels en entreprise - AMELI');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('0dd5b863-c282-43b5-9a29-f4464793b340', 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047542116',
        'Décret n° 2023-368 du 13 mai 2023 relatif à la suspension de l''obligation de vaccination contre la covid-19 des professionnels et étudiants');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000046771783',
        'Loi n° 2022-1598 du 21 décembre 2022 portant mesures d''urgence relatives au fonctionnement du marché du travail en vue du plein emploi, article 2.');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048707198',
        'Décret n° 2023-1307 du 28 décembre 2023 relatif au refus par un salarié d''une proposition de contrat de travail à durée indéterminée à l''issue d''un contrat de travail à durée déterminée.');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('a1003644-bb99-474d-af9d-c425349ccd25', 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000046186741',
        'Loi n° 2022-1158 du 16 août 2022 portant mesures d''urgence pour la protection du pouvoir d''achat, article 1.');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('1407194e-e4f9-4f4b-881e-858f8222e5a4', 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048898939',
        'Arrêté du 3 janvier 2024 relatif aux modalités d''information de l''opérateur France Travail par un employeur à la suite du refus par un salarié d''une proposition de contrat de travail à durée indéterminée à l''issue d''un contrat à durée déterminée ou d''un contrat de mission.');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('a1003644-bb99-474d-af9d-c425349ccd25', 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000048480578',
        'Loi n° 2023-1107 du 29 novembre 2023 portant transposition de l''accord national interprofessionnel relatif au partage de la valeur au sein de l''entreprise, article 9.');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('29e52fed-e6bf-4dbe-8b77-7b3b1e9c2c32', 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000046771785',
        'Loi n° 2022-1598 du 21 décembre 2022 portant mesures d''urgence relatives au fonctionnement du marché du travail en vue du plein emploi, article 4');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('29e52fed-e6bf-4dbe-8b77-7b3b1e9c2c32', 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047455109',
        'Décret n° 2023-275 du 17 avril 2023 sur la mise en œuvre de la présomption de démission en cas d''abandon de poste volontaire du salarié');
INSERT INTO infographic.infographic_other_references(infographic_id, url, label)
VALUES ('29e52fed-e6bf-4dbe-8b77-7b3b1e9c2c32',
        'https://www.legifrance.gouv.fr/ceta/id/CETATEXT000050797374?init=true&page=3&query=&searchField=ALL&tab_selection=cetat',
        'Conseil d''État, 18 décembre 2024, n° 473640');

DELETE
FROM information.informations_contents_references
WHERE id IN (
             'c83f90ed-ad47-4527-95fb-a9fbca20639e',
             '2eaf1b36-81d4-4e2a-8f1a-352904b299f2',
             'faac5c01-98f1-4727-b888-c3cbd4310ed0',
             '29651e8b-2388-44de-ad81-73a7d940f66e',
             'a818db1a-f828-49df-a40b-37753eefa09d',
             'cc1448e6-e234-47e0-a983-250157bc1f49',
             'beaf8f08-d1f3-441d-8f6d-54d66cc84554',
             '3d05e81a-610a-4130-9369-87de808bced7',
             'e9c43d11-59bf-42b6-8dfb-eb078323cea4',
             '1272b22e-1d6e-4b9f-9678-75a77e5b84bb',
             'd9e93ce2-9628-40a0-9521-e9b2b2f44ed3',
             '5292164b-fcbb-49b4-8118-59a533848516',
             '8ea58b06-c7e3-4ca0-b20a-db8f82d9c2cb',
             '429f101a-9887-40e4-a7b7-5c30ad3f9d71',
             '8c1916c4-0123-4d57-927d-1ee5cad34f07',
             '2f958d57-4d10-414c-8e40-7354c932f496',
             'ef0907b8-aede-46e1-8261-c36a5d2cda11',
             'e3015ced-be2e-4bc6-ae30-3039895e7415',
             '18ef7908-4736-41cb-a322-cd5a11ac7ccd'
  );
