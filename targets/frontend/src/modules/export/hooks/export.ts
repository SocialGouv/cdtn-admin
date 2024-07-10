import { Environment, ExportEsStatus, Status } from "@socialgouv/cdtn-types";
import { Session } from "next-auth";
import { useState } from "react";
import { serializeError, ErrorObject } from "serialize-error";

type ExportEsState = {
  error: ErrorObject | null;
  exportData: ExportEsStatus[];
  hasGetExportError: boolean;
  isGetExportLoading: boolean;
  latestExportProduction: ExportEsStatus | null;
  latestExportPreproduction: ExportEsStatus | null;
};

export function useExportEs(): [
  ExportEsState,
  (hideLoader: boolean) => void,
  (environment: Environment, user: Session["user"]) => void,
  (env: Environment) => Date
] {
  const [state, setState] = useState<ExportEsState>({
    error: null,
    exportData: [],
    hasGetExportError: false,
    isGetExportLoading: false,
    latestExportPreproduction: null,
    latestExportProduction: null,
  });

  const getExportEs = (hideLoader: boolean) => {
    setState((state) => ({
      ...state,
      error: null,
      hasGetExportError: false,
      isGetExportLoading: hideLoader ? false : true,
    }));
    fetch("/api/export")
      .then((response) => {
        if (!response.ok) {
          return Promise.reject("Error fetching export data");
        }
        return response.json();
      })
      .then((data) => {
        setState((state) => ({
          ...state,
          exportData: data[0],
          isGetExportLoading: false,
          latestExportPreproduction: data[1].preproduction,
          latestExportProduction: data[1].production,
          error: null,
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

  const getLatestDeployDate = (env: Environment) => {
    const lastestCompleted = state?.exportData.filter(
      (data) => data.status === Status.completed && data.environment === env
    )[0];

    return lastestCompleted?.created_at;
  };

  const runExportEs = (environment: Environment, user: Session["user"]) => {
    const newExportEs: ExportEsStatus = {
      created_at: new Date(),
      environment,
      id: "0",
      status: Status.running,
      updated_at: new Date(),
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
      user_id: user.id,
    };
    setState((state) => ({
      ...state,
      exportData: [newExportEs, ...state.exportData],
      ...Object.assign(
        environment === Environment.preproduction
          ? { latestExportPreproduction: newExportEs }
          : { latestExportProduction: newExportEs },
        {}
      ),
    }));
    fetch("api/export", {
      body: JSON.stringify({
        environment,
        userId: user.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then(async (response) => {
        if (!response.ok) {
          const errors = await response.json();
          return Promise.reject(errors.error);
        }
        return response.json();
      })
      .catch((error) => {
        setState((state) => ({
          ...state,
          error: serializeError(error),
          ...Object.assign(
            {},
            environment === Environment.preproduction
              ? {
                  latestExportPreproduction: {
                    ...newExportEs,
                    status: Status.failed,
                  },
                }
              : {
                  latestExportProduction: {
                    ...newExportEs,
                    status: Status.failed,
                  },
                }
          ),
          exportData: state.exportData.map((x) =>
            x.id === "0" ? { ...x, status: Status.failed } : x
          ),
        }));
      });
  };

  return [state, getExportEs, runExportEs, getLatestDeployDate];
}
