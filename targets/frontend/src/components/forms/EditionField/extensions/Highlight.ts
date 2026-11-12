import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: () => ReturnType;
      unsetHighlight: () => ReturnType;
      toggleHighlight: () => ReturnType;
    };
  }
}

const NO_HIGHLIGHT_VALUES = [
  "",
  "none",
  "transparent",
  "initial",
  "inherit",
  "auto",
  "windowtext",
  "white",
  "#fff",
  "#ffffff",
  "rgb(255,255,255)",
  "rgb(255, 255, 255)",
];

const BACKGROUND_REGEX =
  /(?:^|;)\s*(?:background(?:-color)?|mso-highlight)\s*:\s*([^;]+)/gi;

/**
 * Détecte un surlignage dans le style d'un élément collé depuis Word / Google Docs :
 * `background`, `background-color` ou `mso-highlight` avec une couleur autre que le blanc.
 */
export const hasHighlightStyle = (style: string | null): boolean => {
  if (!style) {
    return false;
  }
  for (const match of Array.from(style.matchAll(BACKGROUND_REGEX))) {
    const value = (match[1] ?? "").trim().toLowerCase();
    // `background: url(...) ...` ou valeur composite : on garde la première couleur
    const color = value.split(/\s+(?![^(]*\))/)[0] ?? value;
    if (!NO_HIGHLIGHT_VALUES.includes(color)) {
      return true;
    }
  }
  return false;
};

/**
 * Surlignage servant à guider la relecture d'un template.
 * HTML produit : <mark>. Cette extension est la seule autorisée à générer cette balise,
 * le serveur s'appuie dessus pour interdire le passage à « À valider » d'une réponse surlignée.
 */
export const Highlight = Mark.create({
  name: "highlight",

  parseHTML() {
    return [
      { tag: "mark" },
      {
        tag: "span",
        getAttrs: (element) =>
          hasHighlightStyle((element as HTMLElement).getAttribute("style"))
            ? {}
            : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHighlight:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      unsetHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
      toggleHighlight:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.toggleHighlight(),
    };
  },
});
