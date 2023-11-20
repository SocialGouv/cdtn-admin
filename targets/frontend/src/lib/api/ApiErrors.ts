interface ErrorWithCause<T> {
  name: T;
  message: string;
  cause: any;
}

export class ErrorBase<T extends string> extends Error {
  name: T;
  message: string;
  cause: any;

  constructor(error: ErrorWithCause<T>) {
    super();
    this.name = error.name;
    this.message = error.message;
    this.cause = error.cause;
  }
}

export class NotFoundError extends ErrorBase<"NOT_FOUND"> {}

export class MissingDocumentError extends ErrorBase<"MISSING_DOCUMENT"> {}

export class ConflictError extends ErrorBase<"CONFLICT_ERROR"> {}

export const DEFAULT_ERROR_500_MESSAGE =
  "Internal server error during fetching data";

export class InvalidQueryError extends ErrorBase<"INVALID_QUERY"> {
  constructor(message: string, cause: any) {
    super({ name: "INVALID_QUERY", message, cause });
  }
}
