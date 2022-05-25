const isomorphicUnfetch = require("isomorphic-unfetch");

module.exports = async (ctx) => {
  const options = {
    headers: {
      "content-type": "application/json",
    },
    method: ctx.request.method,
    body: JSON.stringify(ctx.request.body, null, 2),
  };

  try {
    const response = await isomorphicUnfetch(
      `${process.env.API_URI}/api/login`,
      options
    );

    if (!response.ok) {
      ctx.response.status = response.status;
      ctx.response.message = response.message;
    } else {
      const data = await response.json();
      ctx.response.headers = response.headers;
      ctx.response.body = data;
    }
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.message = e.message;
  }
};
