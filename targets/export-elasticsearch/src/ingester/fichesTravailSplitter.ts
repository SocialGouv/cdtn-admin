function splitArticle(article: any) {
  const { cdtnId, title, id, isPublished, excludeFromSearch, slug } = article;
  let prefixTitle = title;
  // extract accronyms inside parenthesis
  // Contrat de sécurisation professionnelle (CSP)
  const [, acronym = ""] = title.match(/\((.+)\)/) || [];
  // If there is only one opening parenthesis, assume that the value between parenthesis
  // is an acronym: use it as the prefix.
  // and sometimes accronyms can be followed by text
  if (title.split("(").length === 2 && acronym === acronym.toUpperCase()) {
    prefixTitle = acronym + title.slice(title.indexOf(")") + 1);
  } else if (title.indexOf(":") > -1) {
    // Otherwise use the part before the first colon.
    [prefixTitle] = title.split(/:/);
  }

  const patterns = [
    "5 questions réponses sur ",
    "5 questions sur ",
    "5 questions-réponses sur ",
    "5 questions/réponses sur ",
  ];
  for (const pattern of patterns) {
    prefixTitle = prefixTitle.replace(pattern, "");
  }
  prefixTitle = prefixTitle.replace(/\s+/g, " ").trim();
  return article.sections
    .filter(isUnusedSection)
    .map(
      ({
        anchor,
        description,
        html,
        text,
        references,
        title: sectionTitle,
      }: {
        anchor: string;
        description: string;
        html: string;
        text: string;
        references: any[];
        title: string;
      }) => {
        const transformedSectionTitle = transformSectionTitle({
          prefixTitle,
          sectionTitle,
        });
        return {
          anchor,
          cdtnId,
          description,
          excludeFromSearch,
          html,
          id: id + (anchor ? `#${anchor}` : ""),
          isPublished,
          references,
          slug: `${slug}${anchor ? `#${anchor}` : ""}`,
          text,
          title: transformedSectionTitle,
        };
      },
    );
}

function isUnusedSection({ title }: { title: string }) {
  return (
    !/L.INFO EN PLUS/i.test(title) &&
    !/POUR ALLER PLUS LOIN/i.test(title) &&
    !/LIRE EN COMPLÉMENT/i.test(title) &&
    !/DOCUMENTS À TÉLÉCHARGER/i.test(title) &&
    !/TEXTES DE RÉFÉRENCE/i.test(title)
  );
}

function transformSectionTitle({
  sectionTitle: title,
  prefixTitle,
}: {
  sectionTitle: string;
  prefixTitle: string;
}) {
  // Remove '1)', '2)', '3)' etc.
  let sectionTitle = title.replace(/\d\)/, "");

  //Remove 'Question 1 : ', 'Question 2 : ' etc.
  sectionTitle = sectionTitle.replace(/question\s?\d\s?:?\s?/i, "");
  // add the prefix, only if it is not present in the sectionTitle
  // and if sectionTitle doesn't contains ":" ( there is already a prefix)
  if (sectionTitle && sectionTitle.indexOf(prefixTitle) === -1) {
    sectionTitle = `${prefixTitle} : ${sectionTitle.toLowerCase()}`;
  }

  // replace multiple spaces by a single space.
  sectionTitle = sectionTitle.replace(/\s+/g, " ").trim();

  return sectionTitle
    .trim()
    .replace(/^\w/, (value: string) => value.toUpperCase());
}

export { splitArticle };
