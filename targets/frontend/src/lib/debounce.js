export const debounce = (debouncedFunction, debounceDuration) => {
  let currentTimeout = null;
  return (currentParams) => {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = setTimeout(
      () => debouncedFunction(currentParams),
      debounceDuration
    );
  };
};
