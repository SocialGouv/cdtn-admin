type Config = {
  body?: any;
  headers?: any;
  [key: string]: any;
};

export function request(
  endpoint: string,
  { body, headers, ...customConfig }: Config | undefined = {}
): Promise<any> {
  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (body) {
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      config.body = body;
      // auto set by the browser with its specific multipart/form-data boundaries
      if (config.headers) {
        const configHeaders = config.headers as any;
        delete configHeaders["Content-Type"];
      }
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
