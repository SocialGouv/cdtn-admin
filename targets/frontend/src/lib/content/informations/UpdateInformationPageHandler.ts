import { CommandHandler, Event } from "../../cqrs";
import { AuthenticationError } from "../../cqrs/Errors";
import { UpdateInformationPage } from "./commands";
import { InformationPageUpdated } from "./events";

export class UpdateInformationPageHandler
  implements CommandHandler<UpdateInformationPage>
{
  type(): "update-information-page" {
    return "update-information-page";
  }

  execute({
    userToken,
    cdtnId,
    slug,
    title,
    metaDescription,
    document,
  }: UpdateInformationPage): Event[] {
    if (!userToken) {
      throw new AuthenticationError();
    }
    return [
      new InformationPageUpdated(
        userToken,
        cdtnId,
        metaDescription,
        slug,
        title,
        document
      ),
    ];
  }
}
