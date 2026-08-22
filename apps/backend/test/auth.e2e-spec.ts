import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { SESSION_TTL_SECONDS, TICKET_TTL_SECONDS } from "../src/auth/ttl";
import { MemoryStore } from "../src/auth/memory-store";

describe("Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /me without Authorization returns 401", () => {
    return request(app.getHttpServer()).get("/me").expect(401);
  });

  it("GET /api/invoices without Authorization returns 401", () => {
    return request(app.getHttpServer()).get("/api/invoices").expect(401);
  });

  it("second POST /auth/session with the same ticket returns 401", async () => {
    const ticket = "replay-ticket";
    await request(app.getHttpServer()).post("/auth/session").send({ ticket });
    await request(app.getHttpServer())
      .post("/auth/session")
      .send({ ticket })
      .expect(401);
  });

  it("sets ticket EX 60 and session EX 86400 as integer seconds", () => {
    expect(TICKET_TTL_SECONDS).toBe(60);
    expect(SESSION_TTL_SECONDS).toBe(86400);
    const store = new MemoryStore();
    expect(store.ticketTtlSeconds).toBe(60);
    expect(store.sessionTtlSeconds).toBe(86400);
  });

  it("parallel POST /auth/session with the same ticket yields one 200 and one 401", async () => {
    const ticket = "parallel-ticket";
    const [first, second] = await Promise.all([
      request(app.getHttpServer()).post("/auth/session").send({ ticket }),
      request(app.getHttpServer()).post("/auth/session").send({ ticket }),
    ]);
    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 401]);
  });

  it("POST /auth/logout with Bearer DELs only that session", async () => {
    const first = await request(app.getHttpServer())
      .post("/auth/session")
      .send({ ticket: "logout-ticket-a" });
    const second = await request(app.getHttpServer())
      .post("/auth/session")
      .send({ ticket: "logout-ticket-b" });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const tokenA = first.body.token as string;
    const tokenB = second.body.token as string;

    await request(app.getHttpServer())
      .post("/auth/logout")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    await request(app.getHttpServer())
      .get("/me")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(401);

    await request(app.getHttpServer())
      .get("/me")
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);
  });
});
