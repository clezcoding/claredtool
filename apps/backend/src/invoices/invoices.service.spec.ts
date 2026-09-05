import { NotFoundException } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";

describe("InvoicesService", () => {
  const findUnique = jest.fn();
  const create = jest.fn();
  const $transaction = jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      $queryRaw: jest.fn().mockResolvedValue([{ last: 1 }]),
      invoice: { create },
    }),
  );

  const service = new InvoicesService({
    entity: { findUnique },
    customer: { findUnique: jest.fn() },
    invoice: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    $transaction,
  } as never);

  beforeEach(() => {
    findUnique.mockReset();
    create.mockReset();
    $transaction.mockClear();
    findUnique.mockResolvedValue({
      id: "e1",
      currencyDefault: "EUR",
    });
    create.mockResolvedValue({ id: "i1", items: [] });
  });

  it("defaults invoice item unit to C62", async () => {
    await service.create({
      entityId: "e1",
      items: [{ bezeichnung: "Arbeit", menge: 1, einzelpreis: 100 }],
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          supplyType: "service",
          items: {
            createMany: {
              data: [
                expect.objectContaining({
                  unit: "C62",
                  netto: 100,
                }),
              ],
            },
          },
        }),
      }),
    );
  });

  it("throws when entity missing", async () => {
    findUnique.mockResolvedValue(null);
    await expect(
      service.create({
        entityId: "missing",
        items: [{ bezeichnung: "x", menge: 1, einzelpreis: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
