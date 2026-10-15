import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Highlight } from "../extensions";

// Le BubbleMenu déplace son élément hors de l'arbre React (tippy) : on le rend en place.
jest.mock("@tiptap/react", () => {
  const actual = jest.requireActual("@tiptap/react");
  return {
    ...actual,
    BubbleMenu: ({ children }: { children: React.ReactNode }) => (
      <div role="toolbar">{children}</div>
    ),
  };
});
import { MenuStyle } from "../MenuStyle";

const Harness = ({ highlightEnabled }: { highlightEnabled: boolean }) => {
  const editor = useEditor({
    content: "<p>un passage</p>",
    extensions: [StarterKit, ...(highlightEnabled ? [Highlight] : [])],
  });
  return (
    <>
      <MenuStyle editor={editor} highlightEnabled={highlightEnabled} />
      <EditorContent editor={editor} />
      <button type="button" onClick={() => editor?.commands.selectAll()}>
        select-all
      </button>
      <output data-testid="html">{editor?.getHTML()}</output>
    </>
  );
};

describe("MenuStyle — surlignage", () => {
  it("n'affiche pas l'option « Surligner » par défaut", async () => {
    render(<Harness highlightEnabled={false} />);
    await screen.findByText("select-all");
    expect(screen.queryByTitle("Surligner")).not.toBeInTheDocument();
  });

  it("affiche l'option quand elle est activée et surligne la sélection", async () => {
    render(<Harness highlightEnabled />);
    await userEvent.click(await screen.findByText("select-all"));
    await userEvent.click(await screen.findByTitle("Surligner"));
    expect(screen.getByTestId("html").textContent).toBe(
      "<p><mark>un passage</mark></p>"
    );
  });
});
