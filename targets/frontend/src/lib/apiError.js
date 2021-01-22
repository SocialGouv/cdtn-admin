export function createErrorFor(res) {
  return function toError({ output: { statusCode, payload } }) {
    res.status(statusCode).json(payload);
  };
}

export function apiError(res, { output: { statusCode, payload } }) {
  return res.status(statusCode).json(payload);
}
