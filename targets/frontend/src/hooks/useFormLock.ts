import React, { useRef, useState } from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";

type Action = "save" | "publish";

/**
 * Verrou partagé par la sauvegarde et la publication d'un formulaire : il est
 * posé de façon synchrone, avant tout `await` (validation comprise), pour
 * qu'un double clic ne déclenche jamais deux envois.
 */
export const useFormLock = () => {
  const lockedRef = useRef(false);
  const [running, setRunning] = useState<Action>();

  /**
   * Lance `action` si aucune autre n'est en cours. Avec `holdOnSuccess`, le
   * verrou est conservé quand `action` renvoie autre chose que `false` : à la
   * création, la navigation vers le contenu créé est en cours.
   */
  const run = async (
    name: Action,
    action: () => Promise<boolean | void>,
    { holdOnSuccess = false }: { holdOnSuccess?: boolean } = {}
  ): Promise<void> => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setRunning(name);
    let hold = false;
    try {
      const result = await action();
      hold = holdOnSuccess && result !== false;
    } finally {
      if (!hold) {
        lockedRef.current = false;
        setRunning(undefined);
      }
    }
  };

  /**
   * Gestionnaire `onSubmit` du `<form>` : valide puis appelle `onValid` sous
   * le verrou. `onValid` renvoie `false` quand l'enregistrement a échoué.
   */
  const submit =
    <T extends FieldValues>(
      handleSubmit: UseFormHandleSubmit<T>,
      onValid: (data: T) => Promise<boolean | void>,
      options?: { holdOnSuccess?: boolean }
    ) =>
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void run(
        "save",
        async () => {
          let saved: boolean | void = false;
          await handleSubmit(async (data) => {
            saved = (await onValid(data)) ?? true;
          })(event);
          return saved;
        },
        options
      );
    };

  return {
    run,
    submit,
    saving: running === "save",
    publishing: running === "publish",
    busy: running !== undefined,
  };
};
