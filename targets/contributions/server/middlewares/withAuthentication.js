const reportError = require("../libs/reportError");
const { USER_ROLE } = require("../constants");
const { decode } = require("jsonwebtoken");

async function getMe(ctx) {
  const jwt = ctx.cookies.get("jwt");
  if (jwt === undefined) {
    return { isAuthenticated: false };
  }

  const token = decode(jwt);
  if (!token) {
    return { isAuthenticated: false };
  }

  const claims = token["https://hasura.io/jwt/claims"];
  if (claims) {
    return {
      isAdmin: [
        USER_ROLE.ADMINISTRATOR,
        USER_ROLE.REGIONAL_ADMINISTRATOR,
      ].includes(claims["x-hasura-default-role"]),
      isAuthenticated: true,
    };
  }

  return {
    isAuthenticated: false,
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
