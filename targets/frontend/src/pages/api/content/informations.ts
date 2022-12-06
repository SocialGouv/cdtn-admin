import { NextApiRequest, NextApiResponse } from "next";

import { UpdateInformationPage } from "../../../lib";

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { data } = req.body;
    const command = new UpdateInformationPage(data);
    // TODO Get the event bus and push the command
  }
};
