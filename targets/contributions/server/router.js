/* eslint-disable require-atomic-updates */

const Router = require("@koa/router");
const login = require("./api/login");

const router = new Router();

function withoutAuth(requestHandler, route) {
  router.get(route, async (ctx) => {
    await requestHandler(ctx.req, ctx.res);

    ctx.respond = false;
  });
}

function withErrorAndAuth(nextApp, route, callback) {
  router.get(route, async (ctx) => {
    if (ctx.status >= 500) {
      await nextApp.renderError(ctx.error, ctx.req, ctx.res, route);
    } else {
      const { me } = ctx;
      if (me.isAuthenticated) {
        const jwt_refresh_token = ctx.cookies.get("jwt_refresh_token");
        // Otherwise, we check if the token is expired
        const expirationTimeInSeconds = me.token.exp * 1000;
        const now = new Date();
        const delay = expirationTimeInSeconds - now.getTime();
        console.log(
          "MMA - Expiration : ",
          expirationTimeInSeconds <= now.getTime(),
          " in ",
          delay,
          " token: ",
          jwt_refresh_token
        );
        // if (true) {

        if (delay <= 850000) {
          // Call refresh token API ADMIN
          console.log(
            "MMA - Call refresh token API ADMIN with ",
            jwt_refresh_token
          );
          const options = {
            headers: {
              "content-type": "application/json",
              // Cookie: `refresh_token=${jwt_refresh_token}`,
            },
            method: "POST",
            body: JSON.stringify({
              refresh_token: jwt_refresh_token,
            }),
          };

          try {
            const response = await fetch(
              `${process.env.API_URI}/api/refresh_token`,
              options
            );

            if (!response.ok) {
              console.log(
                "MMA - Call refresh token API RESPONSE FAILED",
                response
              );
              ctx.redirect("/");
              // return { isAuthenticated: false };
            } else {
              const data = await response.json();
              console.log(
                "MMA - Call refresh token API RESPONSE SUCCEED",
                data
              );
              // Update cookie
              ctx.cookies.set("jwt", data.jwt);
              ctx.cookies.set("jwt_refresh_token", data.refresh_token);
            }
          } catch (e) {
            console.log(
              "MMA - Call refresh token API RESPONSE FAILED (error)",
              e
            );
            ctx.redirect("/");
            return { isAuthenticated: false };
          }
        }

        switch (true) {
          case ctx.path === "/":
            ctx.redirect(me.isAdmin ? "/admin" : "/answers/todo/1");
            break;

          case ctx.path.startsWith("/admin") && !me.isAdmin:
            ctx.redirect("/answers/todo/1");
            break;

          case !ctx.path.startsWith("/admin") && me.isAdmin:
            ctx.redirect("/admin");
            break;

          default:
            ctx.status = 200;
            await callback(ctx);
            ctx.respond = false;
        }
      } else {
        if (ctx.path !== "/") {
          ctx.redirect("/");

          return;
        }

        ctx.status = 200;
        await callback(ctx);
        ctx.respond = false;
      }
    }
  });
}

function withErrorAndAuthPost(nextApp, route, callback) {
  router.post(route, async (ctx) => {
    if (ctx.status >= 500) {
      await nextApp.renderError(ctx.error, ctx.req, ctx.res, route);
    } else {
      const { me } = ctx;

      if (me.isAuthenticated) {
        ctx.status = 200;
        await callback(ctx);
        ctx.respond = false;
      } else {
        if (ctx.path !== "/") {
          ctx.redirect("/");

          return;
        }

        ctx.status = 200;
        await callback(ctx);
        ctx.respond = false;
      }
    }
  });
}

module.exports = function (nextApp, requestHandler) {
  router.redirect("/login", "/");

  router.post("/api/login", login);

  withErrorAndAuth(nextApp, "/answers/edit/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/answers/edit", { ...ctx.params });
  });
  withErrorAndAuth(nextApp, "/answers/view/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/answers/view", { ...ctx.params });
  });
  withErrorAndAuth(nextApp, "/answers/:state/:page", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/answers", { ...ctx.params });
  });

  withErrorAndAuth(nextApp, "/admin/agreements/new", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/agreements/new", {});
  });
  withErrorAndAuth(nextApp, "/admin/agreements/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/agreements/edit", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/answers/print", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/answers/print", {});
  });
  withErrorAndAuth(nextApp, "/admin/answers/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/answers/edit", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/generic-answers/print", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/generic-answers/print", {});
  });
  withErrorAndAuth(nextApp, "/admin/generic-answers/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/generic-answers/edit", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/locations/new", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/locations/new", {});
  });
  withErrorAndAuth(nextApp, "/admin/locations/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/locations/edit", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/questions/new", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/questions/new", {});
  });
  withErrorAndAuth(nextApp, "/admin/questions/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/questions/edit", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/requests/new", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/requests/new", {});
  });
  withErrorAndAuth(nextApp, "/admin/requests/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/requests/edit", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/tracker/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/tracker/agreement", {
      ...ctx.params,
    });
  });

  withErrorAndAuth(nextApp, "/admin/users/new", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/users/new", {});
  });
  withErrorAndAuth(nextApp, "/admin/users/:id", async (ctx) => {
    await nextApp.render(ctx.req, ctx.res, "/admin/users/edit", {
      ...ctx.params,
    });
  });

  withoutAuth(requestHandler, "/_next/(.*)");
  withoutAuth(requestHandler, "/favicon.ico");
  withoutAuth(requestHandler, "/internal/(.*)");
  withoutAuth(requestHandler, "/static/(.*)");

  withErrorAndAuth(nextApp, "(.*)", async (ctx) => {
    await requestHandler(ctx.req, ctx.res);
  });

  return router.routes();
};
