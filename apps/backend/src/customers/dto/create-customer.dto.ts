import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from "class-validator";
import { isEuCountry } from "../../common/eu-countries";

export class CreateCustomerDto {
  @IsUUID()
  entityId!: string;

  @IsString()
  name!: string;

  @IsString()
  country!: string;

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

  @ValidateIf((dto: CreateCustomerDto) => isEuCountry(dto.country))
  @IsNotEmpty()
  @IsString()
  vatId?: string;

  @IsOptional()
  @IsString()
  leitwegId?: string;

  @IsOptional()
  @IsString()
  buyerReference?: string;
}
