-- AlterTable entities/customers/invoice_items: structured stammdaten (squawk-safe)
BEGIN;

SET LOCAL lock_timeout = '1s';
SET LOCAL statement_timeout = '5s';

-- entities: structured address + optional contact/bank/legal (D-14, D-16, D-20, D-21, Q1, Q2)
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "address_line2" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "postal_code" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "iban" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "bic" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "hrb" TEXT;
ALTER TABLE "entities" ADD COLUMN IF NOT EXISTS "managing_director" TEXT;

UPDATE "entities"
SET
  "street" = COALESCE(NULLIF("street", ''), COALESCE("address", '')),
  "postal_code" = COALESCE("postal_code", ''),
  "city" = COALESCE("city", '')
WHERE "street" IS NULL OR "postal_code" IS NULL OR "city" IS NULL;

ALTER TABLE "entities" ALTER COLUMN "street" SET NOT NULL;
ALTER TABLE "entities" ALTER COLUMN "postal_code" SET NOT NULL;
ALTER TABLE "entities" ALTER COLUMN "city" SET NOT NULL;

ALTER TABLE "entities" DROP COLUMN IF EXISTS "address";

-- customers: structured address + optional Leitweg/Buyer-Ref (D-16, D-19, D-20, D-21)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "address_line2" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "postal_code" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "leitweg_id" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "buyer_reference" TEXT;

UPDATE "customers"
SET
  "street" = COALESCE(NULLIF("street", ''), COALESCE("address", '')),
  "postal_code" = COALESCE("postal_code", ''),
  "city" = COALESCE("city", '')
WHERE "street" IS NULL OR "postal_code" IS NULL OR "city" IS NULL;

ALTER TABLE "customers" ALTER COLUMN "street" SET NOT NULL;
ALTER TABLE "customers" ALTER COLUMN "postal_code" SET NOT NULL;
ALTER TABLE "customers" ALTER COLUMN "city" SET NOT NULL;

ALTER TABLE "customers" DROP COLUMN IF EXISTS "address";

-- invoice_items: UNECE unit default C62 (D-30)
ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "unit" TEXT NOT NULL DEFAULT 'C62';

COMMIT;
