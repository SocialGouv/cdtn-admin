import { NextApiRequest, NextApiResponse } from "next";

export const URL_EXPORT = process.env.URL_EXPORT ?? "http://localhost:8787";

const main = (req: NextApiRequest, res: NextApiResponse) => {
  // GET
  if (req.method === "GET") {
    const promises = [
      fetch(URL_EXPORT + "/export"),
      fetch(URL_EXPORT + "/export/latest"),
    ];
    Promise.all(promises)
      .then((response) => Promise.all(response.map((rep) => rep.json())))
      .then((data) => {
        data.forEach((dt) => {
          if (dt.errors) {
            res.status(500).json({
              error: dt.errors,
            });
          }
        });
        res.status(200).json(data);
      })
      .catch((error) => {
        res.status(500).json({
          error,
        });
      });
  }

  // POST
  if (req.method === "POST") {
    const { environment, userId } = req.body;
    fetch(URL_EXPORT + "/export", {
      body: JSON.stringify({
        environment,
        userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.errors) {
          res.status(500).json({
            error: data.errors,
          });
        } else {
          res.status(200).json(data);
        }
      })
      .catch((error) => {
        res.status(500).json({
          error,
        });
      });
  }
};

export default main;
