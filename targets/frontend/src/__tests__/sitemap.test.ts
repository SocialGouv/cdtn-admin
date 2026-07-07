import { toUrlEntries, Document } from "../pages/api/sitemap";

jest.mock("p-limit", () => () => ({}));

describe("Sitemap", () => {
  const documents: Document[] = [
    {
      updated_at: "2022-01-03T00:30:44.301258+00:00",
      slug: "l1235-12",
      source: "code_du_travail",
      document: {},
    },
    {
      updated_at: "2022-01-11T00:31:14.726994+00:00",
      slug: "un-salarie-peut-il-travailler-pendant-un-arret-de-travail",
      source: "fiches_service_public",
      document: {},
    },
    {
      updated_at: "2022-01-05T15:59:30.542958+00:00",
      slug: "demande-de-versement-de-lindemnite-inflation",
      source: "modeles_de_courriers",
      document: {},
    },
    {
      updated_at: "2022-01-11T00:31:27.321974+00:00",
      slug: "5-questions-reponses-sur-le-versement-du-salaire",
      source: "page_fiche_ministere_travail",
      document: {},
    },
    {
      updated_at: "2022-01-07T13:09:02.024878+00:00",
      slug: "indemnite-inflation-infographies",
      source: "information",
      document: {},
    },
    {
      updated_at: "2020-11-16T15:46:33.470855+00:00",
      slug: "greve",
      source: "themes",
      document: {},
    },
    {
      slug: "1031-convention-collective-nationale-des-personnels-familles-rurales",
      source: "conventions_collectives",
      updated_at: "2020-11-16T15:46:34.470855+00:00",
      document: {
        num: 1031,
      },
    },
    {
      updated_at: "2022-01-19T11:07:11.31437+00:00",
      slug: "1031-quelles-sont-les-conditions-dindemnisation-pendant-le-conge-de-maternite",
      source: "contributions",
      document: {
        idcc: "1031",
        questionIndex: 43,
      },
    },
    {
      updated_at: "2022-01-19T11:07:11.31437+00:00",
      slug: "quelles-sont-les-conditions-dindemnisation-pendant-le-conge-de-maternite",
      source: "contributions",
      document: {
        idcc: "0000",
        questionIndex: 43,
      },
    },
    {
      updated_at: "2022-01-19T11:07:11.31437+00:00",
      slug: "1031-les-conges-pour-evenements-familiaux",
      source: "contributions",
      document: {
        idcc: "1031",
        questionIndex: 50,
      },
    },
    {
      updated_at: "2022-01-19T11:07:11.31437+00:00",
      slug: "les-conges-pour-evenements-familiaux",
      source: "contributions",
      document: {
        idcc: "0000",
        questionIndex: 50,
      },
    },
  ];
  const glossaryTerms: Document[] = [
    {
      updated_at: "2020-11-25T14:38:50.085775+00:00",
      slug: "abrogation",
      source: "glossary",
      document: {},
    },
  ];
  it("should generate urlEntry for given documents", async () => {
    const { latestPostDate, pages, staticPages, glossaryPages } =
      await toUrlEntries(documents, glossaryTerms, "base.url");
    expect(latestPostDate.getTime()).toEqual(
      new Date("2022-01-19T11:07:11.314Z").getTime()
    );
    expect(pages).toEqual([
      "<url><loc>base.url/code-du-travail/l1235-12</loc><lastmod>2022-01-03T00:30:44.301Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/fiche-service-public/un-salarie-peut-il-travailler-pendant-un-arret-de-travail</loc><lastmod>2022-01-11T00:31:14.726Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/modeles-de-courriers/demande-de-versement-de-lindemnite-inflation</loc><lastmod>2022-01-05T15:59:30.542Z</lastmod><priority>0.7</priority></url>",
      "<url><loc>base.url/fiche-ministere-travail/5-questions-reponses-sur-le-versement-du-salaire</loc><lastmod>2022-01-11T00:31:27.321Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/information/indemnite-inflation-infographies</loc><lastmod>2022-01-07T13:09:02.024Z</lastmod><priority>0.7</priority></url>",
      "<url><loc>base.url/themes/greve</loc><lastmod>2020-11-16T15:46:33.470Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/convention-collective/1031-convention-collective-nationale-des-personnels-familles-rurales</loc><lastmod>2020-11-16T15:46:34.470Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/contribution/1031-quelles-sont-les-conditions-dindemnisation-pendant-le-conge-de-maternite</loc><lastmod>2022-01-19T11:07:11.314Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/contribution/quelles-sont-les-conditions-dindemnisation-pendant-le-conge-de-maternite</loc><lastmod>2022-01-19T11:07:11.314Z</lastmod><priority>0.7</priority></url>",
      "<url><loc>base.url/contribution/les-conges-pour-evenements-familiaux/1031-convention-collective-nationale-des-personnels-familles-rurales</loc><lastmod>2022-01-19T11:07:11.314Z</lastmod><priority>0.5</priority></url>",
      "<url><loc>base.url/contribution/les-conges-pour-evenements-familiaux</loc><lastmod>2022-01-19T11:07:11.314Z</lastmod><priority>0.7</priority></url>",
    ]);
    expect(staticPages.length).toEqual(14);
    expect(staticPages[0]).toContain("<url><loc>base.url/a-propos</loc>");
    expect(glossaryPages).toEqual([
      "<url><loc>base.url/glossaire/abrogation</loc><lastmod>2020-11-25T14:38:50.085Z</lastmod><priority>0.5</priority></url>",
    ]);
  });
});
