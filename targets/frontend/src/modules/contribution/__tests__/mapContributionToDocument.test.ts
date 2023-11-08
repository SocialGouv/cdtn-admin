import { ContributionsAnswers } from "@shared/types";
import { mapContributionToDocument } from "../mapContributionToDocument";
import InputContributionAnswer from "./__mocks__/contribution-answer-input.json";
import OutputContributionAnswer from "./__mocks__/contribution-answer-output.json";

describe("mapContributionToDocument", () => {
  describe("Sans document", () => {
    it("devrait mapper l'answer en document", () => {
      const result = mapContributionToDocument(
        InputContributionAnswer as unknown as ContributionsAnswers
      );
      expect(result).toEqual(OutputContributionAnswer);
    });
  });
});
