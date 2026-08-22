import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly itemOrder = [
    { position: "asc" as const },
    { id: "asc" as const },
  ];

  private formatInvoiceNumber(year: number, last: number): string {
    return `RE-${year}-${String(last).padStart(3, "0")}`;
  }

  private async nextInvoiceNumber(
    tx: Prisma.TransactionClient,
    entityId: string,
    year: number,
  ): Promise<string> {
    const rows = await tx.$queryRaw<{ last: number }[]>`
      INSERT INTO invoice_counters (entity_id, year, last)
      VALUES (${entityId}::uuid, ${year}, 1)
      ON CONFLICT (entity_id, year)
      DO UPDATE SET last = invoice_counters.last + 1
      RETURNING last
    `;
    const last = rows[0]?.last ?? 1;
    return this.formatInvoiceNumber(year, last);
  }

  async create(dto: CreateInvoiceDto) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: dto.entityId },
    });
    if (!entity) {
      throw new NotFoundException("Entity not found");
    }

    const currency = dto.currency ?? entity.currencyDefault;
    const supplyType = dto.supplyType ?? "service";
    const year = new Date().getFullYear();

    return this.prisma.$transaction(async (tx) => {
      const number = await this.nextInvoiceNumber(tx, dto.entityId, year);
      return tx.invoice.create({
        data: {
          entityId: dto.entityId,
          customerId: dto.customerId,
          number,
          currency,
          supplyType,
          items: {
            createMany: {
              data: dto.items.map((row, index) => ({
                position: index,
                bezeichnung: row.bezeichnung,
                menge: row.menge,
                einzelpreis: row.einzelpreis,
                netto: row.menge * row.einzelpreis,
              })),
            },
          },
        },
        include: { items: { orderBy: this.itemOrder } },
      });
    });
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      orderBy: { updatedAt: "desc" },
      include: { items: { orderBy: this.itemOrder } },
    });
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: { orderBy: this.itemOrder } },
    });
    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Invoice not found");
    }

    if (dto.entityId) {
      const entity = await this.prisma.entity.findUnique({
        where: { id: dto.entityId },
      });
      if (!entity) {
        throw new NotFoundException("Entity not found");
      }
    }

    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException("Customer not found");
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.items !== undefined) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        if (dto.items.length > 0) {
          await tx.invoiceItem.createMany({
            data: dto.items.map((row, index) => ({
              invoiceId: id,
              position: index,
              bezeichnung: row.bezeichnung,
              menge: row.menge,
              einzelpreis: row.einzelpreis,
              netto: row.menge * row.einzelpreis,
            })),
          });
        }
      }

      const data: Prisma.InvoiceUpdateInput = {};
      if (dto.entityId !== undefined) {
        data.entity = { connect: { id: dto.entityId } };
      }
      if (dto.customerId !== undefined) {
        data.customer = dto.customerId
          ? { connect: { id: dto.customerId } }
          : { disconnect: true };
      }
      if (dto.currency !== undefined) {
        data.currency = dto.currency;
      }
      if (dto.supplyType !== undefined) {
        data.supplyType = dto.supplyType;
      }
      if (dto.date !== undefined) {
        data.date = new Date(dto.date);
      }
      if (dto.dueDate !== undefined) {
        data.dueDate = new Date(dto.dueDate);
      }

      return tx.invoice.update({
        where: { id },
        data,
        include: { items: { orderBy: this.itemOrder } },
      });
    });
  }
}
