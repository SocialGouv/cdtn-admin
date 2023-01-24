import { Event } from "./Event";
import { EventHandlerNotFoundException } from "./EventErrors";
import { EventHandler } from "./EventHandler";

export class EventPublisher {
  constructor(private handlers: EventHandler[]) {}

  async execute(event: Event): Promise<void> {
    const eventType = event.type;
    const destHandlers: EventHandler[] = this.handlers.filter(
      (handler) => handler.type() === eventType
    );
    if (destHandlers.length === 0) {
      throw new EventHandlerNotFoundException(eventType);
    }
    for (const handler of destHandlers) {
      await handler.on(event);
    }
  }
}
