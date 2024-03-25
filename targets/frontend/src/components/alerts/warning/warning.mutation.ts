import { OperationResult, useMutation } from "@urql/next";

const unseenAlertWarningQuery = `
mutation updateAlertWarningSeen {
  update_alert_warnings(where: {}, _set: {seen: true}) {
    affected_rows
  }
}
`;

type MutationResult = () => Promise<OperationResult>;

export const useSeenAlertWarnings = (): MutationResult => {
  const [, executeUpdate] = useMutation(unseenAlertWarningQuery);
  return executeUpdate;
};
