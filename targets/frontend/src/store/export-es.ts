import { serializeError } from "serialize-error";
import create from "zustand";
import { combine } from "zustand/middleware";

const URL_EXPORT_ES_PREPRODUCTION =
  process.env.NEXT_PUBLIC_EXPORT_ES_PREPRODUCTION ?? "http://localhost:8787";

const URL_EXPORT_ES_PRODUCTION =
  process.env.NEXT_PUBLIC_EXPORT_ES_PRODUCTION ?? "http://localhost:8787";

//TODO: est-ce que ça vaut le coup de partager les types entre le front et l'api
export enum Environment {
  production = "production",
  preproduction = "preproduction",
}

export enum Status {
  running = "running",
  completed = "completed",
  failed = "failed",
  timeout = "timeout",
}

export const useExportEsStore = create(
  combine(
    {
      error: null,
      exportData: [],
      hasGetExportError: false,
      isGetExportLoading: false,
      isRunning: false,
      lastStatusPreproduction: Status.completed,
      lastStatusProduction: Status.completed,
    },
    (set) => ({
      getExportEs: () => {
        set((state) => ({
          ...state,
          error: null,
          hasGetExportError: false,
          isGetExportLoading: true,
        }));
        fetch(URL_EXPORT_ES_PRODUCTION + "/export")
          .then((response) => response.json())
          .then((data) => {
            set((state) => ({
              ...state,
              exportData: data,
              isGetExportLoading: false,
            }));
          })
          .catch((error) => {
            set((state) => ({
              ...state,
              error: serializeError(error),
              hasGetExportError: true,
              isGetExportLoading: false,
            }));
          });
      },
      runExportEs: (environment: Environment, userId: string) => {
        const url =
          environment === Environment.preproduction
            ? URL_EXPORT_ES_PREPRODUCTION
            : URL_EXPORT_ES_PRODUCTION;
        fetch(url + "/export", {
          body: JSON.stringify({
            environment,
            userId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })
          .then((response) => {
            set((state) => ({
              ...state,
              isProductionRunning: false,
            }));
          })
          .catch((error) => {
            set((state) => ({
              ...state,
              isProductionRunning: false,
            }));
          });
      },
    })
  )
);
