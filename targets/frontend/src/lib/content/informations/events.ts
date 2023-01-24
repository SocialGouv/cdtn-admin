import { EditorialContentDoc } from "@shared/types";
import { Event } from "src/lib";

export class InformationPageUpdated implements Event {
  readonly type = "information-page-updated";

  constructor(
    readonly userToken: string,
    readonly cdtnId: string,
    readonly metaDescription: string,
    readonly slug: string,
    readonly title: string,
    readonly document: EditorialContentDoc
  ) {}
}
