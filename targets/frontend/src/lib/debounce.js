export const debounce = (debouncedFunction, debounceDuration) => {
  let currentTimeout = null;
  return function () {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = setTimeout(
      () => debouncedFunction(...arguments),
      debounceDuration
    );
  };
};
