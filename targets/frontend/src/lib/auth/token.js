import Router from "next/router";

import { setJwtCookie } from "./setJwtCookie";
import { getTokenSessionStorage } from "./store";
import cookie from "cookie";

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
    const baseUrl = process.env.FRONTEND_HOST
      ? `https://${process.env.FRONTEND_HOST}`
      : `http://localhost:3000`;
    const isServer = ctx && ctx.req;
    const url = isServer
      ? `${baseUrl}/api/refresh_token`
      : "/api/refresh_token";

    const tokenFromSession = getTokenSessionStorage();

    let body = {};

    if (tokenFromSession) {
      body = {
        ...tokenFromSession,
      };
    }

    if (!tokenFromSession && cookieHeader && cookieHeader.Cookie) {
      let cookies = cookie.parse(cookieHeader.Cookie);
      if (cookies && cookies.refresh_token) {
        body = {
          ...cookies,
        };
      }
    }
    if (body.length === 0) {
      console.log("no token found");
      return;
    }
    const tokenData = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        ...cookieHeader,
      },
      method: "POST",
      cache: "no-cache",
      mode: "same-origin",
      credentials: "include",
      body: JSON.stringify({
        refresh_token: body.refresh_token,
      }),
    }).then((res) => res.json());

    if (!tokenData.refresh_token) {
      throw new Error("no refresh_token found");
    }

    // for ServerSide call, we need to set the Cookie header
    // to update the refresh_token value
    if (isServer) {
      setJwtCookie(ctx.res, tokenData.refresh_token);
      // we also store token in context (this is probably a bad idea b)
      // to reuse it and avoid refresh token twice
      ctx.token = tokenData;
    }
    return tokenData;
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
