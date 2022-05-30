import getConfig from "next/config";
import { Api } from "./api";

const {
  publicRuntimeConfig: { CDTN_API_URL },
} = getConfig();

export default new Api(CDTN_API_URL);
