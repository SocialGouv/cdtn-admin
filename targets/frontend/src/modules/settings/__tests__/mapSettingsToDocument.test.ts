import {
  mapSettingsToDocument,
  SETTINGS_SOURCE,
  toSiteSettings,
} from "../mapSettingsToDocument";

describe("toSiteSettings", () => {
  it("keeps the NPS off when no settings document exists yet", () => {
    expect(toSiteSettings(undefined)).toEqual({ npsEnabled: false });
    expect(toSiteSettings(null)).toEqual({ npsEnabled: false });
    expect(toSiteSettings({})).toEqual({ npsEnabled: false });
  });

  it("reads the stored NPS switch", () => {
    expect(toSiteSettings({ npsEnabled: true })).toEqual({ npsEnabled: true });
    expect(toSiteSettings({ npsEnabled: false })).toEqual({
      npsEnabled: false,
    });
  });
});

describe("mapSettingsToDocument", () => {
  it("builds a single, published, non-searchable settings document", () => {
    const doc = mapSettingsToDocument({ npsEnabled: true });
    expect(doc).toMatchObject({
      cdtn_id: "settings",
      initial_id: "settings",
      source: SETTINGS_SOURCE,
      slug: "settings",
      is_published: true,
      is_available: true,
      is_searchable: false,
      document: { npsEnabled: true },
    });
  });

  it("always targets the same document so saves are upserts", () => {
    expect(mapSettingsToDocument({ npsEnabled: true }).cdtn_id).toBe(
      mapSettingsToDocument({ npsEnabled: false }).cdtn_id
    );
  });
});
