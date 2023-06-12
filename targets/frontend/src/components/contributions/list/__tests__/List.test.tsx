import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ContributionsList } from "..";

jest.mock("../List.query");

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
  });
  test("Verify question display", () => {
    expect(screen.queryByText("question1")).toBeInTheDocument();
    expect(screen.queryByText("question2")).toBeInTheDocument();
  });
});
