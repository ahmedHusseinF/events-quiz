const request = require("supertest");
const app = require("../src/app");

const correctSolution = `apt.emit('apt_event')

apt.on('custom_event', () => {did_listen=true})`;

const wrongSolution = `apt.emit('apt_event')`;

describe("Test root path", () => {
  beforeEach(async () => {
    await request(app).get("/reset");
  });

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
  beforeEach(async () => {
    await request(app).get("/reset");
  });

  test("It should respond with 400 on missing submission", async () => {
    const response = await request(app).post("/submit");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing Parameter");
  });

  test("It returns error on wrong submission", async () => {
    const response = await request(app)
      .post("/submit")
      .send({
        name: "Ahmed Hussein",
        code: wrongSolution
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Failed attempt");
  });

  test("It returns the flag on correct submission", async () => {
    const response = await request(app)
      .post("/submit")
      .send({
        name: "Ahmed Hussein",
        code: correctSolution
      });

    expect(response.status).toBe(200);
    expect(response.body.flag).toContain("APT_ROCKS");
  });

  test("It returns the contest has ended", async () => {
    await request(app)
      .post("/submit")
      .send({
        name: "Ahmed Hussein",
        code: correctSolution
      });

    const response = await request(app)
      .post("/submit")
      .send({
        name: "Ahmed",
        code: correctSolution
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("already won");
  });

  test("It rejects when someone tries to kill the process", async () => {
    await request(app).get("/reset");

    const response = await request(app)
      .post("/submit")
      .send({
        name: "Ahmed",
        code: "process.exit()"
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("STAAAHP");
  });
});

describe("Test reset path", () => {
  beforeEach(async () => {
    await request(app).get("/reset");
  });

  test("It reset correctly", async () => {
    await request(app)
      .post("/submit")
      .send({
        name: "Ahmed Hussein",
        code: correctSolution
      });

    await request(app).get("/reset");

    const response = await request(app)
      .post("/submit")
      .send({
        name: "Ahmed Hussein",
        code: correctSolution
      });

    expect(response.status).toBe(200);
    expect(response.body.flag).toContain("APT_ROCKS");
  });
});

describe("Test winner path", () => {
  beforeEach(async () => {
    await request(app).get("/reset");
  });

  test("It should get the winner name correctly", async () => {
    const name = "AHMED HUSSEIN FEKRY";
    await request(app)
      .post("/submit")
      .send({
        name,
        code: correctSolution
      });

    const response = await request(app).get("/winner");

    expect(response.status).toBe(200);
    expect(response.text).toContain(name);
  });
});
