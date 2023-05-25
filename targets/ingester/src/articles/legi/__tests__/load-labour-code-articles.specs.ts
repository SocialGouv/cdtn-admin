import { loadLabourCodeArticles } from "../load-labour-code-articles";
import LabourCode from "./labour-code.json";

const loadCodeTravail = async (): Promise<LegiData.Code> => {
  return Promise.resolve(LabourCode as unknown as LegiData.Code);
};

test("Load articles of labour code", async () => {
  const result = await loadLabourCodeArticles(loadCodeTravail);
  expect(result).toEqual([
    {
      cid: "LEGIARTI000017961623",
      id: "LEGIARTI000018764571",
      index: "L1",
    },
  ]);
});
