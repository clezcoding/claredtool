import { Controller, Get, NotFoundException } from "@nestjs/common";
import { ApiExcludeController, type OpenAPIObject } from "@nestjs/swagger";
import { Public } from "../auth/public.decorator";

let document: OpenAPIObject | undefined;

export function setOpenApiDocument(doc: OpenAPIObject): void {
  document = doc;
}

@Public()
@ApiExcludeController()
@Controller()
export class DocsController {
  @Get("openapi.json")
  openapi(): OpenAPIObject {
    if (!document) throw new NotFoundException();
    return document;
  }

  @Get("api/docs")
  docs(): OpenAPIObject {
    if (!document) throw new NotFoundException();
    return document;
  }
}
