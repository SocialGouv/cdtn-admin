import { getRawColumns } from "../editInformation.mapping";

test("All rows should be included (with null value also)", () => {
  const rows = getRawColumns({
    id: "58d8f41e-b31b-47a2-a9d9-f079773ae86a",
    name: "Cas 1",
    title: "Cas 1",
    referenceLabel: null,
    order: 1,
    blocks: [
      {
        id: "f0e86b70-475d-4156-9df7-06a9fdf6e6e1",
        content: "Toto",
        type: "markdown",
        order: 1,
      },
      {
        id: "ebe5f760-4907-47be-88bb-edc244a7849d",
        content: "test",
        type: "markdown",
        order: 2,
      },
      {
        id: "cfadf03c-f540-4904-bc27-69877f9d9be9",
        content: "Test 3",
        type: "markdown",
        order: 3,
      },
      {
        id: "73223a87-e142-44e8-9cfb-d1353e1bf71d",
        content: "Test 4",
        type: "markdown",
        order: 4,
      },
    ],
    references: [],
  });

  expect(rows).toEqual(["id", "name", "title", "referenceLabel", "order"]);
});
