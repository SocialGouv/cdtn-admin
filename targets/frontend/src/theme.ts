import { darken, rgba, transparentize } from "polished";

/* eslint-disable sort-keys-fix/sort-keys-fix */

export const theme = {
  alerts: {
    primary: {
      color: "white",
      bg: "primary",
      py: "xsmall",
      px: "small",
    },
    secondary: {
      color: "white",
      bg: "secondary",
      py: "xsmall",
      px: "small",
    },
    highlight: {
      color: "text",
      bg: "highlight",
      py: "xsmall",
      px: "small",
    },
  },
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
    accent: {
      bg: "accent",
      color: "white",
      px: "xxsmall",
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
      bg: "transparent",
      bgHover: "highlight",
      color: "text",
    },
    accent: {
      bg: "accent",
      bgHover: "accentHover",
      color: "white",
    },
    primary: {
      bg: "primary",
      bgHover: "primaryHover",
      color: "white",
    },
    secondary: {
      bg: "secondary",
      bgHover: "secondaryHover",
      color: "white",
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

    text: "#3e486e",
    background: "#fff",
    white: "#fff",
    black: "#232323",
    link: "#004cce",
    linkVisited: "#733d90",
    focus: rgba("#1e90ff", 0.7),

    info: "#2AB7CA",
    caution: "#FED766",
    critical: "#E03616",
    positive: "#43AA8B",
    dropZone: "#d1ffd9",
    neutral: "#d1dffd",
    muted: "#717780",
    highlight: "#F3F3F7",
    nested: "#E9E9ED",

    primary: "#f66663",
    primaryHover: darken(0.05, "#f66663"),
    secondary: "#7994d4",
    secondaryHover: darken(0.05, "#7994d4"),
  },
  fontSizes: {
    0: "0.8rem",
    xxsmall: "0.7rem",
    xsmall: "0.8rem",
    small: "0.9rem",
    medium: "1rem",
    large: "1.4rem",
    xlarge: "2rem",
    xxlarge: "3.2rem",
    icons: "1.5rem",
  },
  // fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  fontWeights: {
    body: 300,
    heading: 600,
    light: 300,
    regular: 400,
    semibold: 600,
    bold: 600,
  },
  forms: {
    input: {
      padding: "xsmall",
      backgroundColor: "white",
    },
    label: {
      fontSize: "medium",
      fontWeight: "bold",
    },
    select: {
      padding: "xsmall",
    },
    textarea: {
      fontFamily: "Muli",
      padding: "xsmall",
      backgroundColor: "white",
    },
    radio: {
      backgroundColor: "white",
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
  messages: {
    primary: {
      p: "small",
    },
    secondary: {
      borderLeftColor: "secondary",
      p: "small",
    },
  },
  radii: {
    small: "4px",
    large: "8px",
    xlarge: "16px",
  },
  shadows: {
    card1: "0 0 8px rgba(0, 0, 0, 0.125)",
    cardHover: "0px 0px 16px rgba(0, 0, 0, 0.325)",
    small:
      "0 0 4px 0px rgba(28,28,28,.1), 0 2px 2px -2px rgba(28,28,28,.1), 0 4px 4px -4px rgba(28,28,28,.2)",
    medium:
      "0 0 4px 0px rgba(28,28,28,.1), 0 8px 8px -4px rgba(28,28,28,.1), 0 12px 12px -8px rgba(28,28,28,.2)",
    large:
      "0 0 4px 0px rgba(28,28,28,.1), 0 3px 18px -4px rgba(28,28,28,.1), 0 5px 30px -12px rgba(28,28,28,.2)",
  },
  sizes: {
    iconsXSmall: "1rem",
    iconSmall: "1.5rem",
    iconMedium: "2rem",
    container: 1440,
  },
  space: {
    0: 0,
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
  styles: {
    hr: {
      color: "neutral",
    },
    root: {
      bg: "white",
      color: "text",
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
      py: "small",
    },
  },
};
