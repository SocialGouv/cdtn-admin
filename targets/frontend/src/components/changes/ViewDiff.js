import Spinner from "@mui/material/CircularProgress";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { theme } from "src/theme";
import { Box } from "@mui/material";

export const ViewDiff = ({ sx = {}, previous, current }) => {
  const workerRef = useRef();
  const [htmlDiff, setHtmlDiff] = useState(null);
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./diff.worker.js", import.meta.url)
    );
    workerRef.current.postMessage({ current, previous });
    workerRef.current.onmessage = (evt) => setHtmlDiff(evt.data);
    return () => {
      workerRef.current.terminate();
    };
  }, [current, previous]);

  return htmlDiff ? (
    <Box
      sx={{
        del: { backgroundColor: theme.colors.critical },
        ins: { backgroundColor: theme.colors.positive },
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
