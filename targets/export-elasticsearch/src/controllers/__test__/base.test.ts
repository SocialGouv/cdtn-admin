import request from "supertest";

import { app } from "../..";

describe("BaseController", () => {
  it("should render the home endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: "available" });
  });
});
