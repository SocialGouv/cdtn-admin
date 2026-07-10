exports.accordMapping = {
  properties: {
    id: {
      type: "keyword",
    },
    title: {
      type: "text",
    },
    // SIRET : recherche exacte (cas d'usage principal)
    siret: {
      type: "keyword",
    },
    dateMaj: {
      type: "date",
      format: "yyyy-MM-dd",
      ignore_malformed: true,
    },
    dateDepot: {
      type: "date",
      format: "yyyy-MM-dd",
      ignore_malformed: true,
    },
    dateEffet: {
      type: "date",
      format: "yyyy-MM-dd",
      ignore_malformed: true,
    },
    dateFin: {
      type: "date",
      format: "yyyy-MM-dd",
      ignore_malformed: true,
    },
    dateDiffusion: {
      type: "date",
      format: "yyyy-MM-dd",
      ignore_malformed: true,
    },
    conformeVersionIntegrale: {
      type: "boolean",
    },
    themes: {
      type: "keyword",
    },
    signataires: {
      type: "keyword",
    },
  },
};
