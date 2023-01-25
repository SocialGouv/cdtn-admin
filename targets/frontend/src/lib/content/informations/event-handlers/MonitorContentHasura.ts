import { EventHandler } from "../../../cqrs";
import { InformationPageUpdated } from "../events";

export class MonitorContentHasura
  implements EventHandler<InformationPageUpdated>
{
  type(): "information-page-updated" {
    return "information-page-updated";
  }

  async on(event: InformationPageUpdated): Promise<void> {
    console.log("Information page has been updated!");
    console.log("Old data: ", event.oldData);
    console.log("Old data: ", event.newData);
    console.log("userId: ", event.userToken);

    // TODO Save in new content database
  }
}
