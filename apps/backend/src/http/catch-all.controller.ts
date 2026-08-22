import { All, Controller, NotFoundException, Req, UnauthorizedException } from "@nestjs/common";
import { Public } from "../auth/public.decorator";

@Public()
@Controller()
export class CatchAllController {
  @All("{*path}")
  unmatched(@Req() req: { url?: string }): never {
    const path = req.url?.split("?")[0] ?? "";
    if (path.startsWith("/api/docs") || path === "/openapi.json") {
      throw new NotFoundException();
    }
    throw new UnauthorizedException();
  }
}
