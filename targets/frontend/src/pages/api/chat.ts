import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { question, history, idcc, url } = req.body;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        history,
        idcc,
      }),
    });
    const data = await response.json();
    if (data.error) {
      res.status(400).json(data);
    }
    res.status(200).json(data);
  }
};
