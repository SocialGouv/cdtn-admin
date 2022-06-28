import cookie from "cookie";

export function setJwtCookie(res, refresh_token, jwt_token) {
  const cookies = [
    cookie.serialize("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES, 10) * 60, // maxAge in second
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    }),
  ];
  if (jwt_token) {
    cookies.push(
      cookie.serialize("jwt", jwt_token, {
        httpOnly: true,
        path: "/",
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
      })
    );
  }
  res.setHeader("Set-Cookie", cookies);
}
