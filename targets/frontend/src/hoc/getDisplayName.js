// Gets the display name of a JSX component for dev tools
export function getDisplayName(Component) {
  return Component.displayName || Component.name || "Component";
}
