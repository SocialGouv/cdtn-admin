import { CommandBus } from "../CommandBus";
import {
  CommandHandlerDuplicatedException,
  CommandHandlerNotFoundException,
} from "../CommandErrors";
import { TestCommand, TestCommandHandler, TestEvent } from "./data/TestCommand";

describe("Test du command bus", () => {
  test("Sans handler, l'exécution d'une commande doit  retourner une erreur", () => {
    const commandBus = new CommandBus([]);
    const command = new TestCommand("DATA");
    expect(() => {
      commandBus.execute(command);
    }).toThrow(new CommandHandlerNotFoundException("test-command"));
  });

  test("l'exécution d'une commande doit retourner les events lié à la commande", () => {
    const commandBus = new CommandBus([new TestCommandHandler()]);
    const command = new TestCommand("DATA");

    const result = commandBus.execute(command);

    expect(result).toEqual([new TestEvent("DATA")]);
  });

  test("la création du commandBus doit retourner une erreur si on enregistre plusieurs handlers pour la même commande", () => {
    expect(() => {
      new CommandBus([new TestCommandHandler(), new TestCommandHandler()]);
    }).toThrow(new CommandHandlerDuplicatedException("test-command"));
  });
});
