import dynamic from "next/dynamic";

export const EditorWrapper: any = dynamic(
  async () => {
    const ace = await import("react-ace");
    await import("ace-builds/src-noconflict/mode-json");
    await import("ace-builds/src-noconflict/theme-github");
    await import("ace-builds/src-noconflict/theme-github_dark");
    await import("ace-builds/src-noconflict/ext-searchbox");
    return ace;
  },
  {
    loading: () => <p>En cours de chargement...</p>,
    ssr: false,
  }
);
