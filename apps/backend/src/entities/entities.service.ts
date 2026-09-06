import {
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEntityDto } from "./dto/create-entity.dto";
import { isValidLegalForm } from "./legal-forms";

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEntityDto) {
    if (!isValidLegalForm(dto.country, dto.legalForm)) {
      throw new UnprocessableEntityException(
        "legalForm is not valid for the given country",
      );
    }

    return this.prisma.entity.create({
      data: {
        name: dto.name,
        country: dto.country,
        legalForm: dto.legalForm,
        street: dto.street,
        addressLine2: dto.addressLine2,
        postalCode: dto.postalCode,
        city: dto.city,
        vatId: dto.vatId,
        currencyDefault: dto.currencyDefault ?? "EUR",
        email: dto.email,
        phone: dto.phone,
        iban: dto.iban,
        bic: dto.bic,
        hrb: dto.hrb,
        managingDirector: dto.managingDirector,
      },
    });
  }

  async findAll() {
    return this.prisma.entity.findMany({ orderBy: { createdAt: "desc" } });
  }
}
