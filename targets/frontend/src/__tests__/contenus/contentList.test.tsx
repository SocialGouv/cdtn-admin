import { render, RenderResult } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { DocumentsPage } from "src/pages/contenus";

jest.mock("next/router", () => ({
  ...jest.requireActual("next/router"),
  useRouter: () => ({
    query: {},
  }),
}));

describe("Given parameters", () => {
  describe("When rendering the component DocumentsPage", () => {
    let rendering: RenderResult;
    beforeEach(async () => {
      await act(async () => {
        rendering = render(<DocumentsPage />);
      });
    });
    it("doit afficher le titre", () => {
      expect(rendering.queryAllByText("Contenus")[0]).toBeInTheDocument();
    });
  });
});
