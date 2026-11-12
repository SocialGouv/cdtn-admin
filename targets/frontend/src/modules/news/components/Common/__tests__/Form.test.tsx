import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { NewsForm } from "../Form";
import { News } from "../../../type";

jest.mock("@codegouvfr/react-dsfr", () => {
  const token = (): object =>
    new Proxy(() => "", {
      get: (_target, key) =>
        key === Symbol.toPrimitive ? () => "#000" : token(),
    });
  return { fr: token() };
});

// La validation et les sous-formulaires ne jouent aucun rôle dans le verrou
// d'envoi.
jest.mock("../formSchema", () => {
  const { z } = jest.requireActual("zod");
  return { buildNewsFormSchema: () => z.any() };
});
jest.mock("../NewsImageField", () => ({ NewsImageField: () => null }));
jest.mock("../NewsLinks", () => ({ NewsLinks: () => null }));
jest.mock("../NewsReferences", () => ({ NewsReferences: () => null }));
jest.mock("src/components/forms", () => ({
  FormDatePicker: () => null,
  FormEditionField: () => null,
  FormTextField: () => null,
}));

const news: News = {
  id: "8a3c1c4e-6f0b-4b8e-9d1a-2f4e5b6c7d8e",
  title: "Titre",
  metaTitle: "Titre meta",
  content: "Contenu",
  metaDescription: "Description meta",
  displayDate: "2026-10-09",
  createdAt: "2026-10-09T10:00:00Z",
  updatedAt: "2026-10-09T10:00:00Z",
  publishedAt: null,
  links: [],
  references: [],
  imageFile: null,
  imageAlt: null,
  imageAuthor: null,
  imageLicense: null,
  imageWidth: null,
  imageHeight: null,
};

const pending = () => jest.fn(() => new Promise<void>(() => {}));

describe("NewsForm", () => {
  it("n'enregistre qu'une fois sur un double clic", async () => {
    const onUpsert = pending();
    render(<NewsForm news={news} onUpsert={onUpsert} />);

    const save = screen.getByRole("button", { name: "Sauvegarder" });
    fireEvent.click(save);
    fireEvent.click(save);

    await waitFor(() => expect(onUpsert).toHaveBeenCalled());
    expect(onUpsert).toHaveBeenCalledTimes(1);
  });

  it("ne publie qu'une fois sur un double clic", async () => {
    const onPublish = pending();
    render(<NewsForm news={news} onUpsert={jest.fn()} onPublish={onPublish} />);

    const publish = screen.getByRole("button", { name: "Publier" });
    fireEvent.click(publish);
    fireEvent.click(publish);

    await waitFor(() => expect(onPublish).toHaveBeenCalled());
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it("ne publie pas pendant une sauvegarde", async () => {
    const onUpsert = pending();
    const onPublish = jest.fn();
    render(<NewsForm news={news} onUpsert={onUpsert} onPublish={onPublish} />);

    const publish = screen.getByRole("button", { name: "Publier" });
    fireEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    fireEvent.click(publish);

    await waitFor(() => expect(onUpsert).toHaveBeenCalled());
    expect(onPublish).not.toHaveBeenCalled();
  });

  it("garde le verrou après une création réussie", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<NewsForm onUpsert={onUpsert} />);

    fireEvent.click(screen.getByRole("button", { name: "Créer" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    expect(screen.queryByRole("button", { name: "Créer" })).toBeNull();
  });

  it("libère le verrou après une sauvegarde en édition", async () => {
    const onUpsert = jest.fn(() => Promise.resolve());
    render(<NewsForm news={news} onUpsert={onUpsert} />);

    fireEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(1));

    fireEvent.click(await screen.findByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onUpsert).toHaveBeenCalledTimes(2));
  });
});
