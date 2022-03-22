import { z } from "zod";

import { Environment } from "../types";

export const CreateExportEsStatus = z.object({
  environment: z.nativeEnum(Environment),
  userId: z.string().uuid(),
});

export type CreateExportEsStatusType = z.infer<typeof CreateExportEsStatus>;
