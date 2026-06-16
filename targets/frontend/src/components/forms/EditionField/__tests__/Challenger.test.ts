import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import { Challenger } from "../extensions";
import {
  detectAmountsInRange,
  detectSmicPercentage,
  parseAmount,
} from "../component/utils";

const mockRect = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => {},
};
if (typeof Element.prototype.getClientRects === "undefined") {
  Element.prototype.getClientRects = function () {
    return {
      length: 1,
      item: () => mockRect,
      [Symbol.iterator]: function* () {
        yield mockRect;
      },
      0: mockRect,
    } as any;
  };
}
if (typeof Element.prototype.getBoundingClientRect === "undefined") {
  Element.prototype.getBoundingClientRect = function () {
    return mockRect as any;
  };
}

const editors: Editor[] = [];

afterEach(() => {
  while (editors.length) {
    const e = editors.pop();
    e?.destroy();
  }
});

const createEditor = (content: string, smicHourly: number | null = null) => {
  const element = document.createElement("div");
  document.body.appendChild(element);
  const editor = new Editor({
    element,
    extensions: [StarterKit, Challenger],
    content,
  });
  editors.push(editor);
  // Always reset storage explicitly (Tiptap reuses the extension instance
  // across editors, so its storage object can leak between tests).
  const ext = editor.extensionManager.extensions.find(
    (e) => e.name === "challenger"
  );
  if (ext) ext.storage.smicHourly = smicHourly;
  editor.view.dispatch(editor.state.tr);
  return editor;
};

const createTableEditor = (content: string) => {
  const element = document.createElement("div");
  document.body.appendChild(element);
  const editor = new Editor({
    element,
    extensions: [
      StarterKit,
      Challenger,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
  });
  editors.push(editor);
  return editor;
};

describe("parseChallengerAmount", () => {
  it.each([
    ["2 109,25 €", 2109.25],
    ["2 109,25 €", 2109.25],
    ["1823,03", 1823.03],
    ["12.5", 12.5],
    ["  42 ", 42],
    ["1 000 000,00 €", 1000000],
    ["0", 0],
  ])("parses %p as %p", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each(["", "abc", "   ", "€", "—"])(
    "returns null for unparsable input %p",
    (input) => {
      expect(parseAmount(input)).toBeNull();
    }
  );
});

describe("Challenger extension commands", () => {
  it("setChallenger applies the mark with formula and parameter", () => {
    const editor = createEditor("<p>2 109,25 €</p>");
    editor.commands.selectAll();
    editor.commands.setChallenger("smic_monthly_custom", "30");

    const html = editor.getHTML();
    expect(html).toContain('data-challenger-formula="smic_monthly_custom"');
    expect(html).toContain('data-challenger-parameter="30"');
    expect(html).toContain('class="challenger"');
  });

  it("unsetChallenger removes the mark", () => {
    const editor = createEditor("<p>2 109,25 €</p>");
    editor.commands.selectAll();
    editor.commands.setChallenger("smic_hourly");
    expect(editor.getHTML()).toContain("data-challenger-formula");

    editor.commands.selectAll();
    editor.commands.unsetChallenger();
    expect(editor.getHTML()).not.toContain("data-challenger-formula");
  });

  it("parseHTML round-trip preserves attributes", () => {
    const html =
      '<p><span data-challenger-formula="smic_monthly_35h" data-challenger-parameter="35">2 109,25 €</span></p>';
    const editor = createEditor(html);
    expect(editor.getHTML()).toContain(
      'data-challenger-formula="smic_monthly_35h"'
    );
    expect(editor.getHTML()).toContain('data-challenger-parameter="35"');
  });

  it("does not persist the computed value in HTML", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">10,00 €</span></p>',
      12
    );
    expect(editor.getHTML()).not.toContain("data-challenger-computed");
  });
});

describe("Challenger decoration", () => {
  const findComputedWrapper = (editor: Editor): HTMLElement | null =>
    editor.view.dom.querySelector("[data-challenger-computed]");

  it("does not decorate when smicHourly storage is not set", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">5,00 €</span></p>'
    );
    expect(findComputedWrapper(editor)).toBeNull();
  });

  it("decorates with SMIC value when reference is greater than original", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">5,00 €</span></p>',
      12 // SMIC horaire 12€ > 5€ → décoration attendue
    );
    const wrapper = findComputedWrapper(editor);
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
      /^12,00\s?€$/
    );
  });

  it("does not decorate when reference is lower than original", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">20,00 €</span></p>',
      12 // SMIC horaire 12€ < 20€ → pas de décoration
    );
    expect(findComputedWrapper(editor)).toBeNull();
  });

  it("does not decorate when reference is equal to original", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">12,00 €</span></p>',
      12
    );
    expect(findComputedWrapper(editor)).toBeNull();
  });

  it("uses the monthly formula to decide whether to decorate", () => {
    // SMIC mensuel 35h = 12 * 151.6667 ≈ 1820€
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_monthly_35h">1 500,00 €</span></p>',
      12
    );
    const wrapper = findComputedWrapper(editor);
    expect(wrapper).not.toBeNull();
    // formatted to "1 820,00 €"
    expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
      /1.+820,00/
    );
  });

  it("recomputes decoration when smicHourly changes", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">10,00 €</span></p>',
      8 // 8 < 10 → pas de décoration
    );
    expect(findComputedWrapper(editor)).toBeNull();

    // Le SMIC est mis à jour ailleurs (autre écran) puis on rouvre l'éditeur.
    // On reproduit le useEffect : on met à jour le storage et on dispatch
    // une transaction no-op pour forcer le recalcul des décorations.
    const ext = editor.extensionManager.extensions.find(
      (e) => e.name === "challenger"
    );
    if (ext) ext.storage.smicHourly = 15;
    editor.view.dispatch(editor.state.tr);

    const wrapper = findComputedWrapper(editor);
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
      /^15,00\s?€$/
    );
  });

  it("falls back to the SMIC reference when the original cannot be parsed", () => {
    const editor = createEditor(
      '<p><span data-challenger-formula="smic_hourly">N/A</span></p>',
      12
    );
    const wrapper = findComputedWrapper(editor);
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
      /^12,00\s?€$/
    );
  });

  const formulasWithoutParam = [
    "smic_hourly",
    "smic_monthly_35h",
    "smic_annual",
  ];
  it.each(formulasWithoutParam)(
    "applies decoration for formula %s when SMIC is high enough",
    (formula) => {
      const editor = createEditor(
        `<p><span data-challenger-formula="${formula}">0,00 €</span></p>`,
        12
      );
      expect(findComputedWrapper(editor)).not.toBeNull();
    }
  );

  describe("smic_annual_custom_monthly", () => {
    // smicHourly * param * 12 — param = heures/mois
    it("decorates with correct annual value (param = heures/mois)", () => {
      // 12 * 100 * 12 = 14 400 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_monthly" data-challenger-parameter="100">1 000,00 €</span></p>',
        12
      );
      const wrapper = findComputedWrapper(editor);
      expect(wrapper).not.toBeNull();
      expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
        /14.+400,00/
      );
    });

    it("does not decorate when reference is lower than original", () => {
      // 12 * 10 * 12 = 1 440 € < 2 000 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_monthly" data-challenger-parameter="10">2 000,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });

    it("does not decorate when parameter is missing", () => {
      // param absent → computeChallengerReference retourne 0 → pas de décoration
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_monthly">500,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });

    it("does not decorate when parameter is invalid", () => {
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_monthly" data-challenger-parameter="abc">500,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });
  });

  describe("smic_annual_custom_week", () => {
    // smicHourly * param * 52 — param = heures/semaine
    it("decorates with correct annual value (param = heures/semaine)", () => {
      // 12 * 35 * 52 = 21 840 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_week" data-challenger-parameter="35">1 000,00 €</span></p>',
        12
      );
      const wrapper = findComputedWrapper(editor);
      expect(wrapper).not.toBeNull();
      expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
        /21.+840,00/
      );
    });

    it("does not decorate when reference is lower than original", () => {
      // 12 * 5 * 52 = 3 120 € < 5 000 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_week" data-challenger-parameter="5">5 000,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });

    it("does not decorate when parameter is missing", () => {
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_week">500,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });

    it("does not decorate when parameter is invalid", () => {
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_annual_custom_week" data-challenger-parameter="abc">500,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });
  });

  describe("smic_monthly_percent", () => {
    // référence = smicHoraire * HOURS_PER_MONTH (≈151,67) * param/100
    it("decorates with XX% of the monthly 35h SMIC", () => {
      // 12 * 151,6667 * 120/100 ≈ 2 184 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_monthly_percent" data-challenger-parameter="120">1 000,00 €</span></p>',
        12
      );
      const wrapper = findComputedWrapper(editor);
      expect(wrapper).not.toBeNull();
      expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
        /2.+184,00/
      );
    });

    it("accepts a decimal percentage", () => {
      // 12 * 151,6667 * 150,5/100 ≈ 2 739 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_monthly_percent" data-challenger-parameter="150.5">1 000,00 €</span></p>',
        12
      );
      const wrapper = findComputedWrapper(editor);
      expect(wrapper).not.toBeNull();
      expect(wrapper?.getAttribute("data-challenger-computed")).toMatch(
        /2.+739/
      );
    });

    it("does not decorate when reference is lower than original", () => {
      // 12 * 151,6667 * 50/100 ≈ 910 € < 2 000 €
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_monthly_percent" data-challenger-parameter="50">2 000,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });

    it("does not decorate when the percentage parameter is missing", () => {
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_monthly_percent">500,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });

    it("does not decorate when the percentage parameter is invalid", () => {
      const editor = createEditor(
        '<p><span data-challenger-formula="smic_monthly_percent" data-challenger-parameter="abc">500,00 €</span></p>',
        12
      );
      expect(findComputedWrapper(editor)).toBeNull();
    });
  });
});

describe("detectSmicPercentage", () => {
  it.each([
    ["1 800 € (120% du SMIC)", "120"],
    ["(120 % du Smic)", "120"],
    ["120% du SMIC", "120"],
    ["rémunération à 105,5% du smic", "105.5"],
    ["1 800 € (120 % du SMIC) garanti", "120"],
    ["130% du SMIC mensuel", "130"],
    ["120% du SMIC, soit le minimum", "120"],
  ])("extracts the percentage from %p", (input, expected) => {
    expect(detectSmicPercentage(input)).toBe(expected);
  });

  it.each([
    ["a bare percentage without 'du SMIC'", "120%"],
    ["'du SMIC' without a percentage", "valeur du SMIC"],
    ["a plain amount", "1 800 euros"],
    ["empty text", ""],
    ["a 'SMIC horaire' qualifier (different base)", "120% du SMIC horaire"],
    ["a 'SMIC annuel' qualifier (different base)", "130% du SMIC annuel"],
  ])("returns null for %s", (_label, input) => {
    expect(detectSmicPercentage(input)).toBeNull();
  });
});

describe("detectAmountsInRange — '% du SMIC' prefill", () => {
  const detectAll = (editor: Editor) =>
    detectAmountsInRange(editor, 0, editor.state.doc.content.size);

  it("prefills the percentage formula when an amount is followed by '(XX% du SMIC)'", () => {
    const editor = createEditor("<p>1 800 € (120% du SMIC)</p>");
    const amounts = detectAll(editor);
    expect(amounts).toHaveLength(1);
    expect(amounts[0].formula).toBe("smic_monthly_percent");
    expect(amounts[0].parameter).toBe("120");
  });

  it("detects the percentage when written inside a table cell", () => {
    const editor = createTableEditor(
      "<table><tbody><tr><td>1 800 € (120% du SMIC)</td></tr></tbody></table>"
    );
    const withPct = detectAll(editor).find(
      (a) => a.formula === "smic_monthly_percent"
    );
    expect(withPct).toBeDefined();
    expect(withPct?.parameter).toBe("120");
  });

  it("leaves the formula empty for an amount without a percentage mention", () => {
    const editor = createEditor("<p>1 800 €</p>");
    const amounts = detectAll(editor);
    expect(amounts).toHaveLength(1);
    expect(amounts[0].formula).toBe("");
    expect(amounts[0].parameter).toBe("");
  });

  it("associates the percentage only with the nearest preceding amount", () => {
    // The "130% du SMIC" qualifies the 2 000 € salary, NOT the 500 € prime that
    // sits before it — the prime must stay unchallenged.
    const editor = createEditor(
      "<p>Prime de 500 € versée. Salaire 2 000 € soit 130% du SMIC</p>"
    );
    const amounts = detectAll(editor);
    expect(amounts).toHaveLength(2);
    const prime = amounts.find((a) => a.rawText.includes("500"));
    const salaire = amounts.find((a) => a.rawText.includes("2"));
    expect(prime?.formula).toBe("");
    expect(salaire?.formula).toBe("smic_monthly_percent");
    expect(salaire?.parameter).toBe("130");
  });

  it("does not associate the percentage across an intervening amount in another cell", () => {
    const editor = createTableEditor(
      "<table><tbody><tr><td>1 200 €</td><td>2 000 € soit 130% du SMIC</td></tr></tbody></table>"
    );
    const amounts = detectAll(editor);
    const first = amounts.find((a) => a.rawText.includes("1"));
    expect(first?.formula).toBe("");
  });

  it("does not prefill for a non-monthly 'du SMIC horaire' mention", () => {
    const editor = createEditor("<p>12 € (120% du SMIC horaire)</p>");
    const amounts = detectAll(editor);
    expect(amounts).toHaveLength(1);
    expect(amounts[0].formula).toBe("");
  });
});
