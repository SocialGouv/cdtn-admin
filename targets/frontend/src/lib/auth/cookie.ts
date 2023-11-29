import cookie from "cookie";
import { REFRESH_TOKEN_EXPIRES } from "src/config";

export function setJwtCookie(
  res: any,
  refresh_token?: string,
  jwt_token?: string
) {
  const cookies = [];
  try {
    if (refresh_token) {
      cookies.push(
        cookie.serialize("refresh_token", refresh_token, {
          httpOnly: true,
          maxAge: REFRESH_TOKEN_EXPIRES * 60, // maxAge in second
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        })
      );
    }
    if (jwt_token) {
      cookies.push(
        cookie.serialize("jwt", jwt_token, {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        })
      );
    }
    if (cookies.length > 0) res.setHeader("Set-Cookie", cookies);
  } catch (err) {
    console.error("[setJwtCookie]", err);
  }
}

export function removeJwtCookie(res: any) {
  const cookies = [
    cookie.serialize("refresh_token", "", {
      httpOnly: true,
      maxAge: -1,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    }),
    cookie.serialize("jwt", "", {
      httpOnly: true,
      maxAge: -1,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    }),
  ];
  res.setHeader("Set-Cookie", cookies);
}
