import { Command } from "./Command";
import { CommandBus } from "./CommandBus";
import { EventPublisher } from "./EventPublisher";

export class CommandService {
  constructor(
    private commandBus: CommandBus,
    private eventPublisher: EventPublisher
  ) {}

  execute(command: Command<string>): void {
    const events = this.commandBus.execute(command);
    events.forEach((event) => {
      this.eventPublisher.execute(event);
    });
  }
}
