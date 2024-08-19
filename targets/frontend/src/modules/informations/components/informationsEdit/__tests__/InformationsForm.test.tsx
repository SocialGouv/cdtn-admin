import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InformationsForm } from "../InformationsForm";
import { InformationsResult } from "../Informations.query";

const information: InformationsResult = {
  id: "cafaf8d6-af91-4901-a18d-e70921788088",
  title: "titre information",
  description: "description information",
  metaTitle: "titre meta information",
  metaDescription: "description meta information",
  dismissalProcess: true,
  sectionDisplayMode: "tab",
  intro: "intro information",
  contents: [
    {
      title: "titre contenus1",
      blocks: [
        {
          content: "contenus1",
          type: "markdown",
        },
      ],
      referenceLabel: "Liens utiles",
      references: [
        {
          title: "contentRef1",
          type: "external",
          url: "http://contentRef1.ref",
        },
      ],
    },
  ],
  referenceLabel: "Références juridiques",
  references: [
    {
      title: "ref1",
      type: "external",
      url: "http://ref1.ref",
    },
  ],
  updatedAt: "2023-10-20T15:29:22.687685+00:00",
};

const onSubmit = jest.fn(() => Promise.resolve());

describe("InformationForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Vérifier l'affichage du contenu", () => {
    render(<InformationsForm data={information} onUpsert={onSubmit} />);
    const [inputInfoDate] =
      screen.getAllByLabelText<HTMLInputElement>("Date mise à jour");
    const [
      inputInfoTitle,
      inputContentTitle1,
      inputContentRefTitle1,
      inputRefTitle1,
    ] = screen.getAllByLabelText<HTMLInputElement>("Titre");
    const [inputInfoTitleMeta] =
      screen.getAllByLabelText<HTMLInputElement>("Titre Meta");
    const [inputInfoDescription] =
      screen.getAllByLabelText<HTMLInputElement>("Description");
    const [inputInfoDescriptionMeta] =
      screen.getAllByLabelText<HTMLInputElement>("Description Meta");
    const [inputInfoIntro] =
      screen.getAllByLabelText<HTMLInputElement>("Intro");
    const [inputInfoDismissalProcess] =
      screen.getAllByLabelText<HTMLInputElement>("Dossier licenciement");
    const [inputContentAccordion] =
      screen.getAllByLabelText<HTMLInputElement>("Accordéon");
    const [inputContentTab] =
      screen.getAllByLabelText<HTMLInputElement>("Onglet");

    const [inputContentTypeMarkdown] =
      screen.getAllByLabelText<HTMLInputElement>("Markdown");
    const [inputContentTypeGraphic] =
      screen.getAllByLabelText<HTMLInputElement>("Graphique");
    const [inputContentTypeContent] =
      screen.getAllByLabelText<HTMLInputElement>("Contenus");

    const [inputContentText] =
      screen.getAllByLabelText<HTMLInputElement>("Texte");

    const [inputContentRefLegalRef, inputRefLegalRef] =
      screen.getAllByLabelText<HTMLInputElement>("Références juridiques");
    const [inputContentRefUsefullLinks, inputRefUsefullLinks] =
      screen.getAllByLabelText<HTMLInputElement>("Liens utiles");
    const [inputContentRefUrl1, inputRefUrl1] =
      screen.getAllByLabelText<HTMLInputElement>("Url");

    expect(inputInfoDate.value).toEqual("19/04/2023");
    expect(inputInfoTitle.value).toEqual("titre information");
    expect(inputInfoTitleMeta.value).toEqual("titre meta information");
    expect(inputInfoDescription.value).toEqual("description information");
    expect(inputInfoDescriptionMeta.value).toEqual(
      "description meta information"
    );
    expect(inputInfoIntro.value).toContain("intro information");
    expect(inputInfoDismissalProcess.checked).toEqual(true);

    // Partie Contenus
    expect(inputContentAccordion.checked).toEqual(false);
    expect(inputContentTab.checked).toEqual(true);
    expect(inputContentTitle1.value).toEqual("titre contenus1");
    expect(inputContentTypeMarkdown.checked).toEqual(true);
    expect(inputContentTypeGraphic.checked).toEqual(false);
    expect(inputContentTypeContent.checked).toEqual(false);
    expect(inputContentText.value).toEqual("contenus1");

    expect(inputContentRefLegalRef.checked).toEqual(false);
    expect(inputContentRefUsefullLinks.checked).toEqual(true);
    expect(inputContentRefUrl1.value).toEqual("http://contentRef1.ref");
    expect(inputContentRefTitle1.value).toEqual("contentRef1");

    // Partie Ref
    expect(inputRefLegalRef.checked).toEqual(true);
    expect(inputRefUsefullLinks.checked).toEqual(false);
    expect(inputRefUrl1.value).toEqual("http://ref1.ref");
    expect(inputRefTitle1.value).toEqual("ref1");
  });

  test("Vérifier que la sauvegarde fonctionne", async () => {
    render(<InformationsForm data={information} onUpsert={onSubmit} />);
    fireEvent.click(screen.getByText("Sauvegarder"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test("Vérifier les validations 'requise'", async () => {
    render(<InformationsForm data={information} onUpsert={onSubmit} />);
    const [
      inputInfoTitle,
      inputContentTitle1,
      inputContentRefTitle1,
      inputRefTitle1,
    ] = screen.getAllByLabelText<HTMLInputElement>("Titre");
    const [inputInfoTitleMeta] =
      screen.getAllByLabelText<HTMLInputElement>("Titre Meta");
    const [inputInfoDescription] =
      screen.getAllByLabelText<HTMLInputElement>("Description");
    const [inputInfoDescriptionMeta] =
      screen.getAllByLabelText<HTMLInputElement>("Description Meta");
    const [inputContentText1] =
      screen.getAllByLabelText<HTMLInputElement>("Texte");
    const [inputContentRefUrl1, inputRefUrl1] =
      screen.getAllByLabelText<HTMLInputElement>("Url");
    const buttonSave = screen.getByText("Sauvegarder");

    userEvent.clear(inputInfoTitle);
    userEvent.clear(inputInfoTitleMeta);
    userEvent.clear(inputInfoDescription);
    userEvent.clear(inputInfoDescriptionMeta);
    userEvent.clear(inputContentTitle1);
    userEvent.clear(inputContentText1);
    userEvent.clear(inputContentRefTitle1);
    userEvent.clear(inputContentRefUrl1);
    userEvent.clear(inputRefTitle1);
    userEvent.clear(inputRefUrl1);
    fireEvent.click(buttonSave);

    const [
      errorInfoTitle,
      errorContentTitle1,
      errorContentRefTitle1,
      errorRefTitle1,
    ] = await screen.findAllByText("Un titre doit être renseigné");
    const [errorInfoMetaTitle] = await screen.findAllByText(
      "Un titre meta doit être renseigné"
    );
    const [errorInfoDescription] = await screen.findAllByText(
      "Une description doit être renseignée"
    );
    const [errorInfoMetaDescription] = await screen.findAllByText(
      "Une description meta doit être renseignée"
    );
    const [errorContentText] = await screen.findAllByText(
      "Un texte doit être renseigné"
    );
    const [errorContentRefUrl1, errorRefUrl1] = await screen.findAllByText(
      "Le format de l'url est invalide"
    );

    expect(errorInfoTitle).toBeInTheDocument();
    expect(errorInfoMetaTitle).toBeInTheDocument();
    expect(errorInfoDescription).toBeInTheDocument();
    expect(errorInfoMetaDescription).toBeInTheDocument();
    expect(errorContentTitle1).toBeInTheDocument();
    expect(errorContentRefTitle1).toBeInTheDocument();
    expect(errorContentRefUrl1).toBeInTheDocument();
    expect(errorRefTitle1).toBeInTheDocument();
    expect(errorRefUrl1).toBeInTheDocument();
    expect(errorContentText).toBeInTheDocument();

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalledTimes(1);
    });
  });

  test("Vérifier les validations 'format url invalide'", async () => {
    render(<InformationsForm data={information} onUpsert={onSubmit} />);
    const [inputContentRefUrl1, inputRefUrl1] =
      screen.getAllByLabelText<HTMLInputElement>("Url");
    const buttonSave = screen.getByText("Sauvegarder");

    userEvent.type(inputContentRefUrl1, "test");
    userEvent.type(inputRefUrl1, "test");
    userEvent.click(buttonSave);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalledTimes(1);
    });

    userEvent.type(inputContentRefUrl1, "http://ref1.ref");
    userEvent.type(inputRefUrl1, "http://ref1.ref");
    userEvent.click(buttonSave);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
