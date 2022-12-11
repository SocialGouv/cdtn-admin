import { Event } from "src/lib";

export class InformationPageUpdated implements Event {
  readonly type = "information-page-updated";

  constructor(readonly content: string) {}
}
