import {
  IsBIC,
  IsEmail,
  IsIBAN,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";
import { isEuCountry } from "../../common/eu-countries";

export class CreateEntityDto {
  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @IsString()
  legalForm!: string;

  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @ValidateIf((dto: CreateEntityDto) => isEuCountry(dto.country))
  @IsNotEmpty()
  @IsString()
  vatId?: string;

  @IsOptional()
  @IsString()
  currencyDefault?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIBAN()
  iban?: string;

  @IsOptional()
  @IsBIC()
  bic?: string;

  @IsOptional()
  @IsString()
  hrb?: string;

  @IsOptional()
  @IsString()
  managingDirector?: string;
}
