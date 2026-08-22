import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "../src/redis/redis.service";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";

const OWNER_TICKET = "invoices-owner-ticket";
const VIEWER_TICKET = "invoices-viewer-ticket";
const ACCOUNTANT_TICKET = "invoices-accountant-ticket";

const OWNER_CLAIMS = JSON.stringify({
  sub: "auth0|owner",
  email: "owner@clared.test",
  name: "Ada Owner",
  groups: ["clared-owner"],
});

const VIEWER_CLAIMS = JSON.stringify({
  sub: "auth0|viewer",
  email: "viewer@clared.test",
  name: "Vera Viewer",
  groups: ["clared-viewer"],
});

const ACCOUNTANT_CLAIMS = JSON.stringify({
  sub: "auth0|accountant",
  email: "accountant@clared.test",
  name: "Ann Accountant",
  groups: ["clared-accountant"],
});

const LINE_ITEMS = [
  { bezeichnung: "Beratung", menge: 2, einzelpreis: 150 },
  { bezeichnung: "Reisekosten", menge: 1, einzelpreis: 80 },
];

describe("phase03-product", () => {
  describe("Invoices (e2e)", () => {
    let app: INestApplication;
    let ownerToken: string;
    let viewerToken: string;
    let accountantToken: string;
    let entityId: string;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.listen(0);

      const redis = app.get(RedisService);
      await redis.set(`ticket:${OWNER_TICKET}`, OWNER_CLAIMS, "EX", 60, "NX");
      await redis.set(`ticket:${VIEWER_TICKET}`, VIEWER_CLAIMS, "EX", 60, "NX");
      await redis.set(
        `ticket:${ACCOUNTANT_TICKET}`,
        ACCOUNTANT_CLAIMS,
        "EX",
        60,
        "NX",
      );

      const ownerSession = await request(app.getHttpServer())
        .post("/auth/session")
        .send({ ticket: OWNER_TICKET })
        .expect(200);
      ownerToken = ownerSession.body.token as string;

      const viewerSession = await request(app.getHttpServer())
        .post("/auth/session")
        .send({ ticket: VIEWER_TICKET })
        .expect(200);
      viewerToken = viewerSession.body.token as string;

      const accountantSession = await request(app.getHttpServer())
        .post("/auth/session")
        .send({ ticket: ACCOUNTANT_TICKET })
        .expect(200);
      accountantToken = accountantSession.body.token as string;

      const entity = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Invoice Seller GmbH",
          country: "AT",
          legalForm: "GmbH",
          address: "Teststraße 1",
          vatId: "ATU12345678",
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

    it("GET /api/invoices returns drafts sorted by updatedAt descending", async () => {
      const older = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: [{ bezeichnung: "Older", menge: 1, einzelpreis: 10 }],
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const newer = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "USD",
          items: [{ bezeichnung: "Newer", menge: 1, einzelpreis: 20 }],
        })
        .expect(201);

      const list = await request(app.getHttpServer())
        .get("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(list.body)).toBe(true);
      const ids = (list.body as { id: string }[]).map((row) => row.id);
      expect(ids.indexOf(newer.body.id)).toBeLessThan(ids.indexOf(older.body.id));
    });

    it("PATCH /api/invoices/:id replaces items and updates draft fields", async () => {
      const created = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: LINE_ITEMS,
        })
        .expect(201);

      const originalNumber = created.body.number as string;

      const patched = await request(app.getHttpServer())
        .patch(`/api/invoices/${created.body.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          currency: "USD",
          date: "2026-08-20",
          dueDate: "2026-09-20",
          items: [{ bezeichnung: "Updated", menge: 3, einzelpreis: 50 }],
        })
        .expect(200);

      expect(patched.body.currency).toBe("USD");
      expect(patched.body.number).toBe(originalNumber);
      expect(patched.body.items).toHaveLength(1);
      expect(patched.body.items[0].bezeichnung).toBe("Updated");
      expect(patched.body.items[0].position).toBe(0);
    });

    it("viewer without invoice.write cannot PATCH (403)", async () => {
      const created = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: LINE_ITEMS,
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/invoices/${created.body.id}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          currency: "USD",
          items: [{ bezeichnung: "Blocked", menge: 1, einzelpreis: 1 }],
        })
        .expect(403);
    });

    it("accountant GET /api/invoices/:id returns 200 via invoice.read", async () => {
      const created = await request(app.getHttpServer())
        .post("/api/invoices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId,
          currency: "EUR",
          items: LINE_ITEMS,
        })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/invoices/${created.body.id}`)
        .set("Authorization", `Bearer ${accountantToken}`)
        .expect(200);
    });

    it("PATCH /api/invoices/:id returns 404 when id missing", async () => {
      await request(app.getHttpServer())
        .patch("/api/invoices/00000000-0000-0000-0000-000000000099")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          currency: "EUR",
          items: [],
        })
        .expect(404);
    });
  });
});
