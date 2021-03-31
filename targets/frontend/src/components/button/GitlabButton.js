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
  pipelines(env: $env) {
    message
    status
  }
}
`;

export function GitlabButton({ env, children }) {
  const [status, setStatus] = useState("disabled");
  const client = useClient();
  const { error, data, mutate } = useSWR(pipelineQuery, (query) =>
    client
      .query(query, {
        requestPolicy: "cache-and-network",
      })
      .toPromise()
      .then((result) => {
        if (result.error) return Promise.reject(error);
        return result.data;
      })
  );

  function clickHandler() {
    if (isDisabled) {
      return;
    }
    setStatus("pending");
    client.mutation(pipelineMutation, { env }).subscribe((result) => {
      if (result.data) {
        mutate(pipelineQuery);
      }
    });
  }

  useEffect(() => {
    if (!error && data) {
      if (data[env] === false) {
        setStatus("ready");
      }
      if (data[env] === true) {
        setStatus("pending");
      }
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
