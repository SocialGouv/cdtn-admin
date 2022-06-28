import jsCookie from "js-cookie";

export class RefreshToken {
  constructor() {}

  async refresh() {
    const refreshToken = jsCookie.get("refresh_token");
    console.log("Cookie : ", refreshToken);

    // Call refresh token API ADMIN
    const options = {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    };

    try {
      const response = await fetch(`/api/refresh_token`, options);
      if (!response.ok) {
        console.error("Failed to refresh cookies", response);
      } else {
        // Cookies updated by set-token header
        return true;
      }
    } catch (error) {
      // Remove cookies
      console.error("Failed to refresh cookies", error);
    }
    return false;
  }
}
