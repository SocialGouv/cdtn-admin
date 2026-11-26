import { HasuraDocument } from "@socialgouv/cdtn-types";

// Site-wide settings are stored as a single technical document in `documents`,
// so that the Elasticsearch export publishes them with the rest of the content
// (preproduction first, then production). Not part of SOURCES: it is never
// rendered as a page on the site.
export const SETTINGS_SOURCE = "settings";
// Fixed identifiers: there is exactly one settings document, upserted in place.
export const SETTINGS_CDTN_ID = "settings";
export const SETTINGS_INITIAL_ID = "settings";

export type SiteSettings = {
  // NPS campaign switch: when false, the site renders neither the exit-intent
  // pop-up (desktop) nor the hand icon (mobile).
  npsEnabled: boolean;
};

export type SettingsDocument = Omit<HasuraDocument<SiteSettings>, "source"> & {
  source: typeof SETTINGS_SOURCE;
};

// No document yet (never saved) or missing key: the NPS stays off, which is
// also what the site does when the setting is absent.
export const toSiteSettings = (
  document?: Partial<SiteSettings> | null
): SiteSettings => ({
  npsEnabled: document?.npsEnabled === true,
});

export const mapSettingsToDocument = (
  settings: SiteSettings
): SettingsDocument => ({
  cdtn_id: SETTINGS_CDTN_ID,
  initial_id: SETTINGS_INITIAL_ID,
  source: SETTINGS_SOURCE,
  slug: SETTINGS_INITIAL_ID,
  title: "Paramètres du site",
  text: "",
  meta_description: "",
  is_searchable: false,
  is_published: true,
  is_available: true,
  document: settings,
});
