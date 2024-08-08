import {
  DocumentElasticWithSource,
  AgreementDoc,
  ContributionDocumentJson,
  Breadcrumb,
  ContributionMetadata,
} from "@socialgouv/cdtn-types";
import { generateMetadata } from "../generateMetadata";

describe("generateMetadata", () => {
  const ccns: Partial<DocumentElasticWithSource<AgreementDoc>>[] = [
    {
      num: 123,
    },
  ];

  const contribution: Partial<
    DocumentElasticWithSource<ContributionDocumentJson>
  > = {
    idcc: "123",
    questionName: "Question",
    seoTitle: "SEO Title",
    description: "Description",
  };

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

  it("should generate metadata with title, text, metaTitle, and metaDescription", () => {
    const metadata: ContributionMetadata = generateMetadata(
      ccns as DocumentElasticWithSource<AgreementDoc>[],
      contribution as DocumentElasticWithSource<ContributionDocumentJson>,
      breadcrumbs
    );

    expect(metadata.title).toBe("Question");
    expect(metadata.text).toBe("Description");
    expect(metadata.metaTitle).toBe("SEO Title");
    expect(metadata.metaDescription).toBe("SEO Title Description");
  });
});
