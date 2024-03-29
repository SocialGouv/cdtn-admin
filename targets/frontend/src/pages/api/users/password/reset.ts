import { NextApiRequest, NextApiResponse } from "next";
import { resetPassword } from "src/modules/authentification/resetPassword";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const email = req.body.email;

  if (!email) {
    res.status(400).json({ message: "Missing a variable" });
    return;
  }

  try {
    await resetPassword(email);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }

  return res.json({
    message: "Success",
  });
}
