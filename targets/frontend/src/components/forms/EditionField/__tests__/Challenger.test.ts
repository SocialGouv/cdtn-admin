import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

import { Challenger } from "../extensions";
import { parseChallengerAmount } from "@shared/utils/build/src/challenger.utils";

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
    expect(parseChallengerAmount(input)).toBe(expected);
  });

  it.each(["", "abc", "   ", "€", "—"])(
    "returns null for unparsable input %p",
    (input) => {
      expect(parseChallengerAmount(input)).toBeNull();
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
});
