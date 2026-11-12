import { mergeAttributes, Node } from "@tiptap/core";
import {
  CONTRIBUTION_VARIABLE_ATTRIBUTE,
  ContributionVariableKey,
  ContributionVariableValues,
  getContributionVariableLabel,
  isContributionVariableKey,
} from "@shared/utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variable: {
      insertVariable: (key: ContributionVariableKey) => ReturnType;
    };
  }
}

type VariableOptions = {
  /**
   * Valeurs connues pour l'aperçu dans l'éditeur (ex. nom de la CC d'une réponse).
   * Sans valeur, la pastille affiche le libellé de la variable.
   * Le HTML produit ne contient jamais la valeur : seulement la clé.
   */
  values: ContributionVariableValues;
};

/**
 * Variable insérable dans un contenu, résolue à l'export.
 * HTML : <span data-variable="agreement_name" class="variable">Nom de la CC</span>
 */
export const Variable = Node.create<VariableOptions>({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return { values: {} };
  },

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute(CONTRIBUTION_VARIABLE_ATTRIBUTE),
        renderHTML: (attributes) => ({
          [CONTRIBUTION_VARIABLE_ATTRIBUTE]: attributes.key,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[${CONTRIBUTION_VARIABLE_ATTRIBUTE}]`,
        getAttrs: (element) => {
          const key = (element as HTMLElement).getAttribute(
            CONTRIBUTION_VARIABLE_ATTRIBUTE
          );
          return key && isContributionVariableKey(key) ? null : false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const key = node.attrs.key as ContributionVariableKey;
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: "variable" }),
      getContributionVariableLabel(key),
    ];
  },

  renderText({ node }) {
    return getContributionVariableLabel(node.attrs.key);
  },

  addNodeView() {
    const values = this.options.values;
    return ({ node }) => {
      const key = node.attrs.key as ContributionVariableKey;
      const dom = document.createElement("span");
      dom.setAttribute(CONTRIBUTION_VARIABLE_ATTRIBUTE, key);
      dom.setAttribute("class", "variable");
      dom.setAttribute("contenteditable", "false");
      dom.setAttribute("role", "img");
      const label = getContributionVariableLabel(key);
      const value = values[key];
      dom.textContent = value ?? label;
      dom.setAttribute(
        "aria-label",
        value ? `Variable « ${label} » : ${value}` : `Variable « ${label} »`
      );
      dom.setAttribute("title", `Variable « ${label} »`);
      return { dom };
    };
  },

  addCommands() {
    return {
      insertVariable:
        (key) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { key } }),
    };
  },
});
