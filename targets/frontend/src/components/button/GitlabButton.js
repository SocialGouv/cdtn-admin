import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  MdDoNotDisturbAlt,
  MdLoop,
  MdSyncProblem,
  MdTimelapse,
} from "react-icons/md";
import useSWR from "swr";
import { useClient } from "urql";

import { ConfirmButton } from "../confirmButton";

const pipelineQuery = `
query getPipelines {
  pipelines {
    preprod
    prod
  }
}
`;

const pipelineMutation = `
mutation trigger_pipeline($env:String!) {
  trigger_pipeline(env: $env) {
    message
  }
}
`;

export function GitlabButton({ env, children }) {
  const [status, setStatus] = useState("disabled");
  const client = useClient();
  const { error, data, mutate } = useSWR(pipelineQuery, (query) => {
    return client
      .query(query, {}, { requestPolicy: "network-only" })
      .toPromise()
      .then((result) => {
        if (result.error) {
          throw result.error;
        }
        return result.data.pipelines;
      });
  });

  function clickHandler() {
    if (isDisabled) {
      return;
    }
    setStatus("pending");
    client.mutation(pipelineMutation, { env }).toPromise((result) => {
      if (result.error) {
        setStatus("error");
      }
      if (result.data) {
        mutate(pipelineQuery);
      }
    });
  }

  useEffect(() => {
    if (data?.[env] === false) {
      setStatus("ready");
    }
    if (data?.[env] === true) {
      setStatus("pending");
    }
  }, [env, data, error]);

  const isDisabled =
    status === "disabled" || status === "pending" || status === "error";

  return (
    <ConfirmButton disabled={isDisabled} onClick={clickHandler}>
      {status === "pending" && <MdTimelapse />}
      {status === "ready" && <MdLoop />}
      {status === "disabled" && <MdDoNotDisturbAlt />}
      {status === "error" && <MdSyncProblem />}
      {children}
    </ConfirmButton>
  );
}

GitlabButton.propTypes = {
  children: PropTypes.node,
  env: PropTypes.string,
};
