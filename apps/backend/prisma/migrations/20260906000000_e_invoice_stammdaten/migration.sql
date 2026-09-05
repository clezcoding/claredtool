-- AlterTable entities: structured address + optional contact/bank/legal (D-14, D-16, D-20, D-21, Q1, Q2)
ALTER TABLE "entities" DROP COLUMN "address",
ADD COLUMN "street" TEXT NOT NULL,
ADD COLUMN "address_line2" TEXT,
ADD COLUMN "postal_code" TEXT NOT NULL,
ADD COLUMN "city" TEXT NOT NULL,
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "iban" TEXT,
ADD COLUMN "bic" TEXT,
ADD COLUMN "hrb" TEXT,
ADD COLUMN "managing_director" TEXT;

-- AlterTable customers: structured address + optional Leitweg/Buyer-Ref (D-16, D-19, D-20, D-21)
ALTER TABLE "customers" DROP COLUMN "address",
ADD COLUMN "street" TEXT NOT NULL,
ADD COLUMN "address_line2" TEXT,
ADD COLUMN "postal_code" TEXT NOT NULL,
ADD COLUMN "city" TEXT NOT NULL,
ADD COLUMN "leitweg_id" TEXT,
ADD COLUMN "buyer_reference" TEXT;

-- AlterTable invoice_items: UNECE unit default C62 (D-30)
ALTER TABLE "invoice_items" ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'C62';
