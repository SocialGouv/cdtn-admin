import { getDifferenceBetweenIndexAndDares } from "./difference";
import { saveDiff } from "./save";

export const runDares = async () => {
  const diff = await getDifferenceBetweenIndexAndDares();
  console.log("diff", JSON.stringify(diff));
  await saveDiff(diff);
};
