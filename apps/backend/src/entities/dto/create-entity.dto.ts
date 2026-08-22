import { IsOptional, IsString } from "class-validator";

export class CreateEntityDto {
  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @IsString()
  legalForm!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  vatId?: string;

  @IsOptional()
  @IsString()
  currencyDefault?: string;
}
