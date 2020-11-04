import { Client } from "@elastic/elasticsearch";

export default async function (req, res) {
  if (!process.env.ELASTICSEARCH_API_KEY || !process.env.ELASTICSEARCH_URL) {
    res.status(304).json({ message: "not modified" });
  }

  const client = new Client({
    auth: {
      apiKey: process.env.ELASTICSEARCH_API_KEY,
    },
    node: `${process.env.ELASTICSEARCH_URL}`,
  });

  const { cdtnId, document } = req.body;
  try {
    await client.update({
      body: {
        doc: document,
      },
      id: cdtnId,
      index: `cdtn_master_documents`,
    });
    res.json({ message: "doc updated!" });
  } catch (response) {
    console.error(response.body.error);
    res.status(response.statusCode).json({ message: response.body.error });
  }
}
