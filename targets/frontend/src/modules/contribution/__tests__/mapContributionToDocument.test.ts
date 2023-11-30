import {
  ContributionDocumentJson,
  ContributionsAnswers,
  Document,
} from "@shared/types";
import { mapContributionToDocument } from "../mapContributionToDocument";

describe("mapContributionToDocument", () => {
  it("devrait mapper les message d'intro et alerte pour les generique de type NOTHING", async () => {
    const inputContribution: ContributionsAnswers = {
      id: "effee3b9-84fb-4667-944b-4b1e1fd14eb5",
      content_type: "NOTHING",
      question: {
        id: "3384f257-e319-46d1-a4cb-8e8294da337b",
        content:
          "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
        order: 43,
      },
      messageIntro: "Pas de content",
      messageAlert: "Alerte: Pas de content !",
    };

    const inputDoc: Document<any> = {
      cdtn_id: "cdtn_id",
      initial_id: "effee3b9-84fb-4667-944b-4b1e1fd14eb5",
      title:
        "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
      meta_description: "meta",
      source: "contributions",
      slug: "hospitalisation-du-nouveau-ne-quelles-consequences-sur-le-conge-de-maternite",
      text: " texte",
      document: {
        info_random: "random",
      },
      is_available: true,
    };

    const outputDoc: Document<ContributionDocumentJson> = {
      cdtn_id: "cdtn_id",
      document: {
        content:
          "<p>Quand une femme tombe enceinte et décide de partir en congé maternité, cette dernière a droit à des indemnités journalières de sécurité sociale venant indemniser la période durant laquelle elle ne peut plus travailler. Certaines conventions collectives prévoient également un maintien de salaire versé par l’employeur. Si le maintien est à 100%, dans ce cas, les deux mécanismes ne sont pas cumulables. Si le maintien est inférieur à 100%, le pourcentage de rémunération restant est indemnisé par les indemnités de Sécurité sociale.&nbsp;</p><h3>Maintien de salaire</h3><p>Les salariées ayant au moins une année de présence continue dans l'entreprise à la date de l'accouchement ont droit à un maintien de salaire, après déduction des indemnités de Sécurité sociale, qui leur assure leur salaire habituel, et ce pendant une durée de 36 jours (en principe 18 jours avant l’accouchement, 18 jours après).</p><p>Pour les salariées cadres âgées de moins de 25 ans et les autres salariées âgées de moins de 22 ans à la date de l'accouchement, la période de 36 jours est augmentée de 2 jours par enfant à charge. L'indemnité&nbsp;complémentaire ne pourra pas être versée plus de 46 jours. Est considéré comme enfant à charge tout enfant à charge de la salariée au sens de la législation des prestations familiales et âgé de moins de 15 ans à la date de l'accouchement.</p><p>A noter&nbsp;: Les périodes de&nbsp;suspension du contrat de travail&nbsp;(maladie, etc.) sont prises en compte pour l'ancienneté.</p><p>Si la salariée ne respecte pas la condition d’ancienneté, elle n’a pas droit au maintien de salaire versé par l’employeur mais aura potentiellement droit aux indemnités journalières de Sécurité sociale si elle respecte ses conditions d’octroi.&nbsp;</p><h3>Indemnités de Sécurité sociale</h3><p><strong>Conditions d’ouverture des droits aux indemnités journalières de Sécurité sociale</strong></p><p>Pour être indemnisée, la salariée doit remplir les conditions suivantes :</p><ul><li><p>Etre affiliée à la Sécurité sociale depuis au moins 10 mois à la date présumée de l'accouchement&nbsp;;</p></li><li><p>cesser son activité professionnelle pendant au moins 8&nbsp;semaines&nbsp;;</p></li></ul><ul><li><p>avoir :&nbsp;</p><ul><li><p>soit travaillé au moins 150 heures au cours des 3 mois civils ou des 90 jours précédant l'arrêt,&nbsp;</p></li><li><p>soit travaillé au moins&nbsp;<strong>600 heures</strong>&nbsp;au cours des 12 mois précédant l’arrêt de travail,&nbsp;</p></li><li><p>soit cotisé, au cours des 6 mois civils précédant l'arrêt, sur la base d'une rémunération au moins égale à 1 015 fois le montant du Smic horaire fixé au début de cette période,&nbsp;</p></li><li><p>soit cotisé au cours des&nbsp;<strong>12 mois</strong>&nbsp;civils précédant l’arrêt, sur la base d'une rémunération au moins égale à&nbsp;2030 fois le montant du Smic horaire fixé en début de période.</p></li></ul></li></ul><p>Exemple&nbsp;:&nbsp;le congé a débuté le 1er juillet 2023 pour une date présumée d'accouchement au 1er septembre 2023.</p><p>Le droit aux&nbsp;indemnités&nbsp;journalières est ouvert si :</p><ul><li><p>La salariée était déjà affiliée à la Sécurité sociale avant novembre 2022&nbsp;;</p></li><li><p>et a travaillé soit au moins 150 heures entre le 1er avril 2023 et le 30 juin 2023, soit au moins 600 heures entre le 1er juillet 2022 et le 30 juin 2023, soit a cotisé entre le 1er janvier 2023 et le 30 juin 2023 sur la base d'une rémunération au moins égale à 11&nbsp;439,05&nbsp;€, soit a cotisé entre le 1er juillet 2022 et le 30 juin 2023 sur la base d’une rémunération au moins égale à 22&nbsp;878,1 €.</p></li></ul><p><strong>Montant</strong></p><p>La CPAM verse des&nbsp;indemnités&nbsp;journalières, dont le montant est fixé selon les étapes de calcul suivantes :</p><ul><li><p>Calcul du salaire journalier de base : somme des 3 derniers salaires bruts perçus avant la date d'interruption du travail, divisé par 91,25.</p></li><li><p>Montant maximal du salaire journalier de base : le salaire pris en compte ne peut pas dépasser le plafond mensuel de la sécurité sociale en&nbsp;vigueur&nbsp;lors du dernier jour du mois qui précède l'arrêt (soit 3&nbsp;666&nbsp;€ par mois en 2023, ou 3&nbsp;428&nbsp;€ en 2022).</p></li><li><p>Taux forfaitaire appliqué par la CPAM : la CPAM retire à ce salaire journalier de base un taux forfaitaire de 21&nbsp;%.</p></li><li><p>Montant minimal et montant maximal des&nbsp;indemnités&nbsp;journalières : le montant ne peut pas être inférieur à 10,24&nbsp;€ ni supérieur à 95,22&nbsp;€ par jour.</p></li></ul><p><strong>Versement</strong></p><p>Les&nbsp;indemnités&nbsp;journalières sont versées tous les 14 jours.</p>",
        contentType: "ANSWER",
        idcc: "0016",
        questionId: "3384f257-e319-46d1-a4cb-8e8294da337b",
        questionName:
          "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
        linkedContent: [],
        questionIndex: 43,
        references: [],
        type: "content",
      },
      initial_id: "effee3b9-84fb-4667-944b-4b1e1fd14eb5",
      is_available: true,
      meta_description: "meta",
      slug: "hospitalisation-du-nouveau-ne-quelles-consequences-sur-le-conge-de-maternite",
      source: "contributions",
      text: " texte",
      title:
        "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
    };

    const result = await mapContributionToDocument(
      inputContribution,
      inputDoc,
      jest.fn()
    );
    expect(result).toEqual(outputDoc);
  });

  it("devrait mapper l'answer d'un document sans fiche SP", async () => {
    const inputContribution: ContributionsAnswers = {
      id: "effee3b9-84fb-4667-944b-4b1e1fd14eb5",
      content:
        "<p>Quand une femme tombe enceinte et décide de partir en congé maternité, cette dernière a droit à des indemnités journalières de sécurité sociale venant indemniser la période durant laquelle elle ne peut plus travailler. Certaines conventions collectives prévoient également un maintien de salaire versé par l’employeur. Si le maintien est à 100%, dans ce cas, les deux mécanismes ne sont pas cumulables. Si le maintien est inférieur à 100%, le pourcentage de rémunération restant est indemnisé par les indemnités de Sécurité sociale.&nbsp;</p><h3>Maintien de salaire</h3><p>Les salariées ayant au moins une année de présence continue dans l'entreprise à la date de l'accouchement ont droit à un maintien de salaire, après déduction des indemnités de Sécurité sociale, qui leur assure leur salaire habituel, et ce pendant une durée de 36 jours (en principe 18 jours avant l’accouchement, 18 jours après).</p><p>Pour les salariées cadres âgées de moins de 25 ans et les autres salariées âgées de moins de 22 ans à la date de l'accouchement, la période de 36 jours est augmentée de 2 jours par enfant à charge. L'indemnité&nbsp;complémentaire ne pourra pas être versée plus de 46 jours. Est considéré comme enfant à charge tout enfant à charge de la salariée au sens de la législation des prestations familiales et âgé de moins de 15 ans à la date de l'accouchement.</p><p>A noter&nbsp;: Les périodes de&nbsp;suspension du contrat de travail&nbsp;(maladie, etc.) sont prises en compte pour l'ancienneté.</p><p>Si la salariée ne respecte pas la condition d’ancienneté, elle n’a pas droit au maintien de salaire versé par l’employeur mais aura potentiellement droit aux indemnités journalières de Sécurité sociale si elle respecte ses conditions d’octroi.&nbsp;</p><h3>Indemnités de Sécurité sociale</h3><p><strong>Conditions d’ouverture des droits aux indemnités journalières de Sécurité sociale</strong></p><p>Pour être indemnisée, la salariée doit remplir les conditions suivantes :</p><ul><li><p>Etre affiliée à la Sécurité sociale depuis au moins 10 mois à la date présumée de l'accouchement&nbsp;;</p></li><li><p>cesser son activité professionnelle pendant au moins 8&nbsp;semaines&nbsp;;</p></li></ul><ul><li><p>avoir :&nbsp;</p><ul><li><p>soit travaillé au moins 150 heures au cours des 3 mois civils ou des 90 jours précédant l'arrêt,&nbsp;</p></li><li><p>soit travaillé au moins&nbsp;<strong>600 heures</strong>&nbsp;au cours des 12 mois précédant l’arrêt de travail,&nbsp;</p></li><li><p>soit cotisé, au cours des 6 mois civils précédant l'arrêt, sur la base d'une rémunération au moins égale à 1 015 fois le montant du Smic horaire fixé au début de cette période,&nbsp;</p></li><li><p>soit cotisé au cours des&nbsp;<strong>12 mois</strong>&nbsp;civils précédant l’arrêt, sur la base d'une rémunération au moins égale à&nbsp;2030 fois le montant du Smic horaire fixé en début de période.</p></li></ul></li></ul><p>Exemple&nbsp;:&nbsp;le congé a débuté le 1er juillet 2023 pour une date présumée d'accouchement au 1er septembre 2023.</p><p>Le droit aux&nbsp;indemnités&nbsp;journalières est ouvert si :</p><ul><li><p>La salariée était déjà affiliée à la Sécurité sociale avant novembre 2022&nbsp;;</p></li><li><p>et a travaillé soit au moins 150 heures entre le 1er avril 2023 et le 30 juin 2023, soit au moins 600 heures entre le 1er juillet 2022 et le 30 juin 2023, soit a cotisé entre le 1er janvier 2023 et le 30 juin 2023 sur la base d'une rémunération au moins égale à 11&nbsp;439,05&nbsp;€, soit a cotisé entre le 1er juillet 2022 et le 30 juin 2023 sur la base d’une rémunération au moins égale à 22&nbsp;878,1 €.</p></li></ul><p><strong>Montant</strong></p><p>La CPAM verse des&nbsp;indemnités&nbsp;journalières, dont le montant est fixé selon les étapes de calcul suivantes :</p><ul><li><p>Calcul du salaire journalier de base : somme des 3 derniers salaires bruts perçus avant la date d'interruption du travail, divisé par 91,25.</p></li><li><p>Montant maximal du salaire journalier de base : le salaire pris en compte ne peut pas dépasser le plafond mensuel de la sécurité sociale en&nbsp;vigueur&nbsp;lors du dernier jour du mois qui précède l'arrêt (soit 3&nbsp;666&nbsp;€ par mois en 2023, ou 3&nbsp;428&nbsp;€ en 2022).</p></li><li><p>Taux forfaitaire appliqué par la CPAM : la CPAM retire à ce salaire journalier de base un taux forfaitaire de 21&nbsp;%.</p></li><li><p>Montant minimal et montant maximal des&nbsp;indemnités&nbsp;journalières : le montant ne peut pas être inférieur à 10,24&nbsp;€ ni supérieur à 95,22&nbsp;€ par jour.</p></li></ul><p><strong>Versement</strong></p><p>Les&nbsp;indemnités&nbsp;journalières sont versées tous les 14 jours.</p>",
      content_type: "ANSWER",
      agreement: {
        id: "0016",
        name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
        kaliId: "KALICONT000005635624",
      },
      question: {
        id: "3384f257-e319-46d1-a4cb-8e8294da337b",
        content:
          "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
        order: 43,
      },
      kali_references: [
        {
          label:
            "Accord du 30 mars 1951 relatif aux techniciens et agents de maîtrise Annexe III, article 22",
          kali_article: {
            id: "KALIARTI000005849277",
            path: "Textes Attachés » Accord du 30 mars 1951 relatif aux techniciens et agents de maîtrise Annexe III » Maternité » Article 22",
            cid: "KALIARTI000005849277",
            label: "Article 22",
          },
        },
        {
          label:
            "Accord du 16 juin 1961 relatifs aux ouvriers - annexe I , article 9",
          kali_article: {
            id: "KALIARTI000005849388",
            path: "Textes Attachés » Accord du 16 juin 1961 relatif aux ouvriers - annexe I » Chapitre Ier : Dispositions communes aux différents groupes d'ouvriers » Maternité » Article 9",
            cid: "KALIARTI000005849387",
            label: "Article 9",
          },
        },
        {
          label:
            "Accord du 27 février 1951 relatif aux employés Annexe II, article 18",
          kali_article: {
            id: "KALIARTI000005849528",
            path: "Textes Attachés » Accord du 27 février 1951 relatif aux employés Annexe II » Maternité » Article 18",
            cid: "KALIARTI000005849527",
            label: "Article 18",
          },
        },
        {
          label:
            "Accord du 30 octobre 1951 relatif aux ingénieurs et cadres - Annexe IV, article 22",
          kali_article: {
            id: "KALIARTI000005849582",
            path: "Textes Attachés » Accord du 30 octobre 1951 relatif aux ingénieurs et cadres - Annexe IV » Maternité » Article 22",
            cid: "KALIARTI000005849582",
            label: "Article 22",
          },
        },
      ],
      legi_references: [],
      other_references: [
        {
          label:
            "Sous-section 3 : Autorisations d'absence et congé de maternité. (Articles L1225-16 à L1225-28)",
          url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006195592/",
        },
        {
          label:
            "Chapitre 3 : Droit aux prestations (maladie, maternité, invalidité, décès) (Articles L313-1 à L313-6) ",
          url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006156079/",
        },
        {
          label:
            "Section 3 : Prestations en espèces (Articles L331-3 à L331-7)",
          url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006172598",
        },
        {
          label:
            "Chapitre 3 : Droit aux prestations (maladie, maternité, congé de paternité, invalidité, décès). (Articles R313-1 à R313-17)",
          url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006156797/",
        },
        {
          label:
            "Section 3 : Prestations en espèces. (Articles R331-5 à R331-7)",
          url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006173387",
        },
      ],
      cdtn_references: [
        {
          document: {
            cdtnId: "abcdef",
          },
        },
        {
          document: {
            cdtnId: "ijhgt",
          },
        },
        {
          document: {
            cdtnId: "klmnop",
          },
        },
        {
          document: {
            cdtnId: "ijhgt",
          },
        },
      ],
      content_fiche_sp: null,
    };

    const inputDoc: Document<any> = {
      cdtn_id: "cdtn_id",
      initial_id: "effee3b9-84fb-4667-944b-4b1e1fd14eb5",
      title:
        "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
      meta_description: "meta",
      source: "contributions",
      slug: "hospitalisation-du-nouveau-ne-quelles-consequences-sur-le-conge-de-maternite",
      text: " texte",
      document: {
        info_random: "random",
      },
      is_available: true,
    };

    const outputDoc: Document<ContributionDocumentJson> = {
      cdtn_id: "cdtn_id",
      document: {
        content:
          "<p>Quand une femme tombe enceinte et décide de partir en congé maternité, cette dernière a droit à des indemnités journalières de sécurité sociale venant indemniser la période durant laquelle elle ne peut plus travailler. Certaines conventions collectives prévoient également un maintien de salaire versé par l’employeur. Si le maintien est à 100%, dans ce cas, les deux mécanismes ne sont pas cumulables. Si le maintien est inférieur à 100%, le pourcentage de rémunération restant est indemnisé par les indemnités de Sécurité sociale.&nbsp;</p><h3>Maintien de salaire</h3><p>Les salariées ayant au moins une année de présence continue dans l'entreprise à la date de l'accouchement ont droit à un maintien de salaire, après déduction des indemnités de Sécurité sociale, qui leur assure leur salaire habituel, et ce pendant une durée de 36 jours (en principe 18 jours avant l’accouchement, 18 jours après).</p><p>Pour les salariées cadres âgées de moins de 25 ans et les autres salariées âgées de moins de 22 ans à la date de l'accouchement, la période de 36 jours est augmentée de 2 jours par enfant à charge. L'indemnité&nbsp;complémentaire ne pourra pas être versée plus de 46 jours. Est considéré comme enfant à charge tout enfant à charge de la salariée au sens de la législation des prestations familiales et âgé de moins de 15 ans à la date de l'accouchement.</p><p>A noter&nbsp;: Les périodes de&nbsp;suspension du contrat de travail&nbsp;(maladie, etc.) sont prises en compte pour l'ancienneté.</p><p>Si la salariée ne respecte pas la condition d’ancienneté, elle n’a pas droit au maintien de salaire versé par l’employeur mais aura potentiellement droit aux indemnités journalières de Sécurité sociale si elle respecte ses conditions d’octroi.&nbsp;</p><h3>Indemnités de Sécurité sociale</h3><p><strong>Conditions d’ouverture des droits aux indemnités journalières de Sécurité sociale</strong></p><p>Pour être indemnisée, la salariée doit remplir les conditions suivantes :</p><ul><li><p>Etre affiliée à la Sécurité sociale depuis au moins 10 mois à la date présumée de l'accouchement&nbsp;;</p></li><li><p>cesser son activité professionnelle pendant au moins 8&nbsp;semaines&nbsp;;</p></li></ul><ul><li><p>avoir :&nbsp;</p><ul><li><p>soit travaillé au moins 150 heures au cours des 3 mois civils ou des 90 jours précédant l'arrêt,&nbsp;</p></li><li><p>soit travaillé au moins&nbsp;<strong>600 heures</strong>&nbsp;au cours des 12 mois précédant l’arrêt de travail,&nbsp;</p></li><li><p>soit cotisé, au cours des 6 mois civils précédant l'arrêt, sur la base d'une rémunération au moins égale à 1 015 fois le montant du Smic horaire fixé au début de cette période,&nbsp;</p></li><li><p>soit cotisé au cours des&nbsp;<strong>12 mois</strong>&nbsp;civils précédant l’arrêt, sur la base d'une rémunération au moins égale à&nbsp;2030 fois le montant du Smic horaire fixé en début de période.</p></li></ul></li></ul><p>Exemple&nbsp;:&nbsp;le congé a débuté le 1er juillet 2023 pour une date présumée d'accouchement au 1er septembre 2023.</p><p>Le droit aux&nbsp;indemnités&nbsp;journalières est ouvert si :</p><ul><li><p>La salariée était déjà affiliée à la Sécurité sociale avant novembre 2022&nbsp;;</p></li><li><p>et a travaillé soit au moins 150 heures entre le 1er avril 2023 et le 30 juin 2023, soit au moins 600 heures entre le 1er juillet 2022 et le 30 juin 2023, soit a cotisé entre le 1er janvier 2023 et le 30 juin 2023 sur la base d'une rémunération au moins égale à 11&nbsp;439,05&nbsp;€, soit a cotisé entre le 1er juillet 2022 et le 30 juin 2023 sur la base d’une rémunération au moins égale à 22&nbsp;878,1 €.</p></li></ul><p><strong>Montant</strong></p><p>La CPAM verse des&nbsp;indemnités&nbsp;journalières, dont le montant est fixé selon les étapes de calcul suivantes :</p><ul><li><p>Calcul du salaire journalier de base : somme des 3 derniers salaires bruts perçus avant la date d'interruption du travail, divisé par 91,25.</p></li><li><p>Montant maximal du salaire journalier de base : le salaire pris en compte ne peut pas dépasser le plafond mensuel de la sécurité sociale en&nbsp;vigueur&nbsp;lors du dernier jour du mois qui précède l'arrêt (soit 3&nbsp;666&nbsp;€ par mois en 2023, ou 3&nbsp;428&nbsp;€ en 2022).</p></li><li><p>Taux forfaitaire appliqué par la CPAM : la CPAM retire à ce salaire journalier de base un taux forfaitaire de 21&nbsp;%.</p></li><li><p>Montant minimal et montant maximal des&nbsp;indemnités&nbsp;journalières : le montant ne peut pas être inférieur à 10,24&nbsp;€ ni supérieur à 95,22&nbsp;€ par jour.</p></li></ul><p><strong>Versement</strong></p><p>Les&nbsp;indemnités&nbsp;journalières sont versées tous les 14 jours.</p>",
        contentType: "ANSWER",
        idcc: "0016",
        questionId: "3384f257-e319-46d1-a4cb-8e8294da337b",
        questionName:
          "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
        linkedContent: [
          {
            cdtnId: "abcdef",
          },
          {
            cdtnId: "ijhgt",
          },
          {
            cdtnId: "klmnop",
          },
          {
            cdtnId: "ijhgt",
          },
        ],
        questionIndex: 43,
        references: [
          {
            title:
              "Accord du 30 mars 1951 relatif aux techniciens et agents de maîtrise Annexe III, article 22",
            url: "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005849277/?idConteneur=KALICONT000005635624",
          },
          {
            title:
              "Accord du 16 juin 1961 relatifs aux ouvriers - annexe I , article 9",
            url: "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005849388/?idConteneur=KALICONT000005635624",
          },
          {
            title:
              "Accord du 27 février 1951 relatif aux employés Annexe II, article 18",
            url: "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005849528/?idConteneur=KALICONT000005635624",
          },
          {
            title:
              "Accord du 30 octobre 1951 relatif aux ingénieurs et cadres - Annexe IV, article 22",
            url: "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005849582/?idConteneur=KALICONT000005635624",
          },
          {
            title:
              "Sous-section 3 : Autorisations d'absence et congé de maternité. (Articles L1225-16 à L1225-28)",
            url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006195592/",
          },
          {
            title:
              "Chapitre 3 : Droit aux prestations (maladie, maternité, invalidité, décès) (Articles L313-1 à L313-6) ",
            url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006156079/",
          },
          {
            title:
              "Section 3 : Prestations en espèces (Articles L331-3 à L331-7)",
            url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006172598",
          },
          {
            title:
              "Chapitre 3 : Droit aux prestations (maladie, maternité, congé de paternité, invalidité, décès). (Articles R313-1 à R313-17)",
            url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006156797/",
          },
          {
            title:
              "Section 3 : Prestations en espèces. (Articles R331-5 à R331-7)",
            url: "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006173387",
          },
        ],
        type: "content",
      },
      initial_id: "effee3b9-84fb-4667-944b-4b1e1fd14eb5",
      is_available: true,
      meta_description: "meta",
      slug: "hospitalisation-du-nouveau-ne-quelles-consequences-sur-le-conge-de-maternite",
      source: "contributions",
      text: " texte",
      title:
        "Quelles sont les conditions d’indemnisation pendant le congé de maternité ?",
    };

    const result = await mapContributionToDocument(
      inputContribution,
      inputDoc,
      jest.fn()
    );
    expect(result).toEqual(outputDoc);
  });
});
