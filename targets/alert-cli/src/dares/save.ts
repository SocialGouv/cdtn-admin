import { AlertRepository } from "../repositories/AlertRepository";
import { DaresAlertInsert, Diff } from "./types";
import { gqlClient } from "@shared/utils";

export const saveDiff = async (diff: Diff) => {
  const alertRepository = new AlertRepository(gqlClient());

  const alertsRemovedToSave: DaresAlertInsert[] = diff.exceedingAgreements.map(
    (agreement) => ({
      info: {
        id: agreement.num,
      },
      status: "todo",
      repository: "dares",
      ref: "v0",
      changes: {
        type: "dares",
        title: agreement.name,
        ref: agreement.num.toString(),
        date: new Date(),
        modified: [],
        removed: [
          {
            name: agreement.name,
            num: agreement.num,
          },
        ],
        added: [],
        documents: [],
      },
    })
  );

  const alertsAddedToSave: DaresAlertInsert[] = diff.missingAgreements.map(
    (agreement) => ({
      info: {
        id: agreement.num,
      },
      status: "todo",
      repository: "dares",
      ref: "v0",
      changes: {
        type: "dares",
        title: agreement.name,
        ref: agreement.num.toString(),
        date: new Date(),
        modified: [],
        added: [
          {
            name: agreement.name,
            num: agreement.num,
          },
        ],
        removed: [],
        documents: [],
      },
    })
  );

  const alertsToSave = [...alertsAddedToSave, ...alertsRemovedToSave];

  const inserts = await Promise.allSettled(
    alertsToSave.map((alert) => alertRepository.saveAlertDares(alert))
  );

  inserts.forEach((insert) => {
    if (insert.status === "fulfilled") {
      const { ref, repository: repo, info } = insert.value;
      console.log(`insert alert for ${ref} on ${repo} (${info.id})`);
    }
  });
};
