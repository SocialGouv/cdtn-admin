import { Command } from "./Command";
import {
  CommandHandlerDuplicatedException,
  CommandHandlerNotFoundException,
} from "./CommandErrors";
import { CommandHandler } from "./CommandHandler";
import { Event } from "./Event";

export class CommandBus {
  private _handlers: Map<string, CommandHandler<Command<string>>> = new Map();

  constructor(private handlers: CommandHandler<Command<string>>[]) {
    handlers.forEach((handler) => {
      if (this._handlers.has(handler.type())) {
        throw new CommandHandlerDuplicatedException(handler.type());
      }
      this._handlers.set(handler.type(), handler);
    });
  }

  async execute(command: Command<string>): Promise<Event[]> {
    const commandId = command.type;
    const handler = this._handlers.get(commandId);
    if (!handler) {
      throw new CommandHandlerNotFoundException(commandId);
    }
    const events = await handler.execute(command);
    return events;
  }
}
