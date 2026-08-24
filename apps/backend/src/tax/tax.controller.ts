import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnprocessableEntityException,
} from "@nestjs/common";
import { EvaluateError, evaluate } from "@clared/tax-engine";
import { RequirePermission } from "../auth/permissions.decorator";
import { EvaluateInvoiceDto } from "./dto/evaluate-invoice.dto";
import { mapDraftToFacts } from "./facts-mapper";

@Controller("api/tax")
export class TaxController {
  @Post("evaluate")
  @RequirePermission("tax.evaluate")
  @HttpCode(HttpStatus.OK)
  evaluate(@Body() body: EvaluateInvoiceDto) {
    const facts = mapDraftToFacts(body);
    try {
      return evaluate(facts);
    } catch (error) {
      if (error instanceof EvaluateError && error.code === "no_unique_match") {
        throw new UnprocessableEntityException("no_unique_match");
      }
      throw error;
    }
  }
}
