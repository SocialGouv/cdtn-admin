import { getDifferenceBetweenIndexAndDares } from "./difference";
import { saveDiff } from "./save";

export const runDares = async () => {
  const diff = await getDifferenceBetweenIndexAndDares();
  await saveDiff(diff);
};
