export function request(endpoint, { body, ...customConfig } = {}) {
  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...customConfig.headers,
    },
  };
  if (body) {
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      config.body = body;
      // auto set by the browser with its specific multipart/form-data boundaries
      delete config.headers["Content-Type"];
    } else {
      config.body = JSON.stringify(body);
    }
  }
  return fetch(endpoint, config).then(async (response) => {
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return Promise.reject({
        data,
        status: response.status,
        statusText: response.statusText,
      });
    }
  });
}
