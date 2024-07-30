import { ConfirmModal } from "../../common/components/modals/ConfirmModal";
import DocumentList from "./document-list";
import React, { useEffect, useState } from "react";
import { useDocumentsQuery } from "../document.query";
import { ShortHasuraDocument } from "@socialgouv/cdtn-types";

export type ConfirmModalProps = {
  open: boolean;
  name: "Prod" | "Pre-Prod";
  onClose: () => void;
  onCancel: () => void;
  onValidate: () => void;
  date: Date;
};

export function ShowDocumentsToUpdateModal({
  open,
  name,
  onClose,
  onCancel,
  onValidate,
  date,
}: ConfirmModalProps): JSX.Element {
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [docsToUpdate] = useState<ShortHasuraDocument<any>[]>([]);
  const docs = useDocumentsQuery({ date });

  useEffect(() => {
    setIsLoadingDocs(false);
  }, [docsToUpdate]);

  return (
    <ConfirmModal
      open={open}
      title={`Mise à jour de la ${name}`}
      message={
        <div>
          <p>Êtes-vous sur de vouloir mettre à jour la {name} ?</p>
          <DocumentList
            docs={docs}
            isLoadingDocs={isLoadingDocs}
          ></DocumentList>
        </div>
      }
      onClose={onClose}
      onCancel={onCancel}
      onValidate={onValidate}
    />
  );
}
