import { useMutation } from "urql";
import { documentsPublishMutation } from "../documents/api/documents.mutation";
import { mapSettingsToDocument, SiteSettings } from "./mapSettingsToDocument";

type MutationResult = {
  insert_documents_one: { cdtn_id: string };
};

export function useSaveSiteSettingsMutation() {
  const [state, execute] = useMutation<MutationResult>(
    documentsPublishMutation
  );
  const save = (settings: SiteSettings) =>
    execute({ upsert: mapSettingsToDocument(settings) });
  return [state, save] as const;
}
