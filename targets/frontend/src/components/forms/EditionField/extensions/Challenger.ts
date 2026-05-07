import { Mark } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type ChallengerFormula =
  | "smic_hourly"
  | "smic_monthly_35h"
  | "smic_monthly_custom"
  | "smic_annual"
  | "smic_monthly_percent"
  | "smic_monthly_multiple";

export type ChallengerFormulaWithParam = Extract<
  ChallengerFormula,
  "smic_monthly_custom" | "smic_monthly_percent" | "smic_monthly_multiple"
>;

export const CHALLENGER_FORMULAS: {
  value: ChallengerFormula;
  label: string;
  paramLabel?: string;
}[] = [
  { value: "smic_hourly", label: "SMIC horaire" },
  {
    value: "smic_monthly_35h",
    label: "SMIC mensuel — 35h (151,67 h × SMIC horaire)",
  },
  {
    value: "smic_monthly_custom",
    label: "SMIC mensuel personnalisé",
    paramLabel: "Nombre d'heures / semaine",
  },
  { value: "smic_annual", label: "SMIC annuel" },
  {
    value: "smic_monthly_percent",
    label: "% du SMIC mensuel",
    paramLabel: "Pourcentage (%)",
  },
  {
    value: "smic_monthly_multiple",
    label: "Multiple du SMIC mensuel",
    paramLabel: "Facteur (multiplicateur)",
  },
];

export const HOURS_PER_MONTH = (35 * 52) / 12; // 151.6667

export function computeChallengerReference(
  formula: ChallengerFormula,
  parameter: string | null | undefined,
  smicHourly: number
): number {
  const param = parameter ? parseFloat(parameter) : NaN;
  switch (formula) {
    case "smic_hourly":
      return smicHourly;
    case "smic_monthly_35h":
      return smicHourly * HOURS_PER_MONTH;
    case "smic_monthly_custom":
      return isNaN(param) ? 0 : smicHourly * ((param * 52) / 12);
    case "smic_annual":
      return smicHourly * HOURS_PER_MONTH * 12;
    case "smic_monthly_percent":
      return isNaN(param) ? 0 : smicHourly * HOURS_PER_MONTH * (param / 100);
    case "smic_monthly_multiple":
      return isNaN(param) ? 0 : smicHourly * HOURS_PER_MONTH * param;
  }
}

export function formatChallengerEur(value: number): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " €"
  );
}

export function parseChallengerAmount(text: string): number | null {
  const cleaned = text
    .replace(/[€$£]/g, "")
    .replace(/[\s ]/g, "")
    .replace(",", ".")
    .trim();
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

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
                const original = parseChallengerAmount(node.text ?? "");
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
