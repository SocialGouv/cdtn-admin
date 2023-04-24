import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ContributionsList } from "../ContributionsList";

jest.mock("../ContributionsList.query");

jest.mock("next/router", () => ({
  useRouter: () => {
    return { push: jest.fn() };
  },
}));

describe("ContributionsList", () => {
  beforeEach(() => {
    render(<ContributionsList />);
  });
  test("Verify inputs presence", () => {
    expect(screen.getByTestId("contributions-list-search")).toBeInTheDocument();
    expect(screen.getByTestId("contributions-list-idcc")).toBeInTheDocument();
  });
  test("Verify question display", () => {
    expect(screen.queryByText("question1")).toBeInTheDocument();
    expect(screen.queryByText("question2")).toBeInTheDocument();
    expect(screen.queryByText("0001")).not.toBeInTheDocument();
    expect(screen.queryByText("0002")).not.toBeInTheDocument();
  });
  describe("On collapse click", () => {
    beforeEach(() => {
      fireEvent.click(screen.queryAllByTestId("KeyboardArrowDownIcon")[0]);
    });
    test("Verify answer display", () => {
      expect(screen.queryByText("0001")).toBeInTheDocument();
      expect(screen.queryByText("0002")).toBeInTheDocument();
    });
    test("Verify status display", () => {
      expect(screen.queryByText("0001")).toBeInTheDocument();
      expect(screen.queryByTestId("questionId1-0001-todo")).toBeInTheDocument();
      expect(
        screen.queryByTestId("questionId1-0001-done")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("0002")).toBeInTheDocument();
      expect(
        screen.queryByTestId("questionId1-0002-todo")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("questionId1-0002-done")).toBeInTheDocument();
    });
  });
});
