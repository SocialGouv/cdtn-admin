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

function fetchPipelines(url) {
  const { jwt_token } = getToken();
  return request(url, { headers: { token: jwt_token } });
}

export function GitlabButton({ env, children }) {
  const [errorCount, setErrorCount] = useState(0);
  const [status, setStatus] = useState("disabled");
  const token = getToken();
  const { error, data, isValidating, mutate } = useSWR(
    `/api/pipelines`,
    fetchPipelines
  );

  console.log("swr", { data, error, isValidating });

  useEffect(() => {
    if (error && errorCount < 3) {
      console.log("inc errro count", errorCount);
      setErrorCount(errorCount + 1);
    }
  }, [error, errorCount, setErrorCount]);

  useEffect(() => {
    console.log("udpate status ", errorCount);
    if (errorCount < 3) {
      setStatus("disabled");
    } else {
      setStatus("error");
    }
  }, [setStatus, errorCount]);

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
        token: token?.jwt_token,
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
      {status === "disabled" && <MdDoNotDisturbAlt />}
      {status === "error" && <MdSyncProblem />} {children}
    </ConfirmButton>
  );
}

GitlabButton.propTypes = {
  children: PropTypes.node,
  env: PropTypes.string,
};
