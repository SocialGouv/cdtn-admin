import Router from "next/router";

import { request } from "../request";
import { setJwtCookie } from "./setJwtCookie";
import { BASE_URL } from "../../config";

let inMemoryToken;

export function getToken() {
  return inMemoryToken || null;
}

export function setToken(token) {
  inMemoryToken = token;
}

export function isTokenExpired() {
  const expired =
    !inMemoryToken || Date.now() > new Date(inMemoryToken.jwt_token_expiry);
  return expired;
}

export async function auth(ctx) {
  console.log("[ auth ] ctx ?", ctx ? true : false);
  if (ctx?.token) {
    return ctx.token;
  }

  const cookieHeader = ctx?.req ? { Cookie: ctx.req.headers.cookie } : {};
  if (
    ctx?.res &&
    !ctx.res.writableEnded &&
    !/refresh_token/.test(cookieHeader.Cookie)
  ) {
    console.log("[ auth ] no cookie found -> redirect to login");
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
    return null;
  }
  try {
    console.log("[auth] refresh token");
    const tokenData = await request(
      ctx?.req ? `${BASE_URL}/api/refresh_token` : "/api/refresh_token",
      {
        body: {},
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          ...cookieHeader,
        },
        mode: "same-origin",
      }
    );
    // for ServerSide call, we need to set the Cookie header
    // to update the refresh_token value
    if (ctx?.res) {
      setJwtCookie(ctx.res, tokenData.refresh_token);
      // we also store token in context (this is probably a bad idea b)
      // to reuse it and avoid refresh token twice
      ctx.token = tokenData;
    }
    inMemoryToken = { ...tokenData };
    console.log("[auth] token", inMemoryToken ? "true" : "false");
    return inMemoryToken;
  } catch (error) {
    console.error("[ auth ] refreshToken error ", { error });

    // we are on server side and its response is not ended yet
    if (ctx?.res && !ctx.res.writableEnded) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else if (ctx && !ctx.req) {
      // if we are on the client
      Router.push("/login");
    }
  }
}
