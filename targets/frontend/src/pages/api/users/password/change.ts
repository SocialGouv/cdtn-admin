import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "src/modules/authentification/utils/jwt";
import { changePassword } from "src/modules/authentification/changePassword";

export default async function changeApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;

  if (!newPassword || !oldPassword) {
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

  const result = await changePassword(
    session.user.id,
    oldPassword,
    newPassword
  );

  if (!result) {
    res.status(500).json({ message: "Error during password modification" });
    return;
  }

  return res.json({
    message: "Success",
  });
}
