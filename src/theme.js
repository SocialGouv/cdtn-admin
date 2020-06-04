import { rgba, darken, transparentize } from "polished";

export const theme = {
  sizes: {
    container: 1440,
    normal: "xsmall",
    small: "xxsmall",
  },
  fontSizes: {
    xsmall: "0.8rem",
    small: "0.9rem",
    medium: "1rem",
    large: "1.4rem",
    xlarge: "2rem",
    xxlarge: "3.2rem",
    icons: "1.5rem",
  },
  fontWeights: {
    body: 300,
    regular: 400,
    heading: 600,
    semibold: 600,
  },
  lineHeights: {
    body: 1.625,
    heading: 1.125,
  },
  letterSpacings: {
    body: "normal",
    caps: "0.2em",
  },
  colors: {
    text: "#3e486e",
    background: "#fff",
    primary: "#f66663",
    primaryHover: darken(0.05, "#f66663"),
    secondary: "#7994d4",
    secondaryHover: darken(0.05, "#7994d4"),
    accent: "#DA4167",
    accentHover: darken(0.05, "#DA4167"),

    positive: "#43AA8B",
    neutral: "#d1dffd",
    info: "#2AB7CA",
    caution: "#FED766",
    critical: "#E03616",

    white: "#fff",
    black: "#232323",

    highlight: "#E6E6EA",
    muted: "#bbcadf",

    link: "#2765cf",
    linkVisited: "#733d90",
    focus: rgba("#1e90ff", 0.7),
  },
  space: {
    none: "0",
    xxsmall: "0.4rem",
    xsmall: "0.8rem",
    small: "1rem",
    medium: "1.6rem",
    large: "2rem",
    xlarge: "2.4rem",
    xxlarge: "3.2rem",
    larger: "4rem",
  },
  radii: {
    small: "4px",
    large: "8px",
  },
  breakpoints: ["40rem", "56rem", "64rem"],
  styles: {
    root: {
      color: "paragraph",
      bg: "white",
      fontWeight: 400,
      fontFamily: "Muli",
      fontSize: "medium",
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
      fontWeight: "heading",
      lineHeight: "heading",
      py: ["xsmall", "large"],
      fontSize: "xlarge",
    },
  },
  buttons: {
    primary: {
      text: "white",
      color: "primary",
      colorHover: "primaryHover",
    },
    secondary: {
      text: "white",
      color: "secondary",
      colorHover: "secondaryHover",
    },
    link: {
      text: "text",
      color: "transparent",
      colorHover: "muted",
    },
    icon: {
      bgHover: transparentize(0.8, "#3e486e"),
    },
  },
  cards: {
    primary: {
      padding: "small",
      borderRadius: "small",
      boxShadow: "large",
    },
    compact: {
      padding: "small",
      borderRadius: "small",
      border: "1px solid",
      borderColor: "muted",
    },
  },
  badges: {
    primary: {
      bg: "primary",
      color: "white",
      fontSize: "medium",
      px: "xxsmall",
    },
    secondary: {
      bg: "secondary",
      color: "white",
      fontSize: "medium",
      px: "xxsmall",
    },
  },
  forms: {
    label: {
      fontSize: "small",
      fontWeight: "body",
    },
    input: {
      padding: "xsmall",
    },
    select: {
      padding: "xsmall",
    },
  },
  shadows: {
    card1: "0 0 8px rgba(0, 0, 0, 0.125)",
    small:
      "0 0 4px 0px rgba(28,28,28,.1), 0 2px 2px -2px rgba(28,28,28,.1), 0 4px 4px -4px rgba(28,28,28,.2)",
    medium:
      "0 0 4px 0px rgba(28,28,28,.1), 0 8px 8px -4px rgba(28,28,28,.1), 0 12px 12px -8px rgba(28,28,28,.2)",
    large:
      "0 0 4px 0px rgba(28,28,28,.1), 0 3px 18px -4px rgba(28,28,28,.1), 0 5px 30px -12px rgba(28,28,28,.2)",
  },
};
