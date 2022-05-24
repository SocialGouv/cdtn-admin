const Koa = require("koa");
const next = require("next");
const koaBody = require('koa-body');

const isInternetExplorer = require("./middlewares/isInternetExplorer");
const withAuthentication = require("./middlewares/withAuthentication");

const router = require("./router");

const NODE_ENV = process.env.NODE_ENV !== undefined ? process.env.NODE_ENV : "development";

const nextApp = next({ dev: NODE_ENV === "development" });

async function start() {
  await nextApp.prepare();

  const koaApp = new Koa();
  const requestHandler = nextApp.getRequestHandler();

  koaApp.use(koaBody({
    jsonLimit: '1kb'
  }));

  // Show a page advising the user to use Chrome if the current browser is IE:
  koaApp.use(isInternetExplorer);

  // Attach authentication data (via `ctx.me`):
  koaApp.use(withAuthentication);

  // Attach routes:
  koaApp.use(router(nextApp, requestHandler));

  koaApp.listen(3201, err => {
    if (err) throw err;

    console.info(`> Website ready on port 3201 (${NODE_ENV}).`);
  });
}

start();
