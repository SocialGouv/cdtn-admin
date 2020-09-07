import cookie from "cookie";

export function setRefreshTokenCookie(res, refresh_token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("refresh_token", refresh_token, {
      httpOnly: true,
      // maxAge in second
      maxAge: (process.env.REFRESH_TOKEN_EXPIRES || 43200) * 60,
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
  );
}
