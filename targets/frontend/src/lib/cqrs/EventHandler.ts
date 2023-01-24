import { Event } from "./Event";

export interface IEventHandler<PEvent extends Event = Event> {
  on(event: PEvent): void;

  type(): PEvent["type"];
}

export abstract class EventHandler<PEvent extends Event = Event>
  implements IEventHandler<PEvent>
{
  abstract on(event: PEvent): Promise<void>;

  type(): PEvent["type"] {
    return PEvent["type"];
  }
}
