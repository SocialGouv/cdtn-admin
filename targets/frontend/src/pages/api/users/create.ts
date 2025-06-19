import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "src/modules/authentification/utils/jwt";
import { createUser } from "src/modules/authentification/createUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const name = req.body.name;
  const email = req.body.email;

  if (!name || !email) {
    res.status(400).json({ message: "Missing a variable" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  const isAccessTokenValid = verifyToken(session.user.accessToken);

  const isRoleValid = session.user.role === "super";

  if (!isAccessTokenValid || !isRoleValid) {
    res.status(401).json({ message: "You are not authorized." });
    return;
  }

  try {
    const result = await createUser(name, email);
    if (!result) {
      res.status(500).json({ message: "Error during user creation" });
      return;
    }
  } catch (error: any) {
    res.status(500).json({ message: JSON.stringify(error) });
    return;
  }
  return res.json({
    message: "Success",
  });
}
