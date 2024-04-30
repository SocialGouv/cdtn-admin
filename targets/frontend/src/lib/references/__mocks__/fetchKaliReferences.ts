import { fetchKaliReferencesInput } from "../recentKaliReferences";
import { KaliReference } from "../../../components/contributions";

export async function fetchKaliReferences(
  props: Omit<fetchKaliReferencesInput, "limit">
): Promise<KaliReference[]> {
  return Promise.resolve([
    {
      agreementId: "0001",
      id: "0001",
      cid: "0001",
      path: "path",
      label: "label",
      createdAt: "2023-01-01T00:00:00.000000+00:00",
      kaliArticle: {
        cid: undefined,
        id: undefined,
        path: undefined,
        label: undefined,
        agreementId: undefined,
        createdAt: undefined,
      },
    },
    {
      agreementId: "0001",
      id: "0002",
      cid: "0001",
      path: "path2",
      label: "label",
      createdAt: "2023-01-01T01:00:00.000000+00:00",
      kaliArticle: {
        cid: undefined,
        id: undefined,
        path: undefined,
        label: undefined,
        agreementId: undefined,
        createdAt: undefined,
      },
    },
  ]);
}
