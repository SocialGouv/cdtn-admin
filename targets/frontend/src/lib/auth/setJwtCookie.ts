import cookie from "cookie";
import { REFRESH_TOKEN_EXPIRES } from "src/config";

export function setJwtCookie(
  res: any,
  refresh_token: string,
  jwt_token?: string
) {
  const cookies = [
    cookie.serialize("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRES * 60, // maxAge in second
      path: "/",
      sameSite: "strict",
      secure: false,
    }),
  ];
  if (jwt_token) {
    cookies.push(
      cookie.serialize("jwt", jwt_token, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: false,
      })
    );
  }
  res.setHeader("Set-Cookie", cookies);
}
