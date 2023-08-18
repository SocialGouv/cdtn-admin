import { OperationContext, useQuery } from "urql";

const unseenAlertWarningQuery = `
query getUnseenAlertWarnings {
  alert_warnings(where: {seen: {_eq: false}}) {
    article
    document
    source
    createdAt: created_at
  }
}
`;

export type AlertWarning = {
  article: string;
  document: string;
  source: string;
  createdAt: string;
};

type QueryResult = {
  alert_warnings: AlertWarning[];
};

export const useUnseenAlertWarningAnswerQuery = (): [
  AlertWarning[] | undefined,
  (opts?: Partial<OperationContext>) => void
] => {
  const [result, reexecuteQuery] = useQuery<QueryResult>({
    query: unseenAlertWarningQuery,
  });
  if (!result?.data?.alert_warnings || !result?.data?.alert_warnings?.length) {
    return [undefined, reexecuteQuery];
  }
  const answer = result.data?.alert_warnings[0];
  if (!answer) {
    return [undefined, reexecuteQuery];
  }
  return [result.data.alert_warnings, reexecuteQuery];
};
