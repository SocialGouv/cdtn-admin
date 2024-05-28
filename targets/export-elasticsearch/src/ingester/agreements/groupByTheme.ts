import { AnswerByTheme, ExportAnswer } from "@socialgouv/cdtn-types";

export function groupByTheme(
  contributions: (Omit<ExportAnswer, "theme"> & { theme?: string })[]
): AnswerByTheme[] {
  return contributions
    .reduce((grouped: AnswerByTheme[], answer): AnswerByTheme[] => {
      if (!answer.theme) {
        throw new Error(
          `Contribution [${answer.questionIndex}] - ${answer.slug} has no theme.`
        );
      }
      const group = grouped.find((g) => g.theme === answer.theme);
      if (group) {
        group.answers.push(answer as ExportAnswer);
      } else {
        grouped.push({ theme: answer.theme, answers: [answer as ExportAnswer] });
      }
      return grouped;
    }, [])
    .map((group) => {
      group.answers = group.answers.sort(
        (a, b) => a.questionIndex - b.questionIndex
      );
      return group;
    })
    .sort((a, b) => {
      return a.theme.localeCompare(b.theme);
    });
}
