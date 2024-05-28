import { splitArticle } from "../fichesTravailSplitter";

const article = {
  url: "https://travail-emploi.gouv.fr/formation-professionnelle/certification-competences-pro/titres-professionnels-373014",
  date: "25/04/2024",
  intro:
    "<p>Un titre professionnel est une certification d’État élaborée et délivrée par le ministère du Travail.</p>",
  sections: [
    {
      html: '<p>Un titre professionnel est une certification professionnelle qui permet d’acquérir des compétences professionnelles spécifiques et favorise l’accès à l’emploi ou l’évolution professionnelle de son titulaire. Il atteste que son titulaire maîtrise les compétences, aptitudes et connaissances permettant l’exercice d’un métier.</p><blockquote class="spip"><p>En 2020, 70&nbsp;% des certifiés demandeurs d’emploi ont retrouvé un emploi dans les six mois suivant l’obtention d’un titre professionnel, malgré les effets de la crise sanitaire.</p></blockquote><p>Les titres professionnels sont enregistrés dans le répertoire national des certifications professionnelles (RNCP) géré par <a href="https://travail-emploi.gouv.fr/ministere/agences-et-operateurs/article/france-competences" class="spip_in" target="_blank" rel="nofollow, noopener">France compétences</a>. Les titres professionnels sont composés de blocs de compétences dénommés certificats de compétences professionnelles (CCP). <br><br>Le titre professionnel couvre tous les secteurs (bâtiment, services à la personne, transports, restauration, commerce, industrie, etc.) et différents niveaux de qualification&nbsp;:</p><ul class="spip" role="list"><li> niveau 3 (ancien niveau V), correspondant au niveau CAP,<br></li><li> niveau 4 (ancien niveau IV), correspondant au niveau BAC,<br></li><li> niveau 5 (ancien niveau III), correspondant au niveau BTS ou DUT,<br></li><li> niveau 6 (ancien niveau II), correspondant au niveau BAC+3 ou 4.</li></ul><p>Les sessions d’examen sont organisées par des centres qui sont agréés pour une durée déterminée par la direction régionale de l’économie, de l’emploi, du travail et des solidarités (<a href="https://dreets.gouv.fr/" class="spip_out" rel="external">DREETS</a>) compétente. Ces centres s’engagent à respecter la réglementation définie pour chaque examen.</p><p>Les organismes de formation souhaitant proposer l’accès à un titre professionnel par la formation doivent choisir entre deux solutions pour leurs stagiaires&nbsp;:</p><ul class="spip" role="list"><li> devenir également centre d’examen, ce qui permet une souplesse dans l’organisation du parcours allant de la formation à l’examen, dans le respect des référentiels et de la réglementation&nbsp;;</li><li> passer une convention avec un centre agréé pour l’organisation de l’examen. Dans ce cas, ils s’engagent à délivrer aux candidats une formation cohérente avec les objectifs fixés par les référentiels et informent les candidats du lieu et de la date de l’examen.</li></ul>',
      text: "Un titre professionnel est une certification professionnelle qui permet d’acquérir des compétences professionnelles spécifiques et favorise l’accès à l’emploi ou l’évolution professionnelle de son titulaire. Il atteste que son titulaire maîtrise les compétences, aptitudes et connaissances permettant l’exercice d’un métier. En 2020, 70 % des certifiés demandeurs d’emploi ont retrouvé un emploi dans les six mois suivant l’obtention d’un titre professionnel, malgré les effets de la crise sanitaire. Les titres professionnels sont enregistrés dans le répertoire national des certifications professionnelles (RNCP) géré par France compétences. Les titres professionnels sont composés de blocs de compétences dénommés certificats de compétences professionnelles (CCP). Le titre professionnel couvre tous les secteurs (bâtiment, services à la personne, transports, restauration, commerce, industrie, etc.) et différents niveaux de qualification : niveau 3 (ancien niveau V), correspondant au niveau CAP, niveau 4 (ancien niveau IV), correspondant au niveau BAC, niveau 5 (ancien niveau III), correspondant au niveau BTS ou DUT, niveau 6 (ancien niveau II), correspondant au niveau BAC+3 ou 4.Les sessions d’examen sont organisées par des centres qui sont agréés pour une durée déterminée par la direction régionale de l’économie, de l’emploi, du travail et des solidarités (DREETS) compétente. Ces centres s’engagent à respecter la réglementation définie pour chaque examen.Les organismes de formation souhaitant proposer l’accès à un titre professionnel par la formation doivent choisir entre deux solutions pour leurs stagiaires : devenir également centre d’examen, ce qui permet une souplesse dans l’organisation du parcours allant de la formation à l’examen, dans le respect des référentiels et de la réglementation ; passer une convention avec un centre agréé pour l’organisation de l’examen. Dans ce cas, ils s’engagent à délivrer aux candidats une formation cohérente avec les objectifs fixés par les référentiels et informent les candidats du lieu et de la date de l’examen.",
      title: "Qu’est-ce qu’un titre professionnel ?",
      anchor: "Qu-est-ce-qu-un-titre-professionnel",
      references: [],
      description:
        "Un titre professionnel est une certification professionnelle qui permet d’acquérir des compétences professionnelles spécifiques et favorise l’accès à l’emploi ou l’évolution professionnelle de son tit",
    },
    {
      html: '<p>Les titres professionnels s’adressent à toute personne souhaitant acquérir une qualification professionnelle.</p><p>Les titres professionnels concernent plus précisément&nbsp;:</p><ul class="spip" role="list"><li> les personnes sorties du système scolaire et souhaitant acquérir une qualification dans un secteur déterminé, notamment dans le cadre d’un contrat de professionnalisation ou d’apprentissage&nbsp;;</li><li> les personnes expérimentées souhaitant faire valider les compétences acquises en vue d’une promotion sociale par l’obtention d’une qualification reconnue&nbsp;;</li><li> les personnes souhaitant se reconvertir qu’elles soient en recherche ou en situation d’emploi&nbsp;;</li><li> les jeunes, dans le cadre de leur cursus initial, déjà titulaires d’un diplôme de niveau 3 souhaitant se spécialiser sur un titre professionnel via l’apprentissage.</li></ul>',
      text: "Les titres professionnels s’adressent à toute personne souhaitant acquérir une qualification professionnelle.Les titres professionnels concernent plus précisément : les personnes sorties du système scolaire et souhaitant acquérir une qualification dans un secteur déterminé, notamment dans le cadre d’un contrat de professionnalisation ou d’apprentissage ; les personnes expérimentées souhaitant faire valider les compétences acquises en vue d’une promotion sociale par l’obtention d’une qualification reconnue ; les personnes souhaitant se reconvertir qu’elles soient en recherche ou en situation d’emploi ; les jeunes, dans le cadre de leur cursus initial, déjà titulaires d’un diplôme de niveau 3 souhaitant se spécialiser sur un titre professionnel via l’apprentissage.",
      title: "Qui est concerné ?",
      anchor: "Qui-est-concerne",
      references: [],
      description:
        "Les titres professionnels s’adressent à toute personne souhaitant acquérir une qualification professionnelle.Les titres professionnels concernent plus précisément : les personnes sorties du système sc",
    },
  ],
  description:
    "Un titre professionnel est une certification d'État élaborée et délivrée par le ministère du Travail.",
  breadcrumbs: [
    {
      label: "Emploi et formation professionnelle",
      position: 4,
      slug: "/themes/emploi-et-formation-professionnelle",
    },
    {
      label: "Formation professionnelle",
      position: 1,
      slug: "/themes/formation-professionnelle",
    },
    {
      label: "La certification professionnelle",
      position: 6,
      slug: "/themes/la-certification-professionnelle",
    },
  ],
  cdtnId: "fe8fa20966",
  excludeFromSearch: false,
  id: "article373014",
  isPublished: true,
  metaDescription:
    "Un titre professionnel est une certification d'État élaborée et délivrée par le ministère du Travail.",
  refs: [],
  slug: "titres-professionnels",
  source: "page_fiche_ministere_travail",
  title: "Titres professionnels modifié",
};

describe("splitArticle", () => {
  test("should keep the same slug for split article", async () => {
    const splitArticles = await splitArticle(article);
    expect(splitArticles.length).toBe(2);
    expect(splitArticles[0].slug).toBe("titres-professionnels#Qu-est-ce-qu-un-titre-professionnel");
  });
});
