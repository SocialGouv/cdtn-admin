import { Event } from "./Event";
import { EventHandlerNotFoundException } from "./EventErrors";
import { EventHandler } from "./EventHandler";

export class EventPublisher {
  constructor(private handlers: EventHandler[]) {}

  execute(event: Event): void {
    const eventType = event.type;
    const destHandlers: EventHandler[] = this.handlers.filter(
      (handler) => handler.type() === eventType
    );
    if (destHandlers.length === 0) {
      throw new EventHandlerNotFoundException(eventType);
    }
    destHandlers.forEach((handler) => {
      handler.on(event);
    });
  }
}
