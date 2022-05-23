const reportError = require("../libs/reportError");
const { USER_ROLE } = require("../constants");

async function getMe(ctx) {
  return {
    isAdmin: true,
    isAuthenticated: true,
  };
}

module.exports = async (ctx, next) => {
  try {
    // eslint-disable-next-line require-atomic-updates
    ctx.me = await getMe(ctx);
  } catch (err) {
    await reportError(ctx, "middlewares/withAuthentication()", err);
  }

  await next();
};
