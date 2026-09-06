import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class InvoiceItemDto {
  @IsString()
  bezeichnung!: string;

  @IsNumber()
  menge!: number;

  @IsNumber()
  einzelpreis!: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateInvoiceDto {
  @IsUUID()
  entityId!: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn(["goods", "service"])
  supplyType?: "goods" | "service";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}
