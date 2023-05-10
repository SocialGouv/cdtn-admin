import { insertReferences } from "../../lib/hasura-mutations-queries";
import { updateKaliData } from "../update-kali-data";

jest.mock("../../lib/hasura-mutations-queries");
jest.setTimeout(10000);

// TODO  run test @max
describe("update-kali-data", () => {
  it(`should store references in hasura`, async () => {
    await updateKaliData();

    expect(insertReferences).toHaveBeenCalledTimes(3);
  });
});
