import type { NextApiRequest, NextApiResponse } from "next";
import { getClientEnvScript } from "src/runtime-env";

// Sert `window.__ENV` au navigateur, à chaque requête (voir src/runtime-env.ts).
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(getClientEnvScript());
}
