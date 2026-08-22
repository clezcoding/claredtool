import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "../src/redis/redis.service";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";

const OWNER_TICKET = "customers-owner-ticket";

const OWNER_CLAIMS = JSON.stringify({
  sub: "auth0|owner-customers",
  email: "owner@clared.test",
  name: "Ada Owner",
  groups: ["clared-owner"],
});

describe("phase03-product", () => {
  describe("Customers (e2e)", () => {
    let app: INestApplication;
    let ownerToken: string;

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
    });

    afterAll(async () => {
      await app.close();
    }, 15000);

    it("POST /api/customers without entityId returns 400", () => {
      return request(app.getHttpServer())
        .post("/api/customers")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Orphan Kunde",
          country: "DE",
          address: "Hauptstraße 1, 10115 Berlin",
          vatId: "DE123456789",
        })
        .expect(400);
    });

    it("POST /api/customers with entityId returns 201", async () => {
      const entity = await request(app.getHttpServer())
        .post("/api/entities")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Parent Entity GmbH",
          country: "DE",
          legalForm: "GmbH",
          address: "Teststraße 1, 10115 Berlin",
          vatId: "DE123456789",
        })
        .expect(201);

      const customer = await request(app.getHttpServer())
        .post("/api/customers")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          entityId: entity.body.id,
          name: "Buyer DE GmbH",
          country: "DE",
          address: "Hauptstraße 1, 10115 Berlin",
          vatId: "DE987654321",
        })
        .expect(201);

      expect(customer.body.id).toEqual(expect.any(String));
      expect(customer.body.entityId).toBe(entity.body.id);
    });
  });
});
