import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { RedisService } from "../src/redis/redis.service";

process.env.AUTH_TEST_MODE = "1";
process.env.DATABASE_URL ??=
  "postgresql://clared_app:clared_app_dev@127.0.0.1:5432/clared";

const OWNER_TICKET = "tax-owner-ticket";

const OWNER_CLAIMS = JSON.stringify({
  sub: "auth0|owner",
  email: "owner@clared.test",
  name: "Ada Owner",
  groups: ["clared-owner"],
});

/** Invoice-shaped body (D-18) — not TransactionFacts keys. */
const INTRA_EU_INVOICE_BODY = {
  seller: {
    country: "AT",
    legalForm: "GmbH",
    vatId: "ATU12345678",
  },
  customer: {
    country: "DE",
    name: "Buyer GmbH",
    vatId: "DE123456789",
  },
  currency: "EUR",
  items: [{ bezeichnung: "Consulting", menge: 1, einzelpreis: 1000 }],
};

const CANONICAL_TAX_KEYS = [
  "place_of_supply_country",
  "tax_liability_party",
  "invoice_tax_rate",
  "invoice_tax_shown",
  "reverse_charge_flag",
  "legal_reference",
  "invoice_text_block_id",
  "applied_rule_id",
  "applied_rule_version",
] as const;

describe("phase03-product", () => {
  describe("Tax evaluate (e2e)", () => {
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

    it("POST /api/tax/evaluate without Authorization returns 401", () => {
      return request(app.getHttpServer())
        .post("/api/tax/evaluate")
        .send(INTRA_EU_INVOICE_BODY)
        .expect(401);
    });

    it("owner POST /api/tax/evaluate with invoice-shaped body returns 200 canonical TaxDecision", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/tax/evaluate")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(INTRA_EU_INVOICE_BODY)
        .expect(200);

      for (const key of CANONICAL_TAX_KEYS) {
        expect(res.body).toHaveProperty(key);
      }
      expect(res.body.invoice_tax_rate).toEqual(expect.any(Number));
      expect(res.body.reverse_charge_flag).toEqual(expect.any(Boolean));
      expect(res.body.legal_reference).toEqual(expect.any(String));
      expect(res.body.applied_rule_id).toBe("EU_INTRACOMM_B2B_SERVICE");
    });

    it("POST /api/tax/evaluate with unclassifiable body returns 422 (no priority pick)", async () => {
      await request(app.getHttpServer())
        .post("/api/tax/evaluate")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          seller: { country: "XX", legalForm: "Unknown" },
          customer: { country: "YY", name: "Nobody" },
          currency: "EUR",
          items: [],
        })
        .expect(422);
    });
  });
});
