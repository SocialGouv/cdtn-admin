import { render, screen, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { AnswerForm } from "../AnswerForm";

describe("Given a component AnswerForm and a basic default non generic answer", () => {
  beforeEach(() => {
    render(
      <AnswerForm
        answer={{
          id: "369336d2-994f-48b1-b6ac-fec78cff240e",
          questionId: "2c820037-62bd-4c0e-a1a8-ca80b97b5958",
          agreementId: "0016",
          content: "",
          contentType: "ANSWER",
          updatedAt: "2023-09-29T14:09:52.01401+00:00",
          contentServicePublicCdtnId: null,
          question: {
            id: "2c820037-62bd-4c0e-a1a8-ca80b97b5958",
            content: "Quelle est la durée maximale de la période d’essai ?",
            order: 5,
          },
          agreement: {
            id: "0016",
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
            status: "TODO",
          },
          updateDate: "29/09/2023",
        }}
        onSubmit={() => {}}
      />
    );
  });
  describe("When i click on submit", () => {
    beforeEach(() => {
      expect(screen.getByText("Afficher la réponse")).toBeInTheDocument();
      userEvent.click(screen.getByText("Afficher la réponse"));
      expect(screen.getByText("Soumettre")).toBeInTheDocument();
      userEvent.click(screen.getByText("Soumettre"));
    });
    test("Check if content required error message displays", () => {
      expect(
        screen.getByText("Une réponse doit être renseigner")
      ).toBeInTheDocument();
    });
  });
});
