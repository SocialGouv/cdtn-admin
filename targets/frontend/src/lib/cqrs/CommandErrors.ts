export class CommandHandlerNotFoundException extends Error {
  constructor(commandName: string) {
    super(
      `The command handler for the "${commandName}" command was not found!`
    );
  }
}

export class CommandHandlerDuplicatedException extends Error {
  constructor(commandName: string) {
    super(
      `The command handler for the "${commandName}" command is duplicated!`
    );
  }
}

export class AggregateNotFoundException extends Error {
  constructor(cdtnId: string) {
    super(`The aggregate with cdtnId "${cdtnId}" was not found!`);
  }
}

export class AggregatePersistException extends Error {
  constructor(cdtnId: string, reason: string) {
    super(
      `Persist the aggregate with cdtnId "${cdtnId}" has failed! Reason: ${reason}`
    );
  }
}

export class AuthenticationException extends Error {
  constructor() {
    super();
  }
}
