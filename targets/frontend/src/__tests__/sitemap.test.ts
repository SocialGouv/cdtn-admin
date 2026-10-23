import { getImageBaseUrl, toUrlEntries, Document } from "../pages/api/sitemap";

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
    // Page fixe : pas de lastmod.
    expect(staticPages[0]).toBe(
      "<url><loc>base.url/a-propos</loc><priority>0.5</priority></url>"
    );
    // Page de liste : date du contenu le plus récent de sa rubrique.
    expect(
      staticPages.find((page) =>
        page.includes("<loc>base.url/modeles-de-courriers</loc>")
      )
    ).toContain("<lastmod>2022-01-05T15:59:30.542Z</lastmod>");
    expect(
      staticPages.find((page) => page.includes("<loc>base.url/glossaire</loc>"))
    ).toContain("<lastmod>2020-11-25T14:38:50.085Z</lastmod>");
    // Rubrique sans contenu : pas de lastmod.
    expect(
      staticPages.find((page) => page.includes("<loc>base.url/actualite</loc>"))
    ).not.toContain("<lastmod>");
    expect(glossaryPages).toEqual([
      "<url><loc>base.url/glossaire/abrogation</loc><lastmod>2020-11-25T14:38:50.085Z</lastmod><priority>0.5</priority></url>",
    ]);
  });

  it("utilise la date de modification d'une actualité quand elle est plus récente", async () => {
    const { pages } = await toUrlEntries(
      [
        {
          updated_at: "2026-10-01T08:00:00.000000+00:00",
          slug: "nouveau-bareme",
          source: "actualites",
          document: {
            date: "01/10/2026",
            updatedAt: "2026-10-10T13:07:55.000Z",
          },
        },
        {
          updated_at: "2026-10-05T08:00:00.000000+00:00",
          slug: "autre-actualite",
          source: "actualites",
          document: { date: "05/10/2026" },
        },
      ],
      [],
      "base.url"
    );

    expect(pages[0]).toContain("<lastmod>2026-10-10T13:07:55.000Z</lastmod>");
    expect(pages[1]).toContain("<lastmod>2026-10-05T00:00:00+02:00</lastmod>");
  });

  it("date une actualité à minuit heure de Paris, en été comme en hiver", async () => {
    const news = (slug: string, date: string): Document => ({
      updated_at: "2026-10-01T08:00:00.000000+00:00",
      slug,
      source: "actualites",
      document: { date },
    });
    const { pages } = await toUrlEntries(
      [
        news("ete", "23/09/2026"),
        news("hiver", "15/01/2026"),
        news("saisie-courte", "1/9/26"),
        news("date-invalide", "31/02/2026"),
      ],
      [],
      "base.url"
    );

    expect(pages[0]).toContain("<lastmod>2026-09-23T00:00:00+02:00</lastmod>");
    expect(pages[1]).toContain("<lastmod>2026-01-15T00:00:00+01:00</lastmod>");
    expect(pages[2]).toContain("<lastmod>2026-09-01T00:00:00+02:00</lastmod>");
    // Date invalide : date de mise à jour du document.
    expect(pages[3]).toContain("<lastmod>2026-10-01T08:00:00.000Z</lastmod>");
  });

  it("liste l'image d'une actualité avec l'url publique du site", async () => {
    const news: Document = {
      updated_at: "2026-10-01T08:00:00.000000+00:00",
      slug: "nouveau-bareme",
      source: "actualites",
      document: {
        date: "01/10/2026",
        image: { filename: "draft/default/nouveau-bareme.webp" },
      },
    };

    const { pages, staticPages } = await toUrlEntries(
      [news, { ...news, slug: "sans-image", document: { date: "02/10/2026" } }],
      [],
      "base.url",
      { imageBaseUrl: "https://bucket/published/default" }
    );

    expect(pages[0]).toBe(
      "<url><loc>base.url/actualite/nouveau-bareme</loc><lastmod>2026-10-01T00:00:00+02:00</lastmod><priority>0.5</priority><image:image><image:loc>https://bucket/published/default/nouveau-bareme.webp</image:loc></image:image></url>"
    );
    expect(pages[1]).not.toContain("<image:image>");
    expect(
      staticPages.find((page) => page.includes("<loc>base.url/actualite</loc>"))
    ).toContain("<lastmod>2026-10-02T00:00:00+02:00</lastmod>");
  });

  it("ne liste pas d'image sans base d'url", async () => {
    const { pages } = await toUrlEntries(
      [
        {
          updated_at: "2026-10-01T08:00:00.000000+00:00",
          slug: "nouveau-bareme",
          source: "actualites",
          document: { date: "01/10/2026", image: { filename: "a.webp" } },
        },
      ],
      [],
      "base.url"
    );
    expect(pages[0]).not.toContain("<image:image>");
  });

  it("construit la base d'url des images à partir du dossier du bucket", () => {
    expect(getImageBaseUrl("published")).toBe(
      "http://localhost:9000/published/default"
    );
    expect(getImageBaseUrl(undefined)).toBeUndefined();
    expect(getImageBaseUrl(["published"])).toBeUndefined();
    expect(getImageBaseUrl("../secret")).toBeUndefined();
  });

  it("échappe les caractères spéciaux XML des url", async () => {
    const { pages } = await toUrlEntries(
      [
        {
          updated_at: "2026-10-01T08:00:00.000000+00:00",
          slug: "a&b",
          source: "fiches_service_public",
          document: {},
        },
      ],
      [],
      "base.url"
    );
    expect(pages[0]).toContain(
      "<loc>base.url/fiche-service-public/a&amp;b</loc>"
    );
  });

  describe("balises Google Actualités", () => {
    const now = new Date("2026-10-22T14:00:00.000Z");
    const news = (date: string, title = "Nouveau barème & taux"): Document => ({
      updated_at: "2026-10-22T08:00:00.000000+00:00",
      slug: `actu-${date.replace(/\//g, "-")}`,
      title,
      source: "actualites",
      document: { date },
    });

    it("ajoute news:news aux actualités des deux derniers jours", async () => {
      const { pages } = await toUrlEntries(
        [news("22/10/2026"), news("20/10/2026")],
        [],
        "base.url",
        { now }
      );

      expect(pages[0]).toContain(
        "<news:news><news:publication><news:name>Code du travail numérique</news:name><news:language>fr</news:language></news:publication><news:publication_date>2026-10-22T00:00:00+02:00</news:publication_date><news:title>Nouveau barème &amp; taux</news:title></news:news>"
      );
      expect(pages[1]).toContain(
        "<news:publication_date>2026-10-20T00:00:00+02:00</news:publication_date>"
      );
    });

    it("n'ajoute rien aux actualités plus anciennes, futures ou sans titre", async () => {
      const { pages } = await toUrlEntries(
        [news("19/10/2026"), news("25/10/2026"), news("22/10/2026", "")],
        [],
        "base.url",
        { now }
      );

      pages.forEach((page) => expect(page).not.toContain("<news:news>"));
    });

    it("compte les deux jours en heure de Paris", async () => {
      // 23/10 à 1 h 30 à Paris, encore le 22/10 en UTC.
      const { pages } = await toUrlEntries(
        [news("23/10/2026"), news("21/10/2026"), news("20/10/2026")],
        [],
        "base.url",
        { now: new Date("2026-10-22T23:30:00.000Z") }
      );

      expect(pages[0]).toContain(
        "<news:publication_date>2026-10-23T00:00:00+02:00</news:publication_date>"
      );
      expect(pages[1]).toContain("<news:news>");
      expect(pages[2]).not.toContain("<news:news>");
    });

    it("utilise l'instant de publication quand il est connu", async () => {
      const { pages } = await toUrlEntries(
        [
          {
            ...news("22/10/2026"),
            document: {
              date: "22/10/2026",
              publishedAt: "2026-10-22T07:45:00.000Z",
            },
          },
        ],
        [],
        "base.url",
        { now }
      );

      expect(pages[0]).toContain("<lastmod>2026-10-22T07:45:00.000Z</lastmod>");
      expect(pages[0]).toContain(
        "<news:publication_date>2026-10-22T07:45:00.000Z</news:publication_date>"
      );
    });

    it("garde la première publication d'une actualité republiée", async () => {
      // Publiée le 21/10 à 9 h 45 (Paris), republiée le 22/10.
      const { pages } = await toUrlEntries(
        [
          {
            ...news("22/10/2026"),
            document: {
              date: "22/10/2026",
              publishedAt: "2026-10-21T07:45:00.000Z",
            },
          },
        ],
        [],
        "base.url",
        { now }
      );

      expect(pages[0]).toContain(
        "<lastmod>2026-10-22T00:00:00+02:00</lastmod>"
      );
      expect(pages[0]).toContain(
        "<news:publication_date>2026-10-21T07:45:00.000Z</news:publication_date>"
      );
    });

    it("compte 48 heures exactement quand l'heure est connue", async () => {
      const published = (publishedAt: string): Document => ({
        ...news("20/10/2026"),
        document: { date: "20/10/2026", publishedAt },
      });
      const { pages } = await toUrlEntries(
        [
          published("2026-10-20T15:00:00.000Z"),
          published("2026-10-20T13:00:00.000Z"),
        ],
        [],
        "base.url",
        { now }
      );

      expect(pages[0]).toContain("<news:news>");
      expect(pages[1]).not.toContain("<news:news>");
    });

    it("ignore un instant de publication invalide", async () => {
      const { pages } = await toUrlEntries(
        [
          {
            ...news("22/10/2026"),
            document: { date: "22/10/2026", publishedAt: "n'importe quoi" },
          },
        ],
        [],
        "base.url",
        { now }
      );

      expect(pages[0]).toContain(
        "<news:publication_date>2026-10-22T00:00:00+02:00</news:publication_date>"
      );
    });

    it("n'ajoute rien aux autres contenus", async () => {
      const { pages } = await toUrlEntries(
        [{ ...news("22/10/2026"), source: "information" }],
        [],
        "base.url",
        { now }
      );

      expect(pages[0]).not.toContain("<news:news>");
    });
  });
});
