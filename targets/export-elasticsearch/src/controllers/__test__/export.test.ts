import request from "supertest";

import app from "../..";
import { Status } from "../../types";

jest.mock("@shared/elasticsearch-document-adapter", () => () => ({
  injest: () => {
    console.log("ok");
  },
}));

describe("ExportController", () => {
  // eslint-disable-next-line jest/no-done-callback
  it("should send the status running when then server is running", (done) => {
    request(app)
      .post("/export/run")
      .expect("Content-Type", /json/)
      .expect(202)
      .expect((res) => {
        expect(res.body).toEqual({ status: Status.running });
      })
      .end((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (err) return done(err);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return done();
      });
  });
});
