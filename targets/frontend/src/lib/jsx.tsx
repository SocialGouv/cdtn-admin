export function jsxJoin(
  array: JSX.Element[],
  str: JSX.Element | string
): JSX.Element | null {
  return array.length > 0
    ? array.reduce((result, item) => (
        <>
          {result}
          {str}
          {item}
        </>
      ))
    : null;
}
