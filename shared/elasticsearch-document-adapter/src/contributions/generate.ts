export function generateContributions(contributions: any | Contributions) {
  const contributions = await getDocumentBySource<ContributionCompleteDoc>(
    SOURCES.CONTRIBUTIONS,
    getBreadcrumbs
  );

  // fds

  const ccnData = await getDocumentBySource<AgreementDoc>(SOURCES.CCN);

  const ccnListWithHighlightFiltered = ccnData.filter((ccn) => {
    return ccn.highlight;
  });
  const ccnListWithHighlight = ccnListWithHighlightFiltered.reduce(
    (acc: any, curr: any) => {
      acc[curr.num] = curr.highlight;
      return acc;
    },
    {}
  );

  const breadcrumbsOfRootContributionsPerIndex = contributions.reduce(
    (state: any, contribution: any) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.index] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  yield {
    documents: contributions.map(
      ({ answers, breadcrumbs, ...contribution }: any) => {
        const newAnswer = answers;
        if (newAnswer.conventions) {
          newAnswer.conventions = answers.conventions.map((answer: any) => {
            const highlight = ccnListWithHighlight[parseInt(answer.idcc)];
            return {
              ...answer,
              ...(highlight ? { highlight } : {}),
            };
          });
        }

        if (newAnswer.conventionAnswer) {
          const highlight =
            ccnListWithHighlight[parseInt(newAnswer.conventionAnswer.idcc)];
          if (highlight) {
            newAnswer.conventionAnswer = {
              ...newAnswer.conventionAnswer,
              highlight,
            };
          }
        }
        const obj = addGlossaryToAllMarkdownField({
          ...contribution,
          answers: {
            ...newAnswer,
          },
          breadcrumbs:
            breadcrumbs.length > 0
              ? breadcrumbs
              : breadcrumbsOfRootContributionsPerIndex[contribution.index],
        });
        return obj;
      }
    ),
    source: SOURCES.CONTRIBUTIONS,
  };
}