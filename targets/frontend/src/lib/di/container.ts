import { createClient } from "urql";

import {
  EditorialContentRepository,
  MonitorContentHasura,
  UpdateInformationPageHandler,
} from "../content";
import { CommandBus, CommandService } from "../cqrs";
import { EventPublisher } from "../cqrs/EventPublisher";

const HASURA_GRAPHQL_ENDPOINT =
  process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql";

const gqlClient = createClient({
  fetchOptions: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  requestPolicy: "network-only",
  url: HASURA_GRAPHQL_ENDPOINT,
});
const commandBus = new CommandBus([
  new UpdateInformationPageHandler(new EditorialContentRepository(gqlClient)),
]);
const eventPublisher = new EventPublisher([new MonitorContentHasura()]);
const commandService = new CommandService(commandBus, eventPublisher);

export { commandService, gqlClient };
