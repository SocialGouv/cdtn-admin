import { batchPromises, chunk } from "../batchPromises";

test("chunks should split array in chunks", () => {
  expect(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 3)).toEqual([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [0],
  ]);
});

test("bactchPromise should batch jobs in parallel", async () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  expect(await batchPromises(data, async (b) => Promise.resolve(b), 2)).toEqual(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  );
});
