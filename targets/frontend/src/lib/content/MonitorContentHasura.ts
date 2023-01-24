import { EventHandler } from "../cqrs";
import { InformationPageUpdated } from "./informations/events";

export class StoreContentHasura
  implements EventHandler<InformationPageUpdated>
{
  type(): "information-page-updated" {
    return "information-page-updated";
  }

  async on(event: InformationPageUpdated): Promise<void> {
    // TODO Save in new content database
  }
}
