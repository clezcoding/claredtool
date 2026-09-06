import { CustomersService } from "./customers.service";

describe("CustomersService", () => {
  const create = jest.fn();
  const service = new CustomersService({
    customer: { create, findMany: jest.fn() },
  } as never);

  beforeEach(() => {
    create.mockReset();
    create.mockResolvedValue({ id: "c1" });
  });

  it("maps structured address and optional Leitweg fields", async () => {
    await service.create({
      entityId: "00000000-0000-0000-0000-000000000001",
      name: "Buyer GmbH",
      country: "DE",
      street: "Kundenweg 2",
      postalCode: "80331",
      city: "München",
      vatId: "DE987654321",
      leitwegId: "991-12345-67",
      buyerReference: "PO-42",
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        street: "Kundenweg 2",
        postalCode: "80331",
        city: "München",
        leitwegId: "991-12345-67",
        buyerReference: "PO-42",
      }),
    });
  });
});
