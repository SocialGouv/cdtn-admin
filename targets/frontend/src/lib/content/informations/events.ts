import { EditorialContent } from "@shared/types";
import { Event } from "src/lib";

export class InformationPageUpdated implements Event {
  readonly type = "information-page-updated";

  constructor(
    readonly userToken: string,
    readonly oldData: EditorialContent | null,
    readonly newData: EditorialContent
  ) {}
}
