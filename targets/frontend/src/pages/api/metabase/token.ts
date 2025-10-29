import type { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";

const METABASE_SITE_URL = "https://metabase-cdtn.fabrique.social.gouv.fr";
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY ?? "";

if (!METABASE_SECRET_KEY) {
  throw new Error("METABASE_SECRET_KEY is missing in .env.local");
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ iframeUrl: string } | { error: string }>
) {
  console.log("API /api/metabase/token appelée");

  const payload = {
    resource: { dashboard: 8 },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60,
  };

  try {
    const token = sign(payload, METABASE_SECRET_KEY);
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=false`;

    res.status(200).json({ iframeUrl });
  } catch (error) {
    console.error("Erreur token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
}
