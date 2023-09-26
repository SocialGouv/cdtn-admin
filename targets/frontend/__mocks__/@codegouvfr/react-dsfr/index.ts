const DEFAULT_VARIANTS = {
  default: {
    error: {},
    info: {},
    warning: {},
    success: {},
    grey: {},
  },
};
module.exports = {
  fr: {
    colors: {
      decisions: {
        text: {
          ...DEFAULT_VARIANTS,
          actionHigh: { blueCumulus: {} },
          label: { greenBourgeon: {} },
        },
        background: {
          ...DEFAULT_VARIANTS,
        },
      },
    },
  },
};
