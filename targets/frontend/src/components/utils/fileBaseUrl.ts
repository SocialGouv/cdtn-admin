import {
  getBucketDefaultFolder,
  getBucketDraftFolder,
  getBucketPublicEndpoint,
} from "src/runtime-env";

export const buildFilePathUrl = () =>
  `${getBucketPublicEndpoint()}/${getBucketDraftFolder()}/${getBucketDefaultFolder()}`;
