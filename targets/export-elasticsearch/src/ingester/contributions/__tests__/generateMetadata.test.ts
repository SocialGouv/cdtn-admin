import {
  AgreementDoc,
  Breadcrumb,
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { generateMetadata } from "../generateMetadata";

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Breadcrumb 1",
    position: 1,
    slug: "slug1",
  },
  {
    label: "Breadcrumb 2",
    position: 2,
    slug: "slug2",
  },
];

describe("generateMetadata", () => {
  describe("Page non personnalisée", () => {
    describe("avec un titre SEO personnalisé", () => {
      const contribution: Partial<
        DocumentElasticWithSource<ContributionDocumentJson>
      > = {
        idcc: "0000",
        questionName: "Question",
        seoTitle: "SEO Title",
        description: "Description",
      };

      it("doit générer les metadata sans prendre en compte les thèmes ou le titre SEO", () => {
        const metadata: ContributionMetadata = generateMetadata(
          [],
          contribution as DocumentElasticWithSource<ContributionDocumentJson>,
          breadcrumbs
        );

        expect(metadata.title).toBe("Question");
        expect(metadata.text).toBe("Description");
        expect(metadata.metas.title).toBe("Question");
        expect(metadata.metas.description).toBe("Description");
      });
    });

    describe("sans titre SEO personnalisé sans prendre en compte les thèmes ou le titre SEO", () => {
      const contribution: Partial<
        DocumentElasticWithSource<ContributionDocumentJson>
      > = {
        idcc: "0000",
        questionName: "Question",
        seoTitle: "",
        description: "Description",
      };

      it("doit générer les metadata", () => {
        const metadata: ContributionMetadata = generateMetadata(
          [],
          contribution as DocumentElasticWithSource<ContributionDocumentJson>,
          breadcrumbs
        );

        expect(metadata.title).toBe("Question");
        expect(metadata.text).toBe("Description");
        expect(metadata.metas.title).toBe("Question");
        expect(metadata.metas.description).toBe("Description");
      });
    });
  });

  describe("Page personnalisée", () => {
    const ccns: Partial<DocumentElasticWithSource<AgreementDoc>>[] = [
      {
        num: 123,
        shortTitle: "CC Short title",
      },
    ];

    describe("avec un titre SEO personnalisé", () => {
      const contribution: Partial<
        DocumentElasticWithSource<ContributionDocumentJson>
      > = {
        idcc: "123",
        questionName: "Question",
        seoTitle: "SEO Title",
        description: "Description",
      };

      it("doit générer les metadata avec le titre SEO", () => {
        const metadata: ContributionMetadata = generateMetadata(
          ccns as DocumentElasticWithSource<AgreementDoc>[],
          contribution as DocumentElasticWithSource<ContributionDocumentJson>,
          breadcrumbs
        );

        expect(metadata.title).toBe("Question");
        expect(metadata.text).toBe("Description");
        expect(metadata.metas.title).toBe("SEO Title - CC Short title");
        expect(metadata.metas.description).toBe("Question - Description");
      });
    });

    describe("sans titre SEO personnalisé", () => {
      const contribution: Partial<
        DocumentElasticWithSource<ContributionDocumentJson>
      > = {
        idcc: "123",
        questionName: "Question",
        seoTitle: "",
        description: "Description",
      };

      it("doit générer les metadata avec le thème de plus haut niveau", () => {
        const metadata: ContributionMetadata = generateMetadata(
          ccns as DocumentElasticWithSource<AgreementDoc>[],
          contribution as DocumentElasticWithSource<ContributionDocumentJson>,
          breadcrumbs
        );

        expect(metadata.title).toBe("Question");
        expect(metadata.text).toBe("Description");
        expect(metadata.metas.title).toBe("Breadcrumb 2 - CC Short title");
        expect(metadata.metas.description).toBe("Question - Description");
      });
    });
  });

  describe("Vérification de l'assignation d'un thème", () => {
    describe("lorsque la contribution est publié et aucun thème associé", () => {
      const contribution: Partial<
        DocumentElasticWithSource<ContributionDocumentJson>
      > = {
        id: "123",
        idcc: "123",
        questionName: "Question",
        questionIndex: 1,
        isPublished: true,
        description: "Description",
      };

      it("doit lever une erreur demandant d'assigner un thème", () => {
        expect(() => {
          generateMetadata(
            [] as DocumentElasticWithSource<AgreementDoc>[],
            contribution as DocumentElasticWithSource<ContributionDocumentJson>,
            []
          );
        }).toThrow(
          `Merci d'assigner un thème à la contribution 1 - Question (123). Cette opération est disponible dans le menu Vérifications -> Contenus sans thèmes.`
        );
      });
    });

    describe("lorsque la contribution n'est pas publié et aucun thème associé", () => {
      const contribution: Partial<
        DocumentElasticWithSource<ContributionDocumentJson>
      > = {
        id: "123",
        idcc: "0000",
        questionName: "Question",
        questionIndex: 1,
        isPublished: false,
        description: "Description",
      };

      it("ne doit pas lever d'erreur", () => {
        expect(() => {
          generateMetadata(
            [] as DocumentElasticWithSource<AgreementDoc>[],
            contribution as DocumentElasticWithSource<ContributionDocumentJson>,
            []
          );
        }).not.toThrow();
      });
    });
  });
});
