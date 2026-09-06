import { UnprocessableEntityException } from "@nestjs/common";
import { EntitiesService } from "./entities.service";

describe("EntitiesService", () => {
  const create = jest.fn();
  const service = new EntitiesService({
    entity: { create, findMany: jest.fn() },
  } as never);

  beforeEach(() => {
    create.mockReset();
    create.mockResolvedValue({ id: "e1" });
  });

  it("maps structured stammdaten into prisma create", async () => {
    await service.create({
      name: "Acme GmbH",
      country: "DE",
      legalForm: "GmbH",
      street: "Hauptstraße 1",
      postalCode: "10115",
      city: "Berlin",
      vatId: "DE123456789",
      email: "billing@acme.test",
      phone: "+493012345",
      iban: "DE89370400440532013000",
      bic: "COBADEFFXXX",
      hrb: "HRB 12345",
      managingDirector: "Ada Owner",
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        street: "Hauptstraße 1",
        postalCode: "10115",
        city: "Berlin",
        email: "billing@acme.test",
        phone: "+493012345",
        iban: "DE89370400440532013000",
        bic: "COBADEFFXXX",
        hrb: "HRB 12345",
        managingDirector: "Ada Owner",
        currencyDefault: "EUR",
      }),
    });
  });

  it("rejects invalid legalForm for country", async () => {
    await expect(
      service.create({
        name: "Bad",
        country: "DE",
        legalForm: "LLC",
        street: "x",
        postalCode: "1",
        city: "Berlin",
        vatId: "DE123456789",
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
