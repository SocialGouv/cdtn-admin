import { StoreContentHasura, UpdateInformationPageHandler } from "../content";
import { CommandBus, CommandService } from "../cqrs";
import { EventPublisher } from "../cqrs/EventPublisher";

const commandBus = new CommandBus([new UpdateInformationPageHandler()]);
const eventPublisher = new EventPublisher([new StoreContentHasura()]);
const commandService = new CommandService(commandBus, eventPublisher);

export { commandService };
