import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { NewsSortableList } from "../NewsSortableList";

jest.mock("@codegouvfr/react-dsfr", () => ({
  fr: {
    colors: {
      decisions: {
        border: {
          default: { grey: { default: "var(--border-default-grey)" } },
        },
      },
    },
  },
}));

type Item = { id: string; title: string };

const items: Item[] = [
  { id: "a", title: "A" },
  { id: "b", title: "B" },
];

describe("NewsSortableList", () => {
  let onMove: jest.Mock;
  let onRemove: jest.Mock;

  beforeEach(() => {
    onMove = jest.fn();
    onRemove = jest.fn();
    render(
      <NewsSortableList
        items={items}
        onMove={onMove}
        onRemove={onRemove}
        renderItem={(item) => <span>{item.title}</span>}
        itemLabel={(item) => item.title}
      />
    );
  });

  test("clicking « Descendre A » moves the first item down", () => {
    fireEvent.click(screen.getByRole("button", { name: "Descendre A" }));
    expect(onMove).toHaveBeenCalledWith(0, 1);
  });

  test("« Monter A » is disabled on the first item", () => {
    expect(screen.getByRole("button", { name: "Monter A" })).toBeDisabled();
  });

  test("clicking « Supprimer B » removes the second item", () => {
    fireEvent.click(screen.getByRole("button", { name: "Supprimer B" }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
