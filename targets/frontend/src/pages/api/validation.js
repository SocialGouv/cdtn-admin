import Joi from "@hapi/joi";

import { passwordValidation } from "../../lib/regex";

export const passwordSchema = Joi.string()
  .min(12)
  .max(32)
  .regex(passwordValidation)
  .required();
