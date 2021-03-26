import type { AppConfig } from "@socialgouv/kosko-charts/components/app";
import { ok } from "assert";

ok(process.env.IP_ALLOWLIST, "Missing process.env.IP_ALLOWLIST");

export default {
  annotations: {
    "nginx.ingress.kubernetes.io/whitelist-source-range":
      process.env.IP_ALLOWLIST,
  },
} as Partial<AppConfig>;
