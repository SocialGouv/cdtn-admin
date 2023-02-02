import { AuthenticationException, CommandHandler, Event } from "../../../cqrs";
import { UpdateInformationPage } from "../commands";
import { InformationPageUpdated } from "../events";
import { EditorialContentRepository } from "../repository";

export class UpdateInformationPageHandler
  implements CommandHandler<UpdateInformationPage>
{
  constructor(private repository: EditorialContentRepository) {}

  type(): "update-information-page" {
    return "update-information-page";
  }

  async execute({
    userToken,
    cdtnId,
    slug,
    title,
    metaDescription,
    document,
  }: UpdateInformationPage): Promise<Event[]> {
    if (!userToken) {
      throw new AuthenticationException();
    }

    const aggregate = await this.repository.load(userToken, cdtnId);

    const newAggregate = await this.repository.save(
      userToken,
      cdtnId,
      metaDescription,
      slug,
      title,
      document
    );

    return [new InformationPageUpdated(userToken, aggregate, newAggregate)];
  }
}
