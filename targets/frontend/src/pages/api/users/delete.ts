import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "src/modules/authentification/utils/jwt";
import { deleteUser } from "src/modules/authentification/deleteUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const userId = req.body.userId;
  const userName = req.body.userName;

  if (!userId) {
    res.status(400).json({ message: "Missing user id" });
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

  const result = await deleteUser(userId, userName);

  if (!result) {
    res.status(500).json({ message: "Error deleting user" });
    return;
  }

  return res.json({
    message: "Success",
  });
}
