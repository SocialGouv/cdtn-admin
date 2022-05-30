module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    CDTN_API_URL:
      process.env.CDTN_API_URL || "https://cdtn-api.fabrique.social.gouv.fr",
    API_URL: process.env.API_URL || "http://localhost:8080",
  },
};
