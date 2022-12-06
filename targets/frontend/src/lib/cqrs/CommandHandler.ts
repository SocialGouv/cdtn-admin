import { Command } from "./Command";
import { Event } from "./Event";

export interface CommandHandler<
  PCommand extends Command<string>,
  REvent extends Event = Event
> {
  execute(command: PCommand): REvent[];

  type(): PCommand["type"];
}