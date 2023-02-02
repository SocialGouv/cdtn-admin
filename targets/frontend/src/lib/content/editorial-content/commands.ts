import { EditorialContentDoc } from "@shared/types";

import { Command } from "../../cqrs";

export class UpdateInformationPage
  implements Command<"update-information-page">
{
  readonly type = "update-information-page";

  constructor(
    readonly userToken: string | undefined,
    readonly cdtnId: string,
    readonly metaDescription: string,
    readonly slug: string,
    readonly title: string,
    readonly document: EditorialContentDoc
  ) {}
}
