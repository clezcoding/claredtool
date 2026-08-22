import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { RequirePermission } from "../auth/permissions.decorator";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { InvoicesService } from "./invoices.service";

@Controller("api/invoices")
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Post()
  @RequirePermission("invoice.write")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateInvoiceDto) {
    return this.invoices.create(body);
  }

  @Get(":id")
  @RequirePermission("invoice.read")
  findById(@Param("id") id: string) {
    return this.invoices.findById(id);
  }
}
