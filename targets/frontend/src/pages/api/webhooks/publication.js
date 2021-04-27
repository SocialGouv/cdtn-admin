import { Client } from "@elastic/elasticsearch";
import Boom from "@hapi/boom";
import Joi from "@hapi/joi";
import { createErrorFor } from "src/lib/apiError";

import { majorIndexVersion } from "../actions/preview";

export default async function publishDocument(req, res) {
  const apiError = createErrorFor(res);

  if (req.headers["publication-secret"] !== process.env.PUBLICATION_SECRET) {
    console.error("[publishDocument] Invalid secret token");
    return apiError(Boom.unauthorized("Invalid secret token"));
  }

  if (
    !process.env.ELASTICSEARCH_TOKEN_UPDATE ||
    !process.env.ELASTICSEARCH_URL
  ) {
    console.error("[publishDocument] Missing env");
    res.status(304).json({ message: "not modified" });
  }

  const schema = Joi.object()
    .keys({
      event: Joi.object()
        .keys({
          data: Joi.object()
            .keys({
              new: Joi.object({
                cdtn_id: Joi.string().required(),
                is_published: Joi.bool(),
              })
                .required()
                .unknown(),
            })
            .required()
            .unknown(),
          op: Joi.string().pattern(/^(UPDATE)$/, "OP"),
        })
        .required()
        .unknown(),
    })
    .unknown();

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error(`[publishDocument] ${error.details[0].message}`);
    return apiError(Boom.badRequest(error.details[0].message));
  }
  const { data } = value.event;
  const { cdtn_id, is_published } = data.new;

  const client = new Client({
    auth: {
      apiKey: process.env.ELASTICSEARCH_TOKEN_UPDATE,
    },
    node: `${process.env.ELASTICSEARCH_URL}`,
  });

  try {
    await client.update({
      body: {
        doc: { isPublished: is_published },
      },
      id: cdtn_id,
      index: `cdtn-preprod-v${majorIndexVersion}_documents`,
    });
    console.log(
      `[publishDocument] ${
        is_published ? "published" : "unpublish"
      } document ${cdtn_id}`
    );
    res.json({
      message: `${
        is_published ? "published" : "unpublish"
      } document ${cdtn_id}`,
    });
  } catch (response) {
    if (response.body) {
      console.error("[webhook] update publication status", response.body.error);
    } else {
      console.error("[webhook] update publication status", response);
    }
    apiError(Boom.badGateway(`[webhook] can't update publication status`));
  }
}
