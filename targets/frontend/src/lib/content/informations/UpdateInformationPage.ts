import { CommandHandler, Event } from "../../cqrs";
import { UpdateInformationPage } from "./commands";

export class UpdateInformationPageHandler
  implements CommandHandler<UpdateInformationPage>
{
  type(): "update-information-page" {
    return "update-information-page";
  }

  execute(command: UpdateInformationPage): Event[] {
    return [];
  }
}
