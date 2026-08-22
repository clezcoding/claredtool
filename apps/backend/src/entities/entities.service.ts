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
        address: dto.address,
        vatId: dto.vatId,
        currencyDefault: dto.currencyDefault ?? "EUR",
      },
    });
  }

  async findAll() {
    return this.prisma.entity.findMany({ orderBy: { createdAt: "desc" } });
  }
}
