import slugify from "@socialgouv/cdtn-slugify";

export default function slug(req, res) {
  const text = req.query.q;
  if (!text) {
    res.status(400).json({
      error: "Bad request",
      message: "missing text",
      statusCode: 400,
    });
    return;
  }
  res.status(200).json({ slug: slugify(text) });
}
