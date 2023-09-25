const route = jest.fn();
const router = {
  asPath: "mock",
  pathname: "mock",
  push: jest.fn((path) => {
    route(path);
    return Promise.resolve();
  }),
  query: { q: "" },
  route,
};

module.exports = {
  ...jest.requireActual("next/router"),

  useRouter: () => router,
};
