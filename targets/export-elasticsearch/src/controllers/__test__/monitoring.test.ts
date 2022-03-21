import request from "supertest";

import app from "../..";

describe("MonitoringController", () => {
  // it("should render the healthz endpoint", async () => {
  //   const res = await request.get("/healthz");
  //   expect(res.statusCode).toEqual(200);
  //   expect(res.body).toEqual({ status: "available" });
  // });

  it("should send the status running when then server is running", (done) => {
    request(app)
      .post("/healthz")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ status: "available" });
      })
      .end((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (err) return done(err);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return done();
      });
  });
});
