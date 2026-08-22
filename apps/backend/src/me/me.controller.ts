import { Controller, Get, Req } from "@nestjs/common";
import { AuthedRequest } from "../auth/auth.guard";

@Controller("me")
export class MeController {
  @Get()
  me(@Req() request: AuthedRequest) {
    const user = request.user;
    return {
      sub: user?.sub ?? "",
      email: user?.email ?? "",
      name: user?.name ?? "",
      groups: user?.groups ?? [],
      permissions: user?.permissions ?? [],
      primaryRole: user?.primaryRole ?? "",
    };
  }
}
