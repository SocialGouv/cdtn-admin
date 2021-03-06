// Imports order are important and can't be in alphabetical order.
/* eslint-disable simple-import-sort/imports */
import PropTypes from "prop-types";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

export default function CodeEditor({ onChange, value }) {
  return (
    <AceEditor
      mode="json"
      theme="github"
      name="EditJsonContent"
      setOptions={{
        useWorker: false,
        wrap: true,
      }}
      editorProps={{ $blockScrolling: true }}
      onChange={onChange}
      value={value}
      width="100%"
      height="calc(100vh - 355px)"
    />
  );
}

CodeEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};
