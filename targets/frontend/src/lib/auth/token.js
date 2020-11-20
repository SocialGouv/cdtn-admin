import Router from "next/router";

import { request } from "../request";
import { setRefreshTokenCookie } from "./setRefreshTokenCookie";

let inMemoryToken;

export function getToken() {
  return inMemoryToken || null;
}

export function isTokenExpired() {
  const expired =
    !inMemoryToken || Date.now() > new Date(inMemoryToken.jwt_token_expiry);
  return expired;
}

export async function auth(ctx) {
  console.log("[ auth ] ");
  if (ctx?.token) {
    return ctx.token;
  }
  if (inMemoryToken) {
    return inMemoryToken;
  }

  const cookieHeader =
    ctx && ctx.req
      ? {
          Cookie: ctx.req.headers.cookie,
        }
      : {};
  try {
    const tokenData = await request(
      ctx && ctx.req
        ? `${process.env.FRONTEND_URL}/api/refresh_token`
        : "/api/refresh_token",
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
    if (ctx && ctx.res) {
      setRefreshTokenCookie(ctx.res, tokenData.refresh_token);
      // we also store token in context (this is probably a bad idea b)
      // to reuse it and avoid refresh token twice
      ctx.token = tokenData;
      return tokenData;
    } else {
      // if on client, we store token in memory
      inMemoryToken = { ...tokenData };
    }
    return inMemoryToken;
  } catch (error) {
    console.error("[ auth ] refreshToken error ", { error });

    // we are on server side and its response is not ended yet
    if (ctx && ctx.res && !ctx.res.writableEnded) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else if (ctx && !ctx.req) {
      // if we are on the client
      Router.push("/login");
    }
  }
}

export function setToken(token) {
  inMemoryToken = token;
}
