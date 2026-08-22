import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "../src/redis/redis.service";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";

const OWNER_TICKET = "invoices-owner-ticket";

const OWNER_CLAIMS = JSON.stringify({
  sub: "auth0|owner",
  email: "owner@clared.test",
  name: "Ada Owner",
  groups: ["clared-owner"],
});

const LINE_ITEMS = [
  { bezeichnung: "Beratung", menge: 2, einzelpreis: 150 },
  { bezeichnung: "Reisekosten", menge: 1, einzelpreis: 80 },
];

describe("phase03-product", () => {
  describe("Invoices (e2e)", () => {
    let app: INestApplication;
    let ownerToken: string;
    let entityId: string;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.listen(0);

      const redis = app.get(RedisService);
      await redis.set(`ticket:${OWNER_TICKET}`, OWNER_CLAIMS, "EX", 60, "NX");

      const ownerSession = await request(app.getHttpServer())
        .post("/auth/session")
        .send({ ticket: OWNER_TICKET })
        .expect(200);
      ownerToken = ownerSession.body.token as string;

      const entity = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Invoice Seller GmbH",
          country: "AT",
          legalForm: "GmbH",
          address: "Teststraße 1",
        })
        .expect(201);
      entityId = entity.body.id as string;
    });

    afterAll(async () => {
      await app.close();
    }, 15000);

    it("GET /api/invoices/:id without Authorization returns 401", () => {
      return request(app.getHttpServer())
        .get("/api/invoices/00000000-0000-0000-0000-000000000001")
        .expect(401);
    });

    it("owner POST /api/invoices with items returns 201 including items", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: LINE_ITEMS,
        })
        .expect(201);

      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.items).toHaveLength(LINE_ITEMS.length);
      expect(res.body.items[0].bezeichnung).toBe(LINE_ITEMS[0].bezeichnung);
      expect(res.body.items[1].bezeichnung).toBe(LINE_ITEMS[1].bezeichnung);
    });

    it("GET /api/invoices/:id returns the same items", async () => {
      const created = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: LINE_ITEMS,
        })
        .expect(201);

      const fetched = await request(app.getHttpServer())
        .get(`/api/invoices/${created.body.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(200);

      expect(fetched.body.items).toHaveLength(LINE_ITEMS.length);
      expect(fetched.body.items[0].bezeichnung).toBe(LINE_ITEMS[0].bezeichnung);
      expect(Number(fetched.body.items[1].menge)).toBe(LINE_ITEMS[1].menge);
      expect(fetched.body.number).toMatch(/^RE-\d{4}-\d{3}$/);
    });

    it("owner POST /api/invoices with empty items array still returns 201", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: [],
        })
        .expect(201);

      expect(res.body.items).toEqual([]);
    });
  });
});
