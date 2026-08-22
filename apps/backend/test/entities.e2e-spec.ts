import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "../src/redis/redis.service";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://prisma-test:unused@127.0.0.1:5432/clared";

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

describe.skip("phase03-product", () => {
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
