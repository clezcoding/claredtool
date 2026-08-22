import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { RequirePermission } from "../auth/permissions.decorator";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("api/customers")
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @RequirePermission("kunde.read")
  findByEntity(@Query("entityId") entityId: string) {
    return this.customers.findByEntity(entityId);
  }

  @Post()
  @RequirePermission("kunde.write")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateCustomerDto) {
    return this.customers.create(body);
  }
}
