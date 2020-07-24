import { uniq } from "../compareTree";

const data = [
  {
    data: { cid: "100", id: "123" },
    type: "article",
  },
  {
    data: { cid: "100", id: "100" },
    type: "article",
  },
  {
    data: { cid: "100", id: "111" },
    type: "article",
  },
  {
    data: { cid: "200", id: "202" },
    type: "article",
  },
  {
    data: { cid: "300", id: "300" },
    type: "article",
  },
  {
    data: { cid: "300", id: "333" },
    type: "article",
  },
];

const expected = [
  {
    data: { cid: "100", id: "123" },
    type: "article",
  },
  {
    data: { cid: "200", id: "202" },
    type: "article",
  },
  {
    data: { cid: "300", id: "333" },
    type: "article",
  },
];

it("should keep only last version", () => {
  expect(data.filter(uniq)).toEqual(expected);
});
