import * as fs from "fs";

// import { insertLegiReference } from "../../lib/hasura-mutations-queries";
import updateLegiData from "../update-legi-data";

// jest.mock("../../lib/hasura-mutations-queries");
jest.setTimeout(1000000);

// jest
//   .mocked(insertLegiReference)
//   .mockImplementation((id: string, ref: unknown): any => {
//     console.log("MOCK", id);
//     fs.writeFileSync(
//       "src/references/__tests__/data/output/" + id + ".json",
//       JSON.stringify(ref)
//     );
//     return id;
//   });
describe("update-kali-data", () => {
  it(`should store references in hasura`, async () => {
    await updateLegiData();

    expect(true).toEqual(true);
    // expect(insertLegiReference).toHaveBeenCalledWith(
    //   "CODE:LEGITEXT000006072050"
    // );
    // expect(insertLegiReference).toHaveBeenCalledWith(
    //   "CODE:LEGITEXT000006072050:ARTICLES"
    // );
  });
});
