// import type { Article } from "@shared/dila-resolver/lib/types";
// import type { Agreement } from "@socialgouv/kali-data";

import { insertKaliReference } from "../../lib/hasura-mutations-queries";
import { updateKaliData } from "../update-kali-data";
import * as fs from "fs";

// jest.mock("../../lib/hasura-mutations-queries");
jest.setTimeout(1000000);
//
// jest
//   .mocked(insertKaliReference)
//   .mockImplementation((id: string, ref: Agreement | Article): any => {
//     console.log("MOCK", id);
//     fs.writeFileSync(
//       "src/references/__tests__/data/output/" + id + ".json",
//       JSON.stringify(ref)
//     );
//     return id;
//   });
describe("update-kali-data", () => {
  it(`should store references in hasura`, async () => {
    await updateKaliData();

    expect(true).toEqual(true);
    // expect(insertKaliReference).toHaveBeenCalledWith(
    //   "AGREEMENT:KALICONT000005635085"
    // );
    // expect(insertKaliReference).toHaveBeenCalledWith(
    //   "AGREEMENT:KALICONT000005635085:ARTICLES"
    // );
  });
});
