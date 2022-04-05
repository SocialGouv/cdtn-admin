import { Environment, ExportEsStatus } from "@shared/types";
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
    const promises = [
      fetch(URL_EXPORT_ES_PRODUCTION + "/export"),
      fetch(URL_EXPORT_ES_PRODUCTION + "/export/latest"),
    ];
    Promise.all(promises)
      .then((response) => Promise.all(response.map((rep) => rep.json())))
      .then((data) => {
        data.forEach((dt) => {
          if (dt.errors) {
            throw new Error(dt.errors);
          }
        });
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
        if (data.errors) {
          throw new Error(data.errors);
        }
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
