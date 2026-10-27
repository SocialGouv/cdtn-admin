import { useState } from "react";
import type { AlertColor } from "@mui/material";

import { useQuestionTemplateAnswers } from "./templateReset.query";
import { useTemplateResetMutation } from "./templateReset.mutation";
import { TemplateResetBlock } from "./TemplateResetBlock";
import { SnackBar } from "src/components/utils/SnackBar";

type TemplateResetProps = {
  questionId: string;
  /** Template actuel (valeur du champ « template_answer » du formulaire) */
  template: string | undefined;
  disabled?: boolean;
};

export const TemplateReset = ({
  questionId,
  template,
  disabled = false,
}: TemplateResetProps): JSX.Element | null => {
  const { answers, fetching, refetch } = useQuestionTemplateAnswers(questionId);
  const resetMutation = useTemplateResetMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const handleReset = async (ids: string[]) => {
    try {
      await resetMutation(ids, template);
      refetch();
      setSnack({ open: true, severity: "success", message: "Réinitialisé" });
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: `Erreur: ${e.message}`,
      });
    }
  };

  return (
    <>
      <TemplateResetBlock
        answers={fetching ? [] : answers}
        template={template}
        disabled={disabled}
        onReset={handleReset}
      />
      <SnackBar snack={snack} setSnack={setSnack} />
    </>
  );
};
