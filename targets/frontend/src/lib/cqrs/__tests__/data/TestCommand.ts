import { Command } from "../../Command";
import { CommandHandler } from "../../CommandHandler";
import { Event } from "../../Event";

export class TestCommand implements Command<"test-command"> {
  readonly type = "test-command";

  constructor(readonly data: string) {}
}

export class TestEvent implements Event {
  readonly type = "test-event";

  constructor(readonly data: string) {}
}

export type TestEvents = TestEvent;

export class TestCommandHandler
  implements CommandHandler<TestCommand, TestEvents>
{
  type(): "test-command" {
    return "test-command";
  }

  execute(command: TestCommand): TestEvents[] {
    return [new TestEvent(command.data)];
  }
}
