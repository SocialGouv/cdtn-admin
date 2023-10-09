export const saveTokenSessionStorage = (token: Record<string, any>) => {
  sessionStorage.setItem("token", JSON.stringify(token));
};

export const getTokenSessionStorage = () => {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("token");
  if (token) {
    return JSON.parse(token);
  }
  return null;
};

export const removeTokenSessionStorage = () => {
  sessionStorage.removeItem("token");
};

export function isTokenExpired() {
  const token = getTokenSessionStorage();
  if (!token) {
    return true;
  }
  return new Date().getTime() > new Date(token.jwt_token_expiry).getTime();
}
