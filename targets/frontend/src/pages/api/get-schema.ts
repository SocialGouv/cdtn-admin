import { NextApiRequest, NextApiResponse } from "next";
import { getIntrospectionQuery } from "graphql";
import fetch from "node-fetch"; // or your preferred request in Node.js
import * as fs from "fs";
import {
  getIntrospectedSchema,
  minifyIntrospectionQuery,
} from "@urql/introspection";

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    fetch(
      process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://hasura:8080/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret":
            process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "admin1",
        },
        body: JSON.stringify({
          variables: {},
          query: getIntrospectionQuery({ descriptions: false }),
        }),
      }
    )
      .then((result) => result.json())
      .then(({ data }) => {
        const minified = minifyIntrospectionQuery(getIntrospectedSchema(data));
        fs.writeFileSync("./schema.json", JSON.stringify(minified));
        res.status(200).json({
          result: "Schema written!",
        });
      });
  }
};
