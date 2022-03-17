import { BaseService } from "../base";

describe("BaseService", () => {
  it("should return an ok status", () => {
    const service = new BaseService();

    expect(service.get()).toEqual({ status: "available" });
  });
});
