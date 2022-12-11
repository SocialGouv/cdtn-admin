export class EventHandlerNotFoundException extends Error {
  constructor(eventName: string) {
    super(`No event handler found for the "${eventName}" event`);
  }
}
