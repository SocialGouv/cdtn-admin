export interface GraphQLResponseRoot<Data> {
  data?: Data;
  errors?: GraphQLResponseError[];
}

export interface GraphQLResponseError {
  message: string;
  locations?: GraphQLResponseErrorLocation[];
}

export interface GraphQLResponseErrorLocation {
  line: number;
  column: number;
}
