const Koa = require("koa");
const next = require("next");
const koaBody = require("koa-body");
const proxy = require("koa-proxies");

const isInternetExplorer = require("./middlewares/isInternetExplorer");
const withAuthentication = require("./middlewares/withAuthentication");

const router = require("./router");

const NODE_ENV =
  process.env.NODE_ENV !== undefined ? process.env.NODE_ENV : "development";

const nextApp = next({ dev: NODE_ENV === "development" });

async function start() {
  await nextApp.prepare();

  const koaApp = new Koa();
  const requestHandler = nextApp.getRequestHandler();

  // Show a page advising the user to use Chrome if the current browser is IE:
  koaApp.use(isInternetExplorer);

  // Attach authentication data (via `ctx.me`):
  koaApp.use(withAuthentication);

  koaApp.use(async (ctx, next) => {
    if (ctx.url === "/api/graphql") {
      if (ctx.me.isAuthenticated) {
        ctx.request.headers = {
          ...ctx.request.headers,
          Authorization: `Bearer ${ctx.me.jwt}`,
        };
        await next();
      } else {
        ctx.status = 401;
      }
    } else {
      await next();
    }
  });

  koaApp.use(
    proxy("/api/graphql", {
      target: process.env.HASURA_GRAPHQL_ENDPOINT,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/graphql/, "/v1/graphql"),
      logs: false,
    })
  );

  koaApp.use(
    proxy("/api/login", {
      target: process.env.API_URI,
      changeOrigin: true,
      logs: true,
    })
  );

  koaApp.use(
    proxy("/api/logout", {
      target: process.env.API_URI,
      changeOrigin: true,
      logs: true,
    })
  );

  koaApp.use(
    koaBody({
      jsonLimit: "1kb",
    })
  );

  // Attach routes:
  koaApp.use(router(nextApp, requestHandler));

  koaApp.listen(3200, (err) => {
    if (err) throw err;

    console.info(`> Website ready on port 3200 (${NODE_ENV}).`);
  });
}

start();
