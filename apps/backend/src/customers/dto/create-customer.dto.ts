import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { isEuCountry } from "../../common/eu-countries";

export class CreateCustomerDto {
  @IsUUID()
  entityId!: string;

  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @IsString()
  address!: string;

  @ValidateIf((dto: CreateCustomerDto) => isEuCountry(dto.country))
  @IsNotEmpty()
  @IsString()
  vatId?: string;
}
