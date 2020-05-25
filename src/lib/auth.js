import Router from "next/router";
import { request } from "./request";
import { parse, serialize } from "cookie";
import { setRefreshTokenCookie } from "./setRefreshTokenCookie";

let token = null;

function getToken() {
  return token ? token.jwt_token : null;
}

function getUserId() {
  return token ? token.user_id : null;
}

function isTokenExpired() {
  console.log("[ isTokenExpired ]", token);
  if (!token) return true;
  return Date.now() > new Date(token.jwt_token_expiry);
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
        ? `http://localhost:${process.env.PORT}/api/refresh_token`
        : "/api/refresh_token",
      {
        credentials: "include",
        mode: "same-origin",
        headers,
        body: { refresh_token: token?.refresh_token },
      }
    );

    // for ServerSide call, we need to set the Cookie header
    // to update the refresh_token value
    if (ctx && ctx.res) {
      setRefreshTokenCookie(ctx.res, tokenData.refresh_token);
    }

    setToken(tokenData);
  } catch (error) {
    console.error("[ auth.refreshToken error ]", { error });
    console.log("[auth.refreshToken error]", token);
    setToken(null);
    if (ctx && ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
      return;
    } else {
      Router.push("/login");
      return;
    }
  }

  return getToken();
}

function setToken(tokenData) {
  token = tokenData;
}

export { getToken, getUserId, isTokenExpired, refreshToken, setToken };
