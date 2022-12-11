import { CommandHandler, Event } from "../../cqrs";
import { UpdateInformationPage } from "./commands";
import { InformationPageUpdated } from "./events";

export class UpdateInformationPageHandler
  implements CommandHandler<UpdateInformationPage>
{
  type(): "update-information-page" {
    return "update-information-page";
  }

  execute(command: UpdateInformationPage): Event[] {
    return [new InformationPageUpdated(command.content)];
  }
}
