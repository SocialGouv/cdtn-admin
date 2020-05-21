import React from "react";
import { theme } from "src/theme";
import { ThemeProvider } from "theme-ui";

// Gets the display name of a JSX component for dev tools
export const getDisplayName = (Component) =>
  Component.displayName || Component.name || "Component";

export function withTheme(WrappedComponent) {
  return class extends React.Component {
    static displayName = `withTheme(${getDisplayName(WrappedComponent)})`;
    static async getInitialProps(ctx) {
      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));
      return { ...componentProps };
    }
    render() {
      return (
        <ThemeProvider theme={theme}>
          <WrappedComponent {...this.props} />
        </ThemeProvider>
      );
    }
  };
}
