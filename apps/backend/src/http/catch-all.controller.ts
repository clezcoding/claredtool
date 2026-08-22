import { All, Controller, UnauthorizedException } from "@nestjs/common";

@Controller()
export class CatchAllController {
  @All("{*path}")
  unmatched(): never {
    throw new UnauthorizedException();
  }
}
