import { NextApiRequest, NextApiResponse } from "next";
import { commandService, UpdateInformationPage } from "src/lib";

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { data } = req.body;
    const command = new UpdateInformationPage(data);
    try {
      commandService.execute(command);
      res.send(202);
    } catch (e) {
      // TODO res.send(boom(e));
    }
  }
};
