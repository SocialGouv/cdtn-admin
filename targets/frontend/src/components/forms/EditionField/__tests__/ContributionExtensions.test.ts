import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

import { Highlight, Variable } from "../extensions";
import { hasHighlightStyle } from "../extensions/Highlight";

const createEditor = (content: string, withHighlight = true) =>
  new Editor({
    content,
    extensions: [
      StarterKit,
      ...(withHighlight ? [Highlight] : []),
      Variable.configure({ values: { agreement_name: "Banque" } }),
    ],
  });

describe("Highlight", () => {
  it("produit une balise <mark>", () => {
    const editor = createEditor("<p>un passage</p>");
    editor.commands.selectAll();
    editor.commands.setHighlight();
    expect(editor.getHTML()).toBe("<p><mark>un passage</mark></p>");
  });

  it.each([
    ['<p><span style="background:yellow">à relire</span></p>'],
    ['<p><span style="background-color:#FFFF00">à relire</span></p>'],
    ['<p><span style="mso-highlight:yellow">à relire</span></p>'],
    ['<p><mark style="background:yellow">à relire</mark></p>'],
  ])("conserve le surlignage collé depuis Word : %s", (html) => {
    const editor = createEditor(html);
    expect(editor.getHTML()).toBe("<p><mark>à relire</mark></p>");
  });

  it.each([
    ['<p><span style="background:white">texte</span></p>'],
    ['<p><span style="background:#FFFFFF">texte</span></p>'],
    ['<p><span style="color:red">texte</span></p>'],
  ])("ignore un fond blanc ou une couleur de texte : %s", (html) => {
    const editor = createEditor(html);
    expect(editor.getHTML()).toBe("<p>texte</p>");
  });

  it("supprime le surlignage quand l'extension n'est pas activée", () => {
    const editor = createEditor(
      '<p><span style="background:yellow">à relire</span> et <mark>ceci</mark></p>',
      false
    );
    expect(editor.getHTML()).toBe("<p>à relire et ceci</p>");
  });

  it("détecte les styles de surlignage", () => {
    expect(hasHighlightStyle("background: yellow; color: red")).toBe(true);
    expect(hasHighlightStyle("color: red")).toBe(false);
    expect(hasHighlightStyle(null)).toBe(false);
  });
});

describe("Variable", () => {
  it("insère la variable et produit le HTML attendu (clé, jamais la valeur)", () => {
    const editor = createEditor("<p>La convention</p>");
    editor.commands.focus("end");
    editor.commands.insertVariable("agreement_name");
    expect(editor.getHTML()).toBe(
      '<p>La convention<span data-variable="agreement_name" class="variable">Nom de la CC</span></p>'
    );
  });

  it("relit une variable existante", () => {
    const html =
      '<p><span data-variable="agreement_name" class="variable">Nom de la CC</span></p>';
    const editor = createEditor(html);
    expect(editor.getHTML()).toBe(html);
  });

  it("ignore une variable inconnue", () => {
    const editor = createEditor(
      '<p>a <span data-variable="inconnue">x</span></p>'
    );
    expect(editor.getHTML()).not.toContain("data-variable");
  });
});
