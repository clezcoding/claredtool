import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCustomerDto {
  @IsUUID()
  entityId!: string;

  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  vatId?: string;
}
