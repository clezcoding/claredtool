import { Type } from "class-transformer";
import {
  IsArray,
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
  @IsString()
  supplyType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}
