import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        entityId: dto.entityId,
        name: dto.name,
        country: dto.country,
        street: dto.street,
        addressLine2: dto.addressLine2,
        postalCode: dto.postalCode,
        city: dto.city,
        vatId: dto.vatId,
        leitwegId: dto.leitwegId,
        buyerReference: dto.buyerReference,
      },
    });
  }

  async findByEntity(entityId: string) {
    return this.prisma.customer.findMany({
      where: { entityId },
      orderBy: { createdAt: "desc" },
    });
  }
}
