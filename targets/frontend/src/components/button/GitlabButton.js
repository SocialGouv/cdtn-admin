/** @jsx jsx  */
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { MdDoNotDisturbAlt, MdLoop, MdTimelapse } from "react-icons/md";
import { request } from "src/lib/request";
import useSWR from "swr";
import { jsx } from "theme-ui";

import { ConfirmButton } from "../confirmButton";

export function GitlabButton({ env, children }) {
  const [status, setStatus] = useState("disabled");
  const { error, data, mutate } = useSWR("/api/pipelines");

  if (error) {
    setStatus("disabled");
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

  const isDisabled = status === "disabled" || status === "pending";
  return (
    <ConfirmButton disabled={isDisabled} onClick={clickHandler}>
      {status === "pending" && <MdTimelapse />}
      {status === "ready" && <MdLoop />}
      {status === "disabled" && <MdDoNotDisturbAlt />} {children}
    </ConfirmButton>
  );
}

GitlabButton.propTypes = {
  children: PropTypes.node,
  env: PropTypes.string,
};
