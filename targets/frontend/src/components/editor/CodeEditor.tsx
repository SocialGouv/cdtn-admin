import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";

import { EditorWrapper } from "./EditorWrapper";

type Props = {
  onChange: (v: any) => void;
  value: any;
};

export default function CodeEditor({ onChange, value }: Props) {
  const { isDark } = useIsDark();

  return (
    <div>
      <EditorWrapper
        name="EditJsonContent"
        mode="json"
        theme={isDark ? "github_dark" : "github"}
        setOptions={{
          useWorker: false,
          showLineNumbers: true,
        }}
        editorProps={{ $blockScrolling: true }}
        onChange={onChange}
        value={value}
        width="100%"
        height="calc(100vh - 355px)"
      />
    </div>
  );
}
