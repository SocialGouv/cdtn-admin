import { Command } from "../../cqrs";

export class UpdateInformationPage
  implements Command<"update-information-page">
{
  readonly type = "update-information-page";

  constructor(readonly content: string) {}
}
