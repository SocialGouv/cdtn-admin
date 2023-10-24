module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    CDTN_API_URL:
      process.env.CDTN_API_URL || "https://cdtn-api.fabrique.social.gouv.fr",
    API_URL: process.env.API_URL || "http://localhost:8080",
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "deny",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};
