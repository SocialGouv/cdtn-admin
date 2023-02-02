import { Command } from "./Command";
import { CommandBus } from "./CommandBus";
import { EventPublisher } from "./EventPublisher";

export class CommandService {
  constructor(
    private commandBus: CommandBus,
    private eventPublisher: EventPublisher
  ) {}

  async execute(command: Command<string>): Promise<void> {
    const events = await this.commandBus.execute(command);
    for (const event of events) {
      await this.eventPublisher.execute(event);
    }
  }
}
