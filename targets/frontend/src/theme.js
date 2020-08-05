import { darken, rgba, transparentize } from "polished";

export const theme = {
  badges: {
    circle: {
      bg: "accent",
      borderRadius: "xlarge",
      lineHeight: 1,
      px: "5px",
      py: "3px",
    },
    outline: {
      bg: "transparent",
      boxShadow: "inset 0 0 0 1px",
      color: "primary",
    },
    primary: {
      bg: "primary",
      color: "white",
      px: "xxsmall",
    },
    secondary: {
      bg: "secondary",
      color: "white",
      px: "xxsmall",
    },
  },

  breakpoints: ["40rem", "56rem", "64rem"],

  buttons: {
    icon: {
      bgHover: transparentize(0.8, "#3e486e"),
    },
    link: {
      color: "transparent",
      colorHover: "muted",
      text: "text",
    },
    primary: {
      color: "primary",
      colorHover: "primaryHover",
      text: "white",
    },
    secondary: {
      color: "secondary",
      colorHover: "secondaryHover",
      text: "white",
    },
  },

  cards: {
    compact: {
      border: "1px solid",
      borderColor: "muted",
      borderRadius: "small",
      padding: "small",
    },
    primary: {
      borderRadius: "small",
      boxShadow: "large",
      padding: "small",
    },
  },

  colors: {
    accent: "#DA4167",
    accentHover: darken(0.05, "#DA4167"),
    background: "#fff",
    black: "#232323",
    caution: "#FED766",
    critical: "#E03616",
    focus: rgba("#1e90ff", 0.7),
    highlight: "#E6E6EA",

    info: "#2AB7CA",
    link: "#2765cf",
    linkVisited: "#733d90",
    muted: "#bbcadf",
    neutral: "#d1dffd",

    positive: "#43AA8B",
    primary: "#f66663",

    primaryHover: darken(0.05, "#f66663"),
    secondary: "#7994d4",

    secondaryHover: darken(0.05, "#7994d4"),
    text: "#3e486e",
    white: "#fff",
  },

  fontSizes: {
    0: "0.8rem",
    icons: "1.5rem",
    large: "1.4rem",
    medium: "1rem",
    small: "0.9rem",
    xlarge: "2rem",
    xsmall: "0.8rem",
    xxlarge: "3.2rem",
  },
  // fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  fontWeights: {
    body: 300,
    bold: 600,
    heading: 600,
    regular: 400,
    semibold: 600,
  },
  fonts: {
    body: "muli",
    heading: "muli",
    monospace: "monospace",
  },
  forms: {
    input: {
      padding: "xsmall",
    },
    label: {
      fontSize: "small",
      fontWeight: "body",
    },
    select: {
      padding: "xsmall",
    },
  },
  letterSpacings: {
    body: "normal",
    caps: "0.2em",
  },
  lineHeights: {
    body: 1.625,
    heading: 1.125,
  },
  radii: {
    large: "8px",
    small: "4px",
    xlarge: "16px",
  },
  shadows: {
    card1: "0 0 8px rgba(0, 0, 0, 0.125)",
    large:
      "0 0 4px 0px rgba(28,28,28,.1), 0 3px 18px -4px rgba(28,28,28,.1), 0 5px 30px -12px rgba(28,28,28,.2)",
    medium:
      "0 0 4px 0px rgba(28,28,28,.1), 0 8px 8px -4px rgba(28,28,28,.1), 0 12px 12px -8px rgba(28,28,28,.2)",
    small:
      "0 0 4px 0px rgba(28,28,28,.1), 0 2px 2px -2px rgba(28,28,28,.1), 0 4px 4px -4px rgba(28,28,28,.2)",
  },
  sizes: {
    container: 1440,
    normal: "xsmall",
    small: "xxsmall",
  },
  space: {
    large: "2rem",
    larger: "4rem",
    medium: "1.6rem",
    none: "0",
    small: "1rem",
    xlarge: "2.4rem",
    xsmall: "0.8rem",
    xxlarge: "3.2rem",
    xxsmall: "0.4rem",
  },
  styles: {
    root: {
      bg: "white",
      color: "paragraph",
      fontFamily: "Muli",
      fontSize: "medium",
      fontWeight: 400,
      lineHeight: "body",
    },
  },
  text: {
    default: {
      color: "text",
      fontSize: "medium",
    },
    heading: {
      fontFamily: "Muli",
      fontSize: "xlarge",
      fontWeight: "heading",
      lineHeight: "heading",
      py: ["xsmall", "large"],
    },
  },
};
