import { useCallback, useEffect, useRef, useState } from "react";

import { debounce } from "../lib/debounce";

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useDebouncedState(defaultState, delay) {
  const [state, setState] = useState(defaultState);
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const setDebouncedState = useCallback(debounce(setState, delay), [
    setState,
    delay,
  ]);

  return [state, setState, setDebouncedState];
}
