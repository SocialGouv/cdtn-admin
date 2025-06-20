const groupBy = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => string
) =>
  array.reduce((acc, value, index, _array) => {
    const key = predicate(value, index, _array);
    if (!acc[key]) {
      acc[key] = [];
    }
    // Use non-null assertion since we've guaranteed acc[key] exists
    acc[key]!.push(value);
    return acc;
  }, {} as { [key: string]: T[] });

export { groupBy };
