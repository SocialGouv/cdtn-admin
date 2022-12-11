import { EventHandler } from "../cqrs";
import { InformationPageUpdated } from "./informations/events";

export class StoreContentHasura
  implements EventHandler<InformationPageUpdated>
{
  type(): "information-page-updated" {
    return "information-page-updated";
  }

  on(event: InformationPageUpdated): void {
    const content = event.content;
    // TODO Save in new content database
  }
}
