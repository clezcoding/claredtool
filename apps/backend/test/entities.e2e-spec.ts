import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "../src/redis/redis.service";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";

const OWNER_TICKET = "entities-owner-ticket";
const VIEWER_TICKET = "entities-viewer-ticket";

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

const ENTITY_BODY = {
  name: "Acme AT GmbH",
  country: "AT",
  legalForm: "GmbH",
  address: "Mariahilfer Straße 1, 1060 Wien",
};

const CUSTOMER_BODY = {
  name: "Buyer DE GmbH",
  country: "DE",
  address: "Hauptstraße 1, 10115 Berlin",
  vatId: "DE123456789",
};

describe("phase03-product", () => {
  describe("Entities (e2e)", () => {
    let app: INestApplication;
    let ownerToken: string;
    let viewerToken: string;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.listen(0);

      const redis = app.get(RedisService);
      await redis.set(`ticket:${OWNER_TICKET}`, OWNER_CLAIMS, "EX", 60, "NX");
      await redis.set(`ticket:${VIEWER_TICKET}`, VIEWER_CLAIMS, "EX", 60, "NX");

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
    });

    afterAll(async () => {
      await app.close();
    }, 15000);

    it("GET /api/entities without Authorization returns 401", () => {
      return request(app.getHttpServer()).get("/api/entities").expect(401);
    });

    it("owner POST /api/entities returns 201 with id (entity.create)", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(ENTITY_BODY)
        .expect(201);

      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.name).toBe(ENTITY_BODY.name);
      expect(res.body.country).toBe(ENTITY_BODY.country);
      expect(res.body.legalForm).toBe(ENTITY_BODY.legalForm);
      expect(res.body.address).toBe(ENTITY_BODY.address);
    });

    it("owner GET /api/entities returns 200 array including created entity (entity.read)", async () => {
      const created = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          ...ENTITY_BODY,
          name: "List Test Entity GmbH",
        })
        .expect(201);

      const list = await request(app.getHttpServer())
        .get("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(list.body)).toBe(true);
      expect(list.body.some((row: { id: string }) => row.id === created.body.id)).toBe(
        true,
      );
    });

    it("owner POST customer then GET /api/customers?entityId= returns 200 array (kunde.read)", async () => {
      const entity = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          ...ENTITY_BODY,
          name: "Customer Parent GmbH",
        })
        .expect(201);

      const customer = await request(app.getHttpServer())
        .post("/api/customers")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          ...CUSTOMER_BODY,
          entityId: entity.body.id,
        })
        .expect(201);

      const list = await request(app.getHttpServer())
        .get("/api/customers")
        .query({ entityId: entity.body.id })
        .set("Authorization", `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(list.body)).toBe(true);
      expect(
        list.body.some((row: { id: string }) => row.id === customer.body.id),
      ).toBe(true);
    });

    it("viewer POST /api/entities returns 403 without entity.create", () => {
      return request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send(ENTITY_BODY)
        .expect(403);
    });

    it("two identical owner POSTs return 201 with different ids (no name uniqueness)", async () => {
      const first = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(ENTITY_BODY)
        .expect(201);

      const second = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(ENTITY_BODY)
        .expect(201);

      expect(first.body.id).not.toBe(second.body.id);
    });
  });
});
