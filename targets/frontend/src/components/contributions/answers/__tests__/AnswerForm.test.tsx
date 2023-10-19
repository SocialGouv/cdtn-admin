import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { fireEvent } from "@testing-library/react";

import { AnswerForm } from "../AnswerForm";
import { AnswerWithStatus } from "../answer.query";

const answerBase: AnswerWithStatus = {
  id: "",
  questionId: "",
  agreementId: "0000",
  content: "content",
  contentType: "ANSWER",
  updatedAt: "2023-09-29T14:09:52.01401+00:00",
  contentServicePublicCdtnId: null,
  question: {
    id: "2c820037-62bd-4c0e-a1a8-ca80b97b5958",
    content: "Quelle est la durée maximale de la période d’essai ?",
    order: 5,
    message_id: "",
  },
  agreement: {
    id: "0000",
    name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
    kaliId: "KALICONT000005635624",
  },
  answerComments: [],
  statuses: [],
  kaliReferences: [
    {
      label: "kaliRef1",
      kaliArticle: {
        label: "kaliArt1",
      },
    },
    {
      label: "kaliRef2",
      kaliArticle: {
        label: "kaliArt2",
      },
    },
  ],
  legiReferences: [
    {
      legiArticle: { cid: "1", id: "1", label: "legiArticle1" },
    },
    {
      legiArticle: { cid: "2", id: "2", label: "legiArticle2" },
    },
  ],
  otherReferences: [
    {
      label: "otherReferences1",
      url: "http://otherReferences1.fr",
    },
    {
      label: "otherReferences2",
    },
  ],
  cdtnReferences: [
    {
      document: {
        cdtnId: "1",
        slug: "1",
        source: "information",
        title: "reference1",
      },
    },
    {
      document: {
        cdtnId: "2",
        slug: "2",
        source: "information",
        title: "reference2",
      },
    },
  ],
  contentFichesSpDocument: {
    cdtnId: "1",
    slug: "1",
    source: "",
    title: "ficheSP",
  },
  status: {
    status: "TODO",
    createdAt: new Date().toISOString(),
    user: { created_at: "", email: "", name: "" },
    userId: "",
    id: "",
  },
  updateDate: "29/09/2023",
};

const onSubmit = jest.fn(() => Promise.resolve());

describe("Given a component AnswerForm with generic answer data", () => {
  beforeEach(() => {
    render(<AnswerForm answer={answerBase} onSubmit={onSubmit} />);
  });
  it("Should display respective options", () => {
    expect(screen.queryByText("Afficher la réponse")).toBeInTheDocument();
    expect(
      screen.queryByText("Utiliser la fiche service public")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("La convention collective ne prévoit rien")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Nous n'avons pas la réponse")
    ).not.toBeInTheDocument();
  });
  it("Should display correctly all the content", () => {
    expect(screen.queryByText("content")).toBeInTheDocument();

    const spInput = screen.getByLabelText("Fiche service-public");
    expect(spInput?.closest("input")?.value).toContain("ficheSP");

    const cdtInput = screen.queryByLabelText(
      "Références liées au code du travail"
    );
    expect(cdtInput?.parentElement?.innerHTML).toContain("legiArticle1");
    expect(cdtInput?.parentElement?.innerHTML).toContain("legiArticle2");

    const [nameInput1, nameInput2] = screen.queryAllByLabelText("Nom");
    expect(nameInput1?.closest("input")?.value).toContain("otherReferences1");
    expect(nameInput2?.closest("input")?.value).toContain("otherReferences2");
    const [linkInput1] = screen.queryAllByLabelText("Lien");
    expect(linkInput1?.closest("input")?.value).toContain(
      "http://otherReferences1.fr"
    );

    const linkedContentInput = screen.queryByLabelText("Contenus liés");
    expect(linkedContentInput?.parentElement?.innerHTML).toContain(
      "reference1"
    );
    expect(linkedContentInput?.parentElement?.innerHTML).toContain(
      "reference2"
    );
  });
  describe("When saving with valid data", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByText("Sauvegarder"));
    });
    it("should call onSubmit callback", async () => {
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe("When selecting 'use SP file', clearing field and saving", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByText("Utiliser la fiche service public"));
      userEvent.clear(screen.getByLabelText("Fiche service-public"));
      fireEvent.click(screen.getByText("Sauvegarder"));
    });
    it("should throw an error message", async () => {
      expect(
        await screen.findByText(/Le document doit être renseigné/)
      ).toBeInTheDocument();
    });
  });
  describe("When adding new reference", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByText("Ajouter une référence"));
    });
    describe("When saving", () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText("Sauvegarder"));
      });
      it("should throw a required error", async () => {
        const [placeholder] = await screen.findAllByText(
          /Un libellé doit être renseigné/
        );
        expect(placeholder).toBeInTheDocument();
      });
    });
    describe("When filling wrong url and saving", () => {
      beforeEach(() => {
        const [field] = screen.getAllByLabelText("Lien");
        fireEvent.change(field!, {
          target: { value: "t" },
        });
        fireEvent.click(screen.getByText("Sauvegarder"));
      });
      test("it should throw an invalid error", async () => {
        const [placeholder] = await screen.findAllByText(
          "Le format du lien est invalide"
        );
        expect(placeholder).toBeInTheDocument();
      });
    });
  });
});

describe("Given a basic default CC answer", () => {
  beforeEach(() => {
    const answer = {
      ...answerBase,
      agreementId: "0016",
      agreement: {
        ...answerBase.agreement,
        id: "0016",
        name: "0016",
        kaliId: "0016",
      },
    };
    render(<AnswerForm answer={answer} onSubmit={() => Promise.resolve()} />);
  });
  test("Check options are displayed", () => {
    expect(screen.queryByText("Afficher la réponse")).toBeInTheDocument();
    expect(
      screen.queryByText("Utiliser la fiche service public")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("La convention collective ne prévoit rien")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nous n'avons pas la réponse")
    ).toBeInTheDocument();
  });
});
