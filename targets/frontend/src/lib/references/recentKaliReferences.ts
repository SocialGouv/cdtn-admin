import { fetchKaliReferences } from "./fetchKaliReferences";
import { KaliReference } from "../../components/contributions";

export type fetchKaliReferencesInput = {
  agreementId: string;
  query: string;
  limit?: number;
};

function filterRecentKaliReferences(refs: KaliReference[] = []) {
  return refs.reduce<KaliReference[]>((result, ref) => {
    const { cid, createdAt } = ref;
    const foundIndex: number = result.findIndex(
      ({ cid: _cid, createdAt: _createdAt }) => {
        return (
          _cid === cid &&
          new Date(_createdAt).getTime() < new Date(createdAt).getTime()
        );
      }
    );
    if (foundIndex > -1) {
      result[foundIndex] = ref;
    } else {
      result.push(ref);
    }
    return result;
  }, []);
}

export async function fetchRecentKaliReferences({
  agreementId,
  query,
  limit = 5,
}: fetchKaliReferencesInput) {
  const fetched = await fetchKaliReferences({ agreementId, query });
  return filterRecentKaliReferences(fetched).slice(0, limit);
}
