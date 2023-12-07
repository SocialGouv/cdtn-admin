import { ConfirmModal } from "../../common/components/modals/ConfirmModal";
import DocumentList from "./document-list";
import React, { useEffect, useState } from "react";
import { ShortDocument } from "../../documents";
import { useDocumentsQuery } from "../document.query";

export type ConfirmModalProps = {
  open: boolean;
  name: string;
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
  const [docsToUpdate, setDocsToUpdate] = useState<ShortDocument[]>([]);
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
