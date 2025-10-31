import type { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";

const METABASE_SITE_URL = "https://metabase-cdtn.fabrique.social.gouv.fr";
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY ?? "";

if (!METABASE_SECRET_KEY) {
  throw new Error("METABASE_SECRET_KEY is missing");
}

export default function token(
  req: NextApiRequest,
  res: NextApiResponse<{ iframeUrl: string } | { error: string }>
) {
  const { dashboard, ...params } = req.query;

  if (!dashboard || Array.isArray(dashboard)) {
    return res.status(400).json({ error: "Paramètre 'dashboard' requis" });
  }
  const dashboardId = parseInt(dashboard as string, 10);
  if (isNaN(dashboardId)) {
    return res.status(400).json({ error: "dashboard doit être un nombre" });
  }

  const cleanParams: Record<string, string | string[]> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      cleanParams[key] = value;
    }
  });

  const payload = {
    resource: { dashboard: dashboardId },
    params: cleanParams,
    exp: Math.round(Date.now() / 1000) + 10 * 60,
  };

  try {
    const key = sign(payload, METABASE_SECRET_KEY);
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${key}#bordered=true&titled=false&resize=true&hide_footer=true`;

    res.status(200).json({ iframeUrl });
  } catch (error) {
    console.error("Erreur token:", error);
    res.status(500).json({ error: "Échec génération token" });
  }
}
