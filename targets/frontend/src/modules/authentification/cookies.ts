import cookie from "cookie";
import { JWT_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "src/config";

type TokenType = "access_token" | "refresh_token";

export function setTokenCookies(token: string, type: TokenType): Array<any> {
  const cookies = [];
  if (type === "refresh_token") {
    cookies.push(
      cookie.serialize(type, token, {
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXPIRES * 60, // maxAge in second
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    );
  } else {
    cookies.push(
      cookie.serialize(type, token, {
        httpOnly: true,
        maxAge: JWT_TOKEN_EXPIRES * 60,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    );
  }

  return cookies;
}

export function removeTokensCookies() {
  const cookies = [
    cookie.serialize("access_token" as TokenType, "", {
      httpOnly: true,
      maxAge: -1,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    }),
    cookie.serialize("refresh_token" as TokenType, "", {
      httpOnly: true,
      maxAge: -1,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    }),
  ];
  return cookies;
}
