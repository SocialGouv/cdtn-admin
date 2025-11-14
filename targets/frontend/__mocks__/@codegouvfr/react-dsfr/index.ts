const TYPES = {
  error: {},
  info: {},
  warning: {},
  success: {},
  grey: { default: "" },
};

const DEFAULT_VARIANTS = {
  default: TYPES,
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
          contrast: {
            ...TYPES,
          },
        },
      },
    },
    spacing: jest.fn(),
  },
};
