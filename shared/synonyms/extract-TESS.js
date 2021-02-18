/*
  formattes les données TESS extraites à partir du pdf avec pdf-table-extractor (npm)
*/

const thesaurus = require("./extract.json");

const rmBreaks = (row) => row.replace(/\n/g, " ").replace(/(\s+)/g, " ").trim();

const cleanTerm = (row) =>
  row.replace(/\\n/g, " ").replace(/(\s+)/g, " ").trim();

const cleanMulti = (row) =>
  row
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

console.log(
  JSON.stringify(
    thesaurus.pageTables
      .filter((page) => page.page > 1)
      .map((page) => {
        if (page.page === 2) {
          return page.tables.slice(3);
        }
        return page.tables.slice(1);
      })
      .reduce((terms, c) => {
        terms.push(
          ...c.map((x) => ({
            equivalent: rmBreaks(x[5].trim()),
            generic: rmBreaks(x[1]),
            notes: x[4].trim(),
            related: rmBreaks(x[3].trim()),
            specific: cleanMulti(x[2]),
            term: cleanTerm(x[0]),
          }))
        );
        return terms;
      }, [])
  )
);
