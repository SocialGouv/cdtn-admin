/* eslint-disable no-restricted-globals */

import { diffSentences } from "diff";

addEventListener("message", (event) => {
  const { previous, current } = event.data;
  const tokens = diffSentences(previous, current);
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
