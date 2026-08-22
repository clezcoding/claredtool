import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

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
        include: { items: { orderBy: { position: "asc" } } },
      });
    });
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: { orderBy: { position: "asc" } } },
    });
    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }
    return invoice;
  }
}
