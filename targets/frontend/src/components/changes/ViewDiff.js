/** @jsxImportSource theme-ui */

import { Spinner } from "@theme-ui/components";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

export const ViewDiff = ({ sx = {}, previous, current }) => {
  const workerRef = useRef();
  const [htmlDiff, setHtmlDiff] = useState(null);
  useEffect(() => {
    workerRef.current = new Worker(new URL("./diffWorker.js", import.meta.url));
    workerRef.current.postMessage({ current, previous });
    workerRef.current.onmessage = (evt) => setHtmlDiff(evt.data);
    return () => {
      workerRef.current.terminate();
    };
  }, [current, previous]);

  return htmlDiff ? (
    <div
      sx={{
        del: { bg: "critical" },
        ins: { bg: "positive" },
        mb: "large",
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: htmlDiff }}
    />
  ) : (
    <Spinner size="16" />
  );
};

ViewDiff.defaultProps = {
  current: "",
  previous: "",
};

ViewDiff.propTypes = {
  current: PropTypes.string,
  previous: PropTypes.string,
  sx: PropTypes.object,
};
