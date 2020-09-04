import Router from "next/router";

import { request } from "../request";
import { setRefreshTokenCookie } from "./setRefreshTokenCookie";

let token = null;
let inMemoryToken;

function getToken() {
  return token ? token.jwt_token : null;
}

function isTokenExpired() {
  const expired = !token || Date.now() > new Date(token.jwt_token_expiry);
  return expired;
}

async function auth(ctx) {
  if (!inMemoryToken) {
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
      }
      inMemoryToken = { ...tokenData };
    } catch (error) {
      console.error("[ auth ] refreshToken error ", { error });

      if (ctx && ctx.req) {
        ctx.res.writeHead(302, { Location: "/login" });
        ctx.res.end();
      }
      console.log("Router login", ctx.req ? "server" : "client");
      Router.push("/login");
    }
  }
  const jwt_token = inMemoryToken;
  if (!jwt_token) {
    console.log(
      "redir to login(should be on client)",
      ctx.req ? "server" : "client"
    );
    Router.push("/login");
  }
  return jwt_token;
}

function setToken(tokenData) {
  token = tokenData;
}

export { auth, getToken, isTokenExpired, setToken };
