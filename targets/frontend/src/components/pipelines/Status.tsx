import { memo, useEffect } from "react";
import useSWR from "swr";
import { useMutation, useQuery } from "urql";

export const getPipelineStatusQuery = `
query getPipelineStatus ($pipelineId: String!) {
  pipelineStatus: pipeline_status(pipelineId: $pipelineId) { id, status }
}
`;
export const updatePipelineStatusMutation = `
mutation updatePipelines($status:String!, $pipelineId: String!) {
  update_pipelines(
    where: {pipeline_id: {_eq: $pipelineId }} 
    _set: { status: $status }) {
    returning { id }
  }
}`;

type StatusProp = {
  pipelineId: string;
  initialStatus: string;
};

function StatusComponent({
  pipelineId,
  initialStatus,
}: StatusProp): JSX.Element | null {
  const [result, executeQuery] = useQuery({
    pause: true,
    query: getPipelineStatusQuery,
    requestPolicy: "network-only",
    variables: { pipelineId },
  });

  const [, updateStatus] = useMutation(updatePipelineStatusMutation);

  useSWR("pipelinesQuery", () => executeQuery());

  const { data, error } = result;

  useEffect(() => {
    if (
      data &&
      data.pipelineStatus &&
      data?.pipelineStatus.status !== initialStatus
    ) {
      updateStatus({ pipelineId, status: data.pipelineStatus.status });
    }
  }, [data, initialStatus, updateStatus, pipelineId]);

  if (error || !data) {
    return <span>{"en cours"}</span>;
  }

  return <span>{data?.pipelineStatus.status}</span>;
}

export const Status = memo(StatusComponent);
