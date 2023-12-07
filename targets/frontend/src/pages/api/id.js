import { generateIds } from "@shared/id-generator";
import { SOURCES } from "@socialgouv/cdtn-sources";

const sourceValues = Object.values(SOURCES);

export default async function getId(req, res) {
  const source = req.query.source;
  if (!source || !sourceValues.includes(source)) {
    res.status(400).json({
      error: "Bad request",
      message: "invalid or missing source",
      statusCode: 400,
    });
    return;
  }
  res.status(200).json(generateIds(source));
}
