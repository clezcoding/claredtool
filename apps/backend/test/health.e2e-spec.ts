import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RuleSeedService } from "../src/tax/rule-seed";

process.env.AUTH_TEST_MODE = "1";
process.env.GIT_SHA = "e2e-health-build-sha";
process.env.DATABASE_URL ??=
  "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";

const PII_KEYS = ["customerName", "iban", "authorization", "access_token"];

describe("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RuleSeedService)
      .useValue({ onModuleInit: async () => undefined })
      .compile();
    app = moduleFixture.createNestApplication();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  }, 15000);

  it("GET /health returns 200 with status ok and no PII keys", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
    const json = JSON.stringify(res.body);
    for (const key of PII_KEYS) {
      expect(json).not.toContain(key);
    }
  });

  it("GET /health/build returns 200 with top-level sha equal to GIT_SHA", async () => {
    const res = await request(app.getHttpServer()).get("/health/build").expect(200);
    expect(res.body).toEqual({ status: "ok", sha: "e2e-health-build-sha" });
  });

  it("GET /health/ready returns 200 or 503 with postgres and redis in the body", async () => {
    const res = await request(app.getHttpServer()).get("/health/ready");
    expect([200, 503]).toContain(res.status);
    const body = JSON.stringify(res.body).toLowerCase();
    expect(body).toMatch(/postgres/);
    expect(body).toMatch(/redis/);
  });
});
