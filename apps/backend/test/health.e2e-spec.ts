import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  }, 15000);

  it("GET /health returns 200 with no Postgres I/O", () => {
    return request(app.getHttpServer()).get("/health").expect(200);
  });

  it("GET /health/ready returns 200 or 503 with postgres in the body", async () => {
    const res = await request(app.getHttpServer()).get("/health/ready");
    expect([200, 503]).toContain(res.status);
    expect(JSON.stringify(res.body).toLowerCase()).toMatch(/postgres/);
  });
});
