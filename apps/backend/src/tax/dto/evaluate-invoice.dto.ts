import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class EvaluateSellerDto {
  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  legalForm?: string;

  @IsOptional()
  @IsString()
  vatId?: string;
}

export class EvaluateCustomerDto {
  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  vatId?: string;
}

export class EvaluateItemDto {
  @IsString()
  bezeichnung!: string;

  @IsNumber()
  menge!: number;

  @IsNumber()
  einzelpreis!: number;
}

export class EvaluateInvoiceDto {
  @ValidateNested()
  @Type(() => EvaluateSellerDto)
  seller!: EvaluateSellerDto;

  @ValidateNested()
  @Type(() => EvaluateCustomerDto)
  customer!: EvaluateCustomerDto;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  supplyType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluateItemDto)
  items!: EvaluateItemDto[];
}
