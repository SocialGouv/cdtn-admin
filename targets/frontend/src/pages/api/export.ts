import { Environment } from "@shared/types";
import { NextApiRequest, NextApiResponse } from "next";

const URL_EXPORT_ES_PREPRODUCTION =
  process.env.URL_EXPORT_ES_PREPRODUCTION ?? "http://localhost:8787";

const URL_EXPORT_ES_PRODUCTION =
  process.env.URL_EXPORT_ES_PRODUCTION ?? "http://localhost:8787";

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const promises = [
      fetch(URL_EXPORT_ES_PRODUCTION + "/export"),
      fetch(URL_EXPORT_ES_PRODUCTION + "/export/latest"),
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
        res.status(200).json({
          ...data,
        });
      })
      .catch((error) => {
        res.status(500).json({
          error,
        });
      });
  }
  if (req.method === "POST") {
    const { environment, userId } = req.body;
    const url =
      environment === Environment.preproduction
        ? URL_EXPORT_ES_PREPRODUCTION
        : URL_EXPORT_ES_PRODUCTION;
    fetch(url + "/export", {
      body: JSON.stringify({
        environment,
        userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.errors) {
          res.status(500).json({
            error: data.error,
          });
        }
        res.status(200).json({
          ...data,
        });
      })
      .catch((error) => {
        res.status(500).json({
          error,
        });
      });
  }
};
