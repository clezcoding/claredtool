import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { RequirePermission } from "../auth/permissions.decorator";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
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

  @Get()
  @RequirePermission("invoice.read")
  findAll() {
    return this.invoices.findAll();
  }

  @Get(":id")
  @RequirePermission("invoice.read")
  findById(@Param("id") id: string) {
    return this.invoices.findById(id);
  }

  @Patch(":id")
  @RequirePermission("invoice.write")
  update(@Param("id") id: string, @Body() body: UpdateInvoiceDto) {
    return this.invoices.update(id, body);
  }
}
