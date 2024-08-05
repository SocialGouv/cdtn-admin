import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { fireEvent } from "@testing-library/react";

import { AnswerForm } from "../AnswerForm";
import { AnswerWithStatus } from "../answer.query";
import { Provider } from "urql";

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

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn(() => ({
      events: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      },
    })),
  };
});

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
    message_id: "1",
  },
  agreement: {
    id: "0000",
    name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
    kaliId: "KALICONT000005635624",
    unextended: false,
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
    id: "",
    status: "TODO",
    createdAt: new Date().toISOString(),
    userId: "1",
    user: {
      created_at: "",
      email: "",
      name: "",
    },
  },
  updateDate: "29/09/2023",
  document_export: {
    export: {
      createdAt: "29/09/2023",
    },
  },
};

const onSubmit = jest.fn(() => Promise.resolve());

const mockClient = {
  executeQuery: jest.fn(),
  executeMutation: jest.fn(),
  executeSubscription: jest.fn(),
};

describe("AnswerForm", () => {
  test("Vérifier l'affichage du contenu", () => {
    render(
      <Provider value={mockClient}>
        <AnswerForm
          answer={answerBase}
          genericAnswerContentType={"ANSWER"}
          onSubmit={onSubmit}
        />
      </Provider>
    );
    expect(screen.queryByText("content")).toBeInTheDocument();

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

  test("Vérifier l'affichage des options", () => {
    const { rerender } = render(
      <Provider value={mockClient}>
        <AnswerForm
          answer={answerBase}
          genericAnswerContentType={"ANSWER"}
          onSubmit={onSubmit}
        />
      </Provider>
    );
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

    rerender(
      <Provider value={mockClient}>
        <AnswerForm
          genericAnswerContentType={"ANSWER"}
          answer={{
            ...answerBase,
            agreementId: "0016",
            agreement: {
              ...answerBase.agreement,
              id: "0016",
              name: "0016",
              kaliId: "0016",
            },
          }}
          onSubmit={onSubmit}
        />
      </Provider>
    );
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

  test("Vérifier que la sauvegarde fonctionne", async () => {
    render(
      <Provider value={mockClient}>
        <AnswerForm
          genericAnswerContentType={"ANSWER"}
          answer={answerBase}
          onSubmit={onSubmit}
        />
      </Provider>
    );
    fireEvent.click(screen.getByText("Sauvegarder"));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test("Vérifier l'affichage du message d'erreur pour les fiches SP", async () => {
    render(
      <Provider value={mockClient}>
        <AnswerForm
          genericAnswerContentType={"ANSWER"}
          answer={answerBase}
          onSubmit={onSubmit}
        />
      </Provider>
    );
    fireEvent.click(screen.getByText("Utiliser la fiche service public"));
    userEvent.clear(screen.getByLabelText("Fiche service-public"));
    fireEvent.click(screen.getByText("Sauvegarder"));
    expect(
      await screen.findByText(/Le document doit être renseigné/)
    ).toBeInTheDocument();
  });

  test("Vérifier l'affichage du message d'erreur pour les références", async () => {
    render(
      <Provider value={mockClient}>
        <AnswerForm
          genericAnswerContentType={"ANSWER"}
          answer={answerBase}
          onSubmit={onSubmit}
        />
      </Provider>
    );
    fireEvent.click(screen.getByText("Ajouter une référence"));
    fireEvent.click(screen.getByText("Sauvegarder"));
    const [labelRequired] = await screen.findAllByText(
      /Un libellé doit être renseigné/
    );
    expect(labelRequired).toBeInTheDocument();
    const [field] = screen.getAllByLabelText("Lien");
    fireEvent.change(field!, {
      target: { value: "t" },
    });
    fireEvent.click(screen.getByText("Sauvegarder"));
    const [invalidFormat] = await screen.findAllByText(
      "Le format du lien est invalide"
    );
    expect(invalidFormat).toBeInTheDocument();
  });
});
