/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { MdLoop, MdSyncProblem, MdTimelapse } from "react-icons/md";
import { Badge } from "theme-ui";
import { useClient } from "urql";

import { ConfirmButton } from "../confirmButton";

const pipelineMutation = `
mutation updatePipeline($environment:String!) {
  updatePipeline(environment: $environment) {
    id
  }
}
`;

function GitlabBtn({ environment, variant, children, pending = false }) {
  const client = useClient();
  const [status, setStatus] = useState(pending ? "pending" : "ready");
  useEffect(() => {
    setStatus(pending ? "pending" : "ready");
  }, [pending]);

  function clickHandler() {
    if (isDisabled) {
      return;
    }
    setStatus("pending");
    client
      .mutation(pipelineMutation, { environment })
      .toPromise()
      .then((result) => {
        if (result.error) {
          setStatus("error");
        }
      });
  }

  const isDisabled = status === "pending" || status === "error";
  return (
    <ConfirmButton
      disabled={isDisabled}
      onClick={clickHandler}
      variant={variant}
    >
      {status === "pending" && <MdTimelapse sx={{ mr: ".2rem" }} />}
      {status === "ready" && <MdLoop sx={{ mr: ".2rem" }} />}
      {status === "error" && <MdSyncProblem sx={{ mr: ".2rem" }} />}
      {children}
      {status === "error" && (
        <Badge bg="critical" sx={{ ml: "-3rem", mt: "-3rem" }}>
          Erreur
        </Badge>
      )}
    </ConfirmButton>
  );
}

GitlabBtn.propTypes = {
  children: PropTypes.node,
  environment: PropTypes.string,
  pending: PropTypes.bool,
  variant: PropTypes.oneOf(["primary", "secondary", "accent", "link"]),
};

export const GitlabButton = React.memo(GitlabBtn);
