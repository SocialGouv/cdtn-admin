import { fetchKaliReferencesInput } from "../recentKaliReferences";
import { KaliReference } from "../../../components/contributions";

export async function fetchKaliReferences(
  props: Omit<fetchKaliReferencesInput, "limit">
): Promise<Partial<KaliReference>[]> {
  return Promise.resolve([
    {
      agreementId: "0001",
      id: "0001",
      cid: "0001",
      path: "path",
      label: "label",
      createdAt: "2023-01-01T00:00:00.000000+00:00",
    },
    {
      agreementId: "0001",
      id: "0002",
      cid: "0001",
      path: "path2",
      label: "label",
      createdAt: "2023-01-01T01:00:00.000000+00:00",
    },
  ]);
}
