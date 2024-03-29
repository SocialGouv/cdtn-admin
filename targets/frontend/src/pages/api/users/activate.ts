import { NextApiRequest, NextApiResponse } from "next";
import { activateUser } from "src/modules/authentification/activateUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const token = req.body.token;
  const password = req.body.password;

  if (!token || !password) {
    res.status(400).json({ message: "Missing a variable" });
    return;
  }

  try {
    await activateUser(token, password);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }

  return res.json({
    message: "Success",
  });
}
