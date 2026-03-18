import { render, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "urql";
import { useEditor, EditorContent } from "@tiptap/react";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import { Details } from "@tiptap-pro/extension-details";
import { DetailsSummary } from "@tiptap-pro/extension-details-summary";
import { DetailsContent } from "@tiptap-pro/extension-details-content";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Alert, Infographic, Title } from "../extensions";
import { defaultExtensions } from "../Editor";

// Mock du composant AddInfographyDialog qui nécessite urql
jest.mock("../component/AddInfographyDialog", () => ({
  AddInfographyDialog: () => null,
}));

// Mock client urql pour les tests
const mockClient = {
  executeQuery: jest.fn(),
  executeMutation: jest.fn(),
  executeSubscription: jest.fn(),
} as any;

// Mock pour les événements de drag & clipboard
class ClipboardEventMock extends Event {
  clipboardData: {
    getData: jest.Mock<any, [string]>;
    setData: jest.Mock<any, [string, string]>;
  };

  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    this.clipboardData = {
      getData: jest.fn(),
      setData: jest.fn(),
    };
  }
}

class DragEventMock extends Event {
  dataTransfer: {
    getData: jest.Mock<any, [string]>;
    setData: jest.Mock<any, [string, string]>;
  };

  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    this.dataTransfer = {
      getData: jest.fn(),
      setData: jest.fn(),
    };
  }
}

(globalThis as any).DragEvent = DragEventMock;
(globalThis as any).ClipboardEvent = ClipboardEventMock;

// Mock pour getClientRects (nécessaire pour ProseMirror dans JSDOM)
const mockRect = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => {},
};

if (typeof Element.prototype.getClientRects === "undefined") {
  Element.prototype.getClientRects = function () {
    return {
      length: 1,
      item: () => mockRect,
      [Symbol.iterator]: function* () {
        yield mockRect;
      },
      0: mockRect, // Accès par index
    } as any;
  };
}

if (typeof Range.prototype.getClientRects === "undefined") {
  Range.prototype.getClientRects = function () {
    return {
      length: 1,
      item: () => mockRect,
      [Symbol.iterator]: function* () {
        yield mockRect;
      },
      0: mockRect, // Accès par index
    } as any;
  };
}

if (typeof Element.prototype.getBoundingClientRect === "undefined") {
  Element.prototype.getBoundingClientRect = function () {
    return mockRect;
  };
}

if (typeof Range.prototype.getBoundingClientRect === "undefined") {
  Range.prototype.getBoundingClientRect = function () {
    return mockRect;
  };
}

// Composant de test qui expose l'éditeur
const TestEditor = ({
  onEditorCreated,
}: {
  onEditorCreated: (editor: any) => void;
}) => {
  const editor = useEditor({
    extensions: defaultExtensions.concat(
      Infographic.configure({
        baseUrl: "infographicBaseUrl",
      })
    ),
  });

  React.useEffect(() => {
    if (editor) {
      onEditorCreated(editor);
    }
  }, [editor, onEditorCreated]);

  return <EditorContent editor={editor} />;
};

describe("Editor - HTML Snapshots avec commandes Tiptap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupEditor = (): Promise<any> => {
    return new Promise((resolve) => {
      render(
        <Provider value={mockClient}>
          <TestEditor onEditorCreated={resolve} />
        </Provider>
      );
    });
  };

  const waitForUpdate = () => new Promise((resolve) => setTimeout(resolve, 50));

  test("snapshot: contenu vide", async () => {
    await setupEditor();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: insertion de texte via insertContent", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Ceci est un paragraphe simple.");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: texte en gras via toggleBold", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Texte normal ");
    editor
      .chain()
      .focus()
      .toggleBold()
      .insertContent("texte en gras")
      .toggleBold()
      .run();
    editor.commands.insertContent(" texte normal");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: texte en italique via toggleItalic", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Texte normal ");
    editor
      .chain()
      .focus()
      .toggleItalic()
      .insertContent("texte en italique")
      .toggleItalic()
      .run();
    editor.commands.insertContent(" texte normal");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: texte gras et italique combinés", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Texte ");
    editor
      .chain()
      .focus()
      .toggleBold()
      .insertContent("gras ")
      .toggleItalic()
      .insertContent("et italique")
      .toggleBold()
      .toggleItalic()
      .run();
    editor.commands.insertContent(" normal");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: liste à puces via toggleBulletList", async () => {
    const editor = await setupEditor();

    editor.chain().focus().toggleBulletList().run();
    editor.commands.insertContent("Premier élément");
    editor.commands.enter();
    editor.commands.insertContent("Deuxième élément");
    editor.commands.enter();
    editor.commands.insertContent("Troisième élément");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: liste numérotée via toggleOrderedList", async () => {
    const editor = await setupEditor();

    editor.chain().focus().toggleOrderedList().run();
    editor.commands.insertContent("Première étape");
    editor.commands.enter();
    editor.commands.insertContent("Deuxième étape");
    editor.commands.enter();
    editor.commands.insertContent("Troisième étape");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: tableau via insertTable", async () => {
    const editor = await setupEditor();

    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
      .run();
    await waitForUpdate();

    // Remplir les cellules
    editor.commands.insertContent("En-tête 1");
    editor.commands.goToNextCell();
    editor.commands.insertContent("En-tête 2");
    editor.commands.goToNextCell();
    editor.commands.insertContent("Cellule 1");
    editor.commands.goToNextCell();
    editor.commands.insertContent("Cellule 2");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: alerte via setAlert", async () => {
    const editor = await setupEditor();

    editor.chain().focus().setAlert().run();
    editor.commands.insertContent("Ceci est un message d'alerte important");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: section dépliable via setDetails", async () => {
    const editor = await setupEditor();

    editor.chain().focus().setDetails().run();
    editor.commands.insertContent("Titre de la section");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: lien via setLink", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Visitez notre site web");
    await waitForUpdate();

    // Sélectionner "site web"
    const pos = editor.state.doc.content.size;
    editor.commands.setTextSelection({ from: pos - 9, to: pos - 1 });
    editor.chain().focus().setLink({ href: "https://example.com" }).run();
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: blockquote via toggleBlockquote", async () => {
    const editor = await setupEditor();

    editor.chain().focus().toggleBlockquote().run();
    editor.commands.insertContent("Ceci est une citation importante.");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: code block via toggleCodeBlock", async () => {
    const editor = await setupEditor();

    editor.chain().focus().toggleCodeBlock().run();
    editor.commands.insertContent("const x = 42;");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: titre via toggleTitle", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Titre principal");
    await waitForUpdate();

    editor.commands.selectAll();
    editor.chain().focus().toggleTitle({ level: "title" }).run();
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: sous-titre via toggleTitle", async () => {
    const editor = await setupEditor();

    // Créer un titre
    editor.commands.insertContent("Titre principal");
    editor.commands.selectAll();
    editor.chain().focus().toggleTitle({ level: "title" }).run();

    // Ajouter un paragraphe pour le sous-titre
    editor.commands.insertContent("<p>Sous-titre</p>");
    await waitForUpdate();

    // Sélectionner le dernier nœud
    const { doc } = editor.state;
    const lastNodePos = doc.content.size - doc.lastChild!.nodeSize;
    editor.commands.setTextSelection({
      from: lastNodePos,
      to: doc.content.size - 1,
    });
    editor.chain().focus().toggleTitle({ level: "sub-title" }).run();
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: liste imbriquée via sinkListItem", async () => {
    const editor = await setupEditor();

    editor.chain().focus().toggleBulletList().run();
    editor.commands.insertContent("Élément parent 1");
    editor.commands.enter();
    editor.commands.insertContent("Élément enfant 1.1");
    editor.chain().focus().sinkListItem("listItem").run();
    editor.commands.enter();
    editor.commands.insertContent("Élément enfant 1.2");
    editor.commands.enter();
    editor.chain().focus().liftListItem("listItem").run();
    editor.commands.insertContent("Élément parent 2");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: ajout de ligne dans tableau via addRowAfter", async () => {
    const editor = await setupEditor();

    editor
      .chain()
      .focus()
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run();
    editor.commands.insertContent("Col 1");
    editor.commands.goToNextCell();
    editor.commands.insertContent("Col 2");
    editor.commands.goToNextCell();
    editor.commands.insertContent("Ligne 1");
    editor.chain().focus().addRowAfter().run();
    editor.commands.goToNextCell();
    editor.commands.insertContent("Ligne 2");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: hard break via setHardBreak", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Première ligne");
    editor.chain().focus().setHardBreak().run();
    editor.commands.insertContent("Deuxième ligne");
    editor.chain().focus().setHardBreak().run();
    editor.commands.insertContent("Troisième ligne");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: horizontal rule via setHorizontalRule", async () => {
    const editor = await setupEditor();

    editor.commands.insertContent("Texte avant");
    editor.chain().focus().setHorizontalRule().run();
    editor.commands.insertContent("Texte après");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: combinaison de commandes", async () => {
    const editor = await setupEditor();

    // Titre
    editor.commands.insertContent("Introduction");
    editor.commands.selectAll();
    editor.chain().focus().toggleTitle({ level: "title" }).run();

    // Paragraphe avec gras
    editor.commands.insertContent("<p>Paragraphe avec </p>");
    editor
      .chain()
      .focus()
      .toggleBold()
      .insertContent("texte en gras")
      .toggleBold()
      .run();

    // Liste
    editor.chain().focus().toggleBulletList().run();
    editor.commands.insertContent("Point 1");
    editor.commands.enter();
    editor.commands.insertContent("Point 2");

    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: ajout de colonne dans tableau via addColumnAfter", async () => {
    const editor = await setupEditor();

    editor
      .chain()
      .focus()
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run();
    editor.commands.insertContent("Col 1");
    editor.commands.goToNextCell();
    editor.commands.insertContent("Col 2");
    editor.chain().focus().addColumnAfter().run();
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });

  test("snapshot: fusion de cellules via mergeCells", async () => {
    const editor = await setupEditor();

    editor
      .chain()
      .focus()
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run();
    // Sélectionner les deux premières cellules d'en-tête et les fusionner
    editor.chain().focus().mergeCells().run();
    editor.commands.insertContent("En-tête fusionné");
    await waitForUpdate();

    const editorContent = document.querySelector(".ProseMirror");
    expect(editorContent?.innerHTML).toMatchSnapshot();
  });
});
