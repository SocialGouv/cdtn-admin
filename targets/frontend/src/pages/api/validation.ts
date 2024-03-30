import { passwordValidation } from "../../modules/authentification/utils/regex";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12)
  .max(32)
  .regex(passwordValidation);
