import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InfographicForm } from "../Form";
import { Infographic } from "../../../type";
import { request } from "src/lib/request";

jest.mock("src/lib/request", () => ({
  request: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock("urql", () => ({
  ...jest.requireActual("urql"),
  useQuery: jest.fn(() => [
    {
      data: {
        reference_value_smic_values: [],
        legiArticles: [],
        documents: [],
      },
      fetching: false,
      error: undefined,
    },
  ]),
}));

const infographic: Infographic = {
  id: "1b2c3d4e-5f60-4712-8934-56789abcdef0",
  title: "Le congé parental",
  metaTitle: "Le congé parental",
  description: "Description",
  metaDescription: "Description meta",
  transcription: "Transcription",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  displayDate: "2026-01-01T00:00:00.000Z",
  svgFile: {
    id: "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    url: "ancien.svg",
    size: "10",
  },
  pdfFile: {
    id: "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    url: "ancien.pdf",
    size: "20",
  },
  legiReferences: [],
  otherReferences: [],
  cdtnReferences: [],
};

/** 0 = champ SVG, 1 = champ PDF (les deux partagent le même id DOM) */
const deposer = (index: number, name: string, type: string) => {
  const input =
    document.querySelectorAll<HTMLInputElement>("input[type=file]")[index];
  fireEvent.change(input, {
    target: { files: [new File(["contenu"], name, { type })] },
  });
};

const fichiersEnvoyes = () =>
  (request as jest.Mock).mock.calls.flatMap(([, config]) =>
    Array.from((config.body as FormData).keys())
  );

describe("InfographicForm", () => {
  // jsdom ne fournit pas ces API, utilisées par l'aperçu du SVG
  beforeAll(() => {
    (URL as any).createObjectURL = jest.fn(() => "blob:apercu");
    (URL as any).revokeObjectURL = jest.fn();
  });
  beforeEach(() => jest.clearAllMocks());

  it("envoie le PDF au bucket quand on le remplace", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<InfographicForm infographic={infographic} onUpsert={onUpsert} />);

    deposer(1, "nouveau.pdf", "application/pdf");
    await waitFor(() =>
      expect(screen.getByText("nouveau.pdf")).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    // sans cet envoi, l'URL est enregistrée en base mais le fichier n'existe
    // pas dans le bucket : le lien de téléchargement est mort
    expect(fichiersEnvoyes()).toContain("nouveau.pdf");
  });

  it("envoie le SVG au bucket quand on le remplace", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<InfographicForm infographic={infographic} onUpsert={onUpsert} />);

    deposer(0, "nouveau.svg", "image/svg+xml");
    await waitFor(() =>
      expect(screen.getByText("nouveau.svg")).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    expect(fichiersEnvoyes()).toContain("nouveau.svg");
  });

  it("n'envoie rien quand on sauvegarde sans remplacer de fichier", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<InfographicForm infographic={infographic} onUpsert={onUpsert} />);

    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    expect(request).not.toHaveBeenCalled();
    expect((onUpsert as jest.Mock).mock.calls[0][0]).toMatchObject({
      svgFile: infographic.svgFile,
      pdfFile: infographic.pdfFile,
    });
  });
});
