export const debounce = (debouncedFunction, debounceDuration) => {
  let currentTimeout = null;
  return (...args) => {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = setTimeout(
      () => debouncedFunction(...args),
      debounceDuration
    );
  };
};
