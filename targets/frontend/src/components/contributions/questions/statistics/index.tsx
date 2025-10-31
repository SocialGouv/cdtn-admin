import React from "react";

import { useQuestionSlugQuery } from "./QuestionSlug.query";
import MetabaseDashboard from "src/pages/MetabaseDashboard";

export type EditQuestionProps = {
  questionId: string;
};

export const QuestionStatistics = ({
  questionId,
}: EditQuestionProps): JSX.Element => {
  const { data: question } = useQuestionSlugQuery({ questionId });

  return (
    <>
      <MetabaseDashboard dashboardId={16} params={{ question }} />
    </>
  );
};
