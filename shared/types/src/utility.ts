type Camelize<T extends string> = T extends `${infer A}_${infer B}`
  ? `${A}${Camelize<Capitalize<B>>}`
  : T;

export type KeysToCamelCase<T> = {
  [K in keyof T as Camelize<string & K>]: T[K] extends (infer U)[]
    ? KeysToCamelCase<U>[]
    : T[K] extends {}
      ? KeysToCamelCase<T[K]>
      : T[K];
};

export type Audience = "associations" | "particuliers" | "professionnels"
