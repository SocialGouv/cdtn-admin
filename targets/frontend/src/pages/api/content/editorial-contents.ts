import { EditorialContentDocSchema } from "@shared/types";
import { NextApiRequest, NextApiResponse } from "next";
import { commandService, UpdateInformationPage } from "src/lib";
import { z } from "zod";

const InputData = z.object({
  cdtnId: z.string(),
  document: EditorialContentDocSchema,
  metaDescription: z.string(),
  slug: z.string(),
  title: z.string(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const bearer = req.headers.authorization;
    const result = InputData.parse(req.body);
    const command = new UpdateInformationPage(
      bearer,
      result.cdtnId,
      result.metaDescription,
      result.slug,
      result.title,
      result.document
    );
    try {
      await commandService.execute(command);
      res.status(202).send({ success: "OK" });
    } catch (e: unknown) {
      res.status(500).send({ error: (e as any).message });
    }
  }
};
