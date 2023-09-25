import { render, screen } from "@testing-library/react";
import React from "react";

import { QuestionList } from "..";

jest.mock("../QuestionList.query");

jest.mock("next/router", () => ({
  useRouter: () => {
    return { push: jest.fn() };
  },
}));
jest.mock("@codegouvfr/react-dsfr", () => ({
  fr: {
    colors: {
      decisions: {
        text: {
          default: {
            error: {},
            info: {},
            warning: {},
            success: {},
            grey: {},
          },
          actionHigh: { blueCumulus: {} },
          label: { greenBourgeon: {} },
        },
      },
    },
  },
}));

describe("QuestionList", () => {
  beforeEach(() => {
    render(<QuestionList />);
  });
  test("Verify inputs presence", () => {
    expect(screen.getByTestId("contributions-list-search")).toBeInTheDocument();
  });
  test("Verify question display", () => {
    expect(screen.queryByText("question1")).toBeInTheDocument();
    expect(screen.queryByText("question2")).toBeInTheDocument();
  });
});
