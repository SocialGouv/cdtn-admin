import { useState } from "react";
import type { AlertColor } from "@mui/material";
import { useSession } from "next-auth/react";

import { useQuestionAgreementAnswers } from "./templateReset.query";
import { useApplyTemplateMutation } from "./templateReset.mutation";
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
  const { data: session } = useSession();
  const { answers, fetching, refetch } =
    useQuestionAgreementAnswers(questionId);
  const applyTemplate = useApplyTemplateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const handleApply = async (ids: string[]) => {
    try {
      if (!session?.user?.id) {
        throw new Error("Utilisateur non connecté");
      }
      if (!template?.trim()) {
        throw new Error("Le template est vide");
      }
      const count = await applyTemplate(ids, template, session.user.id);
      refetch({ requestPolicy: "network-only" });
      setSnack({
        open: true,
        severity: "success",
        message: `Template appliqué à ${count} réponse${count > 1 ? "s" : ""}, remise${count > 1 ? "s" : ""} en rédaction`,
      });
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: `Erreur: ${e.message}`,
      });
      throw e;
    }
  };

  return (
    <>
      <TemplateResetBlock
        answers={fetching ? [] : answers}
        template={template}
        disabled={disabled}
        onApply={handleApply}
      />
      <SnackBar snack={snack} setSnack={setSnack} />
    </>
  );
};
