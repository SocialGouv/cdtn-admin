import { parse, serialize } from "cookie";
import Router from "next/router";

import { request } from "../request";
import { setRefreshTokenCookie } from "./setRefreshTokenCookie";

let token = null;

function getToken() {
  return token ? token.jwt_token : null;
}

function isTokenExpired() {
  const expired = !token || Date.now() > new Date(token.jwt_token_expiry);
  return expired;
}

async function refreshToken(ctx) {
  try {
    const headers = {
      "Cache-Control": "no-cache",
    };
    if (ctx && ctx.req) {
      const cookies = parse(ctx.req.headers.cookie || "");
      if (cookies && cookies.refresh_token) {
        headers["Cookie"] = serialize("refresh_token", cookies.refresh_token);
      }
    }
    const tokenData = await request(
      ctx && ctx.req
        ? `${process.env.FRONTEND_URL}/api/refresh_token`
        : "/api/refresh_token",
      {
        body: {},
        credentials: "include",
        headers,
        mode: "same-origin",
      }
    );

    // for ServerSide call, we need to set the Cookie header
    // to update the refresh_token value
    if (ctx && ctx.res) {
      setRefreshTokenCookie(ctx.res, tokenData.refresh_token);
    }
    return tokenData;
  } catch (error) {
    console.error("[ auth.refreshToken error ]", { error });
    if (ctx && ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
      return;
    } else {
      Router.push("/login");
      return;
    }
  }
}

function setToken(tokenData) {
  token = tokenData;
}

export { getToken, isTokenExpired, refreshToken, setToken };
