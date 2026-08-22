import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { InvoiceItemDto } from "./create-invoice.dto";

export class UpdateInvoiceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  supplyType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}
