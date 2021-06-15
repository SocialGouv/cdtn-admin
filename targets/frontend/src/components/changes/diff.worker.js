/* eslint-disable no-restricted-globals */

import { diffSentences, diffWords } from "diff";

addEventListener("message", (event) => {
  const { previous, current } = event.data;
  const tokens =
    previous.length > 10000
      ? diffSentences(previous, current)
      : diffWords(previous, current);
  let diff = "";
  for (const { added, removed, value } of tokens) {
    if (added) {
      diff += `<ins>${value}</ins>`;
    } else if (removed) {
      diff += `<del>${value}</del>`;
    } else {
      diff += value;
    }
  }

  postMessage(diff);
});
