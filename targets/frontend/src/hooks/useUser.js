import { useContext } from "react";
import { UserContext } from "src/hoc/UserProvider";
import { request } from "src/lib/request";

export function useUser() {
  const user = useContext(UserContext);
  async function logout() {
    try {
      await request("/api/logout", {
        credentials: "include",
        mode: "same-origin",
      });
    } catch (error) {
      console.error("[ client logout ] failed", error);
    }
    window.location = "/login";
  }
  const isAuth = Boolean(user);
  const isAdmin = user?.roles.includes("admin");
  console.log("useUser");
  return {
    isAdmin,
    isAuth,
    logout,
    user,
  };
}
