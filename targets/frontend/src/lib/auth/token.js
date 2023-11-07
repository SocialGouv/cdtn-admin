import Router from "next/router";

import { setJwtCookie, removeJwtCookie } from "./cookie";
import cookie from "cookie";
import { refreshToken } from "./refreshToken";

export async function auth(ctx) {
  console.log("[auth] init ", ctx ? "server" : "client");
  if (ctx && ctx.req) {
    return await authServerSide(ctx);
  } else {
    return await authClient(ctx);
  }
}

const authServerSide = async (ctx) => {
  console.log("[auth][server] init");

  const cookieHeader = { Cookie: ctx.req.headers.cookie };
  if (
    ctx?.res &&
    !ctx.res.writableEnded &&
    !/refresh_token/.test(cookieHeader.Cookie)
  ) {
    console.log("[auth][server] no cookie found -> redirect to login");
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
    return null;
  }
  console.log("[auth][server] cookie found -> \\o/");
  try {
    let body = {};

    if (cookieHeader && cookieHeader.Cookie) {
      let cookies = cookie.parse(cookieHeader.Cookie);
      if (cookies && cookies.refresh_token) {
        body = {
          ...cookies,
        };
      }
    }
    console.log("[auth][server] Body : ", body);
    if (body.length === 0) {
      console.error("[auth][server] no token found");
      return;
    }

    const tokenData = await refreshToken({
      refresh_token: body.refresh_token,
    });

    if (!tokenData.new_refresh_token) {
      console.error(
        "[auth][server] no refresh_token found in the response ",
        tokenData
      );
      throw new Error("no refresh_token found");
    }

    setJwtCookie(ctx.res, tokenData.new_refresh_token);
    return tokenData;
  } catch (error) {
    console.error("[auth][server] refreshToken error ", { error });

    // we are on server side and its response is not ended yet
    if (ctx?.res && !ctx.res.writableEnded) {
      removeJwtCookie(ctx.res);
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else if (ctx && !ctx.req) {
      // if we are on the client
      Router.push("/login");
    }
  }
};

const authClient = async (ctx) => {
  const cookieHeader = ctx?.req ? { Cookie: ctx.req.headers.cookie } : {};
  if (
    ctx?.res &&
    !ctx.res.writableEnded &&
    !/refresh_token/.test(cookieHeader.Cookie)
  ) {
    console.log("[auth][client] no cookie found -> redirect to login");
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
    return null;
  }
  console.log("[auth][client] cookie found -> \\o/");
  try {
    const isServer = ctx && ctx.req;
    const baseUrl = isServer
      ? "http://localhost:3000"
      : process.env.FRONTEND_HOST
      ? `https://${process.env.FRONTEND_HOST}`
      : `http://localhost:3000`;
    console.log("[auth][client] base url : ", baseUrl);
    const url = isServer
      ? `${baseUrl}/api/refresh_token`
      : "/api/refresh_token";
    console.log("[auth][client] Url : ", baseUrl);

    let body = {};

    if (cookieHeader && cookieHeader.Cookie) {
      let cookies = cookie.parse(cookieHeader.Cookie);
      if (cookies && cookies.refresh_token) {
        body = {
          ...cookies,
        };
      }
    }
    console.log("[auth][client] Body : ", body);
    if (body.length === 0) {
      console.error("[auth] no token found");
      return;
    }

    console.log(
      `[auth][client] Fetch : ${url} with options: ${JSON.stringify(
        {
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
        },
        null,
        2
      )}`
    );
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
    }).then((res) => {
      console.log("[auth][client] Response: ", res);
      return res.json();
    });

    if (!tokenData.refresh_token) {
      console.error(
        "[auth][client] no refresh_token found in the response ",
        tokenData
      );
      throw new Error("no refresh_token found");
    }

    // for ServerSide call, we need to set the Cookie header
    // to update the refresh_token value
    if (isServer) {
      setJwtCookie(ctx.res, tokenData.refresh_token);
    }
    return tokenData;
  } catch (error) {
    console.error("[auth][client] refreshToken error ", { error });

    // we are on server side and its response is not ended yet
    if (ctx?.res && !ctx.res.writableEnded) {
      removeJwtCookie(ctx.res);
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else if (ctx && !ctx.req) {
      // if we are on the client
      Router.push("/login");
    }
  }
};
