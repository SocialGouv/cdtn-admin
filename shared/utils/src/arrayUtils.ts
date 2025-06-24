const groupBy = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => string
) =>
  array.reduce((acc, value, index, _array) => {
    const key = predicate(value, index, _array);
    const group = acc[key] || []; // Use a local variable
    group.push(value);
    acc[key] = group;
    return acc;
  }, {} as { [key: string]: T[] });

export { groupBy };
