import { useContext } from "react";
import { UserContext } from "src/hoc/UserProvider";

export function useUser(): Record<string, any> {
  return useContext(UserContext);
}
