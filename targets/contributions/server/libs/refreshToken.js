module.exports = async function refreshToken(ctx) {
  const { me } = ctx;
  if (me.isAuthenticated) {
    const refresh_token = ctx.cookies.get("refresh_token");
    // Otherwise, we check if the token is expired
    const expirationTimeInSeconds = me.token.exp * 1000;
    const now = new Date();
    if (expirationTimeInSeconds <= now.getTime()) {
      // Call refresh token API ADMIN
      const options = {
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          refresh_token: refresh_token,
        }),
      };

      try {
        const response = await fetch(
          `${process.env.API_URI}/api/refresh_token`,
          options
        );
        if (!response.ok) {
          // Remove cookies
          ctx.cookies.set("jwt", undefined);
          ctx.cookies.set("refresh_token", undefined);
          ctx.redirect("/");
        } else {
          const data = await response.json();
          // Update cookies
          ctx.cookies.set("jwt", data.jwt_token);
          ctx.cookies.set("refresh_token", data.refresh_token);
        }
      } catch (e) {
        // Remove cookies
        console.error("Failed to refresh cookies", e);
        ctx.cookies.set("jwt", undefined);
        ctx.cookies.set("refresh_token", undefined);
        ctx.redirect("/");
      }
    }
  }
};
