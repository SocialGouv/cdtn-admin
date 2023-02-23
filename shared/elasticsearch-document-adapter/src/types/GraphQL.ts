export type GraphQLResponseRoot<Data> = {
  data?: Data;
  errors?: GraphQLResponseError[];
};

export type GraphQLResponseError = {
  message: string;
  locations?: GraphQLResponseErrorLocation[];
};

export type GraphQLResponseErrorLocation = {
  line: number;
  column: number;
};
