import { render, screen } from "@testing-library/react";
import React from "react";

import { AnswerForm } from "../AnswerForm";
import { AnswerWithStatus } from "../answer.query";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn(() => ({
      events: {
        emit: jest.fn(),
        on: jest.fn(),
      },
    })),
  };
});

const answerBase: AnswerWithStatus = {
  id: "369336d2-994f-48b1-b6ac-fec78cff240e",
  questionId: "2c820037-62bd-4c0e-a1a8-ca80b97b5958",
  agreementId: "0000",
  content: "",
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
  },
  answerComments: [],
  statuses: [],
  kaliReferences: [],
  legiReferences: [],
  otherReferences: [],
  cdtnReferences: [],
  contentFichesSpDocument: null,
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
};

describe("Given a component AnswerForm and a basic default generic answer", () => {
  beforeEach(() => {
    render(<AnswerForm answer={answerBase} onSubmit={() => {}} />);
  });
  test("Check options are displayed", () => {
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
});

describe("Given a component AnswerForm and a basic default CC answer", () => {
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
    render(<AnswerForm answer={answer} onSubmit={() => {}} />);
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
