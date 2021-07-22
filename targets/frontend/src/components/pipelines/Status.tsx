/** @jsxImportSource theme-ui */

import { memo, useEffect } from "react";
import { MdTimelapse } from "react-icons/md";
import useSWR from "swr";
import { Box, Flex, Text } from "theme-ui";
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

  if (error) {
    return <span>Erreur</span>;
  }

  return getPipelineStatusLabel(data?.pipelineStatus.status);
}
export const Status = memo(StatusComponent);

export function getPipelineStatusLabel(status: string): JSX.Element {
  if (!status) {
    return (
      <Flex sx={{ alignItems: "center" }}>
        <span>En cours</span> <MdTimelapse sx={{ mb: "-.3rem", ml: ".4rem" }} />
      </Flex>
    );
  }
  switch (status) {
    case "success":
    case "passed":
      return (
        <Box as="span" color="positive">
          Succés
        </Box>
      );
    case "canceled":
      return (
        <Box as="span" color="muted">
          Annulé
        </Box>
      );
    case "created":
    case "pending":
    case "running":
      return (
        <Flex sx={{ alignItems: "center" }}>
          <span>En cours</span>{" "}
          <MdTimelapse sx={{ mb: "-.2rem", ml: ".3rem" }} />
        </Flex>
      );
    case "failed":
      return (
        <Box as="span" color="critical">
          Erreur
        </Box>
      );
    default:
      return <Box as="span">{status}</Box>;
  }
}
