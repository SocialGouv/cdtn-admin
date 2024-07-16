import { useCallback, useState } from "react";

import { debounce } from "../lib/debounce";

export function useDebouncedState(defaultState, delay) {
  const [state, setState] = useState(defaultState);
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const setDebouncedState = useCallback(debounce(setState, delay), [
    setState,
    delay,
  ]);

  return [state, setState, setDebouncedState];
}
