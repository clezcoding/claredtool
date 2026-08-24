import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { RequirePermission } from "../auth/permissions.decorator";
import { CreateEntityDto } from "./dto/create-entity.dto";
import { EntitiesService } from "./entities.service";

@Controller("api/entities")
export class EntitiesController {
  constructor(private readonly entities: EntitiesService) {}

  @Get()
  @RequirePermission("entity.read")
  findAll() {
    return this.entities.findAll();
  }

  @Post()
  @RequirePermission("entity.create")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateEntityDto) {
    return this.entities.create(body);
  }
}
