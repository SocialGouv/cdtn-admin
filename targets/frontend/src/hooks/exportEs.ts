import { Environment, ExportEsStatus } from "@shared/types";
import { useState } from "react";
import { serializeError } from "serialize-error";

type ExportEsState = {
  error: Error | null;
  exportData: ExportEsStatus[];
  hasGetExportError: boolean;
  isGetExportLoading: boolean;
  latestExportProduction: ExportEsStatus | null;
  latestExportPreproduction: ExportEsStatus | null;
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
    latestExportPreproduction: null,
    latestExportProduction: null,
  });

  const getExportEs = () => {
    setState((state) => ({
      ...state,
      error: null,
      hasGetExportError: false,
      isGetExportLoading: true,
    }));
    fetch("/api/export")
      .then(async (response) => {
        return response.status === 500
          ? Promise.reject(await response.json())
          : response.json();
      })
      .then((data) => {
        setState((state) => ({
          ...state,
          exportData: data[0],
          isGetExportLoading: false,
          latestExportPreproduction: data[1].preproduction,
          latestExportProduction: data[1].production,
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
    fetch("api/export", {
      body: JSON.stringify({
        environment,
        userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then(async (response) => {
        return response.status === 500
          ? Promise.reject(await response.json())
          : response.json();
      })
      .then((data) => {
        setState((state) => ({
          ...state,
          ...Object.assign(
            {},
            environment === Environment.preproduction
              ? { latestExportPreproduction: data }
              : { latestExportProduction: data }
          ),
          exportData: [...state.exportData, data],
        }));
      })
      .catch((error) => {
        setState((state) => ({
          ...state,
          error: serializeError(error),
        }));
      });
  };

  return [state, getExportEs, runExportEs];
}
