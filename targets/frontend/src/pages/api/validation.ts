import { passwordValidation } from "../../modules/authentification/passwordValidation";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12)
  .max(32)
  .regex(passwordValidation);
