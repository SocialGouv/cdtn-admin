import { useContext } from "react";
import { UserContext } from "src/hoc/UserProvider";

export function useUser() {
  return useContext(UserContext);
}
