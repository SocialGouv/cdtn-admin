/** @jsx jsx  */
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  MdDoNotDisturbAlt,
  MdLoop,
  MdSyncProblem,
  MdTimelapse,
} from "react-icons/md";
import { getToken } from "src/lib/auth/token";
import { request } from "src/lib/request";
import useSWR from "swr";
import { jsx } from "theme-ui";

import { ConfirmButton } from "../confirmButton";

function fetchPipelines(url, token) {
  return request(url, { headers: { token } });
}

export function GitlabButton({ env, children }) {
  const [errorCount, setErrorCount] = useState(0);
  const [status, setStatus] = useState("disabled");
  const { error, data, mutate } = useSWR(
    () => (errorCount < 3 ? "/api/pipelines" : null),
    fetchPipelines
  );

  if (error) {
    setStatus("disabled");
    setErrorCount(errorCount + 1);
    setTimeout(() => mutate("/api/pipelines"), 2000);
  }

  if (errorCount >= 3) {
    setStatus("error");
  }

  async function clickHandler() {
    if (isDisabled) {
      console.log("no no ");
      return;
    }
    setStatus("pending");
    await request("/api/trigger_pipeline", {
      body: {
        env,
      },
      headers: {
        token: getToken()?.jwt_token,
      },
    }).catch(() => {
      setStatus("disable");
    });
    mutate("/api/pipelines");
  }

  useEffect(() => {
    if (!error && data) {
      if (data[env] === false) {
        console.log(env, "ready to update", data);
        setStatus("ready");
      }
      if (data[env] === true) {
        setStatus("pending");
      }
    }
  }, [env, data, error]);

  const isDisabled = status === "disabled" || status === "pending" || "error";
  return (
    <ConfirmButton disabled={isDisabled} onClick={clickHandler}>
      {status === "pending" && <MdTimelapse />}
      {status === "ready" && <MdLoop />}
      {status === "disabled" && <MdDoNotDisturbAlt />} {children}
      {status === "error" && <MdSyncProblem />} {children}
    </ConfirmButton>
  );
}

GitlabButton.propTypes = {
  children: PropTypes.node,
  env: PropTypes.string,
};
