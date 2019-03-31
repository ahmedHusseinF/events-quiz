const request = require("supertest");
const app = require("../src/app");

describe("Test root path", () => {
  test("It should respond 200 to a GET method", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  test("It should respond with content type text/html", async () => {
    const response = await request(app).get("/");
    expect(response.header["content-type"]).toContain("text/html");
  });

  test("It should respond with html that contain textarea", async () => {
    const response = await request(app).get("/");
    expect(response.text).toContain("<textarea");
  });
});

describe("Test submit path", () => {
  test("It should respond with html that contain textarea", async () => {
    const response = await request(app).post("/submit");
  });
});
