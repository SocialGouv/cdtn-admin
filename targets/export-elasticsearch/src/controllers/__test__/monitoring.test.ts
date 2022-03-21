import request from "supertest";

import app from "../../server";

describe("MonitoringController", () => {
  it("should render the healthz endpoint", async () => {
    const res = await request(app).get("/ss");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: "available" });
  });
});
