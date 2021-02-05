//

import { main } from "@cdt/data/indexing/ingest";
import type { errors } from "@elastic/elasticsearch";

main().catch((error: Error) => {
  if (error.name === "ResponseError") {
    const response: errors.ResponseError = error as errors.ResponseError;
    console.error({ statusCode: response.meta.statusCode });
    console.error({ name: response.name });
    console.error({ request: response.meta.meta.request });
    console.error({ body: response.body });
  } else {
    console.error(error);
  }

  process.exit(1);
});
