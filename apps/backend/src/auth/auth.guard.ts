import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { SessionUser } from "./session-user";
import { RedisService } from "../redis/redis.service";

export type AuthedRequest = {
  headers: { authorization?: string };
  user?: SessionUser;
  sessionToken?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException();
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException();
    }
    const raw = await this.redis.get(`session:${token}`);
    if (!raw) {
      throw new UnauthorizedException();
    }
    request.sessionToken = token;
    request.user = parseSessionUser(raw);
    return true;
  }
}

function parseSessionUser(raw: string): SessionUser {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "sub" in parsed &&
      typeof (parsed as { sub: unknown }).sub === "string" &&
      (parsed as { sub: string }).sub.length > 0
    ) {
      return parsed as SessionUser;
    }
  } catch {
    /* fall through */
  }
  throw new UnauthorizedException();
}
