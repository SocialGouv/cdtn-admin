import fetch from "node-fetch";
import pRetry from "p-retry";
import find from "unist-util-find";
import parents from "unist-util-parents";

import pkg from "../package.json";
import { logger } from "./logger";

const KALI_DATA_VERSION = pkg.devDependencies["@socialgouv/kali-data-types"];

/**
 * @template A
 * @param {(a:A) => number} fn
 * @returns {(a:A, b:A) => number}
 */
const createSorter = (fn) => (a, b) => fn(a) - fn(b);

/**
 * @param {ingester.AgreementKaliBlocks} blocks
 * @param {import("@socialgouv/kali-data-types").Agreement} agreementTree
 * @returns {ingester.AgreementArticleByBlock[]}
 */
export async function getArticlesByTheme(allBlocks, id) {
  const conventionBlocks = allBlocks.find((blocks) => blocks.id === id);

  const agreementTree = await pRetry(
    () =>
      fetch(
        `https://unpkg.com/@socialgouv/kali-data@${KALI_DATA_VERSION}/data/${id}.json`
      )
        .then(async (r) => {
          try {
            return { data: await r.json(), response: r };
          } catch (e) {
            logger.error(e);
            logger.error("from");
            logger.error(r);
            throw e;
          }
        })
        .then(async ({ response, data }) => {
          if (response.ok) {
            return data;
          }
          return Promise.reject(data);
        }),
    {
      onFailedAttempt: async (error) => {
        console.log(
          `On "https://unpkg.com/@socialgouv/kali-data@${KALI_DATA_VERSION}/data/${id}.json".` +
            ` Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
        );
        await new Promise((resolve) => setTimeout(resolve, 33 * 1000));
      },
      retries: 5,
    }
  );

  const treeWithParents = parents(agreementTree);
  if (!conventionBlocks) {
    return [];
  }
  const { blocks } = conventionBlocks;
  return (
    (blocks &&
      Object.keys(blocks)
        .filter((key) => blocks[key].length > 0)
        .sort(createSorter((a) => parseInt(a, 10)))
        .map((key) => ({
          articles:
            blocks[key] &&
            blocks[key].flatMap((articleId) => {
              const node = find(
                treeWithParents,
                (node) => node.data.id === articleId
              );
              if (!node) {
                console.error(
                  `${articleId} not found in idcc ${agreementTree.data.num}`
                );
              }
              return node
                ? [
                    {
                      cid: node.data.cid,
                      id: node.data.id,
                      section: node.parent.data.title,
                      title: node.data.num || "non numéroté",
                    },
                  ]
                : [];
            }),
          bloc: key,
        }))
        .filter(({ articles }) => articles.length > 0)) ||
    []
  );
}
