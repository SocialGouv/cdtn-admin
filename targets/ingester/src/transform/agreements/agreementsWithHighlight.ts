import { client } from "@shared/graphql-client";

const getAgreementsWithHighlightQuery = `
query get_agreements_with_highlight {
  documents(where: {source: {_eq: "conventions_collectives"}, document: {_has_key: "highlight"}}) {
    num: document(path: "$.num")
    highlight: document(path: "$.highlight")
  }
}
`;

interface AgreementHighlight {
  title?: string;
  content?: string;
  searchInfo?: string;
}

interface AgreementWithHighlight {
  num: number;
  highlight: AgreementHighlight;
}

interface AgreementsResult {
  documents: AgreementWithHighlight[];
}

const getAgreementsWithHighlight = async (): Promise<
  Partial<Record<number, AgreementHighlight>>
> => {
  const result = await client
    .query<AgreementsResult>(getAgreementsWithHighlightQuery)
    .toPromise();

  if (result.error) {
    throw new Error(`error while retrieving current agreements data`);
  }
  if (result.data !== undefined) {
    return result.data.documents.reduce(
      (acc: Record<number, AgreementHighlight>, curr) => {
        acc[curr.num] = curr.highlight;
        return acc;
      },
      {}
    );
  }
  return {};
};

export default getAgreementsWithHighlight;
