const glossary = require("./glossary.json");

const entries = [];

glossary.forEach(({ title, abbrs, variants, definition, refs }) => {

  const abbreviations = abbrs.split("\n");
  if (abbreviations[0] === "") abbreviations.shift();

  entries.push({
    term: title.replace(/'/g, "’"),
    abbreviations: JSON.stringify(abbreviations).replace(/'/g, "’"),
    variants: JSON.stringify(variants).replace(/'/g, "’"),
    definition: definition.replace(/'/g, "’").replace(/<p>/g, "").replace(/<\/p>/g, ""),
    references: JSON.stringify(refs.map(ref => ref.url))
  });

});

function insertIntoGlossary({ term, abbreviations, variants, definition, references }) {
  return `('${term}','${abbreviations}','${variants}','${definition}','${references}')`;
}

console.log(`
INSERT INTO public.glossary ("term", "abbreviations", "variants", "definition", "references")
  VALUES ${entries.map(insertIntoGlossary).join(",\n")};
`);
