import { Client } from "@urql/core/dist/types/client";
import { AlertChanges, AlertInfo, HasuraAlert } from "@shared/types";
import { batchPromises } from "../batchPromises";
import { DaresAlertInsert } from "../dares/types";

const insertAlertsMutation = `
mutation insert_alert($alert: alerts_insert_input!) {
  alert: insert_alerts_one(object: $alert,  on_conflict: {
    constraint: alerts_ref_info_key,
    update_columns: [changes]
  }) {
    repository,
    ref
    info
  }
}
`;

interface InsertAlertData {
  alert: {
    repository: string;
    ref: string;
    info: AlertInfo;
  };
}

export class AlertRepository {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async saveAlertDares(data: DaresAlertInsert) {
    const result = await this.client
      .mutation<InsertAlertData>(insertAlertsMutation, {
        alert: data,
      })
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error("insertAlert");
    }
    return result.data.alert;
  }

  async saveAlertChanges(repository: string, alertChanges: AlertChanges[]) {
    const inserts = await batchPromises(
      alertChanges,
      async (diff) => this.insertAlert(repository, diff),
      5
    );
    inserts.forEach((insert) => {
      if (insert.status === "fulfilled") {
        const { ref, repository: repo, info } = insert.value;
        console.log(`insert alert for ${ref} on ${repo} (${info.id})`);
      }
    });

    const rejectedInsert = inserts.filter(
      ({ status }) => status === "rejected"
    );

    if (rejectedInsert.length) {
      console.error(
        `${rejectedInsert.length} alerts failed to insert in ${repository}`
      );
      process.exit(1);
    }
  }

  private async insertAlert(
    repository: string,
    changes: AlertChanges
  ): Promise<Pick<HasuraAlert, "info" | "ref" | "repository">> {
    const alert: Pick<
      HasuraAlert,
      "changes" | "created_at" | "info" | "ref" | "repository"
    > = {
      changes,
      created_at: changes.date,
      info: { id: changes.type === "dila" ? changes.id : changes.title },
      ref: changes.ref,
      repository,
    };

    const result = await this.client
      .mutation<InsertAlertData>(insertAlertsMutation, { alert })
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error("insertAlert");
    }
    return result.data.alert;
  }
}
