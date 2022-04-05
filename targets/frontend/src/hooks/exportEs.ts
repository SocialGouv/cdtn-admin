import { Environment, ExportEsStatus, Status } from "@shared/types";
import { useState } from "react";
import { serializeError } from "serialize-error";

const URL_EXPORT_ES_PREPRODUCTION =
  process.env.NEXT_PUBLIC_EXPORT_ES_PREPRODUCTION ?? "http://localhost:8787";

const URL_EXPORT_ES_PRODUCTION =
  process.env.NEXT_PUBLIC_EXPORT_ES_PRODUCTION ?? "http://localhost:8787";

type ExportEsState = {
  error: Error | null;
  exportData: ExportEsStatus[];
  hasGetExportError: boolean;
  isGetExportLoading: boolean;
  isRunning: boolean;
  lastStatusPreproduction: Status;
  lastStatusProduction: Status;
};

export function useExportEs(): [
  ExportEsState,
  () => void,
  (environment: Environment, userId: string) => void
] {
  const [state, setState] = useState<ExportEsState>({
    error: null,
    exportData: [],
    hasGetExportError: false,
    isGetExportLoading: false,
    isRunning: false,
    lastStatusPreproduction: Status.completed,
    lastStatusProduction: Status.completed,
  });

  const getExportEs = () => {
    setState((state) => ({
      ...state,
      error: null,
      hasGetExportError: false,
      isGetExportLoading: true,
    }));
    fetch(URL_EXPORT_ES_PRODUCTION + "/export")
      .then((response) => response.json())
      .then((data) => {
        setState((state) => ({
          ...state,
          exportData: data,
          isGetExportLoading: false,
        }));
      })
      .catch((error) => {
        setState((state) => ({
          ...state,
          error: serializeError(error),
          hasGetExportError: true,
          isGetExportLoading: false,
        }));
      });
  };

  const runExportEs = (environment: Environment, userId: string) => {
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
      .then((response) => response.json())
      .then((data) => {
        setState((state) => ({
          ...state,
          exportData: data,
          isGetExportLoading: false,
        }));
      })
      .catch((error) => {
        setState((state) => ({
          ...state,
          error: serializeError(error),
          hasGetExportError: true,
          isGetExportLoading: false,
        }));
      });
  };

  return [state, getExportEs, runExportEs];
}
