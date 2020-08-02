import env from "@kosko/env";

import { create } from "@socialgouv/kosko-charts/components/hasura";

const manifests = create({
  env,
  config: {
    ingress: false,
  },
});

export default manifests;
