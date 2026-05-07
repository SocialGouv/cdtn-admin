import { Mark } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ChallengerFormula } from "@shared/utils/build/src/challenger.utils";
import {
  computeChallengerReference,
  formatChallengerEur,
} from "@socialgouv/cdtn-utils";
import { parseAmount } from "../component/utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    challenger: {
      setChallenger: (
        formula: ChallengerFormula,
        parameter?: string | null
      ) => ReturnType;
      unsetChallenger: () => ReturnType;
    };
  }
}

const challengerDecorationKey = new PluginKey("challenger-decorations");

export const Challenger = Mark.create({
  name: "challenger",

  addStorage() {
    return {
      smicHourly: null as number | null,
    };
  },

  addAttributes() {
    return {
      formula: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-challenger-formula"),
        renderHTML: (attrs) => ({
          "data-challenger-formula": attrs.formula,
        }),
      },
      parameter: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-challenger-parameter") ?? null,
        renderHTML: (attrs) =>
          attrs.parameter
            ? { "data-challenger-parameter": attrs.parameter }
            : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-challenger-formula]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", { ...HTMLAttributes, class: "challenger" }, 0];
  },

  addCommands() {
    return {
      setChallenger:
        (formula: ChallengerFormula, parameter?: string | null) =>
        ({ commands }) =>
          commands.setMark(this.name, {
            formula,
            parameter: parameter ?? null,
          }),

      unsetChallenger:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },

  addProseMirrorPlugins() {
    // Capture storage by reference so mutations from outside are visible here
    const storage = this.storage;

    return [
      new Plugin({
        key: challengerDecorationKey,
        props: {
          decorations(state) {
            const smicHourly = storage.smicHourly;
            if (!smicHourly) return DecorationSet.empty;

            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (!node.isText) return;
              node.marks.forEach((mark) => {
                if (mark.type.name !== "challenger") return;
                const ref = computeChallengerReference(
                  mark.attrs.formula,
                  mark.attrs.parameter,
                  smicHourly
                );
                const original = parseAmount(node.text ?? "");
                // Only display the SMIC override when it is strictly greater
                // than the value typed by the author. Otherwise we leave the
                // text untouched so the original amount stays visible.
                if (original !== null && ref <= original) return;
                decorations.push(
                  Decoration.inline(pos, pos + node.nodeSize, {
                    "data-challenger-computed": formatChallengerEur(ref),
                  })
                );
              });
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
