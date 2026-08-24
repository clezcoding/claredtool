import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { isEuCountry } from "../../common/eu-countries";

export class CreateEntityDto {
  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @IsString()
  legalForm!: string;

  @IsString()
  address!: string;

  @ValidateIf((dto: CreateEntityDto) => isEuCountry(dto.country))
  @IsNotEmpty()
  @IsString()
  vatId?: string;

  @IsOptional()
  @IsString()
  currencyDefault?: string;
}
