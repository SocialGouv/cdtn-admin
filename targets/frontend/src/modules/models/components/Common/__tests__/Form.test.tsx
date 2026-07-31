import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ModelForm } from "../Form";
import { Model } from "../../../type";
import { request } from "src/lib/request";

jest.mock("src/lib/request", () => ({
  request: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock("urql", () => ({
  ...jest.requireActual("urql"),
  useQuery: jest.fn(() => [
    {
      data: { reference_value_smic_values: [], legiArticles: [] },
      fetching: false,
      error: undefined,
    },
  ]),
}));

jest.mock("mammoth", () => ({
  __esModule: true,
  default: {
    convertToHtml: jest.fn(() =>
      Promise.resolve({ value: "<p>nouvel aperçu</p>" })
    ),
  },
}));

const model: Model = {
  id: "3f1a2b4c-5d6e-4f70-8901-234567890abc",
  title: "Demande de congés",
  metaTitle: "Demande de congés",
  intro: "Introduction",
  metaDescription: "Description meta",
  type: "lettre",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  previewHTML: "<p>ancien aperçu</p>",
  file: {
    id: "9a8b7c6d-5e4f-4012-8345-678901234def",
    url: "ancien-modele.docx",
    size: "42",
  },
  legiReferences: [],
  otherReferences: [],
  displayDate: "2026-01-01T00:00:00.000Z",
};

const uploadDocx = (name: string) => {
  const input = document.querySelector<HTMLInputElement>("#fileupload")!;
  const file = new File(["contenu"], name, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  fireEvent.change(input, { target: { files: [file] } });
};

describe("ModelForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("enregistre l'URL du fichier avec la même clé que celle déposée dans le bucket", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<ModelForm model={model} onUpsert={onUpsert} />);

    uploadDocx("mon-modele.docx");
    await waitFor(() =>
      expect(screen.getByText("mon-modele.docx")).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    // l'API /api/storage stocke l'objet sous `originalFilename` : l'URL
    // enregistrée en base doit être exactement ce nom, sans préfixe "./"
    expect((onUpsert as jest.Mock).mock.calls[0][0]).toMatchObject({
      file: { url: "mon-modele.docx", size: "7" },
    });
  });

  it("laisse le fichier intact quand on sauvegarde sans en déposer un nouveau", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<ModelForm model={model} onUpsert={onUpsert} />);

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    expect((onUpsert as jest.Mock).mock.calls[0][0].file).toEqual(model.file);
    // aucun upload ne doit être déclenché
    expect(request).not.toHaveBeenCalled();
  });

  it("conserve l'id du fichier existant quand on remplace le document", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<ModelForm model={model} onUpsert={onUpsert} />);

    uploadDocx("mon-modele.docx");
    await waitFor(() =>
      expect(screen.getByText("mon-modele.docx")).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    // sans cet id, la mutation d'édition insère une ligne `files` orpheline et
    // le modèle continue de pointer sur l'ancien document
    expect((onUpsert as jest.Mock).mock.calls[0][0].file.id).toBe(
      model.file.id
    );
  });

  it("envoie le fichier à /api/storage sous son nom réel", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<ModelForm model={model} onUpsert={onUpsert} />);

    uploadDocx("mon-modele.docx");
    await waitFor(() =>
      expect(screen.getByText("mon-modele.docx")).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    const [endpoint, config] = (request as jest.Mock).mock.calls[0];
    expect(endpoint).toBe("/api/storage");
    expect(Array.from((config.body as FormData).keys())).toEqual([
      "mon-modele.docx",
    ]);
  });
});
