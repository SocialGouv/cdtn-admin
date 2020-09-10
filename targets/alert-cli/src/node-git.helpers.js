/* eslint-disable-next-line*/
import nodegit from "nodegit";

/**
 * @param { nodegit.ConvenientPatch } patche
 * @returns { string }
 */
export function getFilename(patche) {
  return patche.newFile().path();
}

/**
 *
 * @param {string} file
 * @returns {(tree:nodegit.Tree) => Object}
 */
export function createToJson(file) {
  return (tree) =>
    tree
      .getEntry(file)
      .then((entry) => entry.getBlob())
      .then((blob) => JSON.parse(blob.toString()));
}
