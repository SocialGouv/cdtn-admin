import cookie from "cookie";

export function setRefreshTokenCookie(res, refresh_token) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES, 10) * 60, // maxAge in second
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
  );
}
