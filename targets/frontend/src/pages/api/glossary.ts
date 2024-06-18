import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { URL_EXPORT } from "./export";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  fetch(URL_EXPORT + "/glossary/all", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  res.status(201).json({ message: "Glossary content is being updated." });
}
